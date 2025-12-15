import { TipoUsuario } from './tipo-usuario.entity';

export interface Usuario {
  id?: number;
  email: string;
  password_hash: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  fecha_registro?: Date;
  activo?: boolean;
  tipo?: TipoUsuario;
  fecha_ultima_conexion?: Date;
  token_recuperacion?: string;
  fecha_expiracion_token?: Date;
}

export class UsuarioEntity implements Usuario {
  public id?: number;
  public email: string;
  public password_hash: string;
  public nombre: string;
  public apellido: string;
  public telefono?: string;
  public fecha_registro: Date;
  public activo: boolean;
  public tipo?: TipoUsuario;

  constructor(
    email: string,
    password_hash: string,
    nombre: string,
    apellido: string,
    tipo?: TipoUsuario,
    telefono?: string,
    id?: number,
    fecha_ultima_conexion?: Date,
    token_recuperacion?: string,
    fecha_expiracion_token?: Date
  ) {
    this.id = id;
    this.email = email;
    this.password_hash = password_hash;
    this.nombre = nombre;
    this.apellido = apellido;
    this.telefono = telefono;
    this.fecha_registro = new Date();
    this.activo = true;
    this.tipo = tipo;
    this.fecha_ultima_conexion = fecha_ultima_conexion;
    this.token_recuperacion = token_recuperacion;
    this.fecha_expiracion_token = fecha_expiracion_token;
  }

  static create(
    email: string,
    password_hash: string,
    nombre: string,
    apellido: string,
    tipo?: TipoUsuario,
    telefono?: string,
    fecha_ultima_conexion?: Date,
    token_recuperacion?: string,
    fecha_expiracion_token?: Date
  ): UsuarioEntity {
    return new UsuarioEntity(
      email,
      password_hash,
      nombre,
      apellido,
      tipo,
      telefono,
      undefined, // id es opcional
      fecha_ultima_conexion,
      token_recuperacion,
      fecha_expiracion_token
    );
  }
}