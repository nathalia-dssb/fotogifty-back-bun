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
import { PrismaItemsPedidoRepository } from '../repositories/prisma-items-pedido.repository';
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
  console.log('=== handleMulterError ===');
  console.log('Error:', err);
  if (err instanceof multer.MulterError) {
    console.log('MulterError code:', err.code, 'field:', err.field);
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
    console.log('Other error:', err.message);
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
  const itemsPedidoRepository = new PrismaItemsPedidoRepository();
  const s3Service = new S3Service();
  const crearPedidoUseCase = new CrearPedidoUseCase(pedidoRepository, usuarioRepository, paqueteRepository);
  const actualizarEstadoPedidoUseCase = new ActualizarEstadoPedidoUseCase(pedidoRepository);
  const subirFotoUseCase = new SubirFotoUseCase(s3Service, usuarioRepository, pedidoRepository, itemsPedidoRepository, paqueteRepository, fotoRepository);
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
   *     summary: Obtener todos los pedidos (para administradores y vendedores)
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
  router.get('/pedidos', authenticateToken, requireRole('admin', 'super_admin', 'store'), (req, res) =>
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
   *     summary: Obtener pedidos por estado (para administradores y vendedores)
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
  router.get('/pedidos/estado/:estado', authenticateToken, requireRole('admin', 'super_admin', 'store'), (req, res) =>
    pedidoController.getPedidosByEstado(req, res)
  );

  /**
   * @swagger
   * /api/pedidos/{id}/estado:
   *   patch:
   *     summary: Actualizar el estado de un pedido (para administradores y vendedores)
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
  router.patch('/pedidos/:id/estado', authenticateToken, requireRole('admin', 'super_admin', 'store'), (req, res) =>
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
  router.post('/pedidos/:id/imagenes', (req, res, next) => {
    console.log('=== DEBUG /pedidos/:id/imagenes ===');
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Params:', req.params);
    next();
  }, authenticateToken, upload.array('imagenes', 20), handleMulterError, async (req, res) => {
    try {
      console.log('=== Después de autenticación y multer ===');
      console.log('Body:', req.body);
      console.log('Files:', req.files ? (req.files as Express.Multer.File[]).length : 0);
      console.log('User:', (req as any).user);
      const pedidoId = parseInt(req.params.id);

      // Validar que se recibieron archivos
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No se proporcionaron archivos. Asegúrate de enviar los archivos con el nombre "imagenes".'
        });
      }

      // Obtener usuarioId del token JWT o del body
      const usuarioId = (req as any).user?.id || parseInt(req.body.usuarioId);
      let itemPedidoId = req.body.itemPedidoId ? parseInt(req.body.itemPedidoId) : null;

      if (!usuarioId) {
        return res.status(400).json({
          success: false,
          error: 'usuarioId es requerido'
        });
      }

      // Si no se proporciona itemPedidoId, obtener el primer item del pedido
      if (!itemPedidoId) {
        const items = await itemsPedidoRepository.findByPedidoId(pedidoId);
        if (!items || items.length === 0) {
          return res.status(400).json({
            success: false,
            error: 'No se encontraron items para este pedido'
          });
        }
        itemPedidoId = items[0].id!;
        console.log('itemPedidoId obtenido automáticamente:', itemPedidoId);
      }

      // Subir todas las imágenes
      const fotosSubidas = [];
      for (const file of files) {
        const foto = await subirFotoUseCase.execute({
          file,
          usuarioId,
          pedidoId,
          itemPedidoId
        });
        fotosSubidas.push({
          id: foto.id,
          url: foto.ruta_almacenamiento,
          filename: foto.nombre_archivo,
          size: foto.tamaño_archivo,
          fecha_subida: foto.fecha_subida
        });
      }

      res.status(200).json({
        success: true,
        data: fotosSubidas
      });
    } catch (error: any) {
      console.error('Error subiendo imagen al pedido:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error interno del servidor'
      });
    }
  });
};

export default pedidoRoutes;