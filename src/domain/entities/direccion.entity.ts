export interface Direccion {
  id?: number;
  usuario_id: number;  // Relación con el usuario
  alias: string;       // Nombre de la dirección (ej: "Casa", "Trabajo", etc.)
  pais: string;
  estado: string;
  ciudad: string;      // Asumo que te refieres a ciudad/municipio
  codigo_postal: string;
  direccion: string;   // Calle
  numero_casa?: string; // Opcional
  numero_departamento?: string; // Opcional
  especificaciones?: string;    // Información adicional
  predeterminada: boolean;      // Si es la dirección predeterminada
  fecha_registro?: Date;
}

export class DireccionEntity implements Direccion {
  id?: number;
  usuario_id: number;
  alias: string;
  pais: string;
  estado: string;
  ciudad: string;
  codigo_postal: string;
  direccion: string;
  numero_casa?: string;
  numero_departamento?: string;
  especificaciones?: string;
  predeterminada: boolean;
  fecha_registro?: Date;

  constructor(
    usuario_id: number,
    alias: string,
    pais: string,
    estado: string,
    ciudad: string,
    codigo_postal: string,
    direccion: string,
    predeterminada: boolean = false,
    numero_casa?: string,
    numero_departamento?: string,
    especificaciones?: string,
    id?: number
  ) {
    this.id = id;
    this.usuario_id = usuario_id;
    this.alias = alias;
    this.pais = pais;
    this.estado = estado;
    this.ciudad = ciudad;
    this.codigo_postal = codigo_postal;
    this.direccion = direccion;
    this.numero_casa = numero_casa;
    this.numero_departamento = numero_departamento;
    this.especificaciones = especificaciones;
    this.predeterminada = predeterminada;
    this.fecha_registro = new Date();
  }

  static create(
    usuario_id: number,
    alias: string,
    pais: string,
    estado: string,
    ciudad: string,
    codigo_postal: string,
    direccion: string,
    predeterminada: boolean = false,
    numero_casa?: string,
    numero_departamento?: string,
    especificaciones?: string
  ): DireccionEntity {
    return new DireccionEntity(
      usuario_id,
      alias,
      pais,
      estado,
      ciudad,
      codigo_postal,
      direccion,
      predeterminada,
      numero_casa,
      numero_departamento,
      especificaciones
    );
  }
}