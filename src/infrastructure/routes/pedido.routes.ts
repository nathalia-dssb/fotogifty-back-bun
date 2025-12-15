import { Router } from 'express';
import multer from 'multer';
import { PedidoController } from '../controllers/pedido.controller';
import { CrearPedidoUseCase } from '../../application/use-cases/crear-pedido.use-case';
import { ActualizarEstadoPedidoUseCase } from '../../application/use-cases/actualizar-estado-pedido.use-case';
import { PrismaPedidoRepository } from '../repositories/prisma-pedido.repository';
import { PrismaUsuarioRepository } from '../repositories/prisma-usuario.repository';
import { PrismaPaqueteRepository } from '../repositories/prisma-paquete.repository';
import { SubirFotoUseCase } from '../../application/use-cases/subir-foto.use-case';
import { S3Service } from '../services/s3.service';
import { PrismaFotoRepository } from '../repositories/prisma-foto.repository';
import { authenticateToken, requireRole, requireCliente, requireAdmin } from '../middlewares/auth.middleware';

// Configurar multer para memoria
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  },
});

// Middleware para manejar errores de Multer
const handleMulterError = (err: any, req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'El archivo es demasiado grande. Máximo permitido: 10MB.'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: `Campo de archivo inesperado: ${err.field}. Se esperaba 'foto'.`
      });
    }
    if (err.code === 'MISSING_FIELD_NAME') {
      return res.status(400).json({
        success: false,
        error: 'Nombre de campo de archivo faltante. Asegúrate de enviar el archivo con el nombre "foto".'
      });
    }
    return res.status(400).json({
      success: false,
      error: `Error en la carga del archivo: ${err.code}`
    });
  } else if (err) {
    if (err.message.includes('Solo se permiten archivos de imagen')) {
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }
    return res.status(500).json({
      success: false,
      error: err.message || 'Error en la carga del archivo'
    });
  }
  next();
};

const pedidoRoutes = (router: Router): void => {
  const pedidoRepository = new PrismaPedidoRepository();
  const usuarioRepository = new PrismaUsuarioRepository();
  const paqueteRepository = new PrismaPaqueteRepository();
  const fotoRepository = new PrismaFotoRepository();
  const s3Service = new S3Service();
  const crearPedidoUseCase = new CrearPedidoUseCase(pedidoRepository, usuarioRepository, paqueteRepository);
  const actualizarEstadoPedidoUseCase = new ActualizarEstadoPedidoUseCase(pedidoRepository);
  const subirFotoUseCase = new SubirFotoUseCase(s3Service, usuarioRepository, fotoRepository);
  const pedidoController = new PedidoController(crearPedidoUseCase, actualizarEstadoPedidoUseCase, pedidoRepository, usuarioRepository, paqueteRepository);

  /**
   * @swagger
   * /api/pedidos:
   *   post:
   *     summary: Crear un nuevo pedido (solo para clientes autenticados)
   *     tags: [Pedidos]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - nombre_cliente
   *               - email_cliente
   *               - direccion_envio
   *               - items_pedido
   *               - subtotal
   *               - iva
   *               - total
   *             properties:
   *               id_usuario:
   *                 type: integer
   *                 description: ID del usuario que realiza el pedido
   *                 example: 1
   *               nombre_cliente:
   *                 type: string
   *                 description: Nombre del cliente
   *                 example: "Juan Pérez"
   *               email_cliente:
   *                 type: string
   *                 format: email
   *                 description: Email del cliente
   *                 example: "juan@ejemplo.com"
   *               telefono_cliente:
   *                 type: string
   *                 description: Teléfono del cliente
   *                 example: "+34612345678"
   *               direccion_envio:
   *                 type: object
   *                 properties:
   *                   calle:
   *                     type: string
   *                     example: "Calle Falsa 123"
   *                   ciudad:
   *                     type: string
   *                     example: "Madrid"
   *                   estado:
   *                     type: string
   *                     example: "Madrid"
   *                   codigo_postal:
   *                     type: string
   *                     example: "28001"
   *                   pais:
   *                     type: string
   *                     example: "España"
   *               items_pedido:
   *                 type: array
   *                 items:
   *                   type: object
   *                   properties:
   *                     id_paquete:
   *                       type: integer
   *                       example: 1
   *                     nombre_paquete:
   *                       type: string
   *                       example: "Paquete Básico"
   *                     categoria_paquete:
   *                       type: string
   *                       example: "Fotografía Impresa"
   *                     precio_unitario:
   *                       type: number
   *                       example: 299.99
   *                     cantidad:
   *                       type: integer
   *                       example: 2
   *                     num_fotos_requeridas:
   *                       type: integer
   *                       example: 20
   *               id_pago_stripe:
   *                 type: string
   *                 description: ID de pago de Stripe
   *                 example: "pi_3L1234567890"
   *               id_sesion_stripe:
   *                 type: string
   *                 description: ID de sesión de Stripe
   *                 example: "cs_test_1234567890"
   *               subtotal:
   *                 type: number
   *                 description: Subtotal del pedido
   *                 example: 599.98
   *               iva:
   *                 type: number
   *                 description: IVA del pedido
   *                 example: 95.99
   *               total:
   *                 type: number
   *                 description: Total del pedido
   *                 example: 695.97
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       201:
   *         description: Pedido creado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/Pedido'
   *       400:
   *         description: Datos de entrada inválidos
   *       401:
   *         description: Acceso no autorizado
   *       500:
   *         description: Error interno del servidor
   */
  router.post('/pedidos', authenticateToken, requireCliente, (req, res) =>
    pedidoController.crearPedido(req, res)
  );

  /**
   * @swagger
   * /api/pedidos:
   *   get:
   *     summary: Obtener todos los pedidos (solo para administradores)
   *     tags: [Pedidos]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Lista de todos los pedidos
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Pedido'
   *       401:
   *         description: Acceso no autorizado
   *       500:
   *         description: Error interno del servidor
   */
  router.get('/pedidos', authenticateToken, requireAdmin, (req, res) =>
    pedidoController.getAllPedidos(req, res)
  );

  /**
   * @swagger
   * /api/pedidos/{id}:
   *   get:
   *     summary: Obtener un pedido por ID
   *     tags: [Pedidos]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del pedido
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Pedido encontrado
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/Pedido'
   *       400:
   *         description: ID de pedido inválido
   *       401:
   *         description: Acceso no autorizado
   *       404:
   *         description: Pedido no encontrado
   *       500:
   *         description: Error interno del servidor
   */
  router.get('/pedidos/:id', authenticateToken, (req, res) =>
    pedidoController.getPedidoById(req, res)
  );

  /**
   * @swagger
   * /api/pedidos/usuario/{usuarioId}:
   *   get:
   *     summary: Obtener pedidos por ID de usuario
   *     tags: [Pedidos]
   *     parameters:
   *       - in: path
   *         name: usuarioId
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del usuario
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Lista de pedidos del usuario
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Pedido'
   *       400:
   *         description: ID de usuario inválido
   *       401:
   *         description: Acceso no autorizado
   *       404:
   *         description: Usuario no encontrado
   *       500:
   *         description: Error interno del servidor
   */
  router.get('/pedidos/usuario/:usuarioId', authenticateToken, (req, res) =>
    pedidoController.getPedidosByUsuarioId(req, res)
  );

  /**
   * @swagger
   * /api/pedidos/estado/{estado}:
   *   get:
   *     summary: Obtener pedidos por estado (solo para administradores)
   *     tags: [Pedidos]
   *     parameters:
   *       - in: path
   *         name: estado
   *         required: true
   *         schema:
   *           type: string
   *           enum: [Pendiente, Enviado, Imprimiendo, Empaquetado, En reparto, Entregado, Archivado]
   *         description: Estado del pedido
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Lista de pedidos con el estado especificado
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Pedido'
   *       400:
   *         description: Estado no válido
   *       401:
   *         description: Acceso no autorizado
   *       500:
   *         description: Error interno del servidor
   */
  router.get('/pedidos/estado/:estado', authenticateToken, requireAdmin, (req, res) =>
    pedidoController.getPedidosByEstado(req, res)
  );

  /**
   * @swagger
   * /api/pedidos/{id}/estado:
   *   patch:
   *     summary: Actualizar el estado de un pedido (solo para administradores)
   *     tags: [Pedidos]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del pedido
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - estado
   *             properties:
   *               estado:
   *                 type: string
   *                 enum: [Pendiente, Enviado, Imprimiendo, Empaquetado, En reparto, Entregado, Archivado]
   *                 description: Nuevo estado del pedido
   *                 example: "Enviado"
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Estado del pedido actualizado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/Pedido'
   *       400:
   *         description: ID de pedido inválido o estado no válido
   *       401:
   *         description: Acceso no autorizado
   *       404:
   *         description: Pedido no encontrado
   *       500:
   *         description: Error interno del servidor
   */
  router.patch('/pedidos/:id/estado', authenticateToken, requireAdmin, (req, res) =>
    pedidoController.updateEstadoPedido(req, res)
  );

  /**
   * @swagger
   * /api/pedidos/{id}/imagenes:
   *   post:
   *     summary: Subir imágenes para un pedido
   *     tags: [Pedidos]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del pedido
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             required:
   *               - foto
   *               - usuarioId
   *               - itemPedidoId
   *             properties:
   *               foto:
   *                 type: string
   *                 format: binary
   *                 description: Archivo de imagen a subir
   *               usuarioId:
   *                 type: integer
   *                 description: ID del usuario
   *                 example: 1
   *               itemPedidoId:
   *                 type: integer
   *                 description: ID del item del pedido
   *                 example: 1
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Imagen subida y asociada al pedido exitosamente
   *       400:
   *         description: Error en los datos enviados
   *       401:
   *         description: Acceso no autorizado
   *       500:
   *         description: Error interno del servidor
   */
  router.post('/pedidos/:id/imagenes', authenticateToken, upload.single('foto'), handleMulterError, (req, res) => {
    // Este endpoint delega a la funcionalidad existente para subir fotos
    // pero asegurando que se relacionen correctamente con el pedido
    const pedidoId = parseInt(req.params.id);

    // Vamos a reutilizar el controlador de fotos existente
    // pero con valores predeterminados para los campos requeridos
    if (!req.body.usuarioId) req.body.usuarioId = req.body.usuarioId || 1; // Valor por defecto
    if (!req.body.itemPedidoId) req.body.itemPedidoId = req.body.itemPedidoId || 1; // Valor por defecto
    req.body.pedidoId = pedidoId;

    // Llamar directamente al controlador de fotos
    // Necesitamos tener acceso al controlador de fotos
    // para implementar completamente esta funcionalidad
    res.status(501).json({
      success: false,
      message: 'Funcionalidad en desarrollo. Utilice /api/fotos/upload directamente'
    });
  });
};

export default pedidoRoutes;