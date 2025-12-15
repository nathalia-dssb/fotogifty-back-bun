import { PedidoEntity, EstadoPedido, EstadoPago } from '../../domain/entities/pedido.entity';
import { PedidoRepositoryPort } from '../../domain/ports/pedido.repository.port';
import { UsuarioRepositoryPort } from '../../domain/ports/usuario.repository.port';
import { PaqueteRepositoryPort } from '../../domain/ports/paquete.repository.port';

interface CrearPedidoResult {
  success: boolean;
  data?: PedidoEntity;
  message?: string;
  error?: string;
}

export class CrearPedidoUseCase {
  constructor(
    private readonly pedidoRepository: PedidoRepositoryPort,
    private readonly usuarioRepository: UsuarioRepositoryPort,
    private readonly paqueteRepository: PaqueteRepositoryPort
  ) {}

  async execute(
    id_usuario: number | undefined,
    nombre_cliente: string,
    email_cliente: string,
    direccion_envio: any, // Debería ser de tipo DireccionEnvio pero evito importaciones circulares
    items_pedido: any[], // Debería ser de tipo ItemPedido pero evito importaciones circulares
    subtotal: number,
    iva: number,
    total: number,
    id_pago_stripe?: string,
    id_sesion_stripe?: string,
    telefono_cliente?: string
  ): Promise<CrearPedidoResult> {
    try {
      // Validaciones
      if (!nombre_cliente || !email_cliente || !direccion_envio || !items_pedido || items_pedido.length === 0) {
        return {
          success: false,
          message: 'Nombre, email, dirección de envío y al menos un ítem son requeridos',
          error: 'Campos requeridos faltantes'
        };
      }

      // Si se proporciona id_usuario, verificar que el usuario exista
      if (id_usuario) {
        const usuario = await this.usuarioRepository.findById(id_usuario);
        if (!usuario) {
          return {
            success: false,
            message: 'El usuario especificado no existe',
            error: 'Usuario no encontrado'
          };
        }
      }

      // Validar que los paquetes en los items existan y obtener información detallada
      for (const item of items_pedido) {
        if (!item.id_paquete) {
          return {
            success: false,
            message: `El ítem con índice ${items_pedido.indexOf(item)} no tiene un paquete asociado`,
            error: 'Paquete no especificado'
          };
        }

        const paquete = await this.paqueteRepository.findById(item.id_paquete);
        if (!paquete) {
          return {
            success: false,
            message: `El paquete con ID ${item.id_paquete} no existe`,
            error: 'Paquete no encontrado'
          };
        }
        
        // Verificar que las propiedades del item coincidan con las del paquete
        if (item.nombre_paquete !== paquete.nombre) {
          return {
            success: false,
            message: `Nombre de paquete no coincide para el paquete con ID ${item.id_paquete}`,
            error: 'Datos de paquete inconsistentes'
          };
        }
        
        if (item.num_fotos_requeridas !== paquete.cantidad_fotos * item.cantidad) {
          return {
            success: false,
            message: `Cantidad de fotos requeridas no coincide para el paquete con ID ${item.id_paquete}`,
            error: 'Cantidad de fotos requeridas incorrecta'
          };
        }
      }

      // Crear la entidad de pedido
      const nuevoPedido = PedidoEntity.create(
        id_usuario,
        (direccion_envio as any).id, // Extraer el ID de la dirección
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

      // Guardar en la base de datos
      const pedidoGuardado = await this.pedidoRepository.create(nuevoPedido);

      return {
        success: true,
        data: pedidoGuardado
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al crear el pedido',
        error: error.message
      };
    }
  }
}