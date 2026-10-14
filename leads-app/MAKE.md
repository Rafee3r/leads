# Módulo en Make: HTTP > Make a request

- URL: https://TU-APP.vercel.app/api/leads
- Method: POST
- Headers: `x-api-key` = (tu MAKE_API_KEY) ; `Content-Type` = application/json
- Body type: Raw, Content type: JSON
- Request content:

{
  "meta_lead_id": "{{1.leadgenId}}",
  "fecha_lead": "{{1.dateCreated}}",
  "nombre": "{{1.data.full_name}}",
  "telefono": "{{1.data.phone_number}}",
  "email": "{{1.data.email}}",
  "ad_id": "{{1.adId}}",
  "tiene_plan": "{{join(1.data.`¿_tienes_actualmente_un_plan_de_isapre?`; \", \")}}",
  "isapre_actual": "{{join(1.data.`¿_con_qué_isapre_estás_actualmente`; \", \")}}",
  "edad": "{{join(1.data.`¿_que_rango_de_edad_tienes?`; \", \")}}"
}

Renta, cargas, comuna y horario se agregan igual cuando existan esas preguntas en el formulario nuevo.
