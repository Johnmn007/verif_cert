# 09 — Registro de decisiones arquitectónicas (ADR) y asuntos pendientes

**Regla:** ningún supuesto de este documento equivale a aprobación institucional. Las decisiones marcadas como aprobadas lo están solo a nivel técnico para iniciar el MVP.

## ADR propuestos
| ID | Estado | Decisión | Justificación | Alternativas / consecuencia |
|---|---|---|---|---|
| ADR-001 | Aprobado técnico | Monolito modular FastAPI | Menor complejidad operativa y evolución gradual | Microservicios: sobrecoste inicial |
| ADR-002 | Aprobado técnico | React + Vite + Tailwind | UI desacoplada e integrable al portal | Renderizado server-side: evaluar SEO no prioritario |
| ADR-003 | Aprobado técnico | PostgreSQL + Alembic | Integridad relacional y migraciones | NoSQL: menos adecuado para trazabilidad transaccional |
| ADR-004 | Aprobado técnico | Archivos en almacenamiento privado | Escalabilidad y control de acceso | BLOB en BD: backups pesados |
| ADR-005 | Aprobado técnico | QR con URL oficial y token aleatorio | No filtra PII y permite verificar estado actual | QR con datos embebidos: desactualización y exposición |
| ADR-006 | Aprobado técnico | Búsqueda pública solo por token | Minimización y antienumeración | DNI/nombre públicos: riesgo alto de privacidad |
| ADR-007 | Aprobado técnico | Publicación con aprobación separada | Reduce errores y fraude interno | Aprobación automática: menor control |
| ADR-008 | Aprobado técnico | Hash SHA-256 y versionado de documentos | Evidencia de integridad y trazabilidad | Sobrescritura: pierde evidencia |
| ADR-009 | Aprobado técnico | API REST versionada | Integración sencilla con web y futuros clientes | GraphQL: complejidad no necesaria |
| ADR-010 | Aprobado técnico | MFA para roles críticos | Protege emisión y revocación | Solo contraseña: mayor riesgo |
| ADR-011 | Aprobado técnico | Política de divulgación versionada | Permite controlar campos públicos sin regenerar QR ni alterar certificados | Campos fijos en código: riesgo legal y poca flexibilidad |
| ADR-012 | Aprobado técnico | URLs efímeras para documento completo | Reduce exposición de archivos y mantiene trazabilidad | Documento público permanente: riesgo alto de privacidad |

## Decisiones institucionales pendientes (prioridad)
| ID | Prioridad | Pregunta a resolver | Responsable sugerido |
|---|---|---|---|
| PD-01 | Crítica | ¿Nombre legal, marca, dominio oficial y responsable del servicio? | Dirección + TI |
| PD-02 | Crítica | ¿Qué tipos de certificados y qué campos mínimos exige cada uno? | Secretaría académica |
| PD-03 | Crítica | ¿Qué datos del titular pueden verse públicamente? ¿Documento completo sí/no y con qué base legal? | Asesoría legal + protección de datos |
| PD-04 | Crítica | ¿Quién registra, aprueba, revoca y audita? ¿Segregación obligatoria? | Dirección académica |
| PD-05 | Alta | ¿Se genera PDF en el sistema o se carga uno emitido externamente? | Secretaría + TI |
| PD-06 | Alta | ¿Firma digital obligatoria por tipo documental? ¿Qué proveedor y flujo? | Asesoría legal + dirección |
| PD-07 | Alta | ¿Formato de código institucional y manejo de duplicados históricos? | Secretaría |
| PD-08 | Alta | ¿Hay certificados con caducidad y reglas de vencimiento? | Área académica |
| PD-09 | Alta | ¿Volumen inicial de históricos y ritmo mensual de emisión/consultas? | Secretaría + TI |
| PD-10 | Alta | ¿Hospedaje, presupuesto, disponibilidad, RPO y RTO? | TI + dirección |
| PD-11 | Alta | ¿Plazos de conservación, supresión y logs de consulta? | Legal + archivos |
| PD-12 | Media | ¿Integración con directorio institucional o identidad local? | TI |
| PD-13 | Media | ¿Necesidad de importación masiva CSV/Excel? | Operaciones |
| PD-14 | Media | ¿Idiomas, accesibilidad y diseño visual institucional? | Comunicaciones |
| PD-15 | Alta | ¿Quién aprueba cambios en la política de divulgación y con qué evidencia legal? | Legal + dirección |

## Plantilla para nuevas decisiones
```md
# ADR-XXX: Título
- Estado: Propuesto / Aprobado / Reemplazado
- Fecha:
- Contexto y problema:
- Opciones evaluadas:
- Decisión:
- Consecuencias y riesgos:
- Requisitos/diagramas/pruebas afectados:
- Responsable y evidencia de aprobación:
```

## Proceso de resolución de conflictos documentales
1. Identificar RF/RN/ADR en conflicto.
2. Priorizar normativa aplicable y política institucional aprobada sobre supuestos técnicos.
3. Registrar propuesta de cambio y alternativas.
4. Obtener aprobación del responsable funcional/técnico correspondiente.
5. Actualizar todos los documentos afectados, migraciones y pruebas en el mismo PR.
6. Versionar la línea base y comunicar la decisión al equipo.
