# Reflexión: Validación, middleware y manejo centralizado de errores en Express (EC1 F3 A4)

### 1. ¿Qué diferencia existe entre validar el formato HTTP y proteger una regla del negocio?
- **Validación de formato HTTP (capa de middleware)**: Se enfoca en la estructura superficial y sintáctica del transporte: comprobar que los encabezados sean correctos (`Content-Type: application/json`), que los parámetros de ruta sean del tipo esperado (por ejemplo, que `:id` sea un entero positivo) y que el cuerpo contenga los tipos de datos requeridos antes de que la petición toque los controladores.
- **Protección de reglas del negocio (capa de servicio)**: Garantiza las invariantes y el dominio de la aplicación, independientemente del protocolo de transporte. Por ejemplo, validar que una tarea realmente exista en la colección antes de modificarla o eliminarla, o aplicar restricciones lógicas que deben cumplirse siempre, incluso si el servicio es invocado desde scripts, pruebas unitarias o comandos CLI sin pasar por HTTP.

### 2. ¿Por qué conviene usar `router.param` para validar el id?
Conviene porque aplica el principio **DRY (Don't Repeat Yourself)** de forma centralizada:
- Se intercepta automáticamente cualquier ruta que contenga el parámetro `:id` (como `GET /:id`, `PATCH /:id/complete`, `PATCH /:id/status`, `PATCH /:id` o `DELETE /:id`) ejecutando `validateTaskId` una única vez.
- Evita que cada controlador tenga que invocar repetidamente funciones de parseo como `parseId(req.params.id)`.
- Si el identificador es inválido (letras, decimales, negativos o cero), la petición se corta de inmediato con un error 400 antes de llegar al controlador o al servicio.

### 3. ¿Qué ventaja ofrece guardar datos normalizados en `res.locals`?
`res.locals` es un objeto proporcionado por Express que persiste durante todo el ciclo de vida de una misma solicitud HTTP (request-response). Guardar datos ya validados y normalizados allí (como `res.locals.taskId = id`, `res.locals.taskTitle = title.trim()` o `res.locals.requestId`) ofrece las siguientes ventajas:
- **Desacoplamiento**: El controlador no necesita lidiar con tipos crudos o desconocidos (`unknown`, `string` de la URL, cadenas con espacios en blanco superfluos).
- **Seguridad y predictibilidad**: Garantiza que el valor consumido por el controlador ya pasó por todos los filtros de validación y saneamiento, listo para entregarse directamente al servicio.

### 4. ¿Cuándo corresponde responder 400 y cuándo 422?
- **400 Bad Request**: Corresponde cuando la petición está sintácticamente malformada o el cliente envía datos que el servidor no puede ni siquiera interpretar o parsear. Ejemplos en nuestra API: un JSON incompleto o con sintaxis inválida (`INVALID_JSON`), o un identificador de ruta que no es un entero positivo (`INVALID_ID`).
- **422 Unprocessable Entity**: Corresponde cuando la sintaxis y el formato son válidos (es un JSON bien estructurado), pero el contenido semántico de los campos viola las reglas de negocio o validación de la aplicación (`VALIDATION_ERROR`). Ejemplos: enviar `{ "title": "" }` (cadena vacía), `{ "title": 25 }` (no es texto), `{ "title": "..." }` con más de 120 caracteres, o `{ "completed": "si" }` cuando se exige un booleano.

### 5. ¿Por qué `notFound` delega el error en lugar de responder directamente?
`notFound` delega la ausencia de una ruta mediante `next(new AppError(..., 404, 'ROUTE_NOT_FOUND'))` para mantener un **único punto de salida de errores** en la aplicación:
- Si `notFound` construyera su propia respuesta JSON, se duplicaría la lógica de formato y sería difícil garantizar que contenga la misma estructura acordada (`{ error: { code, message, requestId } }`) y los encabezados comunes como `X-Request-Id`.
- Al delegar al `errorHandler` central, todas las respuestas de error (rutas no encontradas, validaciones fallidas, JSON malformados y errores no controlados) pasan por el mismo embudo uniforme.

### 6. ¿Qué información no debe enviarse al cliente en un error 500?
Nunca debe enviarse información técnica interna sensible, como:
- El rastro de la pila de llamadas (*stack trace*).
- Nombres de archivos, rutas completas del servidor o librerías internas.
- Credenciales, nombres de bases de datos o detalles de infraestructura.
Exponer esa información facilitaría ataques y vulnerabilidades. El cliente debe recibir únicamente un código genérico y seguro (`code: "INTERNAL_ERROR"`, `message: "Ocurrió un error interno."` junto con su `requestId`), mientras que el detalle técnico completo se registra exclusivamente en los logs internos del servidor (`console.error({ requestId, error })`).

### 7. ¿Cómo ayuda `requestId` durante la depuración?
`requestId` actúa como un **identificador de correlación único** entre el cliente y el servidor:
- Se genera al inicio de cada solicitud mediante `randomUUID()` y se devuelve en el encabezado HTTP `X-Request-Id` y en el cuerpo del error.
- Si un usuario o cliente de la API reporta un problema, puede proporcionar su `requestId`. Los desarrolladores pueden buscar ese ID exacto en los logs del servidor para ver con precisión qué ocurrió en esa solicitud específica sin tener que adivinar entre miles de peticiones simultáneas.

### 8. ¿Qué prueba demuestra que la refactorización no rompió la API anterior?
Las **pruebas de regresión** realizadas sobre las operaciones que ya funcionaban:
- `GET /health` responde 200 con `{ status: "ok" }`.
- `GET /api/tasks` sigue listando las tareas correctamente.
- `PATCH /api/tasks/:id/complete` marca la tarea como completada y devuelve 200 con la tarea actualizada.
- `DELETE /api/tasks/:id` elimina la tarea y devuelve 204 No Content.
- Las consultas posteriores a la tarea eliminada siguen respondiendo 404.
Todas estas operaciones se ejecutaron exitosamente tras incorporar los middlewares de validación y el nuevo manejador de errores, demostrando que la API conserva compatibilidad total con las operaciones previas mientras fortalece su seguridad y robustez.
