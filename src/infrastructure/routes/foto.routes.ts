import { Router } from 'express';
import multer from 'multer';
import { FotoController } from '../controllers/foto.controller';
import { SubirFotoUseCase } from '../../application/use-cases/subir-foto.use-case';
import { S3Service } from '../services/s3.service';
import { PrismaUsuarioRepository } from '../repositories/prisma-usuario.repository';
import { PrismaFotoRepository } from '../repositories/prisma-foto.repository';
import { PrismaItemsPedidoRepository } from '../repositories/prisma-items-pedido.repository';
import { PrismaPedidoRepository } from '../repositories/prisma-pedido.repository';
import { PrismaPaqueteRepository } from '../repositories/prisma-paquete.repository';
import { authenticateToken, requireRole, requireCliente, requireAdmin } from '../middlewares/auth.middleware';

// Configurar multer para memoria
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  },
});

// Middleware para manejar errores de Multer
const handleMulterError = (err: any, req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'El archivo es demasiado grande. Máximo permitido: 10MB.'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: `Campo de archivo inesperado: ${err.field}. Se esperaba 'foto'.`
      });
    }
    if (err.code === 'MISSING_FIELD_NAME') {
      return res.status(400).json({
        success: false,
        error: 'Nombre de campo de archivo faltante. Asegúrate de enviar el archivo con el nombre "foto".'
      });
    }
    return res.status(400).json({
      success: false,
      error: `Error en la carga del archivo: ${err.code}`
    });
  } else if (err) {
    if (err.message.includes('Solo se permiten archivos de imagen')) {
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }
    return res.status(500).json({
      success: false,
      error: err.message || 'Error en la carga del archivo'
    });
  }
  next();
};

const fotoRoutes = (router: Router): void => {
  // Dependencias
  const s3Service = new S3Service();
  const usuarioRepository = new PrismaUsuarioRepository();
  const fotoRepository = new PrismaFotoRepository();
  const itemsPedidoRepository = new PrismaItemsPedidoRepository();
  const pedidoRepository = new PrismaPedidoRepository();
  const paqueteRepository = new PrismaPaqueteRepository();
  const subirFotoUseCase = new SubirFotoUseCase(s3Service, usuarioRepository, pedidoRepository, itemsPedidoRepository, paqueteRepository, fotoRepository);
  const fotoController = new FotoController(subirFotoUseCase);

  // Endpoint temporal para depuración - con middleware de Multer
  router.post('/fotos/debug', upload.any(), handleMulterError, (req, res) => {
    console.log('=== DEBUG INFO (con Multer) ===');
    console.log('Headers:', req.headers);
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Query params:', req.query);
    console.log('Body keys:', Object.keys(req.body));
    console.log('Files:', req.files ? req.files.length : 0);
    if (req.files) {
      req.files.forEach((file, index) => {
        console.log(`File ${index}:`, {
          fieldname: file.fieldname,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size
        });
      });
    }
    console.log('==================');

    res.json({
      headers: req.headers,
      contentType: req.headers['content-type'],
      queryParams: req.query,
      bodyKeys: Object.keys(req.body),
      filesCount: req.files ? req.files.length : 0,
      filesDetails: req.files ? req.files.map(file => ({
        fieldname: file.fieldname,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      })) : [],
      message: 'Información de depuración registrada en la consola del servidor'
    });
  });

  // Endpoint para verificar la solicitud antes de Multer
  router.post('/fotos/debug-raw', async (req, res) => {
    console.log('=== RAW DEBUG INFO ===');
    console.log('Headers:', req.headers);
    console.log('Content-Type:', req.headers['content-type']);

    // Leer el cuerpo sin procesar
    let rawBody = '';
    req.on('data', chunk => {
      rawBody += chunk.toString();
    });

    req.on('end', () => {
      console.log('Raw body length:', rawBody.length);
      console.log('Raw body preview (first 500 chars):', rawBody.substring(0, 500));
      console.log('==================');

      res.json({
        rawBodyLength: rawBody.length,
        message: 'Raw request info logged to server console'
      });
    });
  });

  /**
   * @swagger
   * /api/fotos/upload:
   *   post:
   *     summary: Subir una foto a S3 y guardar en BD
   *     tags: [Fotos]
   *     consumes:
   *       - multipart/form-data
   *     parameters:
   *       - in: formData
   *         name: foto
   *         type: file
   *         required: true
   *         description: Archivo de imagen a subir
   *       - in: formData
   *         name: usuarioId
   *         type: integer
   *         required: true
   *         description: ID del usuario
   *       - in: formData
   *         name: pedidoId
   *         type: integer
   *         required: true
   *         description: ID del pedido
   *       - in: formData
   *         name: itemPedidoId
   *         type: integer
   *         required: true
   *         description: ID del item del pedido
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Foto subida y guardada exitosamente
   *       400:
   *         description: Error en los datos enviados
   *       401:
   *         description: Acceso no autorizado
   *       500:
   *         description: Error interno del servidor
   */
  router.post('/fotos/upload', authenticateToken, upload.single('foto'), handleMulterError, (req, res) =>
    fotoController.subirFoto(req, res)
  );
};

export default fotoRoutes;
