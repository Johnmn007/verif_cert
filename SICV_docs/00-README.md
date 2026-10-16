# SICV — Sistema Institucional de Certificación y Verificación

**Versión documental:** 1.0 (línea base propuesta)  
**Fecha:** 2026-10-10  
**Estado:** Línea base técnica aprobada para iniciar MVP; requiere validación institucional antes de producción.

## Propósito
Fuente única de decisiones funcionales y técnicas para implementar, operar y evolucionar el SICV. Abarca emisión de nuevos certificados, incorporación de certificados históricos y verificación pública mediante código o QR.

## Índice y orden de lectura
1. [01 — Requisitos](01-requisitos-sistema.md): alcance, actores, historias, requisitos y aceptación.
2. [02 — Reglas de negocio](02-reglas-negocio-y-estados.md): estados, emisión, revocación, datos públicos.
3. [03 — Casos de uso](03-casos-de-uso.md): actores, escenarios y excepciones.
4. [04 — Modelo de datos](04-modelo-datos.md): ER, claves, restricciones e integridad.
5. [05 — UML](05-diagramas-uml.md): componentes, clases, secuencias y actividades.
6. [06 — Arquitectura](06-arquitectura-software.md): módulos, despliegue, decisiones técnicas y seguridad.
7. [07 — Contratos API](07-contratos-api.md): endpoints, formatos y errores.
8. [08 — Pruebas y trazabilidad](08-pruebas-y-trazabilidad.md): matriz de pruebas, criterios de salida.
9. [09 — Decisiones ADR](09-decisiones-y-pendientes.md): decisiones aceptadas/propuestas y pendientes.
10. [10 — Revisión del equipo de desarrollo](10-revision-equipo-desarrollo.md): dictamen técnico, mejoras incorporadas y condiciones de arranque.

## Convenciones
- `RF-*`: requisito funcional; `RNF-*`: no funcional; `RN-*`: regla de negocio; `CU-*`: caso de uso; `ADR-*`: decisión arquitectónica; `T-*`: prueba.
- **Aprobado:** solo tras validación por autoridad designada. **Propuesto:** diseño inicial que puede modificarse. **Pendiente:** decisión abierta.
- Fechas almacenadas en UTC; presentación en zona horaria institucional (propuesta: America/Lima).
- Diagramas en bloques `mermaid` compatibles con GitHub y editores que admitan Mermaid.

## Alcance del MVP
Incluye autenticación administrativa, alta y búsqueda de titulares, registro de certificados existentes, carga privada de PDF, emisión de identificador y QR, flujo de aprobación/publicación, consulta pública por token, revocación, auditoría y respaldo. La generación automática de documentos desde plantillas puede implementarse en la fase 2 sin cambiar el modelo central.

## Dictamen técnico
El equipo de desarrollo aprueba esta línea base como punto de partida del MVP, con las condiciones registradas en `10-revision-equipo-desarrollo.md`. La aprobación es técnica: habilita planificación, estimación, diseño de tareas y construcción incremental. No reemplaza la aprobación legal, académica ni institucional de políticas de datos, responsables, firma digital, dominio oficial o retención documental.

## Supuestos que NO deben darse por aprobados
- Nombre legal, dominio, tipos de certificados y autoridades competentes de la institución.
- Política de publicación de nombres, documentos y certificados completos.
- Uso obligatorio de firma digital, reglas de vigencia, y requisitos legales específicos por tipo documental.
- Proveedor de nube, retención de logs, niveles de servicio y capacidad.

## Criterio de gobierno documental
Todo cambio significativo debe: (1) referenciar un RF/RN/ADR; (2) modificar los diagramas y contratos afectados; (3) agregar pruebas; (4) registrarse en un ADR si cambia una decisión arquitectónica. No se modifica la lógica de producción basándose únicamente en conversaciones informales.
