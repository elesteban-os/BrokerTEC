import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { ENV } from './env';

// Configuración básica de Swagger
const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BrokerTEC API',
      version: '1.0.0',
      description: 'API para el sistema BrokerTEC - Gestión de usuarios y operaciones',
      contact: {
        name: 'Equipo BrokerTEC',
        email: 'desarrollo@brokertec.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: `http://localhost:${ENV.PORT}`,
        description: 'Servidor de desarrollo'
      },
      {
        url: 'https://api.brokertec.com',
        description: 'Servidor de producción'
      }
    ],
    components: {
      schemas: {
        // Esquemas de datos comunes
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Mensaje de error'
            },
            code: {
              type: 'string',
              description: 'Código de error (opcional)'
            }
          },
          required: ['message']
        },
        HealthCheck: {
          type: 'object',
          properties: {
            ok: {
              type: 'boolean',
              description: 'Estado de salud del servicio'
            }
          },
          required: ['ok']
        }
      },
      responses: {
        // Respuestas comunes
        BadRequest: {
          description: 'Solicitud incorrecta - datos de entrada inválidos',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        NotFound: {
          description: 'Recurso no encontrado',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        Conflict: {
          description: 'Conflicto - recurso ya existe',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        InternalServerError: {
          description: 'Error interno del servidor',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        }
      }
    }
  },
  // Rutas donde Swagger buscará las anotaciones JSDoc
  apis: [
    './src/app.ts',
    './src/modules/**/Controllers/*.controller.ts',
    './src/modules/**/DTOs/*.dto.ts',
    './src/modules/**/*.entity.ts',
    './src/modules/**/Services/*.service.ts'
  ]
};

// Generar especificación de Swagger
export const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Configuración de Swagger UI
export const swaggerUiOptions: swaggerUi.SwaggerUiOptions = {
  explorer: true,
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #1976d2; }
  `,
  customSiteTitle: 'BrokerTEC API Documentation',
  customfavIcon: '/favicon.ico'
};