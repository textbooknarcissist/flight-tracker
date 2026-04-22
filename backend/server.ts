import "dotenv/config";

import app from "./src/app";
import { prisma } from "./src/config/prisma";

const port = Number(process.env.PORT ?? 4000);

const server = app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});

async function shutdown(signal: string) {
  console.log(`Received ${signal}. Shutting down gracefully.`);

  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});
