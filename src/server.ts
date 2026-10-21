import type { Server } from "node:http";

import { app } from "./app.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { env } from "./config/env.js";

let server: Server | null = null;
let isShuttingDown = false;

const gracefulShutdown = async (signal: string): Promise<void> => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`\nSeñal ${signal} recibida. Cerrando servidor de forma ordenada...`);

  if (server) {
    await new Promise<void>((resolve) => {
      server!.close(() => {
        console.log("Servidor HTTP cerrado.");
        resolve();
      });
    });
  }

  try {
    await disconnectDatabase();
  } catch (error: unknown) {
    console.error("Error al cerrar la conexión con MongoDB:", error);
  }

  process.exit(0);
};

process.on("SIGINT", () => void gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => void gracefulShutdown("SIGTERM"));

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase({
      uri: env.MONGODB_URI,
      dbName: env.MONGODB_DB_NAME,
    });
    server = app.listen(env.PORT, () => {
      console.log(`API disponible en http://localhost:${env.PORT}`);
    });
  } catch {
    console.error(
      "No fue posible iniciar la API. Revise MONGODB_URI, " +
        "el usuario y la lista de acceso de red.",
    );
    process.exitCode = 1;
  }
};

void startServer();
