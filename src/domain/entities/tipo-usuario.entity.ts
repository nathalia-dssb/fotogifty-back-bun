import { Usuario } from './usuario.entity';

export enum TipoUsuario {
  CLIENTE = 'cliente',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
  STORE = 'store'
}

export interface UsuarioConTipo extends Usuario {
  tipo: TipoUsuario;
}