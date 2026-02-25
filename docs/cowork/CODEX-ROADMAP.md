# Roadmap del Codex (desde 0)
Fechas base: 2025-09-01 a 2025-09-11 (ajustables). Todo inicia al **0%**.

## Hitos & Entregables
1) **Scope & Kickoff**
   - Entregable: Respuestas al cuestionario PhD + Documento de KPIs/SLOs + Matriz de riesgos.
2) **Bootstrap**
   - Entregable: Repo FastAPI con flags, tests, config segura.
3) **Observabilidad + CI/CD**
   - Entregable: Tracing OTel → Langfuse/Phoenix, pipeline CI con pre-commit (ruff/mypy/pytest) y coverage.
4) **Datos**
   - Entregable: DVC inicial, MLflow tracking, validaciones GX.
5) **Evals & Red‑teaming**
   - Entregable: Golden set + métrica de groundedness (Ragas) + informe de hallazgos.
6) **Módulos activables**
   - Entregable: RAG (/rag/*), Agents/Tools, Batch/Queues, Analytics; activables por flag.
7) **Seguridad & Compliance**
   - Entregable: Checklist OWASP LLM, secretos, RBAC por entorno, auditoría.
8) **SLOs + Release (canary)**
   - Entregable: SLOs p95/p99 y costo/request; despliegue canary con flags.

## KPIs/SLOs propuestos
- Latencia p95 ≤ 800ms (RAG ≤ 1500ms) · p99 ≤ 1500ms (RAG ≤ 2500ms)
- Costo/request ≤ $0.01 (RAG ≤ $0.05) — ajustable
- Tasa de groundedness ≥ 0.85 (RAGAS)
- Cobertura de tests ≥ 80% · Lints = 0 errores
