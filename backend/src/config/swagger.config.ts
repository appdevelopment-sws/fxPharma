import swaggerJsdoc from "swagger-jsdoc";
import path from "path";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "DawaDukaan API Documentation",
      version: "1.0.0",
      description: "API documentation for DawaDukaan Multi-tenant Backend",
    },
    servers: [
      {
        url: "/api/v1",
        description: "V1 API",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  // Path to the API docs (relative to root)
  apis: ["./src/v1/modules/**/*.ts", "./src/index.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
