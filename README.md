# Task API con Express y TypeScript (EC1 F2 A3)

API REST para la gestión de tareas desarrollada con **Express**, **TypeScript**, **Node.js** y almacenamiento temporal en memoria. Práctica individual guiada para la asignatura *Programación Backend con Frameworks* (Universidad Estatal de Sonora).

---

## 🏛️ Arquitectura por Capas

El proyecto implementa una arquitectura modular limpia con estricta separación de responsabilidades:

```
Cliente (Postman / Browser)
         │
         ▼
     [app.ts] ──► express.json(), Middlewares globales
         │
         ▼
[task.routes.ts] ──► Enrutamiento HTTP (/api/tasks)
         │
         ▼
[task.controller.ts] ──► Interpreta req.params / req.body, invoca servicio, responde JSON
         │
         ▼
[task.service.ts] ──► Reglas de negocio puras, validación defensiva, AppError
         │
         ▼
  [data/tasks.ts] ──► Arreglo en memoria (colección de tareas)
```

- **Rutas (`src/routes/`)**: Asocian métodos y URLs a los controladores.
- **Controladores (`src/controllers/`)**: Manejan solicitudes y respuestas HTTP.
- **Servicios (`src/services/`)**: Reglas de negocio independientes de Express.
- **Modelos (`src/models/`)**: Definición de tipos e interfaces TypeScript.
- **Datos (`src/data/`)**: Estructura de almacenamiento en memoria.
- **Middlewares (`src/middlewares/`)**: Manejo centralizado de errores y rutas no encontradas (404).
- **Errores (`src/errors/`)**: Clase `AppError` para errores operacionales con código HTTP.

---

## 📋 Contrato de la API

| Método | Ruta | Código HTTP | Descripción |
|:------:|:-----|:-----------:|:------------|
| `GET` | `/health` | `200 OK` | Comprueba estado y disponibilidad del servidor. |
| `GET` | `/api/tasks` | `200 OK` | Obtiene la lista de todas las tareas. |
| `GET` | `/api/tasks/:id` | `200 OK` / `404 Not Found` | Obtiene una tarea específica por su ID. |
| `POST` | `/api/tasks` | `201 Created` / `400 Bad Request` | Crea una nueva tarea (`{"title": "..."}`). |
| `PATCH` | `/api/tasks/:id/complete` | `200 OK` / `404 Not Found` | Marca una tarea existente como completada. |
| `PATCH` | `/api/tasks/:id` | `200 OK` / `400 Bad Request` / `404 Not Found` | *(Desafío)* Edita el título de una tarea existente. |
| `DELETE` | `/api/tasks/:id` | `204 No Content` / `404 Not Found` | Elimina una tarea por su ID. |

---

## 🚀 Requisitos y Configuración

### Requisitos Previos
- **Node.js** (v18 o superior)
- **PNPM** (instalado de forma global o vía Corepack)
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

El puerto por defecto es `3000`.

---

## 💻 Comandos del Proyecto

| Comando | Propósito |
|---|---|
| `pnpm dev` | Inicia el servidor en modo desarrollo con recarga automática (`tsx watch`). |
| `pnpm check` | Comprueba tipos e integridad con el compilador de TypeScript (`tsc --noEmit`). |
| `pnpm build` | Compila el código fuente TypeScript a JavaScript estándar en la carpeta `dist/`. |
| `pnpm start` | Ejecuta la versión compilada en producción con Node.js (`node dist/server.js`). |

---

## 🧪 Pruebas con Postman

Se incluye la colección oficial de pruebas lista para importar en:
📂 `postman/task-api-ec1-f2-a3.postman_collection.json`

### Pasos para importar y ejecutar:
1. Abra Postman y haga clic en **Import**.
2. Seleccione el archivo `postman/task-api-ec1-f2-a3.postman_collection.json`.
3. Inicie el servidor con `pnpm dev`.
4. Ejecute las solicitudes en el orden numerado (la creación de tarea actualiza automáticamente la variable `taskId`).

---

## 📁 Estructura del Proyecto

```
task-api-express/
├── src/
│   ├── controllers/
│   │   └── task.controller.ts
│   ├── data/
│   │   └── tasks.ts
│   ├── errors/
│   │   └── app-error.ts
│   ├── middlewares/
│   │   ├── error.middleware.ts
│   │   └── not-found.middleware.ts
│   ├── models/
│   │   └── task.ts
│   ├── routes/
│   │   └── task.routes.ts
│   ├── services/
│   │   └── task.service.ts
│   ├── app.ts
│   └── server.ts
├── docs/
│   ├── pruebas-api.md
│   └── reflexion.md
├── postman/
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
- **Registro de Pruebas**: [docs/pruebas-api.md](docs/pruebas-api.md)
- **Reflexión Teórica**: [docs/reflexion.md](docs/reflexion.md)
