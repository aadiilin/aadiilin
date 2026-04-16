import http from "node:http";
import app from "./app";
import { attachWebsocket } from "./game";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const server = http.createServer(app);
attachWebsocket(server);

server.listen(port, () => {
  logger.info({ port }, "Server listening (HTTP + WebSocket)");
});

server.on("error", (err) => {
  logger.error({ err }, "Server error");
  process.exit(1);
});
