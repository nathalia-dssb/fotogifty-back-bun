import prisma from '../database/prisma.client';
import { Direccion } from '../../domain/entities/direccion.entity';
import { DireccionRepositoryPort } from '../../domain/ports/direccion.repository.port';

export class PrismaDireccionRepository implements DireccionRepositoryPort {
  async save(direccion: Direccion): Promise<Direccion> {
    if (direccion.id) {
      // Actualizar
      const updated = await prisma.direcciones.update({
        where: { id: direccion.id },
        data: this.toPrisma(direccion)
      });
      return this.toDomain(updated);
    } else {
      // Crear
      const created = await prisma.direcciones.create({
        data: this.toPrisma(direccion)
      });
      return this.toDomain(created);
    }
  }

  async findById(id: number): Promise<Direccion | null> {
    const direccion = await prisma.direcciones.findUnique({
      where: { id }
    });

    return direccion ? this.toDomain(direccion) : null;
  }

  async findByUsuarioId(usuarioId: number): Promise<Direccion[]> {
    const direcciones = await prisma.direcciones.findMany({
      where: { usuario_id: usuarioId }
    });

    return direcciones.map(direccion => this.toDomain(direccion));
  }

  async update(id: number, direccion: Direccion): Promise<Direccion | null> {
    try {
      const updated = await prisma.direcciones.update({
        where: { id },
        data: this.toPrisma(direccion)
      });
      return this.toDomain(updated);
    } catch (error) {
      console.error('Error updating address:', error);
      return null;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await prisma.direcciones.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      console.error('Error deleting address:', error);
      return false;
    }
  }

  async setPredeterminada(usuarioId: number, direccionId: number): Promise<void> {
    // Primero, desmarcar todas las direcciones predeterminadas del usuario
    await prisma.direcciones.updateMany({
      where: { 
        usuario_id: usuarioId,
        predeterminada: true
      },
      data: { predeterminada: false }
    });

    // Luego, marcar la dirección seleccionada como predeterminada
    await prisma.direcciones.update({
      where: { id: direccionId },
      data: { predeterminada: true }
    });
  }

  async findByUsuarioIdAndPredeterminada(usuarioId: number): Promise<Direccion | null> {
    const direccion = await prisma.direcciones.findFirst({
      where: {
        usuario_id: usuarioId,
        predeterminada: true
      }
    });

    return direccion ? this.toDomain(direccion) : null;
  }

  private toDomain(prismaDireccion: any): Direccion {
    return {
      id: prismaDireccion.id,
      usuario_id: prismaDireccion.usuario_id,
      alias: prismaDireccion.alias,
      pais: prismaDireccion.pais,
      estado: prismaDireccion.estado,
      ciudad: prismaDireccion.ciudad,
      codigo_postal: prismaDireccion.codigo_postal,
      direccion: prismaDireccion.direccion,
      numero_casa: prismaDireccion.numero_casa,
      numero_departamento: prismaDireccion.numero_departamento,
      especificaciones: prismaDireccion.especificaciones,
      predeterminada: prismaDireccion.predeterminada,
      fecha_registro: prismaDireccion.fecha_registro
    };
  }

  private toPrisma(direccion: Direccion): any {
    return {
      usuario_id: direccion.usuario_id,
      alias: direccion.alias,
      pais: direccion.pais,
      estado: direccion.estado,
      ciudad: direccion.ciudad,
      codigo_postal: direccion.codigo_postal,
      direccion: direccion.direccion,
      numero_casa: direccion.numero_casa,
      numero_departamento: direccion.numero_departamento,
      especificaciones: direccion.especificaciones,
      predeterminada: direccion.predeterminada
    };
  }
}