# Pruebas de consultas de tareas

## Entorno

- Rama: `act-8` (feature/consultas-paginadas)
- Base: `task_api`
- Colección: `tasks`
- Resultado de `pnpm install`: correcto; dependencias restauradas desde el lockfile.
- Resultado de `pnpm check`: correcto; `tsc --noEmit` finalizó sin errores.
- Resultado de `pnpm build`: correcto; `tsc` finalizó sin errores.
- Archivos compilados verificados: `dist/repositories/task.repository.js`, `dist/types/task-query.js`, `dist/middlewares/validate-task-query.middleware.js`.

## Datos preparados

- Total de tareas: 5
- Tareas pending: 3
- Tareas completed: 2

## Casos ejecutados

| Tipo | Método y ruta | Esperado | Obtenido | requestId | Resultado |
|---|---|---|---|---|---|
| Positiva | `GET /api/tasks` | 200 con `data` (arreglo) y `meta` (page=1, limit=10) | 200 con `data` y `meta` | [UUID] | Aprobada |
| Positiva | `GET /api/tasks?page=1&limit=2` | 200 con máx 2 tareas, total=5, totalPages=3 | 200 con 2 tareas, hasNextPage=true, hasPrev=false | [UUID] | Aprobada |
| Positiva | `GET /api/tasks?page=2&limit=2` | 200 con segunda página, sin duplicar tareas | 200 con tareas de página 2, hasNextPage=true, hasPrev=true | [UUID] | Aprobada |
| Positiva | `GET /api/tasks?status=completed` | 200 con tareas completadas y meta.total=2 | 200 con 2 tareas completadas | [UUID] | Aprobada |
| Positiva | `GET /api/tasks?status=pending` | 200 con tareas pendientes y meta.total=3 | 200 con 3 tareas pendientes | [UUID] | Aprobada |
| Positiva | `GET /api/tasks?search=api` | 200 con coincidencias que contengan "api" | 200 con tareas coincidentes (case-insensitive) | [UUID] | Aprobada |
| Positiva | `GET /api/tasks?search=.*` | 200 tratando `.*` como texto literal escapado | 200 sin interpretar comodines regex | [UUID] | Aprobada |
| Positiva | `GET /api/tasks?sortBy=title&order=asc` | 200 ordenadas alfabéticamente por título | 200 en orden ascendente | [UUID] | Aprobada |
| Positiva | `GET /api/tasks?sortBy=title&order=desc` | 200 ordenadas inversamente por título | 200 en orden descendente | [UUID] | Aprobada |
| Positiva | `GET /api/tasks?status=pending&search=entrega&page=1&limit=2&sortBy=title&order=asc` | 200 con parámetros combinados | 200 con datos filtrados y paginados | [UUID] | Aprobada |
| Negativa | `GET /api/tasks?page=0` | 422 QUERY_VALIDATION_ERROR | 422 con detalle en `page` | [UUID] | Aprobada |
| Negativa | `GET /api/tasks?page=abc` | 422 QUERY_VALIDATION_ERROR | 422 con detalle en `page` | [UUID] | Aprobada |
| Negativa | `GET /api/tasks?limit=51` | 422 QUERY_VALIDATION_ERROR | 422 con detalle en `limit` | [UUID] | Aprobada |
| Negativa | `GET /api/tasks?status=archived` | 422 QUERY_VALIDATION_ERROR | 422 con detalle en `status` | [UUID] | Aprobada |
| Negativa | `GET /api/tasks?search=` | 422 QUERY_VALIDATION_ERROR | 422 con detalle en `search` | [UUID] | Aprobada |
| Negativa | `GET /api/tasks?sortBy=priority` | 422 QUERY_VALIDATION_ERROR | 422 con detalle en `sortBy` | [UUID] | Aprobada |
| Negativa | `GET /api/tasks?order=sideways` | 422 QUERY_VALIDATION_ERROR | 422 con detalle en `order` | [UUID] | Aprobada |
| Negativa | `GET /api/tasks?owner=ana` | 422 QUERY_VALIDATION_ERROR | 422 parámetro no permitido | [UUID] | Aprobada |
| Negativa | `GET /api/tasks` (Atlas no disponible) | 503 DATABASE_UNAVAILABLE | 503 error seguro sin exponer URI | [UUID] | Aprobada |
| Desafío (Positiva) | `GET /api/tasks?createdFrom=2026-09-01T00:00:00.000Z&createdTo=2026-10-31T23:59:59.999Z` | 200 rango de fechas válido | 200 tareas filtradas por fecha | [UUID] | Aprobada |
| Desafío (Negativa) | `GET /api/tasks?createdFrom=fecha-invalida` | 422 QUERY_VALIDATION_ERROR | 422 fecha ISO 8601 inválida | [UUID] | Aprobada |
| Desafío (Negativa) | `GET /api/tasks?createdFrom=2026-10-31T00:00:00.000Z&createdTo=2026-09-01T00:00:00.000Z` | 422 QUERY_VALIDATION_ERROR | 422 createdFrom posterior a createdTo | [UUID] | Aprobada |
| Desafío (Regresión) | `GET /api/tasks?createdFrom=2026-09-01T00:00:00.000Z&status=pending&search=api&limit=2` | 200 combinación completa | 200 datos y meta coherentes | [UUID] | Aprobada |
| Regresión | `POST /api/tasks` | 201 tarea creada | 201 con `data` creada | [UUID] | Aprobada |
| Regresión | `GET /api/tasks/:id` | 200 tarea por id | 200 con `data` encontrada | [UUID] | Aprobada |
| Regresión | `PATCH /api/tasks/:id` | 200 tarea actualizada | 200 con `data` modificada | [UUID] | Aprobada |
| Regresión | `PATCH /api/tasks/:id/complete` | 200 tarea completada | 200 con status `completed` | [UUID] | Aprobada |
| Regresión | `DELETE /api/tasks/:id` | 204 sin cuerpo | 204 sin contenido | [UUID] | Aprobada |
| Regresión | `GET /api/tasks/:id` (eliminada) | 404 TASK_NOT_FOUND | 404 recurso no encontrado | [UUID] | Aprobada |

## Evidencias

1. Compilación correcta: `pnpm check` y `pnpm build` finalizan sin advertencias ni errores.
2. Dos páginas sin documentos repetidos: cálculo determinista de `skip = (page - 1) * limit` y orden secundario por `_id`.
3. Filtro y búsqueda combinados: `buildFilter` incorpora `status` y la expresión regular con `escapeRegex`.
4. Orden ascendente y descendente: validación con lista cerrada `TASK_SORT_FIELDS` y direcciones `asc` / `desc`.
5. Error 422 con details y requestId: validación anticipada en middleware antes de consultar la base de datos.
6. CRUD heredado completo: todas las operaciones previas de A7 se mantienen íntegras y funcionales.
7. Persistencia después de reiniciar: todas las operaciones se ejecutan de manera persistente sobre MongoDB Atlas.
