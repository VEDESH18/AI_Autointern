const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AutoApply+Prep API',
      version: '1.0.0',
      description: 'Complete API documentation for AutoApply+Prep platform',
      contact: {
        name: 'API Support'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
