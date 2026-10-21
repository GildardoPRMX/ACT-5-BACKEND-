# Reflexión EC3 F1 A9

Este borrador explica las decisiones de autenticación implementadas en el proyecto. Personaliza los ejemplos y la redacción antes de entregar.

## 1. ¿Por qué un hash de contraseña no debe poder descifrarse?

La API no necesita recuperar la contraseña original. Durante el registro guarda un hash bcrypt con una sal aleatoria y, durante el login, compara la contraseña recibida con ese hash. Si la base de datos se expone, un atacante no obtiene directamente las contraseñas en texto claro.

## 2. ¿Qué diferencia existe entre una sal aleatoria y la clave usada para firmar HS256?

La sal se genera para cada hash de contraseña y hace que dos contraseñas iguales produzcan hashes distintos. La clave JWT es un secreto compartido por la API: se usa para firmar y verificar la integridad de los tokens y debe guardarse en `JWT_SECRET`.

## 3. ¿Por qué `passwordHash` tiene `select: false` y aun así el login puede recuperarlo?

`select: false` lo excluye de las consultas habituales para reducir el riesgo de exponerlo por accidente. El repositorio lo incluye de forma explícita con `select('+passwordHash')` solo al buscar una cuenta para comparar la contraseña durante el login.

## 4. ¿Por qué `unique` no sustituye la validación HTTP del correo?

El middleware valida el tipo, formato, longitud y normalización del correo para responder con un error claro antes de llegar a la base de datos. El índice único protege la persistencia ante registros simultáneos, pero no explica si el formato de la entrada era correcto.

## 5. ¿Qué riesgo evita rechazar el campo `role` durante el registro?

Evita que alguien se asigne `admin` enviando un campo adicional en el JSON. El middleware rechaza propiedades no permitidas y el servicio crea siempre las cuentas con el rol `user`.

## 6. ¿Por qué correo inexistente y contraseña incorrecta devuelven el mismo mensaje?

Si la API respondiera mensajes distintos, alguien podría consultar qué correos tienen una cuenta. En ambos casos se devuelve `401 INVALID_CREDENTIALS` con el mismo mensaje; para el correo inexistente también se compara contra un hash ficticio.

## 7. ¿Qué información contiene el JWT de esta actividad y qué información se excluye?

El payload personalizado contiene el identificador del usuario en `sub` y su `role`; también incluye claims estándar como `iss`, `aud`, `iat` y `exp`. No contiene la contraseña, el hash, el nombre ni el correo. La firma protege la integridad, pero el payload no está cifrado.

## 8. ¿Qué validan `issuer`, `audience`, `algorithms` y `exp`?

`issuer` comprueba quién emitió el token, `audience` para qué cliente se creó y `algorithms` restringe la verificación a HS256. `exp` limita hasta cuándo puede aceptarse el token.

## 9. ¿Cómo llega un error de MongoDB desde el repositorio hasta `errorHandler` en Express 5?

El repositorio convierte los errores de duplicado, validación y disponibilidad en `AppError` con códigos públicos. El servicio y el controlador esperan sus promesas; Express 5 envía un rechazo al manejador central, que conserva el formato uniforme y el `requestId`.

## 10. ¿Por qué las rutas de tareas permanecen públicas en A9 y qué cambiará en A10?

A9 agrega registro, login y emisión/verificación técnica del token. En esta etapa las tareas continúan públicas para conservar el alcance de la actividad. A10 conectará la verificación con middleware de solicitud y añadirá autenticación y permisos por rol a los recursos.
