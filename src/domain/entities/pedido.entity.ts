export interface ItemPedido {
  id_paquete: number;
  nombre_paquete: string;
  categoria_paquete?: string;
  precio_unitario: number;
  cantidad: number;
  num_fotos_requeridas: number;
}

export enum EstadoPedido {
  PENDIENTE = 'Pendiente',
  ENVIADO = 'Enviado',
  IMPRIMIENDO = 'Imprimiendo',
  EMPAQUETADO = 'Empaquetado',
  EN_REPARTO = 'En reparto',
  ENTREGADO = 'Entregado',
  ARCHIVADO = 'Archivado'
}

export enum EstadoPago {
  PENDIENTE = 'pending',
  PAGADO = 'paid',
  FALLIDO = 'failed',
  REEMBOLSADO = 'refunded'
}

export interface Pedido {
  id?: number;
  id_usuario?: number;  // Relación con el usuario que hizo el pedido
  id_direccion?: number; // Relación con la dirección de envío
  id_pago_stripe?: string;
  id_sesion_stripe?: string;
  nombre_cliente: string;
  email_cliente: string;
  telefono_cliente?: string;
  fecha_pedido: Date;
  items_pedido: ItemPedido[];
  estado: EstadoPedido;
  estado_pago: EstadoPago;
  subtotal: number;
  iva: number;
  total: number;
  imagenes?: string[];
  creado_en?: Date;
  actualizado_en?: Date;
}

export class PedidoEntity implements Pedido {
  public id?: number;
  public id_usuario?: number;
  public id_direccion?: number;
  public id_pago_stripe?: string;
  public id_sesion_stripe?: string;
  public nombre_cliente: string;
  public email_cliente: string;
  public telefono_cliente?: string;
  public fecha_pedido: Date;
  public items_pedido: ItemPedido[];
  public estado: EstadoPedido;
  public estado_pago: EstadoPago;
  public subtotal: number;
  public iva: number;
  public total: number;
  public imagenes?: string[];
  public creado_en: Date;
  public actualizado_en: Date;

  constructor(
    id_usuario: number | undefined,
    id_direccion: number | undefined,
    nombre_cliente: string,
    email_cliente: string,
    items_pedido: ItemPedido[],
    subtotal: number,
    iva: number,
    total: number,
    id_pago_stripe?: string,
    id_sesion_stripe?: string,
    telefono_cliente?: string,
    estado: EstadoPedido = EstadoPedido.PENDIENTE,
    estado_pago: EstadoPago = EstadoPago.PENDIENTE,
    imagenes?: string[],
    id?: number
  ) {
    this.id = id;
    this.id_usuario = id_usuario;
    this.id_direccion = id_direccion;
    this.id_pago_stripe = id_pago_stripe;
    this.id_sesion_stripe = id_sesion_stripe;
    this.nombre_cliente = nombre_cliente;
    this.email_cliente = email_cliente;
    this.telefono_cliente = telefono_cliente;
    this.fecha_pedido = new Date();
    this.items_pedido = items_pedido;
    this.estado = estado;
    this.estado_pago = estado_pago;
    this.subtotal = subtotal;
    this.iva = iva;
    this.total = total;
    this.imagenes = imagenes;
    this.creado_en = new Date();
    this.actualizado_en = new Date();
  }

  static create(
    id_usuario: number | undefined,
    id_direccion: number | undefined,
    nombre_cliente: string,
    email_cliente: string,
    items_pedido: ItemPedido[],
    subtotal: number,
    iva: number,
    total: number,
    id_pago_stripe?: string,
    id_sesion_stripe?: string,
    telefono_cliente?: string
  ): PedidoEntity {
    return new PedidoEntity(
      id_usuario,
      id_direccion,
      nombre_cliente,
      email_cliente,
      items_pedido,
      subtotal,
      iva,
      total,
      id_pago_stripe,
      id_sesion_stripe,
      telefono_cliente
    );
  }
}