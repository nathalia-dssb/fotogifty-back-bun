import { Router } from 'express';
import { DireccionController } from '../controllers/direccion.controller';
import { 
  CrearDireccionUseCase, 
  ObtenerDireccionesUsuarioUseCaseList, 
  ActualizarDireccionUseCase, 
  EliminarDireccionUseCase,
  EstablecerDireccionPredeterminadaUseCase
} from '../../application/use-cases/direccion.use-case';
import { PrismaDireccionRepository } from '../repositories/prisma-direccion.repository';
import { PrismaUsuarioRepository } from '../repositories/prisma-usuario.repository';
import { authenticateToken } from '../middlewares/auth.middleware';

const direccionRoutes = (router: Router): void => {
  // Dependencias
  const direccionRepository = new PrismaDireccionRepository();
  const usuarioRepository = new PrismaUsuarioRepository();
  
  // Casos de uso
  const crearDireccionUseCase = new CrearDireccionUseCase(direccionRepository, usuarioRepository);
  const obtenerDireccionesUsuarioUseCase = new ObtenerDireccionesUsuarioUseCaseList(direccionRepository);
  const actualizarDireccionUseCase = new ActualizarDireccionUseCase(direccionRepository, usuarioRepository);
  const eliminarDireccionUseCase = new EliminarDireccionUseCase(direccionRepository);
  const establecerDireccionPredeterminadaUseCase = new EstablecerDireccionPredeterminadaUseCase(direccionRepository);
  
  // Controlador
  const direccionController = new DireccionController(
    crearDireccionUseCase,
    obtenerDireccionesUsuarioUseCase,
    actualizarDireccionUseCase,
    eliminarDireccionUseCase,
    establecerDireccionPredeterminadaUseCase
  );

  /**
   * @swagger
   * tags:
   *   name: Direcciones
   *   description: Gestión de direcciones de usuarios
   */

  /**
   * @swagger
   * /api/direcciones:
   *   post:
   *     summary: Crear una nueva dirección para el usuario autenticado
   *     tags: [Direcciones]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - alias
   *               - pais
   *               - estado
   *               - ciudad
   *               - codigo_postal
   *               - direccion
   *             properties:
   *               alias:
   *                 type: string
   *                 description: "Nombre de la dirección (ej: Casa, Trabajo)"
   *                 example: "Casa"
   *               pais:
   *                 type: string
   *                 description: "País"
   *                 example: "España"
   *               estado:
   *                 type: string
   *                 description: "Estado o región"
   *                 example: "Madrid"
   *               ciudad:
   *                 type: string
   *                 description: "Ciudad o municipio"
   *                 example: "Madrid"
   *               codigo_postal:
   *                 type: string
   *                 description: "Código postal"
   *                 example: "28001"
   *               direccion:
   *                 type: string
   *                 description: "Calle o vía"
   *                 example: "Calle Principal 123"
   *               numero_casa:
   *                 type: string
   *                 description: "Número de casa (opcional)"
   *                 example: "123"
   *               numero_departamento:
   *                 type: string
   *                 description: "Número de departamento (opcional)"
   *                 example: "5B"
   *               especificaciones:
   *                 type: string
   *                 description: "Información adicional (opcional)"
   *                 example: "Edificio A, Puerta Azul"
   *               predeterminada:
   *                 type: boolean
   *                 description: "Si es la dirección predeterminada"
   *                 example: true
   *     responses:
   *       201:
   *         description: Dirección creada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/Direccion'
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
  router.post('/direcciones', authenticateToken, (req, res) =>
    direccionController.crearDireccion(req, res)
  );

  /**
   * @swagger
   * /api/direcciones/usuario/{usuarioId}:
   *   get:
   *     summary: Obtener todas las direcciones de un usuario
   *     tags: [Direcciones]
   *     parameters:
   *       - in: path
   *         name: usuarioId
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del usuario
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Lista de direcciones del usuario
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
   *                     $ref: '#/components/schemas/Direccion'
   *       400:
   *         description: ID de usuario inválido
   *       401:
   *         description: Acceso no autorizado
   *       403:
   *         description: Acceso denegado
   *       500:
   *         description: Error interno del servidor
   */
  router.get('/direcciones/usuario/:usuarioId', authenticateToken, (req, res) =>
    direccionController.getDireccionesByUsuarioId(req, res)
  );

  /**
   * @swagger
   * /api/direcciones/{id}:
   *   put:
   *     summary: Actualizar una dirección existente
   *     tags: [Direcciones]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID de la dirección
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - alias
   *               - pais
   *               - estado
   *               - ciudad
   *               - codigo_postal
   *               - direccion
   *             properties:
   *               alias:
   *                 type: string
   *                 description: "Nombre de la dirección (ej: Casa, Trabajo)"
   *                 example: "Casa"
   *               pais:
   *                 type: string
   *                 description: "País"
   *                 example: "España"
   *               estado:
   *                 type: string
   *                 description: "Estado o región"
   *                 example: "Madrid"
   *               ciudad:
   *                 type: string
   *                 description: "Ciudad o municipio"
   *                 example: "Madrid"
   *               codigo_postal:
   *                 type: string
   *                 description: "Código postal"
   *                 example: "28001"
   *               direccion:
   *                 type: string
   *                 description: "Calle o vía"
   *                 example: "Calle Principal 123"
   *               numero_casa:
   *                 type: string
   *                 description: "Número de casa (opcional)"
   *                 example: "123"
   *               numero_departamento:
   *                 type: string
   *                 description: "Número de departamento (opcional)"
   *                 example: "5B"
   *               especificaciones:
   *                 type: string
   *                 description: "Información adicional (opcional)"
   *                 example: "Edificio A, Puerta Azul"
   *               predeterminada:
   *                 type: boolean
   *                 description: "Si es la dirección predeterminada"
   *                 example: true
   *     responses:
   *       200:
   *         description: Dirección actualizada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/Direccion'
   *                 message:
   *                   type: string
   *       400:
   *         description: Datos de entrada inválidos
   *       401:
   *         description: Acceso no autorizado
   *       403:
   *         description: Acceso denegado
   *       404:
   *         description: Dirección no encontrada
   *       500:
   *         description: Error interno del servidor
   */
  router.put('/direcciones/:id', authenticateToken, (req, res) =>
    direccionController.updateDireccion(req, res)
  );

  /**
   * @swagger
   * /api/direcciones/{id}:
   *   delete:
   *     summary: Eliminar una dirección
   *     tags: [Direcciones]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID de la dirección
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Dirección eliminada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 message:
   *                   type: string
   *       401:
   *         description: Acceso no autorizado
   *       403:
   *         description: Acceso denegado
   *       404:
   *         description: Dirección no encontrada
   *       500:
   *         description: Error interno del servidor
   */
  router.delete('/direcciones/:id', authenticateToken, (req, res) =>
    direccionController.deleteDireccion(req, res)
  );

  /**
   * @swagger
   * /api/direcciones/{id}/predeterminada:
   *   patch:
   *     summary: Establecer una dirección como predeterminada
   *     tags: [Direcciones]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID de la dirección
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Dirección establecida como predeterminada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 message:
   *                   type: string
   *       401:
   *         description: Acceso no autorizado
   *       403:
   *         description: Acceso denegado
   *       404:
   *         description: Dirección no encontrada
   *       500:
   *         description: Error interno del servidor
   */
  router.patch('/direcciones/:id/predeterminada', authenticateToken, (req, res) =>
    direccionController.setDireccionPredeterminada(req, res)
  );
};

export default direccionRoutes;