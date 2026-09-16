# Task API: Validación, Middleware y Manejo Centralizado de Errores (EC1 F3 A4)

API REST para la gestión de tareas desarrollada con **Express**, **TypeScript**, **Node.js** y almacenamiento temporal en memoria. Actividad guiada **EC1 F3 A4** para la asignatura *Programación Backend con Frameworks* (Universidad Estatal de Sonora).

---

## 🏛️ Arquitectura por Capas y Flujo de Peticiones

El proyecto implementa una arquitectura desacoplada y robusta donde las validaciones de transporte HTTP se aíslan en middlewares reutilizables, permitiendo que controladores y servicios consuman datos limpios y normalizados:

```
Cliente (Postman / Frontend)
         │
         ▼
    [requestContext] ──► Genera UUID único en X-Request-Id y res.locals.requestId
         │
         ▼
     [express.json()] ──► Parsea el cuerpo JSON
         │
         ▼
[task.routes.ts] ──► Enrutamiento HTTP con router.param y middlewares de validación:
         ├── router.param('id', validateTaskId) ──► Valida entero positivo (400 INVALID_ID)
         ├── requireJson ──► Exige Content-Type application/json (415 UNSUPPORTED_MEDIA_TYPE)
         ├── validateTaskTitle ──► Valida y normaliza title (422 VALIDATION_ERROR)
         └── validateCompletion ──► Valida completed booleano (422 VALIDATION_ERROR)
         │
         ▼
[task.controller.ts] ──► Consume res.locals (taskId, taskTitle, completed) y delega al servicio
         │
         ▼
[task.service.ts] ──► Reglas de negocio puras (existencia de tarea, 404 TASK_NOT_FOUND)
         │
         ▼
  [data/tasks.ts] ──► Colección temporal de tareas en memoria
         │
         ▼
 [notFound / errorHandler] ──► Captura de errores unificada con formato JSON y requestId
```

---

## 📦 Contrato Uniforme de Errores

Todas las respuestas de error siguen una estructura JSON homogénea y predecible:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "La solicitud contiene datos inválidos.",
    "details": [
      {
        "field": "title",
        "message": "Debe ser texto no vacío."
      }
    ],
    "requestId": "a0c804a5-1102-45e0-9467-34751f8877aa"
  }
}
```

### Códigos de Error del Servidor

| Estado HTTP | Código de la API (`code`) | Causa / Uso |
|:-----------:|:--------------------------|:------------|
| `400 Bad Request` | `INVALID_ID` | El identificador de ruta no es un entero positivo. |
| `400 Bad Request` | `INVALID_JSON` | El cuerpo de la petición contiene sintaxis JSON malformada. |
| `404 Not Found` | `TASK_NOT_FOUND` | La tarea solicitada no existe en la colección. |
| `404 Not Found` | `ROUTE_NOT_FOUND` | La ruta o método HTTP solicitado no existe. |
| `415 Unsupported Media Type` | `UNSUPPORTED_MEDIA_TYPE` | Endpoints con cuerpo que no declaran `Content-Type: application/json`. |
| `422 Unprocessable Entity` | `VALIDATION_ERROR` | Los campos JSON no cumplen con las restricciones semánticas. |
| `500 Internal Server Error` | `INTERNAL_ERROR` | Fallo no previsto o excepción no controlada en el servidor. |

---

## 📋 Endpoints de la API

| Método | Ruta | Código HTTP | Descripción |
|:------:|:-----|:-----------:|:------------|
| `GET` | `/health` | `200 OK` | Comprueba estado y disponibilidad del servidor. |
| `GET` | `/api/tasks` | `200 OK` | Obtiene la lista de todas las tareas. |
| `GET` | `/api/tasks/:id` | `200 OK` / `400` / `404` | Obtiene una tarea específica por su ID. |
| `POST` | `/api/tasks` | `201 Created` / `400` / `415` / `422` | Crea una nueva tarea (`{"title": "..."}`). |
| `PATCH` | `/api/tasks/:id/complete` | `200 OK` / `400` / `404` | Marca una tarea existente como completada. |
| `PATCH` | `/api/tasks/:id/status` | `200 OK` / `400` / `404` / `415` / `422` | **(Desafío F3 A4)** Actualiza el estado booleano (`{"completed": true}`). |
| `PATCH` | `/api/tasks/:id` | `200 OK` / `400` / `404` / `415` / `422` | Edita el título de una tarea (`{"title": "..."}`). |
| `DELETE` | `/api/tasks/:id` | `204 No Content` / `400` / `404` | Elimina una tarea por su ID. |

---

## 🚀 Requisitos y Configuración

### Requisitos Previos
- **Node.js** (v18 o superior)
- **PNPM**
- **Visual Studio Code**
- **Git**
- **Postman**

### Instalación de dependencias

```bash
pnpm install
```

### Configuración del entorno
Copie el archivo `.env.example` a `.env` (si aún no existe):

```bash
cp .env.example .env
```

---

## 💻 Comandos del Proyecto

| Comando | Propósito |
|---|---|
| `pnpm dev` | Inicia el servidor en modo desarrollo con recarga automática (`tsx watch`). |
| `pnpm check` | Comprueba tipos e integridad con el compilador de TypeScript (`tsc --noEmit`). |
| `pnpm build` | Compila el código fuente TypeScript a JavaScript estándar en la carpeta `dist/`. |
| `pnpm start` | Ejecuta la versión compilada en producción con Node.js (`node dist/server.js`). |

---

## 🧪 Colección y Pruebas en Postman

Se incluye la colección completa con pruebas unitarias y aserciones automatizadas en:
📂 `postman/task-api-ec1-f3-a4.postman_collection.json`

### Importación y ejecución:
1. Abra Postman y seleccione **Import**.
2. Cargue el archivo `postman/task-api-ec1-f3-a4.postman_collection.json`.
3. Inicie el servidor con `pnpm dev`.
4. Ejecute la colección completa para validar las 16 pruebas positivas, negativas y de regresión.

---

## 📁 Estructura del Proyecto

```
backend-frameworks/
├── src/
│   ├── controllers/
│   │   └── task.controller.ts
│   ├── data/
│   │   └── tasks.ts
│   ├── errors/
│   │   └── app-error.ts
│   ├── middlewares/
│   │   ├── error.middleware.ts
│   │   ├── not-found.middleware.ts
│   │   ├── request-context.middleware.ts
│   │   ├── require-json.middleware.ts
│   │   ├── validate-completion.middleware.ts
│   │   ├── validate-task-id.middleware.ts
│   │   └── validate-task-title.middleware.ts
│   ├── models/
│   │   └── task.ts
│   ├── routes/
│   │   └── task.routes.ts
│   ├── services/
│   │   └── task.service.ts
│   ├── types/
│   │   └── api-error.ts
│   ├── app.ts
│   └── server.ts
├── docs/
│   ├── pruebas-validacion.md
│   ├── reflexion-validacion.md
│   ├── pruebas-api.md
│   └── reflexion.md
├── postman/
│   ├── task-api-ec1-f3-a4.postman_collection.json
│   └── task-api-ec1-f2-a3.postman_collection.json
├── .env
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── tsconfig.json
```

---

## 📄 Evidencias y Documentación
- **Registro de Pruebas de Validación**: [docs/pruebas-validacion.md](docs/pruebas-validacion.md)
- **Reflexión sobre Middleware y Errores**: [docs/reflexion-validacion.md](docs/reflexion-validacion.md)
