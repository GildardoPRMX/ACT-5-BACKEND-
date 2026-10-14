# Reflexión del CRUD persistente

## 1. ¿Qué operación de Mongoose corresponde a cada letra de CRUD?

Create se implementa con `TaskModel.create`, Read con `TaskModel.find` y `TaskModel.findById`, Update con `TaskModel.findByIdAndUpdate`, y Delete con `TaskModel.findByIdAndDelete`. Cada operación trabaja sobre la misma colección `tasks`.

## 2. ¿Por qué se usa PATCH y no un reemplazo completo del documento?

Se usa `PATCH` porque el cliente puede enviar solo el campo que quiere cambiar. Por ejemplo, si manda `{"status":"completed"}`, el servidor no debe exigir ni sobrescribir `title`.

## 3. ¿Qué problema evita `$set`?

`$set` evita reemplazar el documento completo por accidente. Solo modifica las propiedades validadas, así un cambio de estado conserva el título, el id y las fechas administradas por MongoDB/Mongoose.

## 4. ¿Qué efecto tienen `new: true` y `runValidators: true`?

`new: true` hace que Mongoose devuelva el documento ya actualizado. `runValidators: true` obliga a que las reglas del esquema también se apliquen durante la actualización, no solo durante la creación.

## 5. ¿Por qué un cuerpo vacío debe rechazarse?

Un cuerpo vacío no representa ningún cambio real. Aceptarlo haría que la ruta responda como si hubiera actualizado algo cuando el cliente no envió una modificación válida.

## 6. ¿Qué diferencia existe entre `INVALID_ID` y `TASK_NOT_FOUND`?

`INVALID_ID` significa que el parámetro ni siquiera tiene formato de ObjectId válido, por ejemplo `/api/tasks/1`. `TASK_NOT_FOUND` significa que el id sí tiene formato válido, pero no existe un documento con ese valor en la colección.

## 7. ¿Qué responsabilidad cumple `validateTaskUpdate` y cuál cumple `TaskModel`?

`validateTaskUpdate` define el contrato HTTP: cuerpo JSON, objeto no vacío, campos permitidos y valores válidos. `TaskModel` define la regla de persistencia en MongoDB mediante el esquema de Mongoose, como el enum de `status`, el máximo de `title` y los timestamps.

## 8. ¿Cómo llega un error de `updateTask` al `errorHandler` de Express 5?

El controlador espera la promesa con `await`. Si `updateTask` lanza un `AppError` o una falla de persistencia mapeada, Express 5 captura automáticamente el rechazo del manejador asíncrono y lo pasa al middleware `errorHandler`.

## 9. ¿Por qué DELETE responde 204 sin cuerpo?

`204 No Content` indica que la eliminación se completó y que no hay representación que devolver. Por eso el controlador usa `res.status(204).send()` y no envía JSON.

## 10. ¿Qué prueba demuestra que el CRUD es persistente y no solo funcional en memoria?

La prueba clave es crear una tarea, actualizarla, detener la API, volver a iniciarla y consultar el mismo id. Si el título y el estado actualizados siguen presentes, el dato vive en MongoDB Atlas y no en variables del proceso Node.js.
