import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { ENV } from './env';
import path from 'path';

const ROOT = path.resolve(__dirname, '..');      // /src
const DIST = path.resolve(ROOT, '..', 'dist');   // /dist

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
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT para autenticación. Formato: Bearer <token>'
        }
      },
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
        Unauthorized: {
          description: 'No autorizado - Token JWT faltante o inválido',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  message: {
                    type: 'string',
                    example: 'Token de autorización requerido'
                  },
                  error: {
                    type: 'string',
                    example: 'MISSING_TOKEN'
                  }
                }
              }
            }
          }
        },
        Forbidden: {
          description: 'Prohibido - Permisos insuficientes',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  message: {
                    type: 'string',
                    example: 'Permisos insuficientes para esta acción'
                  },
                  error: {
                    type: 'string',
                    example: 'INSUFFICIENT_PERMISSIONS'
                  }
                }
              }
            }
          }
        },
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
    './src/modules/**/Services/*.service.ts',

    // 🔽 añadidos seguros (no rompen nada) para encontrar compilados
    path.join(DIST, 'app.js'),
    path.join(DIST, 'modules', '**', 'Controllers', '*.controller.js'),
    path.join(DIST, 'modules', '**', 'DTOs', '*.dto.js'),
    path.join(DIST, 'modules', '**', '*.entity.js'),
    path.join(DIST, 'modules', '**', 'Services', '*.service.js'),
    // al final del array apis:
    path.join(process.cwd(), 'dist/app.js'),
    path.join(process.cwd(), 'dist/modules/**/Controllers/*.controller.js'),
    path.join(process.cwd(), 'dist/modules/**/DTOs/*.dto.js'),
    path.join(process.cwd(), 'dist/modules/**/*.entity.js'),
    path.join(process.cwd(), 'dist/modules/**/Services/*.service.js'),

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
