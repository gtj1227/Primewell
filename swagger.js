// swagger.js
import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Your API Title",
      version: "1.0.0",
      description: "API documentation for your app",
    },
    servers: [
      {
        url: "https://cs490-gp-backend-production.up.railway.app/", 
      },
    ],
  },
  apis: ["./server.js"], // or wherever your routes are defined
};

const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;
