# Task API: CRUD persistente y autenticación con Express y MongoDB Atlas

API REST para la gestión de tareas y cuentas de usuario desarrollada con **Express 5**, **TypeScript**, **Node.js**, **Mongoose 8.24.4** y persistencia en **MongoDB Atlas**. Conserva el CRUD de tareas de A8 y agrega registro e inicio de sesión con contraseñas protegidas y tokens JWT.

## Arquitectura

```text
Cliente (Postman / Frontend)
         |
         v
    requestContext -> X-Request-Id y res.locals.requestId
         |
         v
    express.json()
         |
         +--> /api/auth
         |      +--> validación de entrada
         |      +--> controlador -> servicio de autenticación
         |      +--> bcryptjs -> repositorio -> UserModel
         |      +--> jose: firma y verifica JWT
         |
         +--> /health
         |      +--> GET / -> status ok
         |      +--> GET /database -> ping a MongoDB Atlas
         |
         +--> /api/tasks
                +--> middlewares de validación
                +--> controllers
                +--> services
                +--> TaskModel (Mongoose)
                +--> MongoDB Atlas: task_api.tasks
```

## Variables de Entorno

Copie `.env.example` a `.env` y complete valores reales sin versionarlos:

| Variable | Uso |
|---|---|
| `PORT` | Puerto local de Express. |
| `MONGODB_URI` | Cadena de conexión privada a MongoDB Atlas. |
| `MONGODB_DB_NAME` | Base de datos usada por la API, por defecto `task_api`. |
| `JWT_SECRET` | Clave aleatoria de al menos 32 bytes para firmar y verificar JWT. |
| `JWT_EXPIRES_IN` | Vigencia del token, como `15m`, `1h` o `7d`; por defecto `1h`. |
| `JWT_ISSUER` | Emisor validado en los tokens; por defecto `task-api-express`. |
| `JWT_AUDIENCE` | Audiencia validada en los tokens; por defecto `task-api-client`. |

Genera `JWT_SECRET` localmente con `node --input-type=module -e "import { randomBytes } from 'node:crypto'; console.log(randomBytes(32).toString('hex'))"` y guárdalo solo en `.env`. Nunca uses el marcador de `.env.example` como valor real.

## Endpoints

| Método | Ruta | Éxito | Errores previstos |
|---|---|---:|---|
| `GET` | `/health` | `200` | - |
| `GET` | `/health/database` | `200` | `503` |
| `POST` | `/api/tasks` | `201` | `400`, `415`, `422`, `503` |
| `GET` | `/api/tasks` | `200` | `503` |
| `GET` | `/api/tasks/:id` | `200` | `400`, `404`, `503` |
| `PATCH` | `/api/tasks/:id` | `200` | `400`, `404`, `415`, `422`, `503` |
| `PATCH` | `/api/tasks/:id/complete` | `200` | `400`, `404`, `503` |
| `DELETE` | `/api/tasks/:id` | `204` | `400`, `404`, `503` |
| `POST` | `/api/auth/register` | `201` | `415`, `422`, `409`, `503` |
| `POST` | `/api/auth/login` | `200` | `415`, `422`, `401`, `503` |

## Autenticación

El registro acepta `name`, `email`, `password` y `confirmPassword`. La confirmación solo se valida en la frontera HTTP; no se guarda ni se devuelve. El usuario siempre recibe el rol `user`. La contraseña requiere al menos 15 caracteres y no más de 72 bytes UTF-8; se guarda únicamente su hash bcrypt con 12 rondas.

```json
{
  "name": "Ana Torres",
  "email": "ana.torres@example.com",
  "password": "Frase segura para clase 2026",
  "confirmPassword": "Frase segura para clase 2026"
}
```

El login devuelve `data.user`, `data.accessToken`, `data.tokenType` (`Bearer`) y `data.expiresIn`. El JWT firma solo `sub` (id del usuario) y `role`, además de los claims estándar; la verificación restringe el algoritmo a HS256 y valida emisor, audiencia y expiración. Las respuestas públicas no contienen `passwordHash`.

Las rutas de tareas permanecen públicas en A9; exigir el JWT para acceder a recursos corresponde a A10.

## Actualización Parcial

`PATCH /api/tasks/:id` permite modificar `title`, `status` o ambos campos. Rechaza cuerpos vacíos, arreglos, campos desconocidos, títulos vacíos o mayores a 120 caracteres y estados distintos de `pending` o `completed`.

```json
{
  "title": "Documentar el CRUD persistente",
  "status": "completed"
}
```

## Comandos

| Comando | Propósito |
|---|---|
| `pnpm install` | Instala dependencias declaradas en `pnpm-lock.yaml`. |
| `pnpm dev` | Inicia el servidor en desarrollo. |
| `pnpm check` | Ejecuta TypeScript sin emitir archivos. |
| `pnpm build` | Compila a `dist/`. |
| `pnpm start` | Ejecuta la versión compilada. |

## Verificación y evidencias

Importa `postman/task-api-ec3-f1-a9.postman_collection.json` para recorrer los casos de autenticación y regresión. Los resultados que dependan de MongoDB Atlas requieren una URI válida y acceso de red habilitado. Registra los resultados reales en `docs/evidencias-ec3-f1-a9.md` y personaliza `docs/reflexion-ec3-f1-a9.md` antes de entregar.

## Evidencias

- Pruebas CRUD persistente: `docs/pruebas-crud-mongodb.md`
- Reflexión CRUD persistente: `docs/reflexion-crud-mongodb.md`
- Colección Postman sugerida: `postman/task-api-ec2-f2-a7.postman_collection.json`
