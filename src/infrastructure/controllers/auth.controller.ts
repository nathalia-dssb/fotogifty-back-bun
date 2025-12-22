import { Request, Response } from 'express';
import { UsuarioConTipo } from '../../domain/entities/tipo-usuario.entity';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { TokenService } from '../services/token.service';
import { PasswordService } from '../services/password.service';

export class AuthController {
  private tokenService: TokenService;

  constructor(private loginUseCase: LoginUseCase) {
    this.tokenService = new TokenService();
  }

  async loginCliente(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Validar que se proporcionen email y password
      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Email y contraseña son requeridos'
        });
        return;
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({
          success: false,
          message: 'Formato de email inválido'
        });
        return;
      }

      const result = await this.loginUseCase.execute(email, password, 'cliente');

      if (result.success && result.usuario) {
        // Generar token JWT
        const tokenResponse = this.tokenService.generateToken(result.usuario);

        // No devolver la contraseña hasheada en la respuesta
        const { password_hash: _, ...usuarioSinPassword } = result.usuario;

        res.status(200).json({
          success: true,
          message: 'Login exitoso',
          data: {
            user: usuarioSinPassword,
            token: tokenResponse.token,
            expiresIn: tokenResponse.expiresIn
          }
        });
      } else {
        res.status(401).json({
          success: false,
          message: result.message || 'Credenciales inválidas'
        });
      }
    } catch (error) {
      console.error('Error en loginCliente:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async loginAdmin(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Validar que se proporcionen email y password
      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Email y contraseña son requeridos'
        });
        return;
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({
          success: false,
          message: 'Formato de email inválido'
        });
        return;
      }

      const result = await this.loginUseCase.execute(email, password, 'admin');

      if (result.success && result.usuario) {
        // Generar token JWT
        const tokenResponse = this.tokenService.generateToken(result.usuario);

        // No devolver la contraseña hasheada en la respuesta
        const { password_hash: _, ...usuarioSinPassword } = result.usuario;

        res.status(200).json({
          success: true,
          message: 'Login exitoso',
          data: {
            user: usuarioSinPassword,
            token: tokenResponse.token,
            expiresIn: tokenResponse.expiresIn
          }
        });
      } else {
        res.status(401).json({
          success: false,
          message: result.message || 'Credenciales inválidas'
        });
      }
    } catch (error) {
      console.error('Error en loginAdmin:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async loginStore(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Validar que se proporcionen email y password
      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Email y contraseña son requeridos'
        });
        return;
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({
          success: false,
          message: 'Formato de email inválido'
        });
        return;
      }

      const result = await this.loginUseCase.execute(email, password, 'store');

      if (result.success && result.usuario) {
        // Generar token JWT
        const tokenResponse = this.tokenService.generateToken(result.usuario);

        // No devolver la contraseña hasheada en la respuesta
        const { password_hash: _, ...usuarioSinPassword } = result.usuario;

        res.status(200).json({
          success: true,
          message: 'Login exitoso',
          data: {
            user: usuarioSinPassword,
            token: tokenResponse.token,
            expiresIn: tokenResponse.expiresIn
          }
        });
      } else {
        res.status(401).json({
          success: false,
          message: result.message || 'Credenciales inválidas'
        });
      }
    } catch (error) {
      console.error('Error en loginStore:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async getMe(req: Request, res: Response): Promise<void> {
    try {
      // El usuario ya está en req.user gracias al middleware de autenticación
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: req.user
      });
    } catch (error) {
      console.error('Error en getMe:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}