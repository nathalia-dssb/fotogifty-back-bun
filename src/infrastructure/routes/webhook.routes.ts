import { Router } from 'express';
import { WebhookController } from '../controllers/webhook.controller';
import { ProcesarWebhookStripeUseCase } from '../../application/use-cases/procesar-webhook-stripe.use-case';
import { StripeService } from '../services/stripe.service';
import { PrismaPedidoRepository } from '../repositories/prisma-pedido.repository';

const webhookRoutes = (router: Router): void => {
  // Inicializar dependencias
  const stripeService = new StripeService();
  const pedidoRepository = new PrismaPedidoRepository();

  // Inicializar caso de uso
  const procesarWebhookStripeUseCase = new ProcesarWebhookStripeUseCase(
    stripeService,
    pedidoRepository
  );

  // Inicializar controlador
  const webhookController = new WebhookController(procesarWebhookStripeUseCase);

  /**
   * @swagger
   * /api/webhooks/stripe:
   *   post:
   *     summary: Webhook para recibir eventos de Stripe
   *     tags: [Webhooks]
   *     description: |
   *       Este endpoint recibe eventos de Stripe como:
   *       - checkout.session.completed: Cuando se completa un pago
   *       - checkout.session.expired: Cuando expira una sesión de checkout
   *       - payment_intent.payment_failed: Cuando falla un pago
   *
   *       **IMPORTANTE**: Este endpoint debe recibir el body RAW (no parseado como JSON)
   *       y requiere el header `stripe-signature` para verificar la autenticidad del evento.
   *     parameters:
   *       - in: header
   *         name: stripe-signature
   *         required: true
   *         schema:
   *           type: string
   *         description: Firma de Stripe para verificar el evento
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             description: Evento de Stripe (estructura variable según el tipo de evento)
   *     responses:
   *       200:
   *         description: Evento procesado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 received:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Pedido 42 creado exitosamente"
   *       400:
   *         description: Error en la verificación de la firma o procesamiento del evento
   */
  router.post('/webhooks/stripe', (req, res) =>
    webhookController.handleStripeWebhook(req, res)
  );
};

export default webhookRoutes;
