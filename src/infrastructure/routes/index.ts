import { Router } from 'express';
import generalRoutes from './general.routes';
import messageRoutes from './message.routes';
import usuarioRoutes from './usuario.routes';
import fotoRoutes from './foto.routes';
import paqueteRoutes from './paquete.routes';
import administradorRoutes from './administrador.routes';
import authRoutes from './auth.routes';
import categoriaRoutes from './categoria.routes';
import storeRoutes from './store.routes';
import pedidoRoutes from './pedido.routes';
import direccionRoutes from './direccion.routes';

const configureRoutes = (): Router => {
  const router = Router();

  // Configurar rutas generales en la raíz
  generalRoutes(router);

  // Configurar rutas bajo /api
  const apiRouter = Router();
  messageRoutes(apiRouter);
  usuarioRoutes(apiRouter);
  fotoRoutes(apiRouter);
  paqueteRoutes(apiRouter);
  administradorRoutes(apiRouter);
  authRoutes(apiRouter);
  categoriaRoutes(apiRouter);
  storeRoutes(apiRouter);
  pedidoRoutes(apiRouter);
  direccionRoutes(apiRouter);
  router.use('/api', apiRouter);

  return router;
};

export default configureRoutes;