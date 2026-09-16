# Pruebas de validación y errores

Registro detallado de pruebas ejecutadas para la actividad **EC1 F3 A4: Validación, middleware y manejo centralizado de errores en Express**.

## Tabla de Casos de Prueba

| Caso | Método y ruta | Datos enviados | Esperado | Obtenido | requestId | Resultado |
|---|---|---|---|---|---|---|
| 1. Listar tareas | `GET /api/tasks` | Sin cuerpo | `200 OK` | `200 OK` | `a0c804a5-1102-45e0-9467-34751f8877aa` | Aprobada |
| 2. ID no numérico | `GET /api/tasks/abc` | Sin cuerpo | `400 INVALID_ID` | `400 INVALID_ID` | `f1a8f11f-e8b3-4f93-b6d8-f80164dbcc7b` | Aprobada |
| 3. Tarea no encontrada | `GET /api/tasks/999` | Sin cuerpo | `404 TASK_NOT_FOUND` | `404 TASK_NOT_FOUND` | `d946b41d-cb11-4091-88f5-93c0da238596` | Aprobada |
| 4. Crear tarea válida | `POST /api/tasks` | `{"title": "Aprender validaciones y middleware"}` | `201 Created` | `201 Created` | `c3e0739e-d39f-4375-8025-a13437e2dae2` | Aprobada |
| 5. Tipo de contenido no soportado | `POST /api/tasks` | Content-Type text/plain | `415 UNSUPPORTED_MEDIA_TYPE` | `415 UNSUPPORTED_MEDIA_TYPE` | `4cb43f87-25e2-4161-9db5-862d31295db2` | Aprobada |
| 6. Título vacío | `POST /api/tasks` | `{"title": ""}` | `422 VALIDATION_ERROR` | `422 VALIDATION_ERROR` | `e14a7214-e53b-4866-9b57-ec8fec416952` | Aprobada |
| 7. Título no textual | `POST /api/tasks` | `{"title": 25}` | `422 VALIDATION_ERROR` | `422 VALIDATION_ERROR` | `9665f3d3-c8d7-4b72-bdf4-d021f1589a19` | Aprobada |
| 8. JSON inválido / malformado | `POST /api/tasks` | JSON malformado (`{"title": "incompleto`) | `400 INVALID_JSON` | `400 INVALID_JSON` | `739cf51a-fef0-4822-bc56-d441639ae570` | Aprobada |
| 9. Ruta inexistente | `GET /ruta-inexistente` | Sin cuerpo | `404 ROUTE_NOT_FOUND` | `404 ROUTE_NOT_FOUND` | `8b7d9674-dfcb-485c-8977-160cb6cb6e3d` | Aprobada |
| 10. Regresión completar | `PATCH /api/tasks/3/complete` | Sin cuerpo | `200 OK` | `200 OK` | `e539cd52-0943-4217-a06a-0498b36fa33c` | Aprobada |
| 11. Desafío: estado válido | `PATCH /api/tasks/3/status` | `{"completed": false}` | `200 OK` | `200 OK` | `0540d56b-f81d-4eb0-8025-0604bceb3b29` | Aprobada |
| 12. Desafío: booleano inválido | `PATCH /api/tasks/3/status` | `{"completed": "no"}` | `422 VALIDATION_ERROR` | `422 VALIDATION_ERROR` | `3acb17a0-15ef-45fc-ae58-154df6613da8` | Aprobada |
| 13. Desafío: id inexistente | `PATCH /api/tasks/999/status` | `{"completed": true}` | `404 TASK_NOT_FOUND` | `404 TASK_NOT_FOUND` | `83cd9066-6bf4-4903-8d07-280d9ad4914a` | Aprobada |
| 14. Regresión eliminar | `DELETE /api/tasks/3` | Sin cuerpo | `204 No Content` | `204 No Content` | `5ffcb6f2-39fe-443b-be13-3ef2b794025d` | Aprobada |
| 15. Error 500 controlado | `GET /debug/error` | Sin cuerpo | `500 INTERNAL_ERROR` | `500 INTERNAL_ERROR` | `deb79df1-0b74-41ac-8b09-4c90caea9119` | Aprobada |

---

## Evidencias de Respuestas con Encabezado X-Request-Id y Cuerpo JSON

### 1. Respuesta Correcta (200 OK) - `GET /api/tasks`
- **Encabezado**: `X-Request-Id: a0c804a5-1102-45e0-9467-34751f8877aa`
- **Cuerpo JSON**:
```json
{
  "data": [
    {
      "id": 1,
      "title": "Configurar Express",
      "status": "completed",
      "createdAt": "2026-09-15T21:40:41.000Z"
    },
    {
      "id": 2,
      "title": "Probar la API con Postman",
      "status": "pending",
      "createdAt": "2026-09-15T21:40:41.000Z"
    }
  ]
}
```

### 2. Respuesta 400 Bad Request (`INVALID_ID`) - `GET /api/tasks/abc`
- **Encabezado**: `X-Request-Id: f1a8f11f-e8b3-4f93-b6d8-f80164dbcc7b`
- **Cuerpo JSON**:
```json
{
  "error": {
    "code": "INVALID_ID",
    "message": "El id debe ser un entero positivo.",
    "requestId": "f1a8f11f-e8b3-4f93-b6d8-f80164dbcc7b"
  }
}
```

### 3. Respuesta 400 Bad Request (`INVALID_JSON`) - `POST /api/tasks` con JSON roto
- **Encabezado**: `X-Request-Id: 739cf51a-fef0-4822-bc56-d441639ae570`
- **Cuerpo JSON**:
```json
{
  "error": {
    "code": "INVALID_JSON",
    "message": "El cuerpo contiene JSON inválido.",
    "requestId": "739cf51a-fef0-4822-bc56-d441639ae570"
  }
}
```

### 4. Respuesta 404 Not Found (`TASK_NOT_FOUND`) - `GET /api/tasks/999`
- **Encabezado**: `X-Request-Id: d946b41d-cb11-4091-88f5-93c0da238596`
- **Cuerpo JSON**:
```json
{
  "error": {
    "code": "TASK_NOT_FOUND",
    "message": "No existe una tarea con el id 999.",
    "requestId": "d946b41d-cb11-4091-88f5-93c0da238596"
  }
}
```

### 5. Respuesta 404 Not Found (`ROUTE_NOT_FOUND`) - `GET /ruta-inexistente`
- **Encabezado**: `X-Request-Id: 8b7d9674-dfcb-485c-8977-160cb6cb6e3d`
- **Cuerpo JSON**:
```json
{
  "error": {
    "code": "ROUTE_NOT_FOUND",
    "message": "No existe GET /ruta-inexistente.",
    "requestId": "8b7d9674-dfcb-485c-8977-160cb6cb6e3d"
  }
}
```

### 6. Respuesta 415 Unsupported Media Type (`UNSUPPORTED_MEDIA_TYPE`) - `POST /api/tasks`
- **Encabezado**: `X-Request-Id: 4cb43f87-25e2-4161-9db5-862d31295db2`
- **Cuerpo JSON**:
```json
{
  "error": {
    "code": "UNSUPPORTED_MEDIA_TYPE",
    "message": "La solicitud debe usar Content-Type application/json.",
    "requestId": "4cb43f87-25e2-4161-9db5-862d31295db2"
  }
}
```

### 7. Respuesta 422 Unprocessable Entity (`VALIDATION_ERROR`) - `POST /api/tasks` con título vacío
- **Encabezado**: `X-Request-Id: e14a7214-e53b-4866-9b57-ec8fec416952`
- **Cuerpo JSON**:
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
    "requestId": "e14a7214-e53b-4866-9b57-ec8fec416952"
  }
}
```

### 8. Respuesta 500 Internal Server Error (`INTERNAL_ERROR`) - `GET /debug/error`
- **Encabezado**: `X-Request-Id: deb79df1-0b74-41ac-8b09-4c90caea9119`
- **Cuerpo JSON**:
```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno.",
    "requestId": "deb79df1-0b74-41ac-8b09-4c90caea9119"
  }
}
```
