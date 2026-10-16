# 08 — Plan de pruebas y trazabilidad

## Estrategia
Pirámide: unitarias para reglas y estados; integración con PostgreSQL y almacenamiento simulado/real de staging; API contract tests; E2E para consulta y emisión; pruebas de seguridad y restauración. Cada RF debe tener al menos un test automatizado y evidencia de aceptación.

## Matriz mínima
| Prueba | Requisitos | Caso / expectativa |
|---|---|---|
| T-01 | RF-01, RNF-02 | Sin sesión 401; con rol insuficiente 403 |
| T-02 | RF-02 | Duplicado por tipo/número documento rechazado |
| T-03 | RF-03, RF-19 | Histórico verificable sin alterar PDF original |
| T-04 | RF-05, RF-17 | Archivo permitido: hash coincide; archivo malicioso/rechazado no se publica |
| T-05 | RF-06, RN-12 | Operador no autoaprueba; autoridad sí |
| T-06 | RF-07, RN-03 | Token >=128 bits, único y no secuencial; QR apunta a dominio HTTPS oficial |
| T-07 | RF-08, RN-13 | Consulta pública no expone DNI ni campos no autorizados |
| T-08 | RF-09, RN-05 | Tras revocación, QR devuelve no válido inmediatamente |
| T-09 | RF-10 | Sustitución enlaza certificados, sin ciclos |
| T-10 | RF-11 | Cada transición genera evento auditable con actor y timestamp |
| T-11 | RF-12 | Intentos excesivos devuelven 429 y no permiten enumeración |
| T-12 | RF-13, RF-14 | Búsqueda DNI/nombre solo interna, con permiso y auditoría |
| T-13 | RNF-05 | p95 de verificación <2s bajo carga nominal acordada |
| T-14 | RNF-07 | Restaurar backup en staging y verificar integridad |
| T-15 | RN-08 | Modificación tras aprobación obliga nueva versión y revisión |
| T-16 | RN-15 | No encontrado no se etiqueta como falsificación |
| T-17 | RNF-01 | TLS, cookies seguras, CORS/CSRF correctos |
| T-18 | RNF-03 | Prueba de acceso directo a archivos privados falla sin autorización |
| T-19 | RF-18 | Desactivar cuenta revoca nuevas operaciones administrativas |
| T-20 | RF-16 | Plantilla PDF incorpora QR antes de firma (fase 2) |
| T-21 | RF-21, RN-18 | Cambiar política de divulgación altera la ficha pública sin regenerar QR |
| T-22 | RF-22, RN-20 | Exportación o acceso a documento completo exige motivo, permiso y auditoría |
| T-23 | RNF-13 | Usuarios críticos sin MFA no pueden operar en producción |
| T-24 | RNF-14 | Logs de API no contienen DNI completo, documentos, object keys ni tokens en claro |

## Casos de seguridad
IDOR/BOLA en `holders/{id}` y `certificates/{id}`; inyección SQL; XSS; CSRF cuando aplique; enumeración por token; fuerza bruta de login; subida de archivos poliglota y MIME falsificado; SSRF en importaciones; acceso a object keys; manipulación de estado; carreras concurrentes de aprobación; exposición de secretos en frontend/logs; falsificación de QR con dominio parecido.

## Criterios de salida para producción
- RF alta prioridad implementados y aceptados, sin defectos críticos/altos abiertos.
- Pruebas de autorización y privacidad superadas.
- Migraciones aplicadas y reversión ensayada.
- Restauración de backup probada; alertas básicas operativas.
- Política de publicación aprobada y textos de privacidad publicados.
- Manual de operación y responsables de revocación definidos.
- Threat model MVP revisado y riesgos críticos mitigados o aceptados formalmente.
- OpenAPI, migraciones y smoke test de despliegue validados en staging.

## Matriz de cambios
Al modificar un requisito: actualizar SRS -> reglas -> CU -> ER/UML -> API -> tests -> ADR cuando cambie la arquitectura. El PR debe enlazar IDs afectados.
