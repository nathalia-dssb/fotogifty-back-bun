import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UsuarioConTipo } from '../../domain/entities/tipo-usuario.entity';

declare global {
  namespace Express {
    interface Request {
      user?: UsuarioConTipo;
    }
  }
}

export interface TokenPayload {
  id: number;
  email: string;
  tipo: string;
  iat: number;
  exp: number;
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('=== authenticateToken middleware ===');
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      console.log('No token provided');
      return res.status(401).json({
        success: false,
        message: 'Acceso denegado. No se proporcionó token de autenticación'
      });
    }

    const secret = process.env.JWT_SECRET || 'default_secret_key_for_dev';

    const decoded = jwt.verify(token, secret) as TokenPayload;
    console.log('Token decoded successfully:', { id: decoded.id, email: decoded.email, tipo: decoded.tipo });

    // Añadir la información del usuario al objeto de solicitud
    req.user = {
      id: decoded.id,
      email: decoded.email,
      tipo: decoded.tipo as any
    };

    next();
  } catch (error: any) {
    console.log('Auth error:', error.name, error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({
        success: false,
        message: 'Token inválido'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error en la verificación del token'
    });
  }
};

// Middleware para verificar el tipo de usuario
export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Acceso denegado. Autenticación requerida'
      });
    }

    if (!roles.includes(req.user.tipo)) {
      return res.status(403).json({
        success: false,
        message: `Acceso denegado. Se requiere uno de los siguientes roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};

// Middleware para verificar que el usuario sea un cliente
export const requireCliente = (req: Request, res: Response, next: NextFunction) => {
  requireRole('cliente')(req, res, next);
};

// Middleware para verificar que el usuario sea un administrador
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  requireRole('admin', 'super_admin')(req, res, next);
};

// Middleware para verificar que el usuario sea un super administrador
export const requireSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  requireRole('super_admin')(req, res, next);
};

// Middleware para verificar que el usuario sea un vendedor de ventanilla
export const requireVendedor = (req: Request, res: Response, next: NextFunction) => {
  requireRole('store')(req, res, next);
};