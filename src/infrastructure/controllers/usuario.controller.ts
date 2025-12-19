import { Request, Response } from 'express';
import { CrearUsuarioUseCase } from '../../application/use-cases/crear-usuario.use-case';
import { UsuarioRepositoryPort } from '../../domain/ports/usuario.repository.port';
import { UsuarioEntity } from '../../domain/entities/usuario.entity';
import { TipoUsuario } from '../../domain/entities/tipo-usuario.entity';
import { PasswordService } from '../services/password.service';

export class UsuarioController {
  constructor(
    private readonly crearUsuarioUseCase: CrearUsuarioUseCase,
    private readonly usuarioRepository: UsuarioRepositoryPort
  ) {}

  async crearUsuario(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, nombre, apellido, telefono } = req.body;

      // Validaciones básicas
      if (!email || !password || !nombre || !apellido) {
        res.status(400).json({
          success: false,
          message: 'Email, password, nombre y apellido son requeridos'
        });
        return;
      }

      if (password.length < 6) {
        res.status(400).json({
          success: false,
          message: 'La contraseña debe tener al menos 6 caracteres'
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

      // Hashear la contraseña
      const password_hash = await PasswordService.hashPassword(password);

      // Crear usuario con tipo cliente por defecto
      const nuevoUsuario = UsuarioEntity.create(
        email,
        password_hash,
        nombre,
        apellido,
        TipoUsuario.CLIENTE,
        telefono
      );

      const result = await this.crearUsuarioUseCase.execute(nuevoUsuario);

      if (result.success) {
        // No devolver la contraseña hasheada en la respuesta
        const { password_hash: _, ...usuarioSinPassword } = result.data!;
        res.status(201).json({
          success: true,
          data: usuarioSinPassword
        });
      } else {
        res.status(result.error?.includes('UNIQUE') ? 409 : 500).json({
          success: false,
          message: result.message || 'Error al crear el usuario'
        });
      }
    } catch (error: any) {
      console.error('Error creating user:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async crearAdmin(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, nombre, apellido, telefono, nivel_acceso } = req.body;

      // Validaciones básicas
      if (!email || !password || !nombre || !apellido) {
        res.status(400).json({
          success: false,
          message: 'Email, password, nombre y apellido son requeridos'
        });
        return;
      }

      if (password.length < 6) {
        res.status(400).json({
          success: false,
          message: 'La contraseña debe tener al menos 6 caracteres'
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

      // Hashear la contraseña
      const password_hash = await PasswordService.hashPassword(password);

      // Determinar el tipo de admin (1 = ADMIN, 2 = SUPER_ADMIN)
      const tipoAdmin = nivel_acceso === 2 ? TipoUsuario.SUPER_ADMIN : TipoUsuario.ADMIN;

      // Crear usuario admin
      const nuevoUsuario = UsuarioEntity.create(
        email,
        password_hash,
        nombre,
        apellido,
        tipoAdmin,
        telefono
      );

      const result = await this.crearUsuarioUseCase.execute(nuevoUsuario);

      if (result.success) {
        // No devolver la contraseña hasheada en la respuesta
        const { password_hash: _, ...usuarioSinPassword } = result.data!;
        res.status(201).json({
          success: true,
          data: usuarioSinPassword,
          message: 'Administrador creado exitosamente'
        });
      } else {
        res.status(result.error?.includes('UNIQUE') ? 409 : 500).json({
          success: false,
          message: result.message || 'Error al crear el administrador'
        });
      }
    } catch (error: any) {
      console.error('Error creating admin:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async crearStore(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, nombre, apellido, telefono, codigo_empleado } = req.body;

      // Validaciones básicas
      if (!email || !password || !nombre || !apellido || !codigo_empleado) {
        res.status(400).json({
          success: false,
          message: 'Email, password, nombre, apellido y codigo_empleado son requeridos'
        });
        return;
      }

      if (password.length < 6) {
        res.status(400).json({
          success: false,
          message: 'La contraseña debe tener al menos 6 caracteres'
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

      // Hashear la contraseña
      const password_hash = await PasswordService.hashPassword(password);

      // Crear usuario store
      const nuevoUsuario = UsuarioEntity.create(
        email,
        password_hash,
        nombre,
        apellido,
        TipoUsuario.STORE,
        telefono
      );

      const result = await this.crearUsuarioUseCase.execute(nuevoUsuario);

      if (result.success) {
        // No devolver la contraseña hasheada en la respuesta
        const { password_hash: _, ...usuarioSinPassword } = result.data!;
        res.status(201).json({
          success: true,
          data: usuarioSinPassword,
          message: 'Vendedor de ventanilla creado exitosamente'
        });
      } else {
        res.status(result.error?.includes('UNIQUE') ? 409 : 500).json({
          success: false,
          message: result.message || 'Error al crear el vendedor de ventanilla'
        });
      }
    } catch (error: any) {
      console.error('Error creating store:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async getUsuarioById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const usuarioId = parseInt(id);
      const tokenUserId = req.user?.id; // ID del usuario autenticado desde el token

      if (isNaN(usuarioId)) {
        res.status(400).json({
          success: false,
          message: 'ID de usuario inválido'
        });
        return;
      }

      // Verificar que el usuario autenticado solo pueda acceder a su propio perfil
      // a menos que sea administrador
      const esAdmin = req.user?.tipo === 'admin' || req.user?.tipo === 'super_admin';
      if (tokenUserId !== usuarioId && !esAdmin) {
        res.status(403).json({
          success: false,
          message: 'Acceso denegado. Solo puedes acceder a tu propio perfil.'
        });
        return;
      }

      const usuario = await this.usuarioRepository.findById(usuarioId);

      if (!usuario) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }

      // No devolver la contraseña hasheada en la respuesta
      const { password_hash: _, ...usuarioSinPassword } = usuario;

      res.status(200).json({
        success: true,
        data: usuarioSinPassword
      });
    } catch (error: any) {
      console.error('Error obteniendo usuario por ID:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async updateUsuario(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const usuarioId = parseInt(id);
      const tokenUserId = req.user?.id; // ID del usuario autenticado desde el token
      const { nombre, apellido, telefono, activo } = req.body;

      if (isNaN(usuarioId)) {
        res.status(400).json({
          success: false,
          message: 'ID de usuario inválido'
        });
        return;
      }

      // Verificar que el usuario autenticado solo pueda actualizar su propio perfil
      // a menos que sea administrador
      const esAdmin = req.user?.tipo === 'admin' || req.user?.tipo === 'super_admin';
      if (tokenUserId !== usuarioId && !esAdmin) {
        res.status(403).json({
          success: false,
          message: 'Acceso denegado. Solo puedes actualizar tu propio perfil.'
        });
        return;
      }

      // Verificar que el usuario existe
      const usuarioExistente = await this.usuarioRepository.findById(usuarioId);
      if (!usuarioExistente) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }

      // Validaciones
      if (nombre && typeof nombre !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Nombre debe ser una cadena de texto'
        });
        return;
      }

      if (apellido && typeof apellido !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Apellido debe ser una cadena de texto'
        });
        return;
      }

      if (telefono && typeof telefono !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Teléfono debe ser una cadena de texto'
        });
        return;
      }

      if (activo !== undefined && typeof activo !== 'boolean') {
        res.status(400).json({
          success: false,
          message: 'Activo debe ser un valor booleano'
        });
        return;
      }

      // No permitir actualizar ciertos campos como tipo o id
      if (req.body.tipo !== undefined) {
        res.status(400).json({
          success: false,
          message: 'No puedes cambiar el tipo de usuario'
        });
        return;
      }

      if (req.body.id !== undefined) {
        res.status(400).json({
          success: false,
          message: 'No puedes cambiar el ID del usuario'
        });
        return;
      }

      // Actualizar solo los campos proporcionados
      const usuarioActualizado: any = {
        ...usuarioExistente
      };

      if (nombre) usuarioActualizado.nombre = nombre;
      if (apellido) usuarioActualizado.apellido = apellido;
      if (telefono) usuarioActualizado.telefono = telefono;
      if (activo !== undefined) usuarioActualizado.activo = activo;

      // Guardar el usuario actualizado
      const result = await this.usuarioRepository.save(usuarioActualizado);

      // No devolver la contraseña hasheada en la respuesta
      const { password_hash: _, ...usuarioSinPassword } = result;

      res.status(200).json({
        success: true,
        data: usuarioSinPassword,
        message: 'Usuario actualizado exitosamente'
      });
    } catch (error: any) {
      console.error('Error actualizando usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const usuarioId = parseInt(id);
      const tokenUserId = req.user?.id; // ID del usuario autenticado desde el token
      const { currentPassword, newPassword } = req.body;

      if (isNaN(usuarioId)) {
        res.status(400).json({
          success: false,
          message: 'ID de usuario inválido'
        });
        return;
      }

      // Verificar que el usuario autenticado solo pueda cambiar su propia contraseña
      // a menos que sea administrador
      const esAdmin = req.user?.tipo === 'admin' || req.user?.tipo === 'super_admin';
      if (tokenUserId !== usuarioId && !esAdmin) {
        res.status(403).json({
          success: false,
          message: 'Acceso denegado. Solo puedes cambiar tu propia contraseña.'
        });
        return;
      }

      if (!currentPassword || !newPassword) {
        res.status(400).json({
          success: false,
          message: 'Contraseña actual y nueva contraseña son requeridas'
        });
        return;
      }

      if (newPassword.length < 6) {
        res.status(400).json({
          success: false,
          message: 'La nueva contraseña debe tener al menos 6 caracteres'
        });
        return;
      }

      // Verificar que el usuario existe
      const usuario = await this.usuarioRepository.findById(usuarioId);
      if (!usuario) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }

      // Verificar la contraseña actual
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, usuario.password_hash);
      if (!isCurrentPasswordValid) {
        res.status(401).json({
          success: false,
          message: 'Contraseña actual incorrecta'
        });
        return;
      }

      // Hashear la nueva contraseña
      const saltRounds = 10;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      // Actualizar la contraseña
      const usuarioConNuevaContrasena = {
        ...usuario,
        password_hash: newPasswordHash
      };

      const result = await this.usuarioRepository.save(usuarioConNuevaContrasena);

      // No devolver la contraseña hasheada en la respuesta
      const { password_hash: _, ...usuarioSinPassword } = result;

      res.status(200).json({
        success: true,
        data: usuarioSinPassword,
        message: 'Contraseña actualizada exitosamente'
      });
    } catch (error: any) {
      console.error('Error cambiando contraseña:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async getAllUsuarios(req: Request, res: Response): Promise<void> {
    try {
      const usuarios = await this.usuarioRepository.findAll();

      // No devolver contraseñas hasheadas en la respuesta
      const usuariosSinPassword = usuarios.map(({ password_hash: _, ...usuario }) => usuario);

      res.status(200).json({
        success: true,
        data: usuariosSinPassword
      });
    } catch (error: any) {
      console.error('Error obteniendo usuarios:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}