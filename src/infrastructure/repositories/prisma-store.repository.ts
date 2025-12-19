import { Store } from '@domain/entities/store.entity';
import { StoreRepositoryPort } from '@domain/ports/store.repository.port';
import { TipoUsuario } from '@domain/entities/tipo-usuario.entity';
import prisma from '@infrastructure/database/prisma.client';

export class PrismaStoreRepository implements StoreRepositoryPort {
  async findById(id: number): Promise<Store | null> {
    const storePrisma = await prisma.stores.findUnique({
      where: { id },
      include: {
        usuario: {
          include: {
            direcciones: true
          }
        }
      }
    });

    if (!storePrisma) {
      return null;
    }

    return this.toDomain(storePrisma);
  }

  async findByEmail(email: string): Promise<Store | null> {
    const usuario = await prisma.usuarios.findUnique({
      where: { email },
      include: {
        stores: true,
        direcciones: true
      }
    });

    if (!usuario || !usuario.stores) {
      return null;
    }

    return {
      ...usuario.stores,
      id: usuario.stores.id,
      id_usuario: usuario.id,
      email: usuario.email,
      password_hash: usuario.password_hash,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      telefono: usuario.telefono,
      fecha_registro: usuario.fecha_registro,
      activo: usuario.activo,
      codigo_empleado: usuario.stores.codigo_empleado,
      fecha_contratacion: usuario.stores.fecha_contratacion,
      tipo: TipoUsuario.STORE
    };
  }

  async findByCodigoEmpleado(codigo: string): Promise<Store | null> {
    const storePrisma = await prisma.stores.findUnique({
      where: { codigo_empleado: codigo },
      include: {
        usuario: {
          include: {
            direcciones: true
          }
        }
      }
    });

    if (!storePrisma) {
      return null;
    }

    return this.toDomain(storePrisma);
  }

  async save(store: Store): Promise<Store> {
    // Primero creamos el usuario base
    const usuario = await prisma.usuarios.create({
      data: {
        email: store.email,
        password_hash: store.password_hash,
        nombre: store.nombre,
        apellido: store.apellido,
        telefono: store.telefono
      }
    });

    // Luego creamos el registro del store
    const storeDb = await prisma.stores.create({
      data: {
        usuario_id: usuario.id,
        codigo_empleado: store.codigo_empleado
      },
      include: {
        usuario: {
          include: {
            direcciones: true
          }
        }
      }
    });

    return this.toDomain(storeDb);
  }

  async findAll(): Promise<Store[]> {
    const storesPrisma = await prisma.stores.findMany({
      include: {
        usuario: {
          include: {
            direcciones: true
          }
        }
      }
    });

    return storesPrisma.map(store => this.toDomain(store));
  }

  async update(store: Store): Promise<Store> {
    if (!store.id) {
      throw new Error('El ID del store es requerido para actualizar');
    }

    // Primero obtenemos el registro actual de stores para obtener el id_usuario
    const storeActual = await prisma.stores.findUnique({
      where: { id: store.id },
      include: {
        usuario: true
      }
    });

    if (!storeActual) {
      throw new Error('El store no existe');
    }

    // Actualizamos el usuario base
    const usuario = await prisma.usuarios.update({
      where: { id: storeActual.usuario_id },
      data: {
        email: store.email,
        password_hash: store.password_hash || undefined,
        nombre: store.nombre,
        apellido: store.apellido,
        telefono: store.telefono,
        activo: store.activo
      },
      include: {
        direcciones: true
      }
    });

    // Actualizamos el registro del store
    const storeDb = await prisma.stores.update({
      where: { id: store.id },
      data: {
        codigo_empleado: store.codigo_empleado
      },
      include: {
        usuario: true
      }
    });

    return this.toDomain(storeDb);
  }

  async delete(id: number): Promise<boolean> {
    if (!id) {
      throw new Error('El ID del store es requerido para eliminar');
    }

    try {
      // Primero obtenemos el usuario_id del store
      const store = await prisma.stores.findUnique({
        where: { id },
        select: { usuario_id: true }
      });

      if (!store) {
        return false;
      }

      // Eliminamos el registro de stores
      await prisma.stores.delete({
        where: { id }
      });

      // Luego eliminamos el usuario relacionado
      await prisma.usuarios.delete({
        where: { id: store.usuario_id }
      });

      return true;
    } catch (error) {
      console.error('Error al eliminar store:', error);
      return false;
    }
  }

  private toDomain(prismaStore: any): Store {
    return {
      id: prismaStore.id,
      id_usuario: prismaStore.usuario.id,
      email: prismaStore.usuario.email,
      password_hash: prismaStore.usuario.password_hash,
      nombre: prismaStore.usuario.nombre,
      apellido: prismaStore.usuario.apellido,
      telefono: prismaStore.usuario.telefono,
      fecha_registro: prismaStore.usuario.fecha_registro,
      activo: prismaStore.usuario.activo,
      codigo_empleado: prismaStore.codigo_empleado,
      fecha_contratacion: prismaStore.fecha_contratacion,
      tipo: TipoUsuario.STORE
    };
  }
}