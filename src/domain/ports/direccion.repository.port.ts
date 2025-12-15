import { Direccion } from '../entities/direccion.entity';

export interface DireccionRepositoryPort {
  save(direccion: Direccion): Promise<Direccion>;
  findById(id: number): Promise<Direccion | null>;
  findByUsuarioId(usuarioId: number): Promise<Direccion[]>;
  update(id: number, direccion: Direccion): Promise<Direccion | null>;
  delete(id: number): Promise<boolean>;
  setPredeterminada(usuarioId: number, direccionId: number): Promise<void>;
  findByUsuarioIdAndPredeterminada(usuarioId: number): Promise<Direccion | null>;
}