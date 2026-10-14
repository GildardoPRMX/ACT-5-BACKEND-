# Pruebas del CRUD persistente

## Entorno

- Rama: `feature/crud-persistente-completo`
- Base: `task_api`
- Colección: `tasks`
- Resultado de `pnpm install`: correcto; dependencias restauradas desde el lockfile.
- Resultado de `pnpm check`: correcto; `tsc --noEmit` finalizó sin errores.
- Resultado de `pnpm build`: correcto; `tsc` finalizó sin errores.
- Archivo compilado verificado: `dist/middlewares/validate-task-update.middleware.js`
- Resultado de arranque en esta sesión: pendiente de prueba funcional porque no existe `.env` local con `MONGODB_URI` y `MONGODB_DB_NAME`.

## Recurso de prueba

- id devuelto por POST: pendiente de ejecución en Postman.
- title inicial: `Preparar evidencia del CRUD`
- title final: pendiente de ejecución en Postman.
- status final: pendiente de ejecución en Postman.
- Persistencia después de reiniciar: pendiente de ejecutar con MongoDB Atlas conectado.

## Casos ejecutados

| Tipo | Método y ruta | Datos | Esperado | Obtenido | requestId | Resultado |
|---|---|---|---|---|---|---|
| Infraestructura | `pnpm install` | No aplica | Dependencias instaladas | Correcto | No aplica | Aprobada |
| Infraestructura | `pnpm check` | No aplica | Sin errores TypeScript | Correcto | No aplica | Aprobada |
| Infraestructura | `pnpm build` | No aplica | Compilación correcta | Correcto | No aplica | Aprobada |
| Positiva | `POST /api/tasks` | `{"title":"Tarea"}` | `201` | Pendiente | Pendiente | Pendiente |
| Positiva | `GET /api/tasks` | Sin cuerpo | `200` | Pendiente | Pendiente | Pendiente |
| Positiva | `GET /api/tasks/:id` | Sin cuerpo | `200` | Pendiente | Pendiente | Pendiente |
| Positiva | `PATCH /api/tasks/:id` | `{"title":"Nuevo"}` | `200` | Pendiente | Pendiente | Pendiente |
| Positiva | `PATCH /api/tasks/:id` | `{"status":"completed"}` | `200` | Pendiente | Pendiente | Pendiente |
| Positiva | `PATCH /api/tasks/:id` | `{"title":"Revisar evidencias","status":"pending"}` | `200` | Pendiente | Pendiente | Pendiente |
| Regresión | `PATCH /api/tasks/:id/complete` | Sin cuerpo | `200` | Pendiente | Pendiente | Pendiente |
| Positiva | `DELETE /api/tasks/:id` | Sin cuerpo | `204` | Pendiente | Pendiente | Pendiente |
| Negativa | `GET /api/tasks/1` | Sin cuerpo | `400 INVALID_ID` | Pendiente | Pendiente | Pendiente |
| Negativa | `PATCH /api/tasks/:id` | `{}` | `422 VALIDATION_ERROR` | Pendiente | Pendiente | Pendiente |
| Negativa | `PATCH /api/tasks/:id` | `{"status":"archived"}` | `422 VALIDATION_ERROR` | Pendiente | Pendiente | Pendiente |
| Negativa | `PATCH /api/tasks/:id` | `{"owner":"Ana"}` | `422 VALIDATION_ERROR` | Pendiente | Pendiente | Pendiente |
| Negativa | `PATCH /api/tasks/:id` | JSON mal formado | `400 INVALID_JSON` | Pendiente | Pendiente | Pendiente |
| Negativa | `PATCH /api/tasks/:id` | Sin `application/json` | `415 UNSUPPORTED_MEDIA_TYPE` | Pendiente | Pendiente | Pendiente |
| Negativa | `DELETE /api/tasks/:id` | ObjectId inexistente | `404 TASK_NOT_FOUND` | Pendiente | Pendiente | Pendiente |
| Negativa | `GET /api/tasks` | Atlas no disponible | `503 DATABASE_UNAVAILABLE` | Pendiente | Pendiente | Pendiente |

## Evidencias

1. Compilación correcta: `pnpm check` y `pnpm build` finalizan sin errores.
2. La API ya no usa el arreglo en memoria; todas las operaciones de tareas pasan por `TaskModel`.
3. `PATCH /api/tasks/:id` valida cuerpo JSON, campos permitidos, `title` y `status`.
4. `PATCH /api/tasks/:id/complete` permanece sin requerir cuerpo JSON.
5. Falta ejecutar el recorrido en Postman con un `.env` local real y capturas de Atlas sin URI, usuario, contraseña ni host completo.
