import swaggerJsdoc from "swagger-jsdoc";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            email: { type: "string" },
            status: { type: "integer", example: 1 },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Organization: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            type: { type: "string", enum: ["PHARMACY", "WHOLESALE"] },
          },
        },
        Branch: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            organizationId: { type: "string" },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            message: { type: "string" },
            data: {
              type: "object",
              properties: {
                user: { $ref: "#/components/schemas/User" },
                organization: { $ref: "#/components/schemas/Organization" },
                branch: { $ref: "#/components/schemas/Branch" },
              },
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
          },
        },
        ValidationError: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Validation failed" },
            errors: {
              type: "object",
              additionalProperties: { type: "string" },
              example: { email: "Invalid email address", password: "Too short" },
            },
          },
        },
      },
    },
  },
  apis: [
    path.join(__dirname, "../v1/modules/**/*.ts"),
    path.join(__dirname, "../index.ts")
  ],
};

console.log("🔍 Swagger JSDoc is scanning paths:", options.apis);

export const swaggerSpec = swaggerJsdoc(options);
