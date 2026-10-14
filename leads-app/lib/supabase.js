import { createClient } from '@supabase/supabase-js';

let browserClient;
export function supabaseBrowser() {
  if (!browserClient) {
    browserClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }
  return browserClient;
}

export const ETAPAS = [
  'Registrado',
  'Contactado',
  'Número erróneo',
  'Volver a llamar',
  'WhatsApp o correo',
  'Calificado',
  'Descartar',
  'Convertido',
];

export function horasSinEstado(lead) {
  const t = new Date(lead.estado_actualizado_at).getTime();
  return Math.floor((Date.now() - t) / 36e5);
}

// Chile: numeros llegan como 569XXXXXXXX
export function soloDigitos(tel) {
  return String(tel || '').replace(/\D/g, '');
}
