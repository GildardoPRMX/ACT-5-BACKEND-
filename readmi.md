# Task API con Express y TypeScript (EC1 F2 A3)

API REST para la gestión de tareas desarrollada con **Express**, **TypeScript**, **Node.js** y almacenamiento temporal en memoria. Práctica individual guiada para la asignatura *Programación Backend con Frameworks* (Universidad Estatal de Sonora).

Consulte la documentación completa en [README.md](./README.md).

## Endpoints Principales

| Método | Ruta | Código HTTP | Descripción |
|:------:|:-----|:-----------:|:------------|
| `GET` | `/health` | `200 OK` | Comprueba disponibilidad del servidor. |
| `GET` | `/api/tasks` | `200 OK` | Devuelve todas las tareas. |
| `GET` | `/api/tasks/:id` | `200 OK` / `404 Not Found` | Devuelve una tarea por identificador. |
| `POST` | `/api/tasks` | `201 Created` / `400 Bad Request` | Crea una tarea a partir de un JSON (`title`). |
| `PATCH` | `/api/tasks/:id/complete` | `200 OK` / `404 Not Found` | Cambia el estado de una tarea a `completed`. |
| `PATCH` | `/api/tasks/:id` | `200 OK` / `400 Bad Request` / `404 Not Found` | *(Desafío)* Edita el título de una tarea. |
| `DELETE` | `/api/tasks/:id` | `204 No Content` / `404 Not Found` | Elimina una tarea existente. |

## Evidencias
- Registro de pruebas: [docs/pruebas-api.md](./docs/pruebas-api.md)
- Preguntas de reflexión: [docs/reflexion.md](./docs/reflexion.md)
- Colección de Postman: [postman/task-api-ec1-f2-a3.postman_collection.json](./postman/task-api-ec1-f2-a3.postman_collection.json)

