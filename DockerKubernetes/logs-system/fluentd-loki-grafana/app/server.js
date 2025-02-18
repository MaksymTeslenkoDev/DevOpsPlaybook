const pino = require("pino");
const logger = pino();

setInterval(() => {
  logger.info({ message: "Hello from Node.js!", timestamp: new Date().toISOString() });
}, 2000);
