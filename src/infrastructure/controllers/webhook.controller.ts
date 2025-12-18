import { Request, Response } from 'express';
import { ProcesarWebhookStripeUseCase } from '../../application/use-cases/procesar-webhook-stripe.use-case';

export class WebhookController {
  constructor(
    private procesarWebhookStripeUseCase: ProcesarWebhookStripeUseCase
  ) {}

  async handleStripeWebhook(req: Request, res: Response): Promise<void> {
    try {
      const signature = req.headers['stripe-signature'];

      if (!signature || typeof signature !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Falta la firma de Stripe (stripe-signature header)'
        });
        return;
      }

      // El body debe ser el raw body (Buffer) para verificar la firma
      const payload = req.body;

      const result = await this.procesarWebhookStripeUseCase.execute(payload, signature);

      if (result.success) {
        res.status(200).json({ received: true, message: result.message });
      } else {
        console.error('Error procesando webhook:', result.error);
        res.status(400).json({
          success: false,
          message: result.message || 'Error al procesar el webhook'
        });
      }
    } catch (error: any) {
      console.error('Error en handleStripeWebhook:', error);
      res.status(400).json({
        success: false,
        message: `Webhook Error: ${error.message}`
      });
    }
  }
}
