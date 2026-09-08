# Reflexión: Introducción a Express y construcción de una API REST (EC1 F2 A3)

### 1. ¿Qué responsabilidad cumple Express y qué responsabilidad conserva el servicio?
**Express** asume la responsabilidad del transporte e infraestructura HTTP: levantar el servidor web, escuchar en un puerto determinado, parsear el cuerpo JSON de las solicitudes entrantes (`express.json()`), enrutar las solicitudes según su método y URL hacia el controlador correspondiente, y enviar las respuestas HTTP con sus respectivos códigos de estado y encabezados.

El **servicio** (`src/services/task.service.ts`) conserva la lógica y reglas de negocio puras, de forma totalmente agnóstica e independiente de Express o HTTP. Por ejemplo, define cómo se genera un nuevo ID autonumérico, valida la validez del título, manipula el arreglo de datos y lanza errores de negocio (`AppError`). Si en el futuro se cambia Express por otro framework (como Fastify o NestJS) o por una interfaz CLI, el servicio se mantiene intacto.

### 2. ¿Por qué no conviene escribir toda la lógica dentro de `task.routes.ts`?
No conviene porque violaría el **Principio de Responsabilidad Única (SRP)** y acoplaría el enrutamiento con la lógica de negocio y la gestión de datos. 
- Las rutas (`task.routes.ts`) deben limitarse exclusivamente a asociar combinaciones de métodos HTTP y rutas con sus controladores.
- Si se escribiera toda la lógica en el enrutador, el código se volvería monolítico, difícil de leer, propenso a errores, prácticamente imposible de someter a pruebas unitarias y muy complejo de mantener o migrar cuando la aplicación crezca.

### 3. ¿Qué diferencia existe entre `req.params` y `req.body`?
- **`req.params`**: Contiene los parámetros de ruta definidos con dos puntos en el enrutador (por ejemplo, `/:id` en `/api/tasks/3`). Son valores que viajan directamente en la URL, siempre se reciben inicialmente como cadenas de texto (`string`) y se utilizan principalmente para identificar o ubicar recursos específicos.
- **`req.body`**: Contiene la carga útil o datos enviados en el cuerpo de la solicitud HTTP (típicamente en formato JSON a través de métodos como `POST` o `PATCH`). Permite enviar estructuras de datos complejas (como `{ "title": "Nueva tarea" }`) procesadas por el middleware `express.json()`.

### 4. ¿Por qué el título recibido desde un cliente se considera `unknown` antes de validarlo?
Porque en el límite de la aplicación (la frontera entre la red y nuestro código), TypeScript no tiene control en tiempo de compilación sobre lo que un cliente externo (como Postman o curl) enviará en la carga útil HTTP. El cliente podría enviar un número, un booleano, un objeto, un arreglo o incluso un valor nulo. Utilizar `unknown` obliga a realizar una comprobación defensiva de tipos en tiempo de ejecución (mediante `typeof title !== 'string' || !title.trim()`) antes de realizar operaciones de cadenas de texto como `.trim()`, garantizando la seguridad de tipos del sistema.

### 5. ¿Qué ventaja ofrece centralizar los errores en un middleware?
Centralizar los errores en un middleware (`src/middlewares/error.middleware.ts`) ofrece múltiples ventajas arquitectónicas:
- **Consistencia y uniformidad**: Todas las respuestas de error siguen el mismo formato JSON (`{ "error": "mensaje" }`) y código de estado adecuado.
- **Eliminación de código duplicado**: Evita tener que escribir bloques de captura y formateo de respuesta manual en cada controlador.
- **Seguridad**: Diferencia los errores operacionales controlados (`AppError`, con códigos como 400 o 404) de las excepciones no controladas o fallos inesperados del sistema, registrando el stack trace en la consola del servidor pero enviando al cliente un mensaje seguro (`500: Error interno del servidor`) sin exponer detalles internos ni vulnerabilidades.

### 6. ¿Cuándo debe utilizarse 201 en lugar de 200?
El código **201 Created** debe utilizarse cuando una solicitud HTTP tiene como resultado la creación exitosa de un recurso nuevo en el servidor (en nuestra API, al ejecutar `POST /api/tasks` y crear una nueva tarea con ID propio y timestamp). Por el contrario, **200 OK** se reserva para solicitudes de lectura exitosa (`GET`) o actualizaciones de recursos existentes (`PATCH` o `PUT`).

### 7. ¿Por qué DELETE responde 204 sin un objeto JSON?
El código **204 No Content** indica que la solicitud se procesó con éxito pero que el servidor no necesita devolver ningún cuerpo de respuesta al cliente. En el caso de `DELETE`, dado que el recurso solicitado fue eliminado exitosamente, el código HTTP `204` comunica con total claridad el resultado sin necesidad de consumir ancho de banda adicional transmitiendo un objeto JSON innecesario.

### 8. ¿Qué ocurrirá con las tareas cuando el servidor se reinicie y por qué?
Al reiniciar el proceso del servidor (por ejemplo con Node o TSX), todas las tareas creadas, modificadas o eliminadas durante la sesión se perderán y la colección regresará a su estado inicial de dos tareas predeterminadas. Esto ocurre porque el almacenamiento se encuentra implementado en la memoria RAM del proceso (un arreglo en `src/data/tasks.ts`), sin persistencia en disco ni base de datos externa.

### 9. ¿Qué archivos podrán conservarse cuando se incorpore MongoDB Atlas?
Gracias a la arquitectura por capas implementada, se conservará la gran mayoría de la base de código:
- `src/models/task.ts`: Se mantendrá o adaptará como esquema/interfaz para Mongoose/MongoDB.
- `src/routes/task.routes.ts`: Se conserva intacto, ya que el contrato de la API HTTP no cambia.
- `src/controllers/task.controller.ts`: Se conserva prácticamente idéntico, solo adaptando la resolución asíncrona (`async/await`) de las llamadas a los servicios.
- `src/middlewares/`: Ambos middlewares (`error.middleware.ts` y `not-found.middleware.ts`) y la clase `src/errors/app-error.ts` se conservan sin modificaciones.
- `src/app.ts` y `src/server.ts`: Se conservan, agregando en `server.ts` la conexión a la base de datos antes de escuchar solicitudes.

El cambio principal se concentrará en `src/data/tasks.ts` (que será sustituido por la conexión a la base de datos) y en `src/services/task.service.ts` (cuyas funciones pasarán de interactuar con el arreglo a realizar consultas asíncronas con el driver o modelo de MongoDB).
