# Reflexión: Modelado de documentos y persistencia de tareas en MongoDB Atlas (EC2 F2 A6)

### 1. ¿Qué diferencia existe entre un documento, un esquema y un modelo?
- **Documento**: Es la unidad individual de datos almacenada físicamente en MongoDB bajo formato BSON. Equivale a un registro o fila en una base de datos relacional y contiene pares clave-valor (por ejemplo, `_id`, `title`, `status`, etc.).
- **Esquema (`Schema`)**: Es la definición de metadatos y reglas que Mongoose impone a nivel de aplicación sobre los documentos. Define qué campos existen, sus tipos de datos, valores por defecto, validaciones (como `required`, `trim`, `maxlength`), y opciones estructurales (como `timestamps` o `versionKey`).
- **Modelo (`Model`)**: Es una clase constructora compilada a partir del esquema (`model('Task', taskSchema)`). Proporciona la interfaz de programación directa (API) para consultar, crear, modificar y eliminar documentos en una colección concreta de MongoDB (`TaskModel.find()`, `TaskModel.create()`, etc.).

### 2. ¿Por qué la API devuelve `id` en lugar de `_id`?
MongoDB identifica internamente cada documento con el campo `_id` de tipo `ObjectId`. Sin embargo, la API transforma este campo en `id` (de tipo string de 24 caracteres) mediante la función `toTask`:
1. **Abstracción del almacenamiento**: Oculta la estructura técnica interna de MongoDB, evitando que los clientes HTTP dependan de convenciones específicas de la base de datos (desacoplamiento).
2. **Claridad y compatibilidad**: Para los clientes HTTP (frontends web, aplicaciones móviles o consumidores de API), un atributo `id` como cadena de texto es el estándar universal en arquitectura REST.
3. **Seguridad**: Evita exponer detalles del motor de persistencia subyacente.

### 3. ¿Qué problema evita migrar todas las operaciones a una sola fuente de datos?
Evita el problema de tener **múltiples fuentes de verdad inconsistentes** (*split-brain*). Si se mantuvieran unas operaciones en MongoDB Atlas (como `POST` y `GET`) y otras en el arreglo en memoria (como `PATCH` y `DELETE`), ocurriría una discordancia grave: una tarea recién creada en la nube no existiría en memoria y no podría completarse ni eliminarse de manera confiable. Migrar todas las funciones del servicio (`listTasks`, `findTaskById`, `createTask`, `completeTask`, `deleteTask`) a `TaskModel` garantiza que toda la API opere sobre una única base de datos persistente e íntegra.

### 4. ¿Qué reglas aplica el middleware y cuáles repite el esquema?
- **El middleware (`validate-task-title.middleware.ts`, `validate-task-id.middleware.ts`)**: Actúa en la frontera HTTP protegiendo la entrada de la ruta. Valida que el `id` recibido en el parámetro URL tenga exactamente 24 caracteres hexadecimales de un ObjectId válido, que el `title` no venga vacío y no exceda 120 caracteres, y que `description` no supere 300 caracteres.
- **El esquema de Mongoose (`taskSchema`)**: Repite y refuerza estas reglas en la capa de datos (`required`, `trim`, `maxlength: 120` para título, y `maxlength: 300` para descripción). Esta redundancia aplica el principio de **defensa en profundidad**: asegura que los datos sean coherentes y válidos incluso si se invoca `TaskModel` desde otro servicio, script, worker o middleware que omita la validación HTTP inicial.

### 5. ¿Qué diferencia existe entre `INVALID_ID` y `TASK_NOT_FOUND`?
- **`INVALID_ID` (Código HTTP 400 Bad Request)**: Es un error de **sintaxis / formato**. Ocurre en el middleware cuando el valor proporcionado en la URL no cumple con la estructura requerida (por ejemplo, `/api/tasks/1` o `/api/tasks/abc` en lugar de un ObjectId de 24 caracteres hexadecimales). La petición ni siquiera llega a consultar la base de datos.
- **`TASK_NOT_FOUND` (Código HTTP 404 Not Found)**: Es un error de **regla de negocio / ausencia de recurso**. Ocurre en el servicio cuando el formato del ObjectId es sintácticamente perfecto (por ejemplo, `507f1f77bcf86cd799439011`), la base de datos es consultada correctamente, pero no existe ningún documento con ese identificador en la colección `tasks`.

### 6. ¿Qué hacen `timestamps` y `versionKey: false`?
- **`timestamps: true`**: Le indica a Mongoose que gestione de forma automática los campos `createdAt` (fecha de inserción del documento) y `updatedAt` (fecha de última modificación). En cada creación y actualización (`findByIdAndUpdate`), Mongoose asigna y refresca estas marcas de tiempo en formato Date sin requerir lógica manual.
- **`versionKey: false`**: Desactiva la creación del campo interno `__v` que Mongoose utiliza por defecto para el control de concurrencia y versiones de documentos internos. Dado que esta versión de la API no maneja concurrencia optimista, desactivarlo mantiene los documentos y las respuestas JSON limpios y minimalistas.

### 7. ¿Por qué los controladores deben usar `async` y `await`?
Porque todas las operaciones de red hacia MongoDB Atlas a través de Mongoose (`TaskModel.find()`, `TaskModel.create()`, etc.) son **operaciones asíncronas de entrada/salida (I/O)** que retornan promesas (`Promise`). El uso de `async/await` garantiza que el controlador pause su ejecución hasta que la consulta en la nube resuelva y devuelva los datos reales, antes de serializar la respuesta HTTP con `res.status().json()`. Sin `await`, el controlador enviaría una promesa pendiente en el JSON o respondería antes de que la base de datos complete la acción.

### 8. ¿Cómo llega un `AppError` asíncrono al `errorHandler` de Express 5?
En Express 5, el motor de enrutamiento incorpora soporte nativo para funciones asíncronas y promesas. Si dentro de un controlador asíncrono una promesa es rechazada o una función del servicio lanza un `AppError` (como `throw new AppError(...)`), Express 5 intercepta automáticamente la excepción sin requerir envoltorios `try/catch` manuales ni llamadas a `next(error)`. Express redirige el error hacia la cadena de middlewares hasta llegar a `errorHandler`, el cual extrae el `statusCode`, `code`, `message`, `details` y `requestId` para generar la respuesta uniforme.

### 9. ¿Qué prueba demuestra realmente que una tarea es persistente?
La prueba del **reinicio controlado del proceso de Node.js**:
1. Se crea una tarea mediante `POST /api/tasks` y se recibe su `id`.
2. Se detiene completamente el servidor con `Ctrl+C` (lo cual destruye todas las variables y estructuras en la memoria RAM del proceso).
3. Se vuelve a iniciar el servidor con `pnpm dev`.
4. Se ejecuta `GET /api/tasks/<id>` o `GET /api/tasks`.
Si la tarea sigue existiendo y devuelve exactamente los mismos atributos que cuando se creó, se demuestra que los datos están almacenados de forma durable en los discos del clúster de MongoDB Atlas y no en la memoria volátil del servidor.

### 10. ¿Qué información de Mongoose o Atlas nunca debe aparecer en la respuesta HTTP?
Nunca deben exponerse:
- Cadenas de conexión (`MONGODB_URI`), usuarios, contraseñas o tokens.
- Nombres de hosts, clústeres (`cluster0.hjszpeq.mongodb.net`), puertos o topología de réplicas.
- Detalles internos de Mongoose como `__v`, buffers o esquemas internos BSON.
- *Stack traces* de errores nativos (`MongooseError`, `MongoServerError`) o mensajes de red de base de datos.
Toda excepción debe traducirse a mensajes funcionales y seguros para el usuario (`DATABASE_UNAVAILABLE`, `PERSISTENCE_VALIDATION_ERROR`, `TASK_NOT_FOUND`) conservando el `requestId` para la trazabilidad interna de los desarrolladores.
