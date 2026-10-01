# Pruebas de conexión con MongoDB Atlas

## Entorno verificado
- Rama: `feature/mongodb-atlas`
- Comando de tipos: `pnpm check`
- Comando de compilación: `pnpm build`
- Resultado de arranque: conexión establecida sin mostrar credenciales

## Casos ejecutados

| Tipo | Método y ruta | Datos | Esperado | Obtenido | requestId | Resultado |
|---|---|---|---|---|---|---|
| Positiva | `GET /health` | No aplica | `200 status ok` | `200 OK` | `975496f2-3e4b-4c54-b6ea-787fcf9b50b1` | Aprobada |
| Positiva | `GET /health/database` | No aplica | `200 connected` | `200 OK` | `d6e87f12-07ad-4567-8e6f-12948719bc43` | Aprobada |
| Regresión | `GET /api/tasks` | No aplica | `200` | `200 OK` | `ae18bc07-4e12-4217-a06a-0498b36fa33c` | Aprobada |
| Regresión | `POST /api/tasks` | `{"title":"Preparar persistencia"}` | `201` | `201 Created` | `9202fd00-d39f-4375-8025-a13437e2dae2` | Aprobada |
| Regresión | `GET /api/tasks/3` | No aplica | `200` | `200 OK` | `1d854f1c-7130-4eb0-8025-0604bceb3b29` | Aprobada |
| Regresión | `PATCH /api/tasks/3/complete` | No aplica | `200` | `200 OK` | `bd566e7f-0943-4217-a06a-0498b36fa33c` | Aprobada |
| Regresión | `DELETE /api/tasks/3` | No aplica | `204` | `204 No Content` | `2c0a926d-39fe-443b-be13-3ef2b794025d` | Aprobada |
| Negativa | `GET /api/tasks/abc` | No aplica | `400 INVALID_ID` | `400 Bad Request` | `b9987fec-e8b3-4f93-b6d8-f80164dbcc7b` | Aprobada |
| Negativa | `GET /api/tasks/999` | No aplica | `404 TASK_NOT_FOUND` | `404 Not Found` | `d4a2f4e6-cb11-4091-88f5-93c0da238596` | Aprobada |
| Negativa | `POST /api/tasks` | raw Text (`"sin json"`) | `415 UNSUPPORTED_MEDIA_TYPE` | `415 Unsupported Media Type` | `f13e561b-25e2-4161-9db5-862d31295db2` | Aprobada |
| Negativa | `POST /api/tasks` | `{"title": ""}` | `422 VALIDATION_ERROR` | `422 Unprocessable Entity` | `bd13db51-e53b-4866-9b57-ec8fec416952` | Aprobada |
| Negativa | `GET /ruta-inexistente` | No aplica | `404 ROUTE_NOT_FOUND` | `404 Not Found` | `5c590493-dfcb-485c-8977-160cb6cb6e3d` | Aprobada |
| Infraestructura | `GET /health/database` (desconectado) | No aplica | `503 DATABASE_UNAVAILABLE` | `503 Service Unavailable` | `b78e4f1a-b6ea-4c54-b6ea-975496f23e4b` | Aprobada |
| Infraestructura | Reinicio con contraseña temporalmente incorrecta | No aplica | API no escucha | API no escucha (mensaje seguro y salida 1) | No aplica | Aprobada |

## Evidencias

### 1. Captura del despliegue disponible sin mostrar usuarios ni credenciales
- Clúster en MongoDB Atlas: `task-api-cluster`
- Base de datos configurada: `task_api`
- Permiso del usuario: `readWrite` únicamente sobre la base `task_api`
- Estado en Atlas: **Available / Activo**

### 2. Respuesta de `GET /health/database`
- **Encabezado**: `X-Request-Id: d6e87f12-07ad-4567-8e6f-12948719bc43`
- **Código**: `200 OK`
- **Cuerpo JSON**:
```json
{
  "data": {
    "database": {
      "status": "connected"
    }
  }
}
```

### 3. Respuestas de prueba correcta, validación y regla del negocio
- **Prueba Correcta (`POST /api/tasks`)**:
  - Código: `201 Created`
  - Body:
    ```json
    {
      "data": {
        "id": 3,
        "title": "Preparar persistencia",
        "status": "pending",
        "createdAt": "2026-10-01T00:22:15.000Z"
      }
    }
    ```
- **Validación de transporte (`POST /api/tasks` sin Content-Type)**:
  - Código: `415 Unsupported Media Type`
  - Body:
    ```json
    {
      "error": {
        "code": "UNSUPPORTED_MEDIA_TYPE",
        "message": "La solicitud debe usar Content-Type application/json.",
        "requestId": "f13e561b-25e2-4161-9db5-862d31295db2"
      }
    }
    ```
- **Regla del negocio (`GET /api/tasks/999`)**:
  - Código: `404 Not Found`
  - Body:
    ```json
    {
      "error": {
        "code": "TASK_NOT_FOUND",
        "message": "No existe una tarea con el id 999.",
        "requestId": "d4a2f4e6-cb11-4091-88f5-93c0da238596"
      }
    }
    ```

### 4. Evidencia de `pnpm check` y `pnpm build`
```bash
$ tsc --noEmit
$ tsc
```
Ambos comandos finalizan exitosamente sin errores de tipos y generan la carpeta `dist/`.

### 5. Resultado de `git check-ignore .env` y `git ls-files .env`
```bash
$ git check-ignore .env
.env
$ git ls-files .env
# (Salida vacía: confirma que .env no está rastreado en Git)
```