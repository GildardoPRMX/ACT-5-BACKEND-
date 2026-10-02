import dns from "node:dns";
import mongoose from "mongoose";

// En Windows o redes donde el DNS local del router no resuelve registros SRV (querySrv ECONNREFUSED)
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {
  // Ignorar en entornos que no permitan sobrescribir servidores DNS
}

export interface DatabaseConfig {
  uri: string;
  dbName: string;
}

export const connectDatabase = async (
  config: DatabaseConfig,
): Promise<void> => {
  await mongoose.connect(config.uri, {
    dbName: config.dbName,
    serverSelectionTimeoutMS: 5000,
  });
  console.log("Conexión con MongoDB establecida.");
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
  console.log("Conexión con MongoDB cerrada.");
};