insert into institucion (id, razon_social, dominio_verificacion)
values ('11111111-1111-1111-1111-111111111111', 'Institucion Educativa Demo', 'localhost')
on conflict do nothing;

insert into tipo_certificado (id, institucion_id, codigo, nombre, requiere_vigencia)
values
  ('22222222-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111111', 'CAP', 'Certificado de capacitacion', false),
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'HIST', 'Constancia historica de estudios', false),
  ('22222222-2222-2222-2222-222222222223', '11111111-1111-1111-1111-111111111111', 'TEC', 'Certificado tecnico', true)
on conflict do nothing;

insert into politica_divulgacion (
  id, institucion_id, tipo_id, version, descripcion, activa,
  mostrar_codigo, mostrar_nombre, mostrar_documento, mostrar_fechas,
  mostrar_programa, permitir_documento_completo, approved_at
)
values
  (
    '44444444-4444-4444-4444-444444444441',
    '11111111-1111-1111-1111-111111111111',
    null,
    1,
    'Codigo, titulo, institucion, fecha, programa y estado. Documento completo oculto por defecto.',
    true, true, true, false, true, true, false, now()
  )
on conflict do nothing;
