import jwt from 'jsonwebtoken';
import { Usuario } from '../../domain/entities/usuario.entity';
import { TipoUsuario } from '../../domain/entities/tipo-usuario.entity';
import { TokenPayload } from '../middlewares/auth.middleware';

export interface TokenResponse {
  token: string;
  expiresIn: number;
}

export class TokenService {
  private secret: string;
  private expiresIn: string;

  constructor() {
    this.secret = process.env.JWT_SECRET || 'default_secret_key_for_dev';
    this.expiresIn = process.env.JWT_EXPIRES_IN || '24h'; // Valor por defecto de 24 horas
  }

  generateToken(usuario: Usuario): TokenResponse {
    const payload: TokenPayload = {
      id: usuario.id!,
      email: usuario.email,
      tipo: usuario.tipo || TipoUsuario.CLIENTE,
      iat: Math.floor(Date.now() / 1000), // Tiempo de emisión
    };

    const token = jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
    
    // Convertir expiresIn a segundos
    let expiresInSeconds: number;
    if (this.expiresIn.endsWith('h')) {
      expiresInSeconds = parseInt(this.expiresIn) * 60 * 60;
    } else if (this.expiresIn.endsWith('d')) {
      expiresInSeconds = parseInt(this.expiresIn) * 24 * 60 * 60;
    } else if (this.expiresIn.endsWith('m')) {
      expiresInSeconds = parseInt(this.expiresIn) * 60;
    } else {
      expiresInSeconds = parseInt(this.expiresIn); // asumir segundos
    }

    return {
      token,
      expiresIn: expiresInSeconds
    };
  }

  verifyToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, this.secret) as TokenPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }
}