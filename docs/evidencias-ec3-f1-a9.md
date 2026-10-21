# Evidencias EC3 F1 A9

## Datos generales

- Nombre: completar
- Grupo: completar
- Repositorio y rama: `ACT-5-BACKEND-` / `ec3-a9-auth`
- Commit final: pendiente; esta entrega no se ha confirmado en Git

## Entorno verificado

- `node --version`: `v24.13.1`
- `pnpm --version`: `11.25.0`
- `pnpm install --frozen-lockfile`: aprobado
- `pnpm check`: aprobado
- `pnpm build`: aprobado
- Comprobación HTTP con persistencia simulada en memoria: 26 verificaciones aprobadas.
- Las verificaciones simuladas se ejecutaron con un script temporal; la colección Postman queda disponible para repetirlas manualmente.
- MongoDB Atlas: conexión no disponible en esta ejecución; `/health/database` y las operaciones contra Atlas quedan pendientes.

## Registro e inicio de sesión

- Colección reproducible: `postman/task-api-ec3-f1-a9.postman_collection.json`
- Solicitud de registro: incluye `name`, correo de prueba, `password` y `confirmPassword`; sustituye las contraseñas por `<OCULTA>` en las evidencias.
- Registro y login: `201` y `200`, comprobados con persistencia simulada en memoria.
- El usuario público no contiene `password` ni `passwordHash`; el hash almacenado empieza con el prefijo bcrypt y `confirmPassword` no se persiste en la prueba simulada.
- Login devuelve `tokenType: Bearer`; la vigencia viene de `JWT_EXPIRES_IN`. El token firmado se verificó con `sub` y `role`, y se rechazó una firma alterada.
- No se guardó ningún token en este archivo. Las capturas de Postman y los resultados contra Atlas siguen pendientes.

## Pruebas negativas

| Caso | Código esperado | Código obtenido | `error.code` | Resultado |
|---|---:|---:|---|---|
| Correo repetido | 409 | 409 | `USER_EMAIL_EXISTS` | Aprobado en prueba simulada |
| Contraseña corta o mayor de 72 bytes UTF-8 | 422 | 422 | `AUTH_VALIDATION_ERROR` | Aprobado en prueba simulada |
| Campo `role` | 422 | 422 | `AUTH_VALIDATION_ERROR` | Aprobado en prueba simulada |
| Confirmación distinta o ausente | 422 | 422 | `AUTH_VALIDATION_ERROR` | Aprobado en prueba simulada |
| Credenciales incorrectas o correo inexistente | 401 | 401 | `INVALID_CREDENTIALS` | Mismo código y mensaje en prueba simulada |
| Content-Type incorrecto | 415 | 415 | `UNSUPPORTED_MEDIA_TYPE` | Aprobado en prueba simulada |
| JSON inválido | 400 | 400 | `INVALID_JSON` | Aprobado en prueba simulada |
| Cuerpo mayor de 20 KB | 413 | 413 | `PAYLOAD_TOO_LARGE` | Aprobado en prueba simulada |

## Regresión de tareas

- Listar con paginación, crear, actualizar, completar y eliminar sin token: aprobado en prueba simulada.
- Consulta combinada por estado, búsqueda y orden: aprobada en prueba simulada.
- `/health`: `200` en prueba simulada. `/health/database`: pendiente de Atlas.

## Seguridad observada

- El esquema define `passwordHash` con `select: false`; el servicio devuelve una proyección pública sin contraseña ni hash.
- `confirmPassword` se valida en HTTP y se elimina antes de crear el usuario.
- `confirmPassword` solo confirma que ambos campos coinciden en la solicitud; no es parte de la identidad de usuario que se persiste.
- El servicio asigna el rol `user` y el middleware rechaza campos adicionales como `role`.
- Las solicitudes de la colección usan datos de práctica. No guardes contraseñas reales, hashes, tokens completos, URI ni `JWT_SECRET` en capturas, este archivo o Git.

## Conclusión

Las comprobaciones de tipos, compilación y 26 casos HTTP con persistencia simulada pasaron. Falta repetir los casos con MongoDB Atlas y guardar capturas sanitizadas de Postman. A10 añadirá el middleware que usa el token para identificar solicitudes y proteger recursos.
