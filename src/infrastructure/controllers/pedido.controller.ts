import { Request, Response } from 'express';
import { PedidoEntity, EstadoPedido } from '../../domain/entities/pedido.entity';
import { CrearPedidoUseCase } from '../../application/use-cases/crear-pedido.use-case';
import { ActualizarEstadoPedidoUseCase } from '../../application/use-cases/actualizar-estado-pedido.use-case';
import { PedidoRepositoryPort } from '../../domain/ports/pedido.repository.port';
import { UsuarioRepositoryPort } from '../../domain/ports/usuario.repository.port';
import { PaqueteRepositoryPort } from '../../domain/ports/paquete.repository.port';

export class PedidoController {
  constructor(
    private crearPedidoUseCase: CrearPedidoUseCase,
    private actualizarEstadoPedidoUseCase: ActualizarEstadoPedidoUseCase,
    private pedidoRepository: PedidoRepositoryPort,
    private usuarioRepository: UsuarioRepositoryPort,
    private paqueteRepository: PaqueteRepositoryPort
  ) {}

  async crearPedido(req: Request, res: Response): Promise<void> {
    try {
      const {
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
      } = req.body;

      // Validar que los campos requeridos estén presentes
      if (!nombre_cliente || !email_cliente || !id_direccion || !items_pedido || !Array.isArray(items_pedido) || items_pedido.length === 0 || subtotal === undefined || iva === undefined || total === undefined) {
        res.status(400).json({
          success: false,
          message: 'Nombre, email, ID de dirección, items del pedido, subtotal, IVA y total son requeridos'
        });
        return;
      }

      // Validar que id_direccion sea un número
      if (typeof id_direccion !== 'number' || id_direccion <= 0) {
        res.status(400).json({
          success: false,
          message: 'ID de dirección inválido'
        });
        return;
      }

      // Ejecutar el caso de uso
      const result = await this.crearPedidoUseCase.execute(
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

      if (result.success) {
        res.status(201).json({
          success: true,
          data: result.data
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message || 'Error al crear el pedido'
        });
      }
    } catch (error) {
      console.error('Error en crearPedido:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async getPedidoById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const idNum = parseInt(id, 10);
      if (isNaN(idNum)) {
        res.status(400).json({
          success: false,
          message: 'ID de pedido inválido'
        });
        return;
      }

      const pedido = await this.pedidoRepository.findById(idNum);

      if (!pedido) {
        res.status(404).json({
          success: false,
          message: 'Pedido no encontrado'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: pedido
      });
    } catch (error) {
      console.error('Error en getPedidoById:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async getPedidosByUsuarioId(req: Request, res: Response): Promise<void> {
    try {
      const { usuarioId } = req.params;

      const usuarioIdNum = parseInt(usuarioId, 10);
      if (isNaN(usuarioIdNum)) {
        res.status(400).json({
          success: false,
          message: 'ID de usuario inválido'
        });
        return;
      }

      // Verificar que el usuario exista
      const usuario = await this.usuarioRepository.findById(usuarioIdNum);
      if (!usuario) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }

      const pedidos = await this.pedidoRepository.findByUsuarioId(usuarioIdNum);

      res.status(200).json({
        success: true,
        data: pedidos
      });
    } catch (error) {
      console.error('Error en getPedidosByUsuarioId:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async getPedidosByEstado(req: Request, res: Response): Promise<void> {
    try {
      const { estado } = req.params;

      // Validar que el estado sea uno de los valores permitidos
      const estadosValidos = Object.values(EstadoPedido);
      if (!estadosValidos.includes(estado as EstadoPedido)) {
        res.status(400).json({
          success: false,
          message: `Estado no válido. Estados permitidos: ${estadosValidos.join(', ')}`
        });
        return;
      }

      const pedidos = await this.pedidoRepository.findByEstado(estado);

      res.status(200).json({
        success: true,
        data: pedidos
      });
    } catch (error) {
      console.error('Error en getPedidosByEstado:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async updateEstadoPedido(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      const idNum = parseInt(id, 10);
      if (isNaN(idNum)) {
        res.status(400).json({
          success: false,
          message: 'ID de pedido inválido'
        });
        return;
      }

      // Validar que el estado sea uno de los valores permitidos
      const estadosValidos = Object.values(EstadoPedido);
      if (!estadosValidos.includes(estado as EstadoPedido)) {
        res.status(400).json({
          success: false,
          message: `Estado no válido. Estados permitidos: ${estadosValidos.join(', ')}`
        });
        return;
      }

      // Ejecutar el caso de uso de actualización de estado
      const result = await this.actualizarEstadoPedidoUseCase.execute(
        idNum,
        estado as EstadoPedido
      );

      if (result.success) {
        res.status(200).json({
          success: true,
          data: result.data
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message || 'Error al actualizar el estado del pedido'
        });
      }
    } catch (error) {
      console.error('Error en updateEstadoPedido:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async getAllPedidos(req: Request, res: Response): Promise<void> {
    try {
      const pedidos = await this.pedidoRepository.findAll();

      res.status(200).json({
        success: true,
        data: pedidos
      });
    } catch (error) {
      console.error('Error en getAllPedidos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}