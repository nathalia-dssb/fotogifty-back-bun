import Stripe from 'stripe';

export interface CreateCheckoutSessionParams {
  id_usuario: number;
  id_direccion: number;
  nombre_cliente: string;
  email_cliente: string;
  telefono_cliente?: string;
  items: {
    id_paquete: number;
    nombre_paquete: string;
    categoria_paquete?: string;
    precio_unitario: number;
    cantidad: number;
    num_fotos_requeridas: number;
  }[];
  subtotal: number;
  iva: number;
  total: number;
  success_url: string;
  cancel_url: string;
}

export interface CheckoutSessionResult {
  session_id: string;
  url: string;
}

export interface SessionVerificationResult {
  status: string;
  payment_status: string;
  session: Stripe.Checkout.Session;
}

export class StripeService {
  private stripe: Stripe | null = null;

  private getStripe(): Stripe {
    if (!this.stripe) {
      const secretKey = process.env.STRIPE_SECRET_KEY;
      if (!secretKey) {
        throw new Error('STRIPE_SECRET_KEY no está configurada en las variables de entorno');
      }
      this.stripe = new Stripe(secretKey);
    }
    return this.stripe;
  }

  async createCheckoutSession(params: CreateCheckoutSessionParams): Promise<CheckoutSessionResult> {
    const {
      id_usuario,
      id_direccion,
      nombre_cliente,
      email_cliente,
      telefono_cliente,
      items,
      subtotal,
      iva,
      total,
      success_url,
      cancel_url
    } = params;

    // Crear line_items para Stripe
    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(item => ({
      price_data: {
        currency: 'mxn',
        product_data: {
          name: item.nombre_paquete,
          description: item.categoria_paquete || undefined,
        },
        unit_amount: Math.round(item.precio_unitario * 100), // Convertir a centavos
      },
      quantity: item.cantidad,
    }));

    // Agregar IVA como línea separada si es mayor a 0
    if (iva > 0) {
      line_items.push({
        price_data: {
          currency: 'mxn',
          product_data: {
            name: 'IVA (16%)',
            description: 'Impuesto al Valor Agregado',
          },
          unit_amount: Math.round(iva * 100),
        },
        quantity: 1,
      });
    }

    const session = await this.getStripe().checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email_cliente,
      line_items,
      metadata: {
        id_usuario: id_usuario.toString(),
        id_direccion: id_direccion.toString(),
        nombre_cliente,
        email_cliente,
        telefono_cliente: telefono_cliente || '',
        items_json: JSON.stringify(items),
        subtotal: subtotal.toString(),
        iva: iva.toString(),
        total: total.toString(),
      },
      success_url,
      cancel_url,
    });

    if (!session.url) {
      throw new Error('No se pudo generar la URL de checkout');
    }

    return {
      session_id: session.id,
      url: session.url,
    };
  }

  async retrieveSession(sessionId: string): Promise<SessionVerificationResult> {
    const session = await this.getStripe().checkout.sessions.retrieve(sessionId);

    return {
      status: session.status || 'unknown',
      payment_status: session.payment_status || 'unknown',
      session,
    };
  }

  async constructWebhookEventAsync(payload: string | Buffer, signature: string): Promise<Stripe.Event> {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET no está configurada en las variables de entorno');
    }

    return await this.getStripe().webhooks.constructEventAsync(payload, signature, webhookSecret);
  }

  async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    return await this.getStripe().paymentIntents.retrieve(paymentIntentId);
  }
}
