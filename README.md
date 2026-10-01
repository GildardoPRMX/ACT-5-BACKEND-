# Task API: Conexión Segura con MongoDB Atlas y Diagnóstico (EC2 F1 A5)

API REST para la gestión de tareas desarrollada con **Express 5**, **TypeScript**, **Node.js**, **Mongoose 8** y almacenamiento temporal en memoria para el CRUD. Actividad guiada **EC2 F1 A5** para la asignatura *Programación Backend con Frameworks* (Universidad Estatal de Sonora).

---

## 🏛️ Arquitectura por Capas y Persistencia

El proyecto prepara la infraestructura de base de datos conectando con **MongoDB Atlas** de forma segura mediante variables de entorno validadas en el arranque y un módulo de diagnóstico de salud:

```
Cliente (Postman / Frontend)
         │
         ▼
    [requestContext] ──► Genera UUID en X-Request-Id y res.locals.requestId
         │
         ▼
     [express.json()] ──► Parsea el cuerpo JSON
         │
         ├──► /health ────────► health.routes.ts ──► health.controller.ts:
         │                      ├── GET / ────────► status: "ok"
         │                      └── GET /database ► ping con MongoDB Atlas (200 o 503)
         │
         └──► /api/tasks ─────► task.routes.ts ──► validaciones con middlewares:
                                ├── router.param('id', validateTaskId)
                                ├── requireJson
                                └── validateTaskTitle / validateCompletion
                                         │
                                         ▼
                                task.controller.ts ──► task.service.ts ──► data/tasks.ts (en memoria)
```

---

## 🛡️ Configuración Segura de Variables de Entorno

La API valida en el arranque (`src/config/env.ts`) las variables requeridas antes de intentar conectar a la base de datos o abrir el puerto:

| Variable | Descripción | Estado |
|---|---|---|
| `PORT` | Puerto local en el que escucha Express (ej. `3000`). | No secreta |
| `MONGODB_URI` | Cadena de conexión `mongodb+srv://...` con credenciales y clúster. | **Secreta** (no se versiona) |
| `MONGODB_DB_NAME` | Nombre de la base de datos del proyecto (`task_api`). | Configuración |

---

## 📋 Endpoints de la API

| Método | Ruta | Código HTTP | Descripción |
|:------:|:-----|:-----------:|:------------|
| `GET` | `/health` | `200 OK` | Comprueba estado del proceso del servidor (`status: "ok"`). |
| `GET` | `/health/database` | `200 OK` / `503` | Diagnóstico de disponibilidad de MongoDB con comando `ping`. |
| `GET` | `/api/tasks` | `200 OK` | Obtiene la lista de tareas en memoria. |
| `GET` | `/api/tasks/:id` | `200 OK` / `400` / `404` | Obtiene una tarea específica por ID. |
| `POST` | `/api/tasks` | `201 Created` / `400` / `415` / `422` | Crea una tarea nueva (`{"title": "..."}`). |
| `PATCH` | `/api/tasks/:id/complete` | `200 OK` / `400` / `404` | Marca una tarea como completada. |
| `PATCH` | `/api/tasks/:id/status` | `200 OK` / `400` / `404` / `415` / `422` | Actualiza el estado booleano (`{"completed": true}`). |
| `PATCH` | `/api/tasks/:id` | `200 OK` / `400` / `404` / `415` / `422` | Edita el título de una tarea. |
| `DELETE` | `/api/tasks/:id` | `204 No Content` / `400` / `404` | Elimina una tarea por su ID. |

---

## 🛑 Desafío Individual: Cierre Ordenado (*Graceful Shutdown*)

Se implementó el cierre controlado del servidor en [`src/server.ts`](src/server.ts) y [`src/config/database.ts`](src/config/database.ts):
- Al recibir las señales `SIGINT` (Ctrl+C) o `SIGTERM`, el servidor deja de aceptar nuevas conexiones HTTP (`server.close()`).
- Se cierra de forma asíncrona la conexión activa con MongoDB Atlas (`mongoose.disconnect()`).
- Se finaliza el proceso de forma limpia sin generar excepciones no controladas ni exponer detalles sensibles.

---

## 🚀 Comandos del Proyecto

| Comando | Propósito |
|---|---|
| `pnpm dev` | Inicia el servidor en desarrollo con conexión a MongoDB Atlas y recarga automática (`tsx watch`). |
| `pnpm check` | Comprueba tipos e integridad con el compilador de TypeScript (`tsc --noEmit`). |
| `pnpm build` | Compila el código TypeScript a JavaScript en `dist/`. |
| `pnpm start` | Ejecuta la versión compilada en producción con Node.js (`node dist/server.js`). |

---

## 🧪 Pruebas en Postman

Se incluye la colección oficial en:
📂 `postman/task-api-ec2-f1-a1.postman_collection.json`

### Importación y ejecución:
1. Abra Postman y seleccione **Import**.
2. Cargue el archivo `postman/task-api-ec2-f1-a1.postman_collection.json`.
3. Inicie el servidor con `pnpm dev`.
4. Ejecute las peticiones en orden: pruebas de salud (`/health`, `/health/database`), regresión del CRUD y casos negativos.

---

## 📁 Estructura del Proyecto

```
backend-frameworks/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   └── env.ts
│   ├── controllers/
│   │   ├── health.controller.ts
│   │   └── task.controller.ts
│   ├── data/
│   │   └── tasks.ts
│   ├── errors/
│   │   └── app-error.ts
│   ├── middlewares/
│   ├── models/
│   │   └── task.ts
│   ├── routes/
│   │   ├── health.routes.ts
│   │   └── task.routes.ts
│   ├── services/
│   │   ├── database.service.ts
│   │   └── task.service.ts
│   ├── types/
│   ├── app.ts
│   └── server.ts
├── docs/
│   ├── pruebas-conexion-mongodb.md
│   ├── reflexion-mongodb.md
│   ├── pruebas-validacion.md
│   └── reflexion-validacion.md
├── postman/
│   ├── task-api-ec2-f1-a1.postman_collection.json
│   └── task-api-ec1-f3-a4.postman_collection.json
├── .env
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── tsconfig.json
```

---

## 📄 Evidencias y Documentación
- **Registro de Pruebas con MongoDB Atlas**: [docs/pruebas-conexion-mongodb.md](docs/pruebas-conexion-mongodb.md)
- **Reflexión sobre Conexión Segura**: [docs/reflexion-mongodb.md](docs/reflexion-mongodb.md)
