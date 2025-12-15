import express from 'express';
import cors from 'cors';
// import helmet from 'helmet'; // Descomentar cuando se instale helmet
// import rateLimit from 'express-rate-limit'; // Descomentar cuando se instale express-rate-limit
import { setupSwagger } from '../config/swagger.setup';
import configureRoutes from '../routes';

export class App {
  private app: express.Application;
  private port: number;

  constructor(port: number) {
    this.app = express();
    this.port = port;
    this.initializeMiddlewares();
    this.initializeSwagger();
    this.initializeRoutes();
  }

  private initializeMiddlewares(): void {
    this.app.use(cors());
    this.app.use(express.json());
  }

  private initializeSwagger(): void {
    setupSwagger(this.app, this.port);
  }

  private initializeRoutes(): void {
    const router = configureRoutes();
    this.app.use(router);
  }

  public start(): void {
    this.app.listen(this.port, () => {
      console.log(`🚀 Server running on http://localhost:${this.port}`);
      console.log(`📚 API Documentation: http://localhost:${this.port}/api-docs`);
      console.log(`🏥 Health Check: http://localhost:${this.port}/health`);
      console.log(`📝 API endpoints:`);
      console.log(`   GET  / - Hello World`);
      console.log(`   GET  /health - Health check`);
      console.log(`   POST /api/messages - Send a message`);
      console.log(`   GET  /api/messages - Get all messages`);
      console.log(`   POST /api/usuarios - Create user`);
      console.log(`   POST /api/fotos/upload - Upload photo to S3`);
    });
  }

  public getApp(): express.Application {
    return this.app;
  }
}