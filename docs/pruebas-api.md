# Pruebas de Task API - EC1 F2 A3

A continuación se detalla el registro de pruebas ejecutadas sobre la **Task API**, incluyendo las solicitudes del contrato inicial, las pruebas negativas y el desafío individual de actualización de título.

## Tabla de Resultados

| # | Método | Ruta | Datos enviados (Body / Params) | Código Esperado | Código Obtenido | Resultado | Descripción / Propósito |
|:--:|:------:|:-----|:-------------------------------|:---------------:|:---------------:|:---------:|:------------------------|
| 1 | `GET` | `/health` | Ninguno | `200` | `200` | **Aprobada** | Comprueba disponibilidad del servidor (`status: "ok"`). |
| 2 | `GET` | `/api/tasks` | Ninguno | `200` | `200` | **Aprobada** | Lista las 2 tareas iniciales en memoria. |
| 3 | `POST` | `/api/tasks` | `{"title": "Documentar mi primera API"}` | `201` | `201` | **Aprobada** | Crea una nueva tarea (ID 3, `pending`). |
| 4 | `GET` | `/api/tasks/3` | Param `:id = 3` | `200` | `200` | **Aprobada** | Consulta la tarea recién creada por ID. |
| 5 | `PATCH` | `/api/tasks/3/complete` | Param `:id = 3` | `200` | `200` | **Aprobada** | Marca la tarea 3 con estado `completed`. |
| 6 | `PATCH` | `/api/tasks/3` | `{"title": "Nuevo titulo"}` | `200` | `200` | **Aprobada** | Desafío: actualiza el título de la tarea 3. |
| 7 | `DELETE` | `/api/tasks/3` | Param `:id = 3` | `204` | `204` | **Aprobada** | Elimina la tarea 3 (respuesta sin contenido). |
| 8 | `GET` | `/api/tasks/3` | Param `:id = 3` | `404` | `404` | **Aprobada** | Verifica que la tarea 3 ya no existe tras ser eliminada. |
| 9 | `POST` | `/api/tasks` | `{"title": ""}` | `400` | `400` | **Aprobada** | Prueba negativa: error cuando `title` es una cadena vacía. |
| 10 | `GET` | `/api/tasks/abc` | Param `:id = abc` | `400` | `400` | **Aprobada** | Prueba negativa: error cuando el ID no es un entero positivo. |
| 11 | `GET` | `/ruta-inexistente` | Ninguno | `404` | `404` | **Aprobada** | Prueba negativa: error de ruta inexistente manejado por `notFound`. |
| 12 | `PATCH` | `/api/tasks/1` | `{"title": "   "}` | `400` | `400` | **Aprobada** | Prueba negativa (Desafío): error al enviar `title` vacío en edición. |
| 13 | `PATCH` | `/api/tasks/999` | `{"title": "Titulo valido"}` | `404` | `404` | **Aprobada** | Prueba negativa (Desafío): error al editar tarea inexistente. |

---

## Evidencias de Códigos de Estado Clave

### 1. Respuesta 201 Created (`POST /api/tasks`)
- **Solicitud**: `POST http://localhost:3000/api/tasks`
- **Headers**: `Content-Type: application/json`
- **Body**:
  ```json
  {
    "title": "Documentar mi primera API"
  }
  ```
- **Código HTTP**: `201 Created`
- **Respuesta JSON**:
  ```json
  {
    "data": {
      "id": 3,
      "title": "Documentar mi primera API",
      "status": "pending",
      "createdAt": "2026-09-08T23:09:44.000Z"
    }
  }
  ```

### 2. Respuesta 204 No Content (`DELETE /api/tasks/3`)
- **Solicitud**: `DELETE http://localhost:3000/api/tasks/3`
- **Código HTTP**: `204 No Content`
- **Respuesta**: *(Cuerpo vacío, según estándar HTTP)*

### 3. Respuesta 400 Bad Request (`POST /api/tasks` con título vacío)
- **Solicitud**: `POST http://localhost:3000/api/tasks`
- **Headers**: `Content-Type: application/json`
- **Body**:
  ```json
  {
    "title": ""
  }
  ```
- **Código HTTP**: `400 Bad Request`
- **Respuesta JSON**:
  ```json
  {
    "error": "El campo title es obligatorio."
  }
  ```

### 4. Respuesta 404 Not Found (`GET /api/tasks/999` o `/ruta-inexistente`)
- **Solicitud**: `GET http://localhost:3000/api/tasks/999`
- **Código HTTP**: `404 Not Found`
- **Respuesta JSON**:
  ```json
  {
    "error": "No existe una tarea con el id 999."
  }
  ```
- **Solicitud**: `GET http://localhost:3000/ruta-inexistente`
- **Código HTTP**: `404 Not Found`
- **Respuesta JSON**:
  ```json
  {
    "error": "No existe GET /ruta-inexistente."
  }
  ```
