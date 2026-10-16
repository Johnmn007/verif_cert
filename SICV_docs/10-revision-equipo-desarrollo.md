# 10 — Revisión del equipo de desarrollo

**Fecha:** 2026-10-10  
**Dictamen:** aprobado técnicamente para iniciar MVP, condicionado a decisiones institucionales críticas antes de producción.

## Resumen ejecutivo
La propuesta mantiene una arquitectura adecuada para el problema: monolito modular, PostgreSQL como fuente de verdad, almacenamiento privado, verificación pública por token/QR, auditoría y flujo de aprobación separado. El equipo considera que la esencia del proyecto es correcta y debe conservarse: confianza institucional, privacidad, trazabilidad y operación simple.

No se recomienda cambiar a microservicios, blockchain, búsqueda pública por DNI/nombres ni documentos públicos permanentes. Esas alternativas aumentan riesgo, costo y exposición de datos sin resolver mejor el objetivo principal.

## Mejoras incorporadas
- La línea base pasa de "propuesta" a "aprobada técnicamente para MVP", sin reemplazar validaciones legales o institucionales.
- Se agrega política de divulgación versionada para controlar qué campos se muestran públicamente por tipo de certificado.
- Se refuerza que el documento completo solo se entrega mediante autorización, URL efímera y auditoría.
- Se añaden requisitos de MFA para roles críticos, protección de logs y controles de despliegue.
- Se incorporan pruebas para política pública, acceso a documentos completos, MFA y ausencia de datos sensibles en logs.
- Se formalizan ADR técnicos aprobados y nuevas decisiones sobre divulgación y URLs efímeras.

## Aprobación por disciplina
| Disciplina | Resultado | Observación |
|---|---|---|
| Producto | Aprobado | El MVP cubre emisión, históricos, verificación, revocación y auditoría. |
| Backend | Aprobado | FastAPI, SQLAlchemy, Alembic y PostgreSQL son adecuados para reglas transaccionales. |
| Frontend | Aprobado | React/Vite permite panel administrativo y ficha pública sin acoplar secretos. |
| Seguridad | Aprobado con condiciones | Requiere MFA, rate limit, threat model y almacenamiento privado desde el inicio. |
| Datos | Aprobado | El modelo relacional es correcto; se agrega política de divulgación como entidad explícita. |
| QA | Aprobado | La matriz cubre riesgos principales; se agregan pruebas de privacidad y operación. |
| Operación | Aprobado con condiciones | Producción requiere backups verificados, rollback, smoke tests y alertas mínimas. |

## Condiciones antes de producción
1. Aprobar nombre legal, dominio oficial y responsable institucional del servicio.
2. Aprobar tipos de certificados, campos públicos y base legal de publicación.
3. Definir responsables reales de registro, aprobación, revocación y auditoría.
4. Definir formato de numeración y tratamiento de duplicados históricos.
5. Aprobar proveedor de identidad o mecanismo local con MFA.
6. Aprobar almacenamiento, backups, RPO/RTO, retención de logs y documentos.
7. Ejecutar pruebas de seguridad, restauración y smoke test en staging.

## Recomendación de implementación
Construir por incrementos:

1. Base técnica: backend, frontend, autenticación, RBAC, migraciones, health checks y auditoría.
2. Núcleo documental: titulares, certificados, documentos privados, hashes y versiones.
3. Flujo de estados: borrador, revisión, aprobación, publicación, revocación y reemplazo.
4. Verificación pública: token, QR, política de divulgación, rate limit y mensajes neutrales.
5. Operación: reportes mínimos, backups, restauración, observabilidad y hardening.

## Cierre
El equipo aprueba la propuesta mejorada como línea base técnica del SICV. Las decisiones pendientes no bloquean el diseño del MVP, pero sí bloquean la salida a producción si no se resuelven formalmente.
