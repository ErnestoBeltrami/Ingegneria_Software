import swaggerJsdoc from "swagger-jsdoc";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "IoSonoTrento API",
      version: "1.0.0",
    },
  },
  apis: [
    join(__dirname, "../swagger/**/*.js"),  // Definizioni Swagger separate
    join(__dirname, "../routes/*.js")       // Annotazioni inline nei route (opzionale)
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
