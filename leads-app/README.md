# Leads Isapre

App web (Next.js + Supabase) para gestionar leads: lista ordenada por horas sin estado, tarjeta por lead, botones Llamar / WhatsApp / Marcar contactado.

## Puesta en marcha (en este orden)
1. **Supabase**: crea un proyecto gratis en supabase.com. En *SQL Editor* pega y ejecuta `supabase/schema.sql`.
2. **Usuarios**: *Authentication > Users > Add user* (correo + clave) para cada asesor. Luego, en *SQL Editor*:
   `insert into profiles (id, nombre, rol) values ('<id del usuario>', 'Tu nombre', 'admin');`
   (el id se ve en la lista de usuarios). Para Letty u otro asesor, igual pero con rol `asesor`.
3. **Vercel**: sube esta carpeta (o un repo en GitHub) y créala como proyecto. Variables de entorno: las 4 de `.env.example`
   (URL y anon key están en Supabase > Project Settings > API; `MAKE_API_KEY` la inventas tú).
4. **Make**: agrega un módulo HTTP después de Google Sheets (ver `MAKE.md`).
