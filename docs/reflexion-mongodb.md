# Reflexión: Configuración de MongoDB Atlas y conexión segura desde Express (EC2 F1 A5)

### 1. ¿Qué diferencia existe entre tu cuenta de Atlas y el usuario de base de datos?
- **Cuenta de Atlas**: Es la cuenta administrativa de la plataforma en la nube (MongoDB Cloud). Permite gestionar la facturación, crear y destruir proyectos, configurar clústeres, administrar accesos de red y definir políticas globales.
- **Usuario de base de datos (`Database User`)**: Es una credencial creada específicamente dentro del motor de base de datos para que una aplicación cliente (en este caso, nuestra API con Mongoose) se autentique y ejecute operaciones de lectura/escritura (`readWrite`) limitadas exclusivamente a la base de datos `task_api`. No tiene privilegios para administrar Atlas ni otros recursos.

### 2. ¿Por qué `MONGODB_URI` se considera un secreto aunque el repositorio sea privado?
Porque los repositorios privados pueden ser clonados por múltiples personas, compartirse accidentalmente, exponerse mediante herramientas de integración continua (CI/CD) o filtrarse en caso de una brecha de seguridad. Además, una URI de conexión contiene las credenciales de texto plano (usuario y contraseña) y el host del clúster. Separar la configuración mediante variables de entorno (`.env`) garantiza el principio de seguridad en profundidad y desacopla el código del entorno de ejecución.

### 3. ¿Qué riesgo introduce permitir `0.0.0.0/0` en la lista de acceso?
Permitir `0.0.0.0/0` expone el clúster a todo Internet, permitiendo que cualquier persona o bot automatizado intente conectarse desde cualquier dirección IP del mundo. Esto incrementa dramáticamente la superficie de ataque, dejando la seguridad del clúster dependiendo únicamente de la robustez de la contraseña frente a ataques de fuerza bruta, escaneo de puertos o vulnerabilidades de día cero.

### 4. ¿Por qué la API espera `connectDatabase` antes de ejecutar `app.listen`?
Porque la API no debe comenzar a aceptar tráfico HTTP si su dependencia fundamental de persistencia no está disponible. Esperar a que `connectDatabase` resuelva exitosamente antes de abrir el puerto evita responder solicitudes que inevitablemente fallarían, previene condiciones de carrera y asegura que el servidor solo anuncie su disponibilidad cuando está realmente listo para operar de forma íntegra.

### 5. ¿Qué comprueba `readyState` y qué añade el comando `ping`?
- **`readyState`**: Comprueba el estado de la conexión local en la instancia de Mongoose (0: desconectado, 1: conectado, 2: conectando, 3: desconectando). Es una verificación sincrónica en memoria del cliente.
- **Comando `ping` (`database.admin().ping()`)**: Envía un comando real de red de ida y vuelta al clúster de MongoDB en la nube. Comprueba no solo que la conexión esté registrada como abierta, sino que el servidor remoto esté activo, respondiendo y con capacidad de procesar comandos en ese instante.

### 6. ¿Por qué una falla de MongoDB corresponde a infraestructura y no a validación HTTP?
Porque las validaciones HTTP evalúan la forma, sintaxis y contenido de la solicitud enviada por el cliente (como un encabezado ausente o un JSON con campos vacíos), lo cual es responsabilidad del cliente y produce códigos 4xx. Una falla de MongoDB se origina en la incapacidad del servidor para comunicarse con sus propios servicios y dependencias externas de almacenamiento, lo cual es un problema operativo del entorno backend (infraestructura) y debe reportarse con códigos 5xx (como `503 Service Unavailable` con `DATABASE_UNAVAILABLE`).

### 7. ¿Cómo llega un `AppError` lanzado por `getDatabaseHealth` al manejador central en Express 5?
En Express 5, el enrutador captura automáticamente las promesas rechazadas (`rejected promises`) y los errores lanzados dentro de manejadores de ruta asíncronos (`async/await`) sin requerir bloques manuales `try/catch` ni llamadas explícitas a `next(error)`. Express 5 redirige internamente cualquier excepción asíncrona hacia la cadena de middlewares de error, donde nuestro `errorHandler` centralizado la recibe, extrae el `statusCode` (503), el `code` (`DATABASE_UNAVAILABLE`) y genera la respuesta JSON uniforme.

### 8. ¿Qué pruebas demuestran que la incorporación de Atlas no rompió la API anterior?
Las **pruebas de regresión** ejecutadas sobre los endpoints de tareas existentes:
- `GET /health` responde 200 con `{ status: "ok" }`.
- `GET /api/tasks` continúa listando las tareas.
- `POST /api/tasks` crea tareas nuevas con estado 201.
- `GET /api/tasks/:id` localiza la tarea creada con estado 200.
- `PATCH /api/tasks/:id/complete` la marca como completada con 200.
- `DELETE /api/tasks/:id` la elimina devolviendo 204 No Content.
- Las validaciones de transporte (`415 Unsupported Media Type`, `400 INVALID_ID`, `422 VALIDATION_ERROR`) siguen interceptando peticiones inválidas con normalidad.

### 9. ¿Por qué el arreglo en memoria se conserva todavía en esta actividad?
Porque la actividad **EC2 F1 A5** tiene como alcance exclusivo establecer la infraestructura de conexión, seguridad y diagnóstico de disponibilidad con MongoDB Atlas. Mantener el arreglo en memoria aísla las responsabilidades didácticas y técnicas: primero se comprueba y valida que la conexión y el diagnóstico funcionen al 100%, evitando mezclar problemas de red con el diseño de esquemas, modelos tipados y consultas asíncronas de Mongoose, los cuales se abordarán en las actividades A6 y A7.

### 10. ¿Qué información debe ocultarse al cliente cuando ocurre un error de conexión?
Deben ocultarse:
- La cadena de conexión (`MONGODB_URI`), usuarios y contraseñas.
- Nombres de clústeres, dominios, puertos e infraestructura de red interna.
- Nombres de bases de datos o colecciones internas.
- El rastro de la pila (*stack trace*) o los objetos de error nativos emitidos por el controlador de MongoDB o Mongoose.
El cliente debe recibir únicamente un mensaje seguro y abstracto (`"La base de datos no está disponible."`) con código `503` y `DATABASE_UNAVAILABLE`, junto con su `requestId` para que el equipo de soporte pueda auditar los logs internos sin exponer vulnerabilidades al exterior.