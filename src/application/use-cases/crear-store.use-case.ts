import { StoreEntity } from '@domain/entities/store.entity';
import { StoreRepositoryPort } from '@domain/ports/store.repository.port';
import { PasswordService } from '@infrastructure/services/password.service';

interface CrearStoreResult {
  success: boolean;
  data?: StoreEntity;
  message?: string;
  error?: string;
}

export class CrearStoreUseCase {
  constructor(private readonly storeRepository: StoreRepositoryPort) {}

  async execute(
    email: string,
    password: string,
    nombre: string,
    apellido: string,
    codigo_empleado: string,
    telefono?: string
  ): Promise<CrearStoreResult> {
    try {
      // Validaciones
      if (!email || !password || !nombre || !apellido || !codigo_empleado) {
        return {
          success: false,
          message: 'Email, password, nombre, apellido y código de empleado son requeridos',
          error: 'Campos requeridos faltantes'
        };
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return {
          success: false,
          message: 'Formato de email inválido',
          error: 'Email inválido'
        };
      }

      // Validar longitud de contraseña
      if (password.length < 6) {
        return {
          success: false,
          message: 'La contraseña debe tener al menos 6 caracteres',
          error: 'Contraseña demasiado corta'
        };
      }

      // Validar si ya existe un usuario con este email
      const usuarioExistente = await this.storeRepository.findByEmail(email);
      if (usuarioExistente) {
        return {
          success: false,
          message: 'Ya existe un usuario con este email',
          error: 'Email duplicado'
        };
      }

      // Validar si ya existe un vendedor con este código de empleado
      const codigoExistente = await this.storeRepository.findByCodigoEmpleado(codigo_empleado);
      if (codigoExistente) {
        return {
          success: false,
          message: 'Ya existe un vendedor con este código de empleado',
          error: 'Código de empleado duplicado'
        };
      }

      // Hashear la contraseña antes de crear la entidad
      const password_hash = await PasswordService.hashPassword(password);

      // Crear la entidad de vendedor con la contraseña hasheada
      const nuevoStore = StoreEntity.create(email, password_hash, nombre, apellido, codigo_empleado, telefono);

      // Guardar en la base de datos
      const storeGuardado = await this.storeRepository.save(nuevoStore);

      return {
        success: true,
        data: storeGuardado
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al crear el store',
        error: error.message
      };
    }
  }
}