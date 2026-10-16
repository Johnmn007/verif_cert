# 07 — Contratos REST API (borrador para OpenAPI)

**Base:** `/api/v1` · JSON UTF-8 · fechas ISO 8601 · IDs UUID internos. Endpoints administrativos exigen autenticación, permiso y auditoría. Estado: aprobado técnicamente para MVP.

## Endpoints públicos
| Método | Ruta | Respuesta | Notas |
|---|---|---|---|
| GET | `/public/certificates/{token}` | 200 / 404 / 429 | Datos mínimos y estado actual; sin DNI completo |
| POST | `/public/certificates/{token}/document-access` | 202 / 403 / 404 / 429 | Solicita acceso completo cuando la política lo permita; nunca entrega archivo directamente |
| GET | `/public/status` | 200 | Estado de servicio sin datos sensibles |

### Ejemplo 200
```json
{
  "code": "CERT-2026-000152",
  "status": "PUBLICADO",
  "holder_display_name": "María López García",
  "certificate_title": "Certificado de capacitación",
  "issuer_name": "Institución educativa",
  "issued_on": "2026-09-15",
  "expires_on": null,
  "verified_at": "2026-10-10T15:00:00Z"
}
```
`holder_display_name` está condicionado a política institucional de publicación. `status` de API puede mapearse a `VALIDO`, `REVOCADO`, `VENCIDO`, `REEMPLAZADO` en UI. La URL del QR apunta a frontend `/v/{token}` y este llama a la API.

## Endpoints administrativos
| Método | Ruta | Permiso | Uso |
|---|---|---|---|
| POST | `/auth/login` | público con protección | Iniciar sesión |
| POST | `/auth/logout` | autenticado | Cerrar sesión |
| GET | `/auth/me` | autenticado | Perfil y permisos |
| GET/POST | `/holders` | `holders:read/write` | Buscar y crear titulares |
| GET/PATCH | `/holders/{id}` | `holders:read/write` | Consultar y editar |
| GET/POST | `/disclosure-policies` | `policies:read/write` | Gestionar política de campos públicos |
| POST | `/disclosure-policies/{id}/activate` | `policies:approve` | Activar política aprobada |
| GET/POST | `/certificates` | `certificates:read/create` | Listar y crear borrador |
| GET/PATCH | `/certificates/{id}` | `certificates:read/edit` | Ver/editar borrador |
| POST | `/certificates/{id}/documents` | `documents:upload` | Subir versión con validación |
| POST | `/certificates/{id}/submit` | `certificates:submit` | Enviar a revisión |
| POST | `/certificates/{id}/approve` | `certificates:approve` | Aprobar |
| POST | `/certificates/{id}/publish` | `certificates:publish` | Publicar y obtener QR |
| POST | `/certificates/{id}/revoke` | `certificates:revoke` | Revocar con motivo |
| POST | `/certificates/{id}/replace` | `certificates:replace` | Sustituir y vincular |
| GET | `/certificates/{id}/audit` | `audit:read` | Historial |
| GET | `/reports/certificates` | `reports:read` | Estadísticas |
| GET/POST/PATCH | `/users` y `/users/{id}` | `users:manage` | Gestión administrativa |

## Contratos de mutación
`POST /certificates` acepta `holder_id`, `type_id`, `title`, `issued_on`, `origin`, `institutional_number`, `program`; devuelve 201 con `id`, `status=BORRADOR`, `row_version`.  
`POST /certificates/{id}/revoke` acepta `{ "reason": "Error de emisión" }`; requiere estado `PUBLICADO`; devuelve estado `REVOCADO` y marca temporal.  
`POST /certificates/{id}/publish` requiere estado `APROBADO`; devuelve `{ "status":"PUBLICADO", "verification_url":"https://.../v/..." }`.
`POST /disclosure-policies/{id}/activate` requiere política completa y autorización; deja inactiva la política anterior del mismo alcance dentro de la misma transacción.

## Errores estandarizados
```json
{
  "error": {
    "code": "INVALID_STATE_TRANSITION",
    "message": "No se puede publicar el certificado en su estado actual.",
    "request_id": "d6f8eaf0-12c7-4b2a-8f09-2c7ab10e0c01"
  }
}
```
HTTP: `400` validación de formato, `401` no autenticado, `403` sin permiso, `404` no encontrado, `409` conflicto de estado/versión, `413` archivo grande, `415` tipo no permitido, `422` datos semánticamente inválidos, `429` rate limit, `500` error interno. Evitar distinguir públicamente entre token inexistente y certificado aún no publicado.

## Reglas transversales
Paginación `limit/cursor` para listados internos; orden determinista; cabecera `X-Request-ID`; idempotencia en publicación y revocación; `If-Match` o `row_version` para concurrencia; errores sin trazas ni PII. OpenAPI generado por FastAPI se versiona y valida en CI.

Las mutaciones sensibles aceptan `Idempotency-Key` cuando puedan ser reintentadas por fallos de red. Las respuestas públicas usan `Cache-Control: no-store` salvo recursos estáticos. Tokens públicos, object keys, hashes de IP y enlaces efímeros no se registran en texto claro en logs de aplicación.

## Pendiente antes de implementación
Definir proveedor de identidad, política de documentos completos, esquema de número institucional, tamaño máximo de archivos, cuotas y reglas exactas de búsqueda interna.
