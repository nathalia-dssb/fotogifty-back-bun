import { StripeService } from '../../infrastructure/services/stripe.service';
import { PedidoRepositoryPort } from '../../domain/ports/pedido.repository.port';
import { Pedido } from '../../domain/entities/pedido.entity';

interface VerificarSesionResult {
  success: boolean;
  data?: {
    status: string;
    payment_status: string;
    pedido: Pedido | null;
  };
  message?: string;
  error?: string;
}

export class VerificarSesionCheckoutUseCase {
  constructor(
    private readonly stripeService: StripeService,
    private readonly pedidoRepository: PedidoRepositoryPort
  ) {}

  async execute(sessionId: string): Promise<VerificarSesionResult> {
    try {
      if (!sessionId) {
        return {
          success: false,
          message: 'El session_id es requerido',
          error: 'Session ID faltante'
        };
      }

      // Obtener información de la sesión desde Stripe
      const sessionResult = await this.stripeService.retrieveSession(sessionId);

      // Buscar el pedido asociado a esta sesión
      const pedidos = await this.pedidoRepository.findAll();
      const pedido = pedidos.find(p => p.id_sesion_stripe === sessionId) || null;

      return {
        success: true,
        data: {
          status: sessionResult.status,
          payment_status: sessionResult.payment_status,
          pedido
        }
      };
    } catch (error: any) {
      console.error('Error en VerificarSesionCheckoutUseCase:', error);
      return {
        success: false,
        message: error.message || 'Error al verificar la sesión',
        error: error.message
      };
    }
  }
}
