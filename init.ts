import { initDb } from "./src/lib/db";

async function run() {
  console.log("Inicializando base de datos...");
  await initDb();
  console.log("Base de datos creada exitosamente (local.db).");
  process.exit(0);
}

run();
