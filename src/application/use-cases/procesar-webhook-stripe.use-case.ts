import Stripe from 'stripe';
import { StripeService } from '../../infrastructure/services/stripe.service';
import { PedidoRepositoryPort } from '../../domain/ports/pedido.repository.port';
import { PedidoEntity, EstadoPedido, EstadoPago } from '../../domain/entities/pedido.entity';

interface ProcesarWebhookResult {
  success: boolean;
  message?: string;
  error?: string;
}

export class ProcesarWebhookStripeUseCase {
  constructor(
    private readonly stripeService: StripeService,
    private readonly pedidoRepository: PedidoRepositoryPort
  ) {}

  async execute(payload: string | Buffer, signature: string): Promise<ProcesarWebhookResult> {
    try {
      // Verificar y construir el evento (versión asíncrona para Bun)
      const event = await this.stripeService.constructWebhookEventAsync(payload, signature);

      // Manejar diferentes tipos de eventos
      switch (event.type) {
        case 'checkout.session.completed':
          return await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);

        case 'checkout.session.expired':
          return await this.handleCheckoutSessionExpired(event.data.object as Stripe.Checkout.Session);

        case 'payment_intent.payment_failed':
          return await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);

        default:
          console.log(`Evento de Stripe no manejado: ${event.type}`);
          return {
            success: true,
            message: `Evento ${event.type} recibido pero no procesado`
          };
      }
    } catch (error: any) {
      console.error('Error en ProcesarWebhookStripeUseCase:', error);
      return {
        success: false,
        message: error.message || 'Error al procesar el webhook',
        error: error.message
      };
    }
  }

  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<ProcesarWebhookResult> {
    try {
      const metadata = session.metadata;
      if (!metadata) {
        return {
          success: false,
          message: 'No se encontró metadata en la sesión',
          error: 'Metadata faltante'
        };
      }

      // Extraer datos del metadata
      const id_usuario = parseInt(metadata.id_usuario);
      const id_direccion = parseInt(metadata.id_direccion);
      const nombre_cliente = metadata.nombre_cliente || session.customer_details?.name || '';
      const email_cliente = metadata.email_cliente || session.customer_details?.email || '';
      const telefono_cliente = metadata.telefono_cliente || session.customer_details?.phone || undefined;
      const items = JSON.parse(metadata.items_json || '[]');
      const subtotal = parseFloat(metadata.subtotal || '0');
      const iva = parseFloat(metadata.iva || '0');
      const total = session.amount_total ? session.amount_total / 100 : parseFloat(metadata.total || '0');

      // Verificar si ya existe un pedido con este session_id (evitar duplicados)
      const pedidosExistentes = await this.pedidoRepository.findAll();
      const pedidoExistente = pedidosExistentes.find(p => p.id_sesion_stripe === session.id);

      if (pedidoExistente) {
        console.log(`Pedido ya existe para session_id: ${session.id}`);
        return {
          success: true,
          message: 'El pedido ya fue creado anteriormente'
        };
      }

      // Crear el pedido
      const nuevoPedido = new PedidoEntity(
        id_usuario,
        id_direccion,
        nombre_cliente,
        email_cliente,
        items.map((item: any) => ({
          id_paquete: item.id_paquete,
          nombre_paquete: item.nombre_paquete,
          categoria_paquete: item.categoria_paquete,
          precio_unitario: item.precio_unitario,
          cantidad: item.cantidad,
          num_fotos_requeridas: item.num_fotos_requeridas
        })),
        subtotal,
        iva,
        total,
        session.payment_intent as string || undefined,
        session.id,
        telefono_cliente,
        EstadoPedido.PENDIENTE,
        EstadoPago.PAGADO
      );

      // Agregar direccion_envio para el repositorio
      (nuevoPedido as any).direccion_envio = { id: id_direccion };

      const pedidoCreado = await this.pedidoRepository.create(nuevoPedido);

      console.log(`Pedido creado exitosamente: ${pedidoCreado.id} para session_id: ${session.id}`);

      return {
        success: true,
        message: `Pedido ${pedidoCreado.id} creado exitosamente`
      };
    } catch (error: any) {
      console.error('Error al procesar checkout.session.completed:', error);
      return {
        success: false,
        message: 'Error al crear el pedido',
        error: error.message
      };
    }
  }

  private async handleCheckoutSessionExpired(session: Stripe.Checkout.Session): Promise<ProcesarWebhookResult> {
    console.log(`Sesión de checkout expirada: ${session.id}`);
    // Aquí podrías limpiar datos temporales si los hubiera
    return {
      success: true,
      message: 'Sesión expirada procesada'
    };
  }

  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<ProcesarWebhookResult> {
    console.log(`Pago fallido: ${paymentIntent.id}`);
    // Aquí podrías notificar al usuario o actualizar algún registro
    return {
      success: true,
      message: 'Pago fallido procesado'
    };
  }
}
