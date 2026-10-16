# 05 — Diagramas UML y flujos

**Estado:** Aprobado técnicamente para MVP.

## 1. Diagrama de clases de dominio
```mermaid
classDiagram
  class Titular {+UUID id;+String nombres;+String apellidos;+String documentoProtegido}
  class Certificado {+UUID id;+String numero;+String tokenPublico;+Estado estado;+Date fechaEmision;+publicar();+revocar(motivo);+sustituir(nuevo)}
  class TipoCertificado {+String codigo;+String nombre;+Boolean requiereVigencia}
  class DocumentoVersion {+int version;+String sha256;+String objectKey;+Boolean definitivo}
  class PoliticaDivulgacion {+int version;+Boolean activa;+Boolean mostrarNombre;+Boolean permitirDocumentoCompleto}
  class SesionAccesoDocumento {+DateTime expiresAt;+String motivo;+DateTime usedAt}
  class EventoCertificado {+String accion;+DateTime creadoEn;+String motivo}
  class Usuario {+UUID id;+String email;+Boolean activo}
  class Institucion {+UUID id;+String razonSocial;+String dominio}
  Institucion "1" --> "*" Certificado
  Titular "1" --> "*" Certificado
  TipoCertificado "1" --> "*" Certificado
  TipoCertificado "0..1" --> "*" PoliticaDivulgacion
  Certificado "1" *-- "*" DocumentoVersion
  Certificado "1" --> "*" SesionAccesoDocumento
  Certificado "1" *-- "*" EventoCertificado
  Usuario "0..1" --> "*" EventoCertificado
```

## 2. Secuencia de verificación pública
```mermaid
sequenceDiagram
  actor Visitante
  participant Web as Frontend
  participant API as API Publica
  participant DB as PostgreSQL
  Visitante->>Web: Escanea QR / introduce código
  Web->>API: GET /api/v1/public/certificates/{token}
  API->>API: Validar token y rate limit
  API->>DB: Buscar token y estado
  API->>DB: Leer política de divulgación activa
  alt Encontrado y publicable
    DB-->>API: Registro y campos autorizados
    API-->>Web: 200 + estado y datos mínimos
    Web-->>Visitante: Ficha oficial
  else No encontrado / borrador
    API-->>Web: 404 genérico
    Web-->>Visitante: Sin registro verificable
  else Demasiadas consultas
    API-->>Web: 429
  end
```

## 3. Secuencia de publicación
```mermaid
sequenceDiagram
  actor Operador
  actor Aprobador
  participant API as Backend
  participant DB as PostgreSQL
  participant OBJ as Almacenamiento
  Operador->>API: Crear borrador y subir archivo
  API->>OBJ: Guardar objeto privado
  OBJ-->>API: object_key y metadatos
  API->>DB: Guardar versión/hash y evento
  Operador->>API: Enviar a revisión
  API->>DB: BORRADOR -> EN_REVISION
  Aprobador->>API: Aprobar y publicar
  API->>API: Validar permisos, separación, política y contenido
  API->>DB: Transacción: estado, token, auditoría
  DB-->>API: Confirmación
  API-->>Aprobador: URL oficial y QR
```

## 4. Actividad de revocación
```mermaid
flowchart TD
  A[Autoridad abre certificado] --> B{Estado PUBLICADO?}
  B -- No --> X[Rechazar operación]
  B -- Sí --> C[Introducir motivo y confirmar]
  C --> D{Permiso y motivo válidos?}
  D -- No --> X
  D -- Sí --> E[Transacción: REVOCADO + auditoría]
  E --> F[Invalidar caché pública]
  F --> G[QR devuelve estado revocado]
```

## 5. Contexto y componentes
```mermaid
flowchart LR
  P[Verificador] --> WEB[Web pública]
  OP[Personal autorizado] --> ADMIN[Panel administrativo]
  WEB --> API[API FastAPI]
  ADMIN --> API
  API --> AUTH[Autenticación y RBAC]
  API --> CERT[Dominio Certificados]
  API --> VER[Verificación]
  API --> DISC[Políticas de divulgación]
  CERT --> DB[(PostgreSQL)]
  VER --> DB
  DISC --> DB
  CERT --> STORE[(Object Storage privado)]
  API --> AUD[Auditoría]
  AUD --> DB
```

## Notas de modelado
- Diagramas UML conceptuales: no reemplazan las especificaciones de endpoints ni las restricciones SQL.
- Para generar código, usar como contrato conjunto los archivos 01, 02, 04 y 07.
- Si un cambio altera un estado, actualizar todos los diagramas relacionados y la matriz de pruebas.
