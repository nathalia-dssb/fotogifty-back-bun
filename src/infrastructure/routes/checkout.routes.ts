import { Router } from 'express';
import { CheckoutController } from '../controllers/checkout.controller';
import { CrearSesionCheckoutUseCase } from '../../application/use-cases/crear-sesion-checkout.use-case';
import { VerificarSesionCheckoutUseCase } from '../../application/use-cases/verificar-sesion-checkout.use-case';
import { StripeService } from '../services/stripe.service';
import { PrismaUsuarioRepository } from '../repositories/prisma-usuario.repository';
import { PrismaPaqueteRepository } from '../repositories/prisma-paquete.repository';
import { PrismaDireccionRepository } from '../repositories/prisma-direccion.repository';
import { PrismaPedidoRepository } from '../repositories/prisma-pedido.repository';
import { authenticateToken, requireCliente } from '../middlewares/auth.middleware';

const checkoutRoutes = (router: Router): void => {
  // Inicializar dependencias
  const stripeService = new StripeService();
  const usuarioRepository = new PrismaUsuarioRepository();
  const paqueteRepository = new PrismaPaqueteRepository();
  const direccionRepository = new PrismaDireccionRepository();
  const pedidoRepository = new PrismaPedidoRepository();

  // Inicializar casos de uso
  const crearSesionCheckoutUseCase = new CrearSesionCheckoutUseCase(
    stripeService,
    usuarioRepository,
    paqueteRepository,
    direccionRepository
  );
  const verificarSesionCheckoutUseCase = new VerificarSesionCheckoutUseCase(
    stripeService,
    pedidoRepository
  );

  // Inicializar controlador
  const checkoutController = new CheckoutController(
    crearSesionCheckoutUseCase,
    verificarSesionCheckoutUseCase
  );

  /**
   * @swagger
   * /api/checkout/crear-sesion:
   *   post:
   *     summary: Crear una sesión de checkout de Stripe
   *     tags: [Checkout]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - id_usuario
   *               - id_direccion
   *               - nombre_cliente
   *               - email_cliente
   *               - items
   *               - subtotal
   *               - iva
   *               - total
   *               - success_url
   *               - cancel_url
   *             properties:
   *               id_usuario:
   *                 type: integer
   *                 description: ID del usuario
   *                 example: 1
   *               id_direccion:
   *                 type: integer
   *                 description: ID de la dirección de envío
   *                 example: 5
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
   *                 description: Teléfono del cliente (opcional)
   *                 example: "+52 555 123 4567"
   *               items:
   *                 type: array
   *                 items:
   *                   type: object
   *                   properties:
   *                     id_paquete:
   *                       type: integer
   *                       example: 1
   *                     nombre_paquete:
   *                       type: string
   *                       example: "Pack Básico 10 Fotos"
   *                     categoria_paquete:
   *                       type: string
   *                       example: "Fotos Impresas"
   *                     precio_unitario:
   *                       type: number
   *                       example: 29.99
   *                     cantidad:
   *                       type: integer
   *                       example: 2
   *                     num_fotos_requeridas:
   *                       type: integer
   *                       example: 20
   *               subtotal:
   *                 type: number
   *                 description: Subtotal del pedido
   *                 example: 79.97
   *               iva:
   *                 type: number
   *                 description: IVA (16%)
   *                 example: 12.80
   *               total:
   *                 type: number
   *                 description: Total del pedido
   *                 example: 92.77
   *               success_url:
   *                 type: string
   *                 description: URL de redirección en caso de éxito
   *                 example: "https://fotogifty.com/user/order-success?session_id={CHECKOUT_SESSION_ID}"
   *               cancel_url:
   *                 type: string
   *                 description: URL de redirección en caso de cancelación
   *                 example: "https://fotogifty.com/user/cart"
   *     responses:
   *       200:
   *         description: Sesión de checkout creada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     session_id:
   *                       type: string
   *                       example: "cs_test_a1b2c3d4e5f6g7h8i9j0"
   *                     url:
   *                       type: string
   *                       example: "https://checkout.stripe.com/c/pay/cs_test_a1b2c3d4..."
   *       400:
   *         description: Datos de entrada inválidos
   *       401:
   *         description: No autorizado
   *       500:
   *         description: Error interno del servidor
   */
  router.post('/checkout/crear-sesion', authenticateToken, requireCliente, (req, res) =>
    checkoutController.crearSesion(req, res)
  );

  /**
   * @swagger
   * /api/checkout/verificar-sesion/{sessionId}:
   *   get:
   *     summary: Verificar el estado de una sesión de checkout
   *     tags: [Checkout]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: sessionId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID de la sesión de Stripe
   *         example: "cs_test_a1b2c3d4e5f6g7h8i9j0"
   *     responses:
   *       200:
   *         description: Estado de la sesión obtenido exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     status:
   *                       type: string
   *                       enum: [open, complete, expired]
   *                       example: "complete"
   *                     payment_status:
   *                       type: string
   *                       enum: [unpaid, paid, no_payment_required]
   *                       example: "paid"
   *                     pedido:
   *                       type: object
   *                       nullable: true
   *                       description: Datos del pedido si fue creado
   *       400:
   *         description: Session ID inválido
   *       401:
   *         description: No autorizado
   *       500:
   *         description: Error interno del servidor
   */
  router.get('/checkout/verificar-sesion/:sessionId', authenticateToken, (req, res) =>
    checkoutController.verificarSesion(req, res)
  );
};

export default checkoutRoutes;
