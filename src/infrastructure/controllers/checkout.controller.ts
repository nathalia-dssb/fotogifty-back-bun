import { Request, Response } from 'express';
import { CrearSesionCheckoutUseCase } from '../../application/use-cases/crear-sesion-checkout.use-case';
import { VerificarSesionCheckoutUseCase } from '../../application/use-cases/verificar-sesion-checkout.use-case';

export class CheckoutController {
  constructor(
    private crearSesionCheckoutUseCase: CrearSesionCheckoutUseCase,
    private verificarSesionCheckoutUseCase: VerificarSesionCheckoutUseCase
  ) {}

  async crearSesion(req: Request, res: Response): Promise<void> {
    try {
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
      } = req.body;

      // Validaciones básicas
      if (!id_usuario || typeof id_usuario !== 'number') {
        res.status(400).json({
          success: false,
          message: 'id_usuario es requerido y debe ser un número'
        });
        return;
      }

      if (!id_direccion || typeof id_direccion !== 'number') {
        res.status(400).json({
          success: false,
          message: 'id_direccion es requerido y debe ser un número'
        });
        return;
      }

      if (!nombre_cliente || typeof nombre_cliente !== 'string') {
        res.status(400).json({
          success: false,
          message: 'nombre_cliente es requerido'
        });
        return;
      }

      if (!email_cliente || typeof email_cliente !== 'string') {
        res.status(400).json({
          success: false,
          message: 'email_cliente es requerido'
        });
        return;
      }

      if (!items || !Array.isArray(items) || items.length === 0) {
        res.status(400).json({
          success: false,
          message: 'items es requerido y debe ser un array no vacío'
        });
        return;
      }

      if (subtotal === undefined || typeof subtotal !== 'number' || subtotal <= 0) {
        res.status(400).json({
          success: false,
          message: 'subtotal es requerido y debe ser un número positivo'
        });
        return;
      }

      if (iva === undefined || typeof iva !== 'number' || iva < 0) {
        res.status(400).json({
          success: false,
          message: 'iva es requerido y debe ser un número no negativo'
        });
        return;
      }

      if (total === undefined || typeof total !== 'number' || total <= 0) {
        res.status(400).json({
          success: false,
          message: 'total es requerido y debe ser un número positivo'
        });
        return;
      }

      if (!success_url || typeof success_url !== 'string') {
        res.status(400).json({
          success: false,
          message: 'success_url es requerido'
        });
        return;
      }

      if (!cancel_url || typeof cancel_url !== 'string') {
        res.status(400).json({
          success: false,
          message: 'cancel_url es requerido'
        });
        return;
      }

      // Validar estructura de cada item
      for (const item of items) {
        if (!item.id_paquete || typeof item.id_paquete !== 'number') {
          res.status(400).json({
            success: false,
            message: 'Cada item debe tener id_paquete como número'
          });
          return;
        }
        if (!item.nombre_paquete || typeof item.nombre_paquete !== 'string') {
          res.status(400).json({
            success: false,
            message: 'Cada item debe tener nombre_paquete'
          });
          return;
        }
        if (item.precio_unitario === undefined || typeof item.precio_unitario !== 'number') {
          res.status(400).json({
            success: false,
            message: 'Cada item debe tener precio_unitario como número'
          });
          return;
        }
        if (!item.cantidad || typeof item.cantidad !== 'number' || item.cantidad <= 0) {
          res.status(400).json({
            success: false,
            message: 'Cada item debe tener cantidad como número positivo'
          });
          return;
        }
        if (item.num_fotos_requeridas === undefined || typeof item.num_fotos_requeridas !== 'number') {
          res.status(400).json({
            success: false,
            message: 'Cada item debe tener num_fotos_requeridas como número'
          });
          return;
        }
      }

      // Ejecutar el caso de uso
      const result = await this.crearSesionCheckoutUseCase.execute({
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
      });

      if (result.success) {
        res.status(200).json({
          success: true,
          data: result.data
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message || 'Error al crear la sesión de checkout'
        });
      }
    } catch (error) {
      console.error('Error en crearSesion:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async verificarSesion(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        res.status(400).json({
          success: false,
          message: 'session_id es requerido'
        });
        return;
      }

      const result = await this.verificarSesionCheckoutUseCase.execute(sessionId);

      if (result.success) {
        res.status(200).json({
          success: true,
          data: result.data
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message || 'Error al verificar la sesión'
        });
      }
    } catch (error) {
      console.error('Error en verificarSesion:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}
