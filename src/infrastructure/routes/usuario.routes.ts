import { Router } from 'express';
import { UsuarioController } from '../controllers/usuario.controller';
import { CrearUsuarioUseCase } from '../../application/use-cases/crear-usuario.use-case';
import { PrismaUsuarioRepository } from '../repositories/prisma-usuario.repository';
import { authenticateToken, requireRole, requireCliente, requireAdmin } from '../middlewares/auth.middleware';

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Gestión de usuarios
 */
const usuarioRoutes = (router: Router): void => {
  const usuarioRepository = new PrismaUsuarioRepository();
  const crearUsuarioUseCase = new CrearUsuarioUseCase(usuarioRepository);
  const usuarioController = new UsuarioController(crearUsuarioUseCase, usuarioRepository);

  /**
   * @swagger
   * /api/usuarios:
   *   post:
   *     summary: Crear un nuevo usuario
   *     tags: [Usuarios]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *               - nombre
   *               - apellido
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 description: Email del usuario
   *                 example: "usuario@ejemplo.com"
   *               password:
   *                 type: string
   *                 format: password
   *                 description: Contraseña (mínimo 6 caracteres)
   *                 example: "password123"
   *               nombre:
   *                 type: string
   *                 description: Nombre del usuario
   *                 example: "Juan"
   *               apellido:
   *                 type: string
   *                 description: Apellido del usuario
   *                 example: "Pérez"
   *               telefono:
   *                 type: string
   *                 description: Teléfono opcional
   *                 example: "+34612345678"
   *     responses:
   *       201:
   *         description: Usuario creado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                     email:
   *                       type: string
   *                     nombre:
   *                       type: string
   *                     apellido:
   *                       type: string
   *                     telefono:
   *                       type: string
   *                     fecha_registro:
   *                       type: string
   *                       format: date-time
   *                     activo:
   *                       type: boolean
   *       400:
   *         description: Datos de entrada inválidos
   *       409:
   *         description: El usuario ya existe
   *       500:
   *         description: Error interno del servidor
   */
  router.post('/usuarios', (req, res) =>
    usuarioController.crearUsuario(req, res)
  );

  /**
   * @swagger
   * /api/usuarios/{id}:
   *   get:
   *     summary: Obtener un usuario por ID
   *     tags: [Usuarios]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del usuario
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Usuario encontrado
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/UsuarioResponse'
   *       400:
   *         description: ID de usuario inválido
   *       401:
   *         description: Acceso no autorizado
   *       404:
   *         description: Usuario no encontrado
   *       500:
   *         description: Error interno del servidor
   */
  router.get('/usuarios/:id', authenticateToken, (req, res) =>
    usuarioController.getUsuarioById(req, res)
  );

  /**
   * @swagger
   * /api/usuarios/{id}:
   *   put:
   *     summary: Actualizar información de un usuario
   *     tags: [Usuarios]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del usuario
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               nombre:
   *                 type: string
   *                 description: Nombre del usuario
   *                 example: "Juan"
   *               apellido:
   *                 type: string
   *                 description: Apellido del usuario
   *                 example: "Pérez"
   *               telefono:
   *                 type: string
   *                 description: Teléfono del usuario
   *                 example: "+34612345678"
   *               activo:
   *                 type: boolean
   *                 description: Estado de actividad del usuario
   *                 example: true
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Usuario actualizado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/UsuarioResponse'
   *                 message:
   *                   type: string
   *       400:
   *         description: Datos de entrada inválidos
   *       401:
   *         description: Acceso no autorizado
   *       404:
   *         description: Usuario no encontrado
   *       500:
   *         description: Error interno del servidor
   */
  router.put('/usuarios/:id', authenticateToken, (req, res) =>
    usuarioController.updateUsuario(req, res)
  );

  /**
   * @swagger
   * /api/usuarios/{id}/password:
   *   put:
   *     summary: Cambiar contraseña de un usuario
   *     tags: [Usuarios]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del usuario
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - currentPassword
   *               - newPassword
   *             properties:
   *               currentPassword:
   *                 type: string
   *                 format: password
   *                 description: Contraseña actual
   *                 example: "password123"
   *               newPassword:
   *                 type: string
   *                 format: password
   *                 description: Nueva contraseña
   *                 example: "newpassword123"
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Contraseña actualizada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/UsuarioResponse'
   *                 message:
   *                   type: string
   *       400:
   *         description: Datos de entrada inválidos
   *       401:
   *         description: Contraseña actual incorrecta o acceso no autorizado
   *       404:
   *         description: Usuario no encontrado
   *       500:
   *         description: Error interno del servidor
   */
  router.put('/usuarios/:id/password', authenticateToken, (req, res) =>
    usuarioController.changePassword(req, res)
  );

  /**
   * @swagger
   * /api/usuarios:
   *   get:
   *     summary: Obtener todos los usuarios
   *     tags: [Usuarios]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Lista de todos los usuarios
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: integer
   *                       email:
   *                         type: string
   *                       nombre:
   *                         type: string
   *                       apellido:
   *                         type: string
   *                       telefono:
   *                         type: string
   *                       fecha_registro:
   *                         type: string
   *                         format: date-time
   *                       activo:
   *                         type: boolean
   *       401:
   *         description: Acceso no autorizado
   *       500:
   *         description: Error interno del servidor
   */
  router.get('/usuarios', authenticateToken, requireAdmin, (req, res) =>
    usuarioController.getAllUsuarios(req, res)
  );
};

export default usuarioRoutes;