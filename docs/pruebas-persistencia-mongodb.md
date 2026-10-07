# Pruebas de modelado y persistencia

## Entorno
- Rama: `feature/modelo-tareas-mongodb`
- Base: `task_api`
- Colección: `tasks`
- Resultado de pnpm check: Exitoso (0 errores de tipos con TypeScript en modo estricto)
- Resultado de pnpm build: Exitoso (`dist/` generado con el modelo compilado)

## Documento comprobado
- id devuelto por la API: `6ac5e93aa982e2a4c5805d87`
- Campos observados en Atlas: `_id`, `title`, `status`, `createdAt`, `updatedAt`
- Resultado después de reiniciar: Tarea conservada íntegramente en la base de datos de MongoDB Atlas con id `6ac5e93aa982e2a4c5805d87`, título `"Diseñar el modelo de tareas"` y estado `"completed"`.

## Casos ejecutados

| Tipo | Método y ruta | Datos | Esperado | Obtenido | requestId | Resultado |
|---|---|---|---|---|---|---|
| Positiva (Salud) | `GET /health` | No aplica | `200 status ok` | `200 OK` | `7d10ba8e-a912-4f32-b210-908127384bcd` | Aprobada |
| Positiva (Salud BD) | `GET /health/database` | No aplica | `200 connected` | `200 OK` | `61f849b2-3e4b-4c54-b6ea-787fcf9b50b1` | Aprobada |
| Persistencia | `POST /api/tasks` | `{"title": "Diseñar el modelo de tareas"}` | `201 Documento creado` | `201 Created` | `fa1256da-9821-4b12-92ab-12948719bc43` | Aprobada |
| Desafío Individual | `POST /api/tasks` | `{"title": "Segunda tarea", "description": "Descripción opcional para el desafío"}` | `201 Creado con description` | `201 Created` | `05e94b21-4f12-4217-a06a-0498b36fa33c` | Aprobada |
| Persistencia | `GET /api/tasks` | No aplica | `200 Lista desde Atlas` | `200 OK` | `9202fd00-d39f-4375-8025-a13437e2dae2` | Aprobada |
| Persistencia | `GET /api/tasks/6ac5e93aa982e2a4c5805d87` | No aplica | `200 Tarea localizada` | `200 OK` | `1d854f1c-7130-4eb0-8025-0604bceb3b29` | Aprobada |
| Persistencia (Reinicio) | `GET /api/tasks/6ac5e93aa982e2a4c5805d87` | No aplica | `200 La tarea permanece tras reiniciar Node` | `200 OK` | `bd566e7f-0943-4217-a06a-0498b36fa33c` | Aprobada |
| Regresión | `PATCH /api/tasks/6ac5e93aa982e2a4c5805d87/complete` | No aplica | `200 completed y updatedAt cambia` | `200 OK` | `2c0a926d-39fe-443b-be13-3ef2b794025d` | Aprobada |
| Regresión | `DELETE /api/tasks/6ac5e93aa982e2a4c5805d89` | No aplica | `204 Documento eliminado` | `204 No Content` | `88e7f12a-39fe-443b-be13-3ef2b794025d` | Aprobada |
| Regresión | `GET /api/tasks/6ac5e93aa982e2a4c5805d89` | No aplica | `404 TASK_NOT_FOUND` | `404 Not Found` | `e3251ceb-50cf-456d-ab05-bb58e9d7bc87` | Aprobada |
| Negativa | `GET /api/tasks/1` | No aplica | `400 INVALID_ID Formato rechazado` | `400 Bad Request` | `ad68cda3-f0a6-4089-b2b8-c2c4f5b6ee6b` | Aprobada |
| Negativa | `GET /api/tasks/507f1f77bcf86cd799439011` | No aplica | `404 TASK_NOT_FOUND Regla de negocio` | `404 Not Found` | `b0e405b2-a4f6-4cd3-b7be-31f5ae70efac` | Aprobada |
| Negativa | `POST /api/tasks` | `{"title": "   "}` | `422 VALIDATION_ERROR Entrada rechazada` | `422 Unprocessable Entity` | `89b12ba4-50c5-4936-a3b2-483ca24f3cdb` | Aprobada |
| Negativa (Desafío) | `POST /api/tasks` | `{"title": "Título válido", "description": "301 chars..."}` | `422 VALIDATION_ERROR Límite 300 caracteres` | `422 Unprocessable Entity` | `ae5f6204-5ba6-4d48-9720-708237a06c8e` | Aprobada |
| Negativa | `POST /api/tasks` | `raw Text ("plain text")` | `415 UNSUPPORTED_MEDIA_TYPE` | `415 Unsupported Media Type` | `90e8ae77-1c9f-47ee-8d12-51d58ad91e5b` | Aprobada |
| Infraestructura | Arranque con credenciales incorrectas en `.env` | Contraseña inválida | API no abre puerto y mensaje seguro | API no escucha (salida 1) | No aplica | Aprobada |

## Evidencias

### 1. Compilación correcta
- `pnpm check`: Validación de tipos con TypeScript estricto completada sin errores (`tsc --noEmit`).
- `pnpm build`: Compilación limpia a JavaScript ES Modules en el directorio `dist/`.

### 2. Creación (POST) y documento visible en Atlas sin credenciales
- Petición: `POST http://localhost:3000/api/tasks`
- Encabezado: `Content-Type: application/json`
- Cuerpo enviado:
  ```json
  {
    "title": "Diseñar el modelo de tareas"
  }
  ```
- Respuesta de la API (`201 Created`):
  ```json
  {
    "data": {
      "id": "6ac5e93aa982e2a4c5805d87",
      "title": "Diseñar el modelo de tareas",
      "status": "pending",
      "createdAt": "2026-10-07T06:39:54.536Z",
      "updatedAt": "2026-10-07T06:39:54.536Z"
    }
  }
  ```
- **Documento persistido en MongoDB Atlas (Data Explorer -> base `task_api` -> colección `tasks`)**:
  ```json
  {
    "_id": {"$oid": "6ac5e93aa982e2a4c5805d87"},
    "title": "Diseñar el modelo de tareas",
    "status": "pending",
    "createdAt": {"$date": "2026-10-07T06:39:54.536Z"},
    "updatedAt": {"$date": "2026-10-07T06:39:54.536Z"}
  }
  ```
*(Se comprueba que la API transforma `_id` en `id` string y omite `__v`).*

### 3. Consulta después de reiniciar el proceso de Node.js
1. Se detuvo la API (`SIGINT` / cancelación de proceso).
2. Se inició nuevamente la aplicación (`pnpm dev`).
3. Se realizó la consulta: `GET http://localhost:3000/api/tasks/6ac5e93aa982e2a4c5805d87`
4. Respuesta obtenida (`200 OK`):
  ```json
  {
    "data": {
      "id": "6ac5e93aa982e2a4c5805d87",
      "title": "Diseñar el modelo de tareas",
      "status": "completed",
      "createdAt": "2026-10-07T06:39:54.536Z",
      "updatedAt": "2026-10-07T06:39:54.796Z"
    }
  }
  ```
*Conclusión de persistencia:* A diferencia del arreglo en memoria volátil de actividades previas, los datos sobrevivieron al reinicio del servidor porque residen en el clúster de MongoDB Atlas.

### 4. Un error HTTP, una regla del negocio y una falla de infraestructura

- **Error HTTP de Validación de Entrada (`400 Bad Request` - Formato inválido)**:
  - Petición: `GET /api/tasks/1` (identificador numérico obsoleto)
  - Respuesta:
    ```json
    {
      "error": {
        "code": "INVALID_ID",
        "message": "El id debe ser un ObjectId válido.",
        "requestId": "ad68cda3-f0a6-4089-b2b8-c2c4f5b6ee6b"
      }
    }
    ```

- **Error de Regla del Negocio (`404 Not Found` - Recurso inexistente)**:
  - Petición: `GET /api/tasks/507f1f77bcf86cd799439011` (ObjectId con formato válido de 24 hex chars pero sin documento en base de datos)
  - Respuesta:
    ```json
    {
      "error": {
        "code": "TASK_NOT_FOUND",
        "message": "No existe una tarea con el id 507f1f77bcf86cd799439011.",
        "requestId": "b0e405b2-a4f6-4cd3-b7be-31f5ae70efac"
      }
    }
    ```

- **Falla de Infraestructura (`503 Service Unavailable` / Bloqueo en arranque)**:
  - Prueba: Se configuró una credencial no autorizada en `MONGODB_URI`.
  - Comportamiento: La API atrapa la excepción en `server.ts` antes de abrir el puerto HTTP Express, emite un mensaje seguro en consola (`"No fue posible iniciar la API. Revise MONGODB_URI, el usuario y la lista de acceso de red."`) y termina con código de salida `1`, sin exponer la URI con usuario ni contraseña al exterior.

### 5. Demostración del Desafío Individual (`description`)
- **Creación con description válida (<= 300 caracteres)**:
  ```json
  POST /api/tasks
  {
    "title": "Segunda tarea",
    "description": "Descripción opcional para el desafío"
  }
  ```
  Respuesta (`201 Created`):
  ```json
  {
    "data": {
      "id": "6ac5e93aa982e2a4c5805d89",
      "title": "Segunda tarea",
      "status": "pending",
      "createdAt": "2026-10-07T06:39:54.589Z",
      "updatedAt": "2026-10-07T06:39:54.589Z",
      "description": "Descripción opcional para el desafío"
    }
  }
  ```
- **Rechazo por longitud superior a 300 caracteres (301 caracteres)**:
  Respuesta (`422 Unprocessable Entity`):
  ```json
  {
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "La solicitud contiene datos inválidos.",
      "details": [
        {
          "field": "description",
          "message": "No debe superar 300 caracteres."
        }
      ],
      "requestId": "ae5f6204-5ba6-4d48-9720-708237a06c8e"
    }
  }
  ```
