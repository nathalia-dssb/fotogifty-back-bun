import { Options } from 'swagger-jsdoc';

const swaggerOptions: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Express Bun API',
      version: '1.0.0',
      description: 'Una API REST construida con Express, Bun y TypeScript usando arquitectura hexagonal',
      contact: {
        name: 'API Support',
        email: 'support@api.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo'
      }
    ],
    tags: [
      {
        name: 'General',
        description: 'Endpoints generales de la API'
      },
      {
        name: 'Messages',
        description: 'Gestión de mensajes'
      },
      {
        name: 'Paquetes',
        description: 'Gestión de paquetes de impresión de fotos'
      }
    ],
    security: [
      {
        bearerAuth: []
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Message: {
          type: 'object',
          required: ['content', 'timestamp'],
          properties: {
            id: {
              type: 'string',
              description: 'ID único del mensaje',
              example: 'abc123'
            },
            content: {
              type: 'string',
              description: 'Contenido del mensaje',
              example: 'Hola Mundo!'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha y hora de creación',
              example: '2024-01-01T12:00:00.000Z'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Mensaje de error',
              example: 'Internal server error'
            }
          }
        },
        Usuario: {
      type: 'object',
      required: ['email', 'password', 'nombre', 'apellido'],
      properties: {
        email: {
          type: 'string',
          format: 'email',
          description: 'Email del usuario',
          example: 'usuario@ejemplo.com'
        },
        password: {
          type: 'string',
          format: 'password',
          description: 'Contraseña',
          example: 'password123'
        },
        nombre: {
          type: 'string',
          description: 'Nombre del usuario',
          example: 'Juan'
        },
        apellido: {
          type: 'string',
          description: 'Apellido del usuario',
          example: 'Pérez'
        },
        telefono: {
          type: 'string',
          description: 'Teléfono opcional',
          example: '+34612345678'
      }
    }
  },
  UsuarioResponse: {
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        example: 1
      },
      email: {
        type: 'string',
        example: 'usuario@ejemplo.com'
      },
      nombre: {
        type: 'string',
        example: 'Juan'
      },
      apellido: {
        type: 'string',
        example: 'Pérez'
      },
      telefono: {
        type: 'string',
        example: '+34612345678'
      },
      fecha_registro: {
        type: 'string',
        format: 'date-time',
        example: '2024-01-01T12:00:00.000Z'
      },
      activo: {
        type: 'boolean',
        example: true
      },
      tipo: {
        type: 'string',
        enum: ['cliente', 'admin', 'super_admin'],
        example: 'cliente'
      }
    }
  },
  Categoria: {
    type: 'object',
    required: ['nombre'],
    properties: {
      id: {
        type: 'integer',
        example: 1
      },
      nombre: {
        type: 'string',
        description: 'Nombre de la categoría',
        example: 'Calendario'
      },
      descripcion: {
        type: 'string',
        description: 'Descripción de la categoría',
        example: 'Categoría para productos de calendarios'
      },
      activo: {
        type: 'boolean',
        description: 'Estado de la categoría',
        example: true
      },
      fecha_creacion: {
        type: 'string',
        format: 'date-time',
        example: '2024-01-01T12:00:00.000Z'
      }
    }
  },
  PaquetePredefinido: {
    type: 'object',
    required: ['nombre', 'cantidad_fotos', 'precio', 'estado'],
    properties: {
      id: {
        type: 'integer',
        example: 1
      },
      categoria_id: {
        type: 'integer',
        example: 1
      },
      nombre: {
        type: 'string',
        description: 'Nombre del paquete',
        example: 'Paquete Básico'
      },
      descripcion: {
        type: 'string',
        description: 'Descripción del paquete',
        example: 'Incluye 10 fotos impresas'
      },
      cantidad_fotos: {
        type: 'integer',
        description: 'Cantidad de fotos incluidas en el paquete',
        example: 10
      },
      precio: {
        type: 'number',
        format: 'decimal',
        description: 'Precio del paquete',
        example: 299.99
      },
      estado: {
        type: 'boolean',
        description: 'Estado del producto (Activo/Inactivo)',
        example: true
      },
      resolucion_foto: {
        type: 'integer',
        description: 'Resolución de las fotos en píxeles',
        example: 300
      },
      ancho_foto: {
        type: 'number',
        format: 'decimal',
        description: 'Ancho de las fotos en pulgadas',
        example: 10.16
      },
      alto_foto: {
        type: 'number',
        format: 'decimal',
        description: 'Alto de las fotos en pulgadas',
        example: 15.24
      }
    }
  },
  Direccion: {
    type: 'object',
    required: ['usuario_id', 'alias', 'pais', 'estado', 'ciudad', 'codigo_postal', 'direccion'],
    properties: {
      id: {
        type: 'integer',
        example: 1
      },
      usuario_id: {
        type: 'integer',
        example: 1
      },
      alias: {
        type: 'string',
        description: 'Nombre de la dirección (ej: "Casa", "Trabajo")',
        example: "Casa"
      },
      pais: {
        type: 'string',
        description: 'País',
        example: "España"
      },
      estado: {
        type: 'string',
        description: 'Estado o región',
        example: "Madrid"
      },
      ciudad: {
        type: 'string',
        description: 'Ciudad o municipio',
        example: "Madrid"
      },
      codigo_postal: {
        type: 'string',
        description: 'Código postal',
        example: "28001"
      },
      direccion: {
        type: 'string',
        description: 'Calle o vía',
        example: "Calle Principal 123"
      },
      numero_casa: {
        type: 'string',
        description: 'Número de casa (opcional)',
        example: "123"
      },
      numero_departamento: {
        type: 'string',
        description: 'Número de departamento (opcional)',
        example: "5B"
      },
      especificaciones: {
        type: 'string',
        description: 'Información adicional (opcional)',
        example: "Edificio A, Puerta Azul"
      },
      predeterminada: {
        type: 'boolean',
        description: 'Indica si es la dirección predeterminada',
        example: true
      },
      fecha_registro: {
        type: 'string',
        format: 'date-time',
        example: '2024-01-01T12:00:00.000Z'
      }
    }
  },
  Pedido: {
    type: 'object',
    required: [
      'id_usuario',
      'id_direccion',
      'nombre_cliente',
      'email_cliente',
      'items_pedido',
      'estado',
      'estado_pago',
      'subtotal',
      'iva',
      'total'
    ],
    properties: {
      id: {
        type: 'integer',
        example: 1
      },
      id_usuario: {
        type: 'integer',
        example: 1
      },
      id_direccion: {
        type: 'integer',
        example: 1
      },
      id_pago_stripe: {
        type: 'string',
        example: 'pi_3L1234567890'
      },
      id_sesion_stripe: {
        type: 'string',
        example: 'cs_test_1234567890'
      },
      nombre_cliente: {
        type: 'string',
        example: 'Juan Pérez'
      },
      email_cliente: {
        type: 'string',
        format: 'email',
        example: 'juan@ejemplo.com'
      },
      telefono_cliente: {
        type: 'string',
        example: '+34612345678'
      },
      fecha_pedido: {
        type: 'string',
        format: 'date-time',
        example: '2024-01-01T12:00:00.000Z'
      },
      items_pedido: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id_paquete: {
              type: 'integer',
              example: 1
            },
            nombre_paquete: {
              type: 'string',
              example: 'Paquete Básico'
            },
            categoria_paquete: {
              type: 'string',
              example: 'Fotografía Impresa'
            },
            precio_unitario: {
              type: 'number',
              example: 299.99
            },
            cantidad: {
              type: 'integer',
              example: 2
            },
            num_fotos_requeridas: {
              type: 'integer',
              example: 20
            }
          }
        }
      },
      estado: {
        type: 'string',
        enum: ['Pendiente', 'Enviado', 'Imprimiendo', 'Empaquetado', 'En reparto', 'Entregado', 'Archivado'],
        example: 'Pendiente'
      },
      estado_pago: {
        type: 'string',
        enum: ['pending', 'paid', 'failed', 'refunded'],
        example: 'paid'
      },
      subtotal: {
        type: 'number',
        example: 599.98
      },
      iva: {
        type: 'number',
        example: 95.99
      },
      total: {
        type: 'number',
        example: 695.97
      },
      imagenes: {
        type: 'array',
        items: {
          type: 'string'
        },
        example: ['https://s3.amazonaws.com/bucket/foto1.jpg', 'https://s3.amazonaws.com/bucket/foto2.jpg']
      },
      creado_en: {
        type: 'string',
        format: 'date-time',
        example: '2024-01-01T12:00:00.000Z'
      },
      actualizado_en: {
        type: 'string',
        format: 'date-time',
        example: '2024-01-01T12:00:00.000Z'
      }
    }
  }
    }
  }
},
  apis: [
    './src/infrastructure/routes/*.ts', // Buscar anotaciones en las rutas
    './src/infrastructure/controllers/*.ts'
  ],
};

export default swaggerOptions;