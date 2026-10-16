create extension if not exists pgcrypto;

create table if not exists institucion (
  id uuid primary key default gen_random_uuid(),
  razon_social text not null,
  dominio_verificacion text not null,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists titular (
  id uuid primary key default gen_random_uuid(),
  institucion_id uuid not null references institucion(id) on delete restrict,
  tipo_documento varchar(16) not null,
  documento_normalizado varchar(64) not null,
  documento_mascara varchar(32) not null,
  nombres text not null,
  apellidos text not null,
  created_at timestamptz not null default now(),
  unique (institucion_id, tipo_documento, documento_normalizado)
);

create table if not exists tipo_certificado (
  id uuid primary key default gen_random_uuid(),
  institucion_id uuid not null references institucion(id) on delete restrict,
  codigo varchar(32) not null,
  nombre text not null,
  requiere_vigencia boolean not null default false,
  activo boolean not null default true,
  unique (institucion_id, codigo)
);

create table if not exists certificado (
  id uuid primary key default gen_random_uuid(),
  institucion_id uuid not null references institucion(id) on delete restrict,
  titular_id uuid not null references titular(id) on delete restrict,
  tipo_id uuid not null references tipo_certificado(id) on delete restrict,
  numero_institucional varchar(64) not null,
  token_publico varchar(128) unique,
  estado varchar(24) not null,
  origen varchar(16) not null,
  titulo text not null,
  programa text,
  fecha_emision date not null,
  vence_en date,
  revisor text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (institucion_id, numero_institucional),
  check (estado in ('BORRADOR', 'EN_REVISION', 'OBSERVADO', 'APROBADO', 'PUBLICADO', 'REVOCADO', 'VENCIDO', 'REEMPLAZADO')),
  check (origen in ('HISTORICO', 'NUEVO')),
  check (vence_en is null or vence_en >= fecha_emision)
);

create table if not exists politica_divulgacion (
  id uuid primary key default gen_random_uuid(),
  institucion_id uuid not null references institucion(id) on delete restrict,
  tipo_id uuid references tipo_certificado(id) on delete restrict,
  version integer not null,
  descripcion text not null,
  activa boolean not null default false,
  mostrar_codigo boolean not null default true,
  mostrar_nombre boolean not null default false,
  mostrar_documento boolean not null default false,
  mostrar_fechas boolean not null default true,
  mostrar_programa boolean not null default true,
  permitir_documento_completo boolean not null default false,
  approved_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists uq_politica_activa_tipo
  on politica_divulgacion (institucion_id, tipo_id)
  where activa = true and tipo_id is not null;

create unique index if not exists uq_politica_activa_general
  on politica_divulgacion (institucion_id)
  where activa = true and tipo_id is null;

create table if not exists documento_version (
  id uuid primary key default gen_random_uuid(),
  certificado_id uuid not null references certificado(id) on delete restrict,
  version integer not null,
  object_key text not null,
  sha256 char(64) not null,
  mime varchar(128) not null,
  size_bytes bigint not null,
  es_definitivo boolean not null default false,
  created_at timestamptz not null default now(),
  unique (certificado_id, version)
);

create unique index if not exists uq_documento_definitivo
  on documento_version (certificado_id)
  where es_definitivo = true;

create table if not exists certificado_qr (
  certificado_id uuid primary key references certificado(id) on delete cascade,
  verification_url text not null,
  object_key text not null,
  sha256 char(64) not null,
  mime varchar(64) not null default 'image/svg+xml',
  created_at timestamptz not null default now()
);

create table if not exists carga_masiva (
  id uuid primary key default gen_random_uuid(),
  institucion_id uuid not null references institucion(id) on delete restrict,
  tipo_id uuid references tipo_certificado(id) on delete restrict,
  titulo text not null,
  programa text,
  fecha_emision date not null,
  vence_en date,
  origen varchar(16) not null,
  total_rows integer not null default 0,
  valid_rows integer not null default 0,
  error_rows integer not null default 0,
  created_count integer not null default 0,
  skipped_count integer not null default 0,
  actor text not null,
  status varchar(24) not null default 'COMPLETADO',
  created_at timestamptz not null default now()
);

create table if not exists carga_masiva_detalle (
  id uuid primary key default gen_random_uuid(),
  carga_id uuid not null references carga_masiva(id) on delete cascade,
  row_number integer not null,
  certificado_id uuid references certificado(id) on delete set null,
  numero_institucional varchar(64),
  titular text,
  documento text,
  status varchar(24) not null,
  errors text,
  warnings text,
  verification_url text,
  created_at timestamptz not null default now()
);

create table if not exists cola_revision (
  id uuid primary key default gen_random_uuid(),
  id_publico varchar(32) not null unique,
  titular text not null,
  titulo text not null,
  origen varchar(16) not null,
  estado varchar(24) not null,
  actualizado text not null,
  riesgo text not null,
  orden integer not null default 0
);

create table if not exists evento_auditoria (
  id uuid primary key default gen_random_uuid(),
  accion varchar(64) not null,
  objetivo text not null,
  actor text not null,
  creado_en timestamptz not null default now()
);

create index if not exists ix_certificado_token_publico on certificado(token_publico);
create index if not exists ix_certificado_estado_created on certificado(estado, created_at desc);
