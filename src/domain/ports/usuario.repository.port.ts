import { Usuario } from '../entities/usuario.entity';

export interface UsuarioRepositoryPort {
  findByEmail(email: string): Promise<Usuario | null>;
  findById(id: number): Promise<Usuario | null>;
  findAll(): Promise<Usuario[]>;
  save(usuario: Usuario): Promise<Usuario>;
  updatePassword(id: number, hashedPassword: string): Promise<Usuario | null>;
  updateLastLogin(id: number): Promise<void>;
  updateRecoveryToken(id: number, token: string, expiration: Date): Promise<void>;
}