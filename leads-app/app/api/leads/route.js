import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Make llama aquí con POST + header x-api-key
export async function POST(req) {
  if (req.headers.get('x-api-key') !== process.env.MAKE_API_KEY) {
    return NextResponse.json({ error: 'no autorizado' }, { status: 401 });
  }

  const b = await req.json();
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Asignación simple: al admin (primer perfil). Se puede cambiar después por reparto.
  const { data: perfiles } = await admin.from('profiles').select('id').order('created_at').limit(1);

  const fila = {
    fecha_lead: b.fecha_lead || null,
    nombre: b.nombre || null,
    telefono: b.telefono || null,
    email: b.email || null,
    ad_id: b.ad_id || null,
    edad: b.edad || null,
    renta: b.renta || null,
    cargas: b.cargas || null,
    comuna: b.comuna || null,
    isapre_actual: b.isapre_actual || null,
    tiene_plan: b.tiene_plan || null,
    horario_llamada: b.horario_llamada || null,
    meta_lead_id: b.meta_lead_id || null,
    asignado_a: perfiles?.[0]?.id || null,
  };

  const { error } = await admin.from('leads').upsert(fila, { onConflict: 'meta_lead_id', ignoreDuplicates: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
