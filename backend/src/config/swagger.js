import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.3",

    info: {
      title: "AI Interview Platform API",
      version: "1.0.0",
      description:
        "API documentation for the AI-Powered Technical Interview Platform",
    },

    servers: [
      {
        url: "http://localhost:5000",
        description: "Local Development Server",
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

  apis: [
    "./src/modules/**/*.routes.js",
  ],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;