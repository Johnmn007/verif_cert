# 01 — Especificación de requisitos del sistema (SRS)

**Estado:** Aprobado técnicamente para MVP · **Versión:** 1.1

## 1. Objetivo y alcance
SICV registra y administra certificados emitidos por una institución educativa y ofrece verificación pública de autenticidad contra el registro oficial. Dos vías de incorporación: **históricos** (ya emitidos) y **nuevos** (generados o cargados). No reemplaza por sí mismo las exigencias de firma digital o archivo institucional aplicables.

## 2. Actores
- Visitante/verificador: consulta código o QR sin iniciar sesión.
- Operador de certificación: registra titulares, metadatos y archivos; prepara solicitudes.
- Autoridad aprobadora: aprueba, publica, revoca o sustituye certificados, conforme a permisos.
- Administrador técnico: gestiona usuarios, permisos, configuración y operación; no aprueba certificados por defecto.
- Auditor: accede a trazabilidad y reportes en solo lectura.
- Servicio de almacenamiento: custodia documentos privados.

## 3. Requisitos funcionales
| ID | Prioridad | Requisito verificable | Criterio de aceptación resumido |
|---|---|---|---|
| RF-01 | Alta | Inicio/cierre de sesión del personal y control de roles | Usuario no autenticado recibe 401; rol sin permiso recibe 403 |
| RF-02 | Alta | Alta, edición y búsqueda interna de titulares | No se duplican titulares con mismo tipo/número de documento normalizados dentro del emisor |
| RF-03 | Alta | Registrar certificado histórico con evidencia documental | Se conserva origen `HISTORICO` y fecha de emisión original |
| RF-04 | Alta | Registrar borrador de certificado nuevo | Genera ID interno y número institucional conforme a regla aprobada |
| RF-05 | Alta | Subir PDF o imagen autorizada al almacenamiento privado | Validación de tipo/tamaño, hash SHA-256 y acceso privado |
| RF-06 | Alta | Someter a revisión, aprobar y publicar | Operador no puede autoaprobar cuando rige separación de funciones |
| RF-07 | Alta | Generar token público aleatorio y QR de URL oficial | Token no secuencial; QR apunta a HTTPS del dominio configurado |
| RF-08 | Alta | Verificar por código/token público | Respuesta muestra estado y campos públicos autorizados, sin exponer DNI completo |
| RF-09 | Alta | Revocar un certificado con motivo y autoridad | Estado cambia y el QR existente refleja la revocación inmediatamente |
| RF-10 | Alta | Sustituir certificado con vínculo al anterior | Original queda `REEMPLAZADO`; nuevo documento tiene token propio |
| RF-11 | Alta | Auditar cambios de estado, accesos administrativos y operaciones sensibles | Actor, acción, fecha, objeto, correlación y cambios mínimos quedan registrados |
| RF-12 | Alta | Restringir y monitorear consultas públicas | Rate limit y controles antienumeración; no hay listados públicos |
| RF-13 | Media | Búsqueda por DNI para usuario autorizado | Requiere rol interno; cualquier apertura pública exige aprobación legal y diseño adicional |
| RF-14 | Media | Búsqueda por nombres para usuario autorizado | Paginación, filtros y registro de consulta; nunca directorio público por defecto |
| RF-15 | Media | Reportes de emisión, revocación y actividad | Filtros por período, estado y tipo; exportación autorizada |
| RF-16 | Media | Generación de PDF desde plantilla institucional | Fase 2; QR incorporado antes de firma final |
| RF-17 | Alta | Comprobar integridad del archivo conservado | Hash recalculado coincide con metadato almacenado |
| RF-18 | Alta | Gestión de usuarios y roles | Alta/baja lógica, restablecimiento seguro y registro de cambios |
| RF-19 | Alta | Verificar certificados antiguos sin QR mediante código asignado | Consulta funciona sin modificar el documento histórico original |
| RF-20 | Media | Mostrar documento completo cuando exista autorización válida | Por defecto solo vista mínima; acceso completo con autorización y URL efímera |
| RF-21 | Alta | Configurar política mínima de divulgación por tipo de certificado | Ningún certificado se publica si no existe política activa que defina campos públicos |
| RF-22 | Alta | Registrar motivo operativo en acciones sensibles | Revocación, sustitución, observación, acceso a documento completo y exportaciones quedan justificadas y auditadas |

## 4. Requisitos no funcionales
| ID | Categoría | Requisito / umbral propuesto |
|---|---|---|
| RNF-01 | Seguridad | HTTPS obligatorio; cookies HttpOnly/Secure/SameSite cuando se use sesión; protección CSRF según mecanismo |
| RNF-02 | Seguridad | RBAC por operación y por recurso; consultas parametrizadas; validación de archivos |
| RNF-03 | Privacidad | Minimización de datos públicos; sin DNI completo ni imagen integral pública por defecto |
| RNF-04 | Integridad | Hash SHA-256 de documento final, registro inmutable de eventos críticos a nivel aplicación |
| RNF-05 | Rendimiento | Objetivo inicial p95 < 2 s para verificación pública con carga nominal definida en pruebas |
| RNF-06 | Disponibilidad | Objetivo propuesto 99.5% mensual; pendiente aprobación y presupuesto |
| RNF-07 | Resiliencia | Backups cifrados diarios; prueba de restauración trimestral; RPO/RTO pendientes |
| RNF-08 | Observabilidad | Logs estructurados con request_id; métricas de errores, latencia, fallos de verificación |
| RNF-09 | Accesibilidad | Interfaz orientada a WCAG 2.2 AA, validación antes de salida |
| RNF-10 | Mantenibilidad | Migraciones versionadas, pruebas automáticas, documentación API OpenAPI |
| RNF-11 | Escalabilidad | API sin estado; almacenamiento de objetos y PostgreSQL gestionado |
| RNF-12 | Retención | Plazos de conservación y borrado sujetos a tabla institucional aprobada |
| RNF-13 | Seguridad | MFA obligatorio para aprobadores, administradores y usuarios con permiso de revocación en producción |
| RNF-14 | Privacidad | Logs y métricas no deben almacenar documentos completos, DNI completo, tokens públicos sin protección ni object keys sensibles |
| RNF-15 | Operación | Todo despliegue productivo requiere rollback documentado, smoke test y verificación de migraciones |

## 5. Fuera de alcance del MVP
Blockchain; IA para reconocer certificados; app móvil nativa; integración automática con registros ministeriales; verificación pública por nombres; pagos; firma digital certificada integrada; multiinstitución SaaS. Son posibles ampliaciones, no compromisos.

## 6. Dependencias y restricciones
- Portal web institucional y DNS bajo control del área TI.
- Autoridad responsable de certificar y custodiar expedientes.
- Política de tratamiento de datos personales aprobada.
- Catálogo de programas, tipos de certificado y reglas de numeración.
- Acceso seguro a almacenamiento de documentos y backups.

## 7. Criterios globales de aceptación
1. El QR de un certificado publicado abre el registro oficial vigente.
2. La revocación impide mostrarlo como válido, sin borrar historial.
3. Un operador no puede publicar sin autorización requerida.
4. Ninguna búsqueda pública permite enumerar titulares por DNI/nombre.
5. El archivo original se conserva con hash y versiones.
6. Los registros de auditoría permiten reconstruir emisión, publicación y revocación.
7. Existe política activa de divulgación antes de publicar el primer certificado.
8. Un despliegue fallido puede revertirse sin pérdida de documentos ni eventos ya confirmados.
