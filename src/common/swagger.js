import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "FinDash API",
      version: "1.0.0",
      description:
        "A comprehensive financial management REST API for tracking income, expenses, and analyzing spending patterns with advanced dashboard analytics.",
      contact: {
        name: "FinDash Team",
        url: "https://github.com/reachbheru/FinDash",
      },
    },
    servers: [
      {
        url: "http://localhost:8000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "JWT access token for authentication. Get token by logging in at POST /api/v1/users/login or POST /api/v1/admin/login",
        },
      },
      schemas: {
        Transaction: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              description: "Transaction ID",
            },
            userId: {
              type: "string",
              description: "User ID who owns the transaction",
            },
            amount: {
              type: "number",
              description: "Transaction amount",
              example: 100.5,
            },
            type: {
              type: "string",
              enum: ["income", "expense"],
              description: "Transaction type",
            },
            category: {
              type: "string",
              description: "Transaction category",
              example: "food",
            },
            description: {
              type: "string",
              description: "Transaction description",
            },
            tags: {
              type: "array",
              items: {
                type: "string",
              },
              description: "Transaction tags",
            },
            date: {
              type: "string",
              format: "date-time",
              description: "Transaction date",
            },
            isDeleted: {
              type: "boolean",
              default: false,
            },
            deletedAt: {
              type: "string",
              format: "date-time",
              nullable: true,
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        User: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              description: "User ID",
            },
            firstName: {
              type: "string",
              description: "User first name",
            },
            lastName: {
              type: "string",
              description: "User last name",
            },
            email: {
              type: "string",
              format: "email",
              description: "User email",
            },
            phone: {
              type: "string",
              description: "User phone number",
            },
            role: {
              type: "string",
              enum: ["viewer", "analyst", "admin"],
              description: "User role",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              description: "Error message",
            },
            statusCode: {
              type: "integer",
              description: "HTTP status code",
            },
          },
        },
      },
    },
    // Removed global security - will be applied per endpoint
  },
  apis: [
    "./src/user/user.router.js",
    "./src/transaction/transaction.router.js",
    "./src/dashboard/dashboard.router.js",
    "./src/admin/admin.router.js",
  ],
};

const swaggerSpec = swaggerJsdoc(options);

// Ensure securitySchemes is properly exposed
if (!swaggerSpec.components) {
  swaggerSpec.components = {};
}
if (!swaggerSpec.components.securitySchemes) {
  swaggerSpec.components.securitySchemes = {
    BearerAuth: {
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
      description:
        "JWT access token for authentication. Get token by logging in at POST /api/v1/users/login or POST /api/v1/admin/login",
    },
  };
}

export default swaggerSpec;
