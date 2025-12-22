import { Usuario } from './usuario.entity';
import { TipoUsuario } from './tipo-usuario.entity';

export interface Store extends Usuario {
  id_store?: number;  // ID del registro en la tabla stores
  id_usuario?: number; // ID del usuario relacionado en la tabla usuarios
  codigo_empleado: string;
  fecha_contratacion?: Date;
}

export class StoreEntity implements Store {
  public id?: number;
  public id_store?: number;
  public id_usuario?: number;
  public email: string;
  public password_hash: string;
  public nombre: string;
  public apellido: string;
  public telefono?: string;
  public fecha_registro: Date;
  public activo: boolean;
  public tipo: TipoUsuario;
  public codigo_empleado: string;
  public fecha_contratacion?: Date;

  constructor(
    email: string,
    password_hash: string,
    nombre: string,
    apellido: string,
    codigo_empleado: string,
    telefono?: string,
    id?: number
  ) {
    this.id = id;
    this.email = email;
    this.password_hash = password_hash;
    this.nombre = nombre;
    this.apellido = apellido;
    this.telefono = telefono;
    this.fecha_registro = new Date();
    this.activo = true;
    this.codigo_empleado = codigo_empleado;
    this.fecha_contratacion = new Date();
    this.tipo = TipoUsuario.STORE; // Mantenemos el tipo existente en la base de datos
  }

  static create(
    email: string,
    password_hash: string,
    nombre: string,
    apellido: string,
    codigo_empleado: string,
    telefono?: string
  ): StoreEntity {
    return new StoreEntity(email, password_hash, nombre, apellido, codigo_empleado, telefono);
  }

  static update(
    id: number,
    email: string,
    password_hash: string | undefined,
    nombre: string,
    apellido: string,
    codigo_empleado: string,
    telefono: string | undefined,
    activo: boolean
  ): StoreEntity {
    // Si password_hash es undefined, usamos una cadena vacía temporalmente,
    // pero en el repositorio se debe manejar para mantener la contraseña actual
    const store = new StoreEntity(email, password_hash || '', nombre, apellido, codigo_empleado, telefono);
    store.id = id;
    store.fecha_registro = new Date();
    store.activo = activo;
    store.tipo = TipoUsuario.STORE; // Mantenemos el tipo existente en la base de datos
    return store;
  }
}