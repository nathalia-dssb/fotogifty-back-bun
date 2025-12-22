import prisma from '../database/prisma.client';
import { Usuario } from '../../domain/entities/usuario.entity';
import { UsuarioRepositoryPort } from '@domain/ports/usuario.repository.port';
import { TipoUsuario } from '../../domain/entities/tipo-usuario.entity';

export class PrismaUsuarioRepository implements UsuarioRepositoryPort {
  async findByEmail(email: string): Promise<Usuario | null> {
    const usuario = await prisma.usuarios.findUnique({
      where: { email },
      include: {
        administrador: true,
        stores: true
      }
    });

    return usuario ? this.toDomain(usuario) : null;
  }

  async findById(id: number): Promise<Usuario | null> {

    const usuario = await prisma.usuarios.findUnique({
      where: { id },
      include: {
        administrador: true,
        stores: true
      }
    });

    return usuario ? this.toDomain(usuario) : null;
  }

  async findAll(): Promise<Usuario[]> {
    const usuarios = await prisma.usuarios.findMany({
      include: {
        administrador: true,
        stores: true
      }
    });

    return usuarios.map(usuario => this.toDomain(usuario));
  }

  async save(usuario: Usuario): Promise<Usuario> {
    if (usuario.id) {
      // Actualizar
      const updated = await prisma.usuarios.update({
        where: { id: usuario.id },
        data: this.toPrisma(usuario)
      });
      return this.toDomain(updated);
    } else {
      // Crear
      const created = await prisma.usuarios.create({
        data: this.toPrisma(usuario)
      });
      // Si es un administrador, crear también el registro en la tabla administradores
      if (usuario.tipo && (usuario.tipo === TipoUsuario.ADMIN || usuario.tipo === TipoUsuario.SUPER_ADMIN)) {
        await prisma.administradores.create({
          data: {
            usuario_id: created.id,
            nivel_acceso: usuario.tipo === TipoUsuario.SUPER_ADMIN ? 2 : 1,
            activo: true
          }
        });
      }
      // Si es un vendedor de ventanilla, crear también el registro en la tabla stores
      else if (usuario.tipo && usuario.tipo === TipoUsuario.STORE) {
        await prisma.stores.create({
          data: {
            usuario_id: created.id,
            codigo_empleado: (usuario as any).codigo_empleado || `V${created.id}`,
            activo: true
          }
        });
      }
      return this.toDomain(created);
    }
  }

  async updatePassword(id: number, hashedPassword: string): Promise<Usuario | null> {
    try {
      const updated = await prisma.usuarios.update({
        where: { id },
        data: { password_hash: hashedPassword }
      });
      return this.toDomain(updated);
    } catch (error) {
      console.error('Error updating password:', error);
      return null;
    }
  }

  async updateLastLogin(id: number): Promise<void> {
    try {
      await prisma.usuarios.update({
        where: { id },
        data: { fecha_ultima_conexion: new Date() }
      });
    } catch (error) {
      console.error('Error updating last login:', error);
      // No lanzamos error ya que no es crítico para el inicio de sesión
    }
  }

  async updateRecoveryToken(id: number, token: string, expiration: Date): Promise<void> {
    try {
      await prisma.usuarios.update({
        where: { id },
        data: {
          token_recuperacion: token,
          fecha_expiracion_token: expiration
        }
      });
    } catch (error) {
      console.error('Error updating recovery token:', error);
      throw error;
    }
  }

  private toDomain(prismaUsuario: any): Usuario {
    // Determinar el tipo de usuario basado en las relaciones con las tablas administradores y stores
    let tipoUsuario: TipoUsuario | undefined;
    if (prismaUsuario.administrador) {
      tipoUsuario = prismaUsuario.administrador.nivel_acceso === 2
        ? TipoUsuario.SUPER_ADMIN
        : TipoUsuario.ADMIN;
    } else if (prismaUsuario.stores) {
      tipoUsuario = TipoUsuario.STORE;
    } else {
      tipoUsuario = TipoUsuario.CLIENTE;
    }

    return {
      id: prismaUsuario.id,
      email: prismaUsuario.email,
      password_hash: prismaUsuario.password_hash,
      nombre: prismaUsuario.nombre,
      apellido: prismaUsuario.apellido,
      telefono: prismaUsuario.telefono,
      fecha_registro: prismaUsuario.fecha_registro,
      activo: prismaUsuario.activo,
      tipo: tipoUsuario,
      fecha_ultima_conexion: prismaUsuario.fecha_ultima_conexion,
      token_recuperacion: prismaUsuario.token_recuperacion,
      fecha_expiracion_token: prismaUsuario.fecha_expiracion_token
    };
  }

  private toPrisma(usuario: Usuario): any {
    return {
      email: usuario.email,
      password_hash: usuario.password_hash,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      telefono: usuario.telefono,
      activo: usuario.activo,
      fecha_ultima_conexion: usuario.fecha_ultima_conexion,
      token_recuperacion: usuario.token_recuperacion,
      fecha_expiracion_token: usuario.fecha_expiracion_token
    };
  }
}