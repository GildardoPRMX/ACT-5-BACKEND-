# Reflexión de arquitectura por capas, consultas y paginación

## 1. ¿Qué responsabilidad nueva cumple `task.repository.ts`?

`task.repository.ts` asume la responsabilidad exclusiva de encapsular todas las operaciones directas de acceso a datos contra MongoDB mediante Mongoose (`find`, `countDocuments`, `findById`, `create`, `findByIdAndUpdate`, `findByIdAndDelete`). En este módulo se construyen los objetos de consulta (`FilterQuery`), se configura la ordenación (`buildSort`), se calculan `skip` y `limit` a nivel de cursor de base de datos, se escapan caracteres especiales para expresiones regulares y se realiza el mapeo seguro de errores técnicos de Mongoose hacia `AppError` (`PERSISTENCE_VALIDATION_ERROR` o `DATABASE_UNAVAILABLE`). Esto aísla por completo los detalles de Mongoose del resto de la aplicación.

## 2. ¿Por qué el middleware debe validar `req.query` antes del controlador?

Porque los parámetros recibidos a través de la URL (`req.query`) son entradas no confiables del cliente HTTP. Si no se validan previamente, Express puede interpretar valores como arreglos u objetos si un parámetro se repite, o pueden enviarse parámetros no reconocidos. Validar en `validateTaskQuery`:
- Rechaza parámetros no permitidos mediante una lista cerrada (`ALLOWED_QUERY_FIELDS`).
- Evita parámetros repetidos asegurando que cada valor se reciba una sola vez como cadena.
- Verifica enteros positivos y límites máximos para `page` y `limit`.
- Comprueba valores permitidos para `status`, `sortBy` y `order`, y restringe la longitud de `search`.
- Si existen fallas, responde de inmediato con `422 QUERY_VALIDATION_ERROR` sin consumir recursos de MongoDB.
- Si la consulta es válida, proporciona al controlador un objeto `TaskListQuery` limpio y estrictamente tipado a través de `res.locals.taskQuery`.

## 3. ¿Cómo se calcula skip para una página determinada?

Se calcula con la fórmula:
`skip = (page - 1) * limit`
Donde `page` es el número de página solicitado (1-indexado) y `limit` es la cantidad máxima de elementos por página. Por ejemplo:
- Para `page = 1` y `limit = 10`: `skip = (1 - 1) * 10 = 0` (no se omiten documentos).
- Para `page = 2` y `limit = 10`: `skip = (2 - 1) * 10 = 10` (se omiten los primeros 10 documentos).
- Para `page = 3` y `limit = 5`: `skip = (3 - 1) * 5 = 10` (se omiten los primeros 10 documentos para mostrar del 11 al 15).

## 4. ¿Por qué `find` y `countDocuments` deben usar el mismo filtro?

Porque los metadatos de paginación (`meta.total` y `meta.totalPages`) deben reflejar con exactitud la cantidad de documentos que coinciden con los criterios solicitados por el usuario. Si `countDocuments` recibiera un filtro diferente o contara todos los registros de la colección, `meta.total` reportaría una cantidad falsa que no correspondería a los documentos filtrados que devuelve `find`, lo que provocaría que `totalPages`, `hasNextPage` y `hasPreviousPage` contengan valores erróneos e inconsistentes.

## 5. ¿Qué problema evita `escapeRegex`?

Evita vulnerabilidades de inyección de expresiones regulares y alteraciones semánticas en la búsqueda. Si un usuario envía metacaracteres como `.*`, `+`, `?`, `^`, `$`, `(`, `)`, `[`, `]` o `|`, sin escape podrían transformar una búsqueda de texto literal en un comodín que consulte toda la colección (como `search=.*`), o provocar ataques de denegación de servicio por expresiones regulares (ReDoS). `escapeRegex` antepone barras invertidas `\` a los caracteres especiales para forzar a MongoDB a tratarlos como caracteres literales.

## 6. ¿Por qué `sortBy` utiliza una lista permitida?

`sortBy` utiliza una lista blanca cerrada (`TASK_SORT_FIELDS = ['createdAt', 'updatedAt', 'title', 'status']`) para evitar que el cliente ordene por propiedades no deseadas o campos internos de la base de datos (como contraseñas, versiones internas `__v` o campos no indexados). Esto protege la integridad del modelo, evita errores en la base de datos y optimiza el rendimiento impidiendo ordenamientos sobre columnas no optimizadas.

## 7. ¿Qué diferencia existe entre `data.length`, `meta.total` y `meta.totalPages`?

- `data.length`: Es la cantidad real de tareas entregadas en la respuesta HTTP actual, la cual está limitada por el valor de `limit` (por ejemplo, 10 elementos en la página actual).
- `meta.total`: Es el número total de documentos que cumplen con el filtro en toda la colección de MongoDB, sin importar en qué página se encuentre el cliente.
- `meta.totalPages`: Es el número total de páginas necesarias para distribuir `meta.total` entre `limit`, calculado como `Math.ceil(total / limit)`.

## 8. ¿Cómo llega un error asíncrono del repositorio al `errorHandler` de Express 5?

En Express 5 las funciones asíncronas devuelven promesas cuyo rechazo es manejado nativamente. Cuando ocurre un error en Mongoose, la función `execute` del repositorio lo captura, lo transforma a `AppError` mediante `mapPersistenceError` y lo relanza (`throw`). Al no ser capturado con `try/catch` dentro del controlador, Express 5 detecta automáticamente la promesa rechazada y transfiere el error al middleware final `errorHandler`, el cual serializa el código HTTP correspondiente, `code`, `message`, `details` y el `requestId`.

## 9. ¿Qué prueba demuestra que A8 no rompió el CRUD de A7?

La ejecución de pruebas de regresión completas:
1. `POST /api/tasks` crea una nueva tarea con código `201`.
2. `GET /api/tasks/:id` obtiene la tarea por su ID con código `200`.
3. `PATCH /api/tasks/:id` actualiza los datos con código `200`.
4. `PATCH /api/tasks/:id/complete` marca la tarea como completada con código `200`.
5. `DELETE /api/tasks/:id` elimina la tarea con código `204`.
6. Una nueva consulta a la tarea eliminada devuelve `404 TASK_NOT_FOUND`.
El hecho de que todas estas rutas mantengan sus códigos de éxito, validaciones y contratos JSON sin modificaciones demuestra que la refactorización arquitectónica preservó intacto el funcionamiento del CRUD.

## 10. ¿Qué limitación tiene la paginación basada en skip cuando la colección crece mucho?

La paginación basada en cursor `skip` tiene una complejidad temporal de orden lineal $O(N)$. Para omitir $N$ registros (`skip(N)`), MongoDB debe escanear y recorrer secuencialmente todos los documentos o entradas de índice anteriores desde el inicio antes de devolver los resultados. Cuando las colecciones crecen a cientos de miles o millones de registros, o cuando se navega a páginas muy lejanas (e.g. página 50,000), la consulta consume excesivo tiempo de CPU y memoria. En sistemas de alto volumen se prefiere la paginación por cursor o rango (keyset pagination) utilizando operadores como `$gt` sobre campos indexados únicos como `_id` o `createdAt`.
