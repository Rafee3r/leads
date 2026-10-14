-- Esquema para la app de leads de isapre (Supabase / Postgres)
-- Ejecutar completo en: Supabase > SQL Editor > New query > Run

create extension if not exists pgcrypto;

-- Asesores (uno por usuario de login)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null,
  rol text not null default 'asesor' check (rol in ('admin','asesor')),
  created_at timestamptz not null default now()
);

-- Leads
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  fecha_lead timestamptz,                 -- cuando llego desde Meta
  nombre text,
  telefono text,
  email text,
  ad_id text,
  edad text,
  renta text,
  cargas text,
  comuna text,
  isapre_actual text,
  tiene_plan text,
  horario_llamada text,                   -- "lun 12 desde las 10:05"
  etapa text not null default 'Registrado'
    check (etapa in ('Registrado','Contactado','Número erróneo','Volver a llamar','WhatsApp o correo','Calificado','Descartar','Convertido')),
  estado_actualizado_at timestamptz not null default now(),
  asignado_a uuid references profiles(id),
  notas text,
  meta_lead_id text unique                -- evita duplicados si Make reintenta
);

create index if not exists leads_etapa_idx on leads(etapa);
create index if not exists leads_asignado_idx on leads(asignado_a);

-- Cada cambio de etapa reinicia el contador de "horas sin estado"
create or replace function touch_estado() returns trigger as $$
begin
  if new.etapa is distinct from old.etapa then
    new.estado_actualizado_at := now();
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists leads_touch_estado on leads;
create trigger leads_touch_estado before update on leads
  for each row execute function touch_estado();

-- Seguridad: cada asesor ve solo sus leads; admin ve todos
alter table profiles enable row level security;
alter table leads enable row level security;

create or replace function es_admin() returns boolean as $$
  select exists (select 1 from profiles where id = auth.uid() and rol = 'admin');
$$ language sql security definer stable;

create policy "ver perfil propio o admin" on profiles
  for select using (id = auth.uid() or es_admin());

create policy "ver leads propios o admin" on leads
  for select using (asignado_a = auth.uid() or es_admin());

create policy "editar leads propios o admin" on leads
  for update using (asignado_a = auth.uid() or es_admin());

-- Los leads nuevos los inserta Make con la service role key (no pasa por RLS).
