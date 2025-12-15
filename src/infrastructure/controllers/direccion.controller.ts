import { Request, Response } from 'express';
import { 
  CrearDireccionUseCase, 
  ObtenerDireccionesUsuarioUseCaseList, 
  ActualizarDireccionUseCase, 
  EliminarDireccionUseCase,
  EstablecerDireccionPredeterminadaUseCase
} from '../../application/use-cases/direccion.use-case';
import { DireccionRepositoryPort } from '../../domain/ports/direccion.repository.port';
import { UsuarioRepositoryPort } from '../../domain/ports/usuario.repository.port';

export class DireccionController {
  constructor(
    private readonly crearDireccionUseCase: CrearDireccionUseCase,
    private readonly obtenerDireccionesUsuarioUseCase: ObtenerDireccionesUsuarioUseCaseList,
    private readonly actualizarDireccionUseCase: ActualizarDireccionUseCase,
    private readonly eliminarDireccionUseCase: EliminarDireccionUseCase,
    private readonly establecerDireccionPredeterminadaUseCase: EstablecerDireccionPredeterminadaUseCase
  ) {}

  async crearDireccion(req: Request, res: Response): Promise<void> {
    try {
      const { alias, pais, estado, ciudad, codigo_postal, direccion, numero_casa, numero_departamento, especificaciones, predeterminada = false } = req.body;
      const usuarioId = req.user?.id; // Asumiendo que el ID del usuario está en req.user (middleware de autenticación)

      if (!usuarioId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      // Validaciones
      if (!alias || !pais || !estado || !ciudad || !codigo_postal || !direccion) {
        res.status(400).json({
          success: false,
          message: 'Los campos alias, pais, estado, ciudad, codigo_postal y direccion son requeridos'
        });
        return;
      }

      const result = await this.crearDireccionUseCase.execute(
        usuarioId,
        alias,
        pais,
        estado,
        ciudad,
        codigo_postal,
        direccion,
        predeterminada,
        numero_casa,
        numero_departamento,
        especificaciones
      );

      if (result.success) {
        res.status(201).json({
          success: true,
          data: result.data,
          message: 'Dirección creada exitosamente'
        });
      } else {
        res.status(result.error === 'USER_NOT_FOUND' ? 404 : 500).json({
          success: false,
          message: result.message
        });
      }
    } catch (error: any) {
      console.error('Error creando dirección:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async getDireccionesByUsuarioId(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = parseInt(req.params.usuarioId);
      const tokenUsuarioId = req.user?.id; // ID del usuario autenticado

      if (!tokenUsuarioId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      // Verificar que el usuario autenticado solo pueda ver sus propias direcciones
      // a menos que sea administrador
      const esAdmin = req.user?.tipo === 'admin' || req.user?.tipo === 'super_admin';
      if (tokenUsuarioId !== usuarioId && !esAdmin) {
        res.status(403).json({
          success: false,
          message: 'Acceso denegado. Solo puedes ver tus propias direcciones.'
        });
        return;
      }

      if (isNaN(usuarioId)) {
        res.status(400).json({
          success: false,
          message: 'ID de usuario inválido'
        });
        return;
      }

      const result = await this.obtenerDireccionesUsuarioUseCase.execute(usuarioId);

      if (result.success) {
        res.status(200).json({
          success: true,
          data: result.data
        });
      } else {
        res.status(500).json({
          success: false,
          message: result.message
        });
      }
    } catch (error: any) {
      console.error('Error obteniendo direcciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async updateDireccion(req: Request, res: Response): Promise<void> {
    try {
      const direccionId = parseInt(req.params.id);
      const tokenUsuarioId = req.user?.id; // ID del usuario autenticado

      if (!tokenUsuarioId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      if (isNaN(direccionId)) {
        res.status(400).json({
          success: false,
          message: 'ID de dirección inválido'
        });
        return;
      }

      const { alias, pais, estado, ciudad, codigo_postal, direccion, numero_casa, numero_departamento, especificaciones, predeterminada } = req.body;

      // Validaciones
      if (!alias || !pais || !estado || !ciudad || !codigo_postal || !direccion) {
        res.status(400).json({
          success: false,
          message: 'Los campos alias, pais, estado, ciudad, codigo_postal y direccion son requeridos'
        });
        return;
      }

      const result = await this.actualizarDireccionUseCase.execute(
        direccionId,
        tokenUsuarioId, // El usuario autenticado solo puede actualizar sus propias direcciones
        alias,
        pais,
        estado,
        ciudad,
        codigo_postal,
        direccion,
        predeterminada ?? false,
        numero_casa,
        numero_departamento,
        especificaciones
      );

      if (result.success) {
        res.status(200).json({
          success: true,
          data: result.data,
          message: 'Dirección actualizada exitosamente'
        });
      } else {
        const statusCode = result.error === 'ADDRESS_NOT_FOUND' ? 404 : 
                          result.error === 'UNAUTHORIZED' ? 403 : 
                          result.error === 'USER_NOT_FOUND' ? 404 : 500;
        res.status(statusCode).json({
          success: false,
          message: result.message
        });
      }
    } catch (error: any) {
      console.error('Error actualizando dirección:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async deleteDireccion(req: Request, res: Response): Promise<void> {
    try {
      const direccionId = parseInt(req.params.id);
      const tokenUsuarioId = req.user?.id; // ID del usuario autenticado

      if (!tokenUsuarioId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      if (isNaN(direccionId)) {
        res.status(400).json({
          success: false,
          message: 'ID de dirección inválido'
        });
        return;
      }

      const result = await this.eliminarDireccionUseCase.execute(direccionId, tokenUsuarioId);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message
        });
      } else {
        const statusCode = result.error === 'ADDRESS_NOT_FOUND' ? 404 : 
                          result.error === 'UNAUTHORIZED' ? 403 : 500;
        res.status(statusCode).json({
          success: false,
          message: result.message
        });
      }
    } catch (error: any) {
      console.error('Error eliminando dirección:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async setDireccionPredeterminada(req: Request, res: Response): Promise<void> {
    try {
      const direccionId = parseInt(req.params.id);
      const tokenUsuarioId = req.user?.id; // ID del usuario autenticado

      if (!tokenUsuarioId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      if (isNaN(direccionId)) {
        res.status(400).json({
          success: false,
          message: 'ID de dirección inválido'
        });
        return;
      }

      const result = await this.establecerDireccionPredeterminadaUseCase.execute(tokenUsuarioId, direccionId);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message
        });
      } else {
        const statusCode = result.error === 'ADDRESS_NOT_FOUND' ? 404 : 
                          result.error === 'UNAUTHORIZED' ? 403 : 500;
        res.status(statusCode).json({
          success: false,
          message: result.message
        });
      }
    } catch (error: any) {
      console.error('Error estableciendo dirección predeterminada:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}