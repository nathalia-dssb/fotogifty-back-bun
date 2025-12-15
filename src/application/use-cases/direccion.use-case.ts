import { DireccionEntity, Direccion } from '../../domain/entities/direccion.entity';
import { DireccionRepositoryPort } from '../../domain/ports/direccion.repository.port';
import { UsuarioRepositoryPort } from '../../domain/ports/usuario.repository.port';

interface DireccionResult {
  success: boolean;
  data?: Direccion;
  message?: string;
  error?: string;
}

export class CrearDireccionUseCase {
  constructor(
    private readonly direccionRepository: DireccionRepositoryPort,
    private readonly usuarioRepository: UsuarioRepositoryPort
  ) {}

  async execute(
    usuario_id: number,
    alias: string,
    pais: string,
    estado: string,
    ciudad: string,
    codigo_postal: string,
    direccion: string,
    predeterminada: boolean,
    numero_casa?: string,
    numero_departamento?: string,
    especificaciones?: string
  ): Promise<DireccionResult> {
    try {
      // Verificar que el usuario exista
      const usuario = await this.usuarioRepository.findById(usuario_id);
      if (!usuario) {
        return {
          success: false,
          message: 'Usuario no encontrado',
          error: 'USER_NOT_FOUND'
        };
      }

      // Si esta dirección se va a marcar como predeterminada, desmarcar la anterior
      if (predeterminada) {
        const direccionActualPredeterminada = await this.direccionRepository.findByUsuarioIdAndPredeterminada(usuario_id);
        if (direccionActualPredeterminada) {
          // Si hay otra dirección predeterminada, cambiarla a no predeterminada
          await this.direccionRepository.update(direccionActualPredeterminada.id!, {
            ...direccionActualPredeterminada,
            predeterminada: false
          });
        }
      } else {
        // Si es la primera dirección, marcarla como predeterminada
        const direccionesUsuario = await this.direccionRepository.findByUsuarioId(usuario_id);
        if (direccionesUsuario.length === 0) {
          predeterminada = true;
        }
      }

      // Crear la entidad de dirección
      const nuevaDireccion = DireccionEntity.create(
        usuario_id,
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

      // Guardar en la base de datos
      const direccionGuardada = await this.direccionRepository.save(nuevaDireccion);

      return {
        success: true,
        data: direccionGuardada
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al crear la dirección',
        error: error.message
      };
    }
  }
}

export class ObtenerDireccionesUsuarioUseCase {
  constructor(private readonly direccionRepository: DireccionRepositoryPort) {}

  async execute(usuarioId: number): Promise<DireccionResult> {
    try {
      const direcciones = await this.direccionRepository.findByUsuarioId(usuarioId);

      return {
        success: true,
        data: direcciones as any // Esto devolverá un array en lugar de un solo elemento
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al obtener las direcciones',
        error: error.message
      };
    }
  }
}

// Este caso de uso devuelve un array, por lo que es mejor tener uno específico para ello
export class ObtenerDireccionesUsuarioUseCaseList {
  constructor(private readonly direccionRepository: DireccionRepositoryPort) {}

  async execute(usuarioId: number): Promise<{ success: boolean; data?: Direccion[]; message?: string; error?: string }> {
    try {
      const direcciones = await this.direccionRepository.findByUsuarioId(usuarioId);

      return {
        success: true,
        data: direcciones
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al obtener las direcciones',
        error: error.message
      };
    }
  }
}

export class ActualizarDireccionUseCase {
  constructor(
    private readonly direccionRepository: DireccionRepositoryPort,
    private readonly usuarioRepository: UsuarioRepositoryPort
  ) {}

  async execute(
    id: number,
    usuario_id: number,
    alias: string,
    pais: string,
    estado: string,
    ciudad: string,
    codigo_postal: string,
    direccion: string,
    predeterminada: boolean,
    numero_casa?: string,
    numero_departamento?: string,
    especificaciones?: string
  ): Promise<DireccionResult> {
    try {
      // Verificar que la dirección exista y pertenezca al usuario
      const direccionExistente = await this.direccionRepository.findById(id);
      if (!direccionExistente) {
        return {
          success: false,
          message: 'Dirección no encontrada',
          error: 'ADDRESS_NOT_FOUND'
        };
      }

      if (direccionExistente.usuario_id !== usuario_id) {
        return {
          success: false,
          message: 'No tienes permiso para actualizar esta dirección',
          error: 'UNAUTHORIZED'
        };
      }

      // Verificar que el usuario exista
      const usuario = await this.usuarioRepository.findById(usuario_id);
      if (!usuario) {
        return {
          success: false,
          message: 'Usuario no encontrado',
          error: 'USER_NOT_FOUND'
        };
      }

      // Si esta dirección se va a marcar como predeterminada, desmarcar la anterior
      if (predeterminada) {
        const direccionActualPredeterminada = await this.direccionRepository.findByUsuarioIdAndPredeterminada(usuario_id);
        if (direccionActualPredeterminada && direccionActualPredeterminada.id !== id) {
          await this.direccionRepository.update(direccionActualPredeterminada.id!, {
            ...direccionActualPredeterminada,
            predeterminada: false
          });
        }
      }

      // Actualizar la dirección
      const direccionActualizada: Direccion = {
        id,
        usuario_id,
        alias,
        pais,
        estado,
        ciudad,
        codigo_postal,
        direccion,
        numero_casa,
        numero_departamento,
        especificaciones,
        predeterminada
      };

      const direccionGuardada = await this.direccionRepository.update(id, direccionActualizada);

      if (!direccionGuardada) {
        return {
          success: false,
          message: 'Error al actualizar la dirección',
          error: 'UPDATE_FAILED'
        };
      }

      return {
        success: true,
        data: direccionGuardada
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al actualizar la dirección',
        error: error.message
      };
    }
  }
}

export class EliminarDireccionUseCase {
  constructor(private readonly direccionRepository: DireccionRepositoryPort) {}

  async execute(id: number, usuario_id: number): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      // Verificar que la dirección exista y pertenezca al usuario
      const direccion = await this.direccionRepository.findById(id);
      if (!direccion) {
        return {
          success: false,
          message: 'Dirección no encontrada',
          error: 'ADDRESS_NOT_FOUND'
        };
      }

      if (direccion.usuario_id !== usuario_id) {
        return {
          success: false,
          message: 'No tienes permiso para eliminar esta dirección',
          error: 'UNAUTHORIZED'
        };
      }

      const eliminado = await this.direccionRepository.delete(id);

      if (!eliminado) {
        return {
          success: false,
          message: 'Error al eliminar la dirección',
          error: 'DELETE_FAILED'
        };
      }

      return {
        success: true,
        message: 'Dirección eliminada exitosamente'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al eliminar la dirección',
        error: error.message
      };
    }
  }
}

export class EstablecerDireccionPredeterminadaUseCase {
  constructor(private readonly direccionRepository: DireccionRepositoryPort) {}

  async execute(usuarioId: number, direccionId: number): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      // Verificar que la dirección exista y pertenezca al usuario
      const direccion = await this.direccionRepository.findById(direccionId);
      if (!direccion) {
        return {
          success: false,
          message: 'Dirección no encontrada',
          error: 'ADDRESS_NOT_FOUND'
        };
      }

      if (direccion.usuario_id !== usuarioId) {
        return {
          success: false,
          message: 'No tienes permiso para modificar esta dirección',
          error: 'UNAUTHORIZED'
        };
      }

      // Establecer como predeterminada
      await this.direccionRepository.setPredeterminada(usuarioId, direccionId);

      return {
        success: true,
        message: 'Dirección establecida como predeterminada exitosamente'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al establecer la dirección como predeterminada',
        error: error.message
      };
    }
  }
}