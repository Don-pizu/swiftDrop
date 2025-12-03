// swagger.js


const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SwiftDrop API',
      version: '1.0.0',
      description: 'API documentation for SwiftDrop microservices',
    },
    servers: [
      {
        url: 'http://localhost:5000/api', // for local development
        description: 'Local server',
      },
      {
        url: 'https://swiftdrop-d7zh.onrender.com', // for deployment 
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routes/*.js'], // Swagger will look for JSDoc comments in your route files
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = {
  swaggerUi,
  swaggerSpec,
};
