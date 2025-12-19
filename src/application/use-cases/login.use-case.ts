import { UsuarioRepositoryPort } from '../../domain/ports/usuario.repository.port';
import { TipoUsuario, UsuarioConTipo } from '../../domain/entities/tipo-usuario.entity';
import { PasswordService } from '../../infrastructure/services/password.service';

interface LoginResult {
  success: boolean;
  message?: string;
  usuario?: UsuarioConTipo;
}

export class LoginUseCase {
  constructor(private usuarioRepository: UsuarioRepositoryPort) {}

  async execute(email: string, password: string, tipoSolicitado: string): Promise<LoginResult> {
    try {
      // Buscar al usuario por email
      const usuario = await this.usuarioRepository.findByEmail(email);
      
      if (!usuario) {
        return {
          success: false,
          message: 'Usuario no encontrado'
        };
      }

      // Verificar el tipo de usuario
      if (tipoSolicitado === 'cliente' && usuario.tipo !== TipoUsuario.CLIENTE) {
        return {
          success: false,
          message: 'Credenciales inválidas'
        };
      }

      // Para login de admin, permitir tanto admin como super_admin
      if (tipoSolicitado === 'admin' &&
          (usuario.tipo !== TipoUsuario.ADMIN && usuario.tipo !== TipoUsuario.SUPER_ADMIN)) {
        return {
          success: false,
          message: 'Credenciales inválidas'
        };
      }

      // Para login de vendedor de ventanilla (store)
      if (tipoSolicitado === 'store' && usuario.tipo !== TipoUsuario.STORE) {
        return {
          success: false,
          message: 'Credenciales inválidas'
        };
      }

      // Verificar la contraseña
      const isPasswordValid = await PasswordService.verifyPassword(password, usuario.password_hash);

      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Contraseña incorrecta'
        };
      }

      // Actualizar la fecha de última conexión
      await this.usuarioRepository.updateLastLogin(usuario.id!);

      // Actualizar localmente la fecha de última conexión para devolverla en la respuesta
      const usuarioConUltimaConexion = {
        ...usuario,
        fecha_ultima_conexion: new Date()
      };

      // Devolver el usuario sin la contraseña
      const { password_hash, ...usuarioSinPassword } = usuarioConUltimaConexion;

      return {
        success: true,
        usuario: {
          ...usuarioSinPassword,
          tipo: usuario.tipo
        }
      };
    } catch (error) {
      console.error('Error en LoginUseCase:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }
}