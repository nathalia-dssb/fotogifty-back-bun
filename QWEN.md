# Express Bun API - Documentación del Proyecto

## Descripción General

Express Bun API es una API REST construida con Express.js, Bun runtime y TypeScript siguiendo una arquitectura hexagonal (patrón de puertos y adaptadores). El proyecto está diseñado para un sistema de gestión de paquetes de fotos llamado "foto pack" que permite a los usuarios crear cuentas, gestionar pedidos y subir fotos al almacenamiento S3.

### Tecnologías Clave

- **Runtime**: Bun v1.2.21 (entorno de JavaScript todo en uno rápido)
- **Framework**: Express.js (framework web)
- **Lenguaje**: TypeScript (con seguridad de tipos)
- **Base de Datos**: MySQL (gestionado con Prisma ORM)
- **Almacenamiento de Objetos**: AWS S3 (para subida de fotos)
- **Documentación**: Swagger UI para documentación de API
- **Arquitectura**: Arquitectura hexagonal (patrón de puertos y adaptadores)
- **Carga de Archivos**: Multer para manejar multipart/form-data
- **Hash de Contraseñas**: bcrypt para almacenamiento seguro de contraseñas

## Arquitectura

El proyecto sigue una arquitectura hexagonal con la siguiente estructura:

```
src/
├── application/     # Casos de uso y lógica de aplicación
├── domain/          # Entidades de negocio, puertos y servicios
├── infrastructure/  # Adaptadores externos (controladores, repositorios, rutas, etc.)
└── shared/          # Utilidades compartidas y código común
```

- **Capa de Dominio**: Contiene entidades de negocio (como Usuario), puertos (interfaces) y servicios de dominio
- **Capa de Aplicación**: Contiene casos de uso que orquestan la lógica de negocio
- **Capa de Infraestructura**: Contiene implementaciones de puertos, controladores, rutas, repositorios de base de datos e integraciones con servicios externos

## Configuración de Entorno

El proyecto utiliza un archivo `.env` con las siguientes variables de entorno:

- `DATABASE_URL`: Cadena de conexión MySQL
- `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`: Credenciales AWS para S3
- `S3_BUCKET_NAME`: Nombre del bucket S3 para almacenamiento de fotos
- `PORT`: Puerto del servidor (por defecto: 3001)

## Configuración de Base de Datos

El proyecto utiliza Prisma ORM con MySQL. El esquema de base de datos incluye tablas para:
- Usuarios (usuarios)
- Direcciones (direcciones)
- Tipos de paquete (tipo_paquete)
- Paquetes predefinidos (paquetes_predefinidos)
- Estados de pedido (estados_pedido)
- Pedidos (pedidos)
- Ítems de pedido (items_pedido)
- Fotos (fotos)
- Calendarios de fotos (calendario_fotos)
- Administradores (administradores)

## Endpoints de la API

### Endpoints Generales
- `GET /` - Hola Mundo
- `GET /health` - Verificación de estado

### API de Mensajes
- `POST /api/messages` - Crear un nuevo mensaje
- `GET /api/messages` - Obtener todos los mensajes

### API de Usuarios
- `POST /api/usuarios` - Crear un nuevo usuario

### API de Fotos
- `POST /api/fotos/upload` - Subir una foto a S3 y guardar en la base de datos

### API de Pedidos
- `POST /api/pedidos` - Crear un nuevo pedido
- `GET /api/pedidos/{id}` - Obtener un pedido por ID
- `GET /api/pedidos/usuario/{usuarioId}` - Obtener pedidos por ID de usuario
- `GET /api/pedidos/estado/{estado}` - Obtener pedidos por estado
- `PATCH /api/pedidos/{id}/estado` - Actualizar el estado de un pedido
- `POST /api/pedidos/{id}/imagenes` - Subir imágenes para un pedido

## Compilación y Ejecución

### Requisitos Previos
- Instalar Bun runtime (versión 1.2.21 o superior)

### Instrucciones de Configuración
1. Instalar dependencias:
   ```bash
   bun install
   ```

2. Configurar la base de datos:
   ```bash
   # Iniciar MySQL con Docker
   docker compose up -d
   
   # Aplicar migraciones de Prisma
   bunx prisma db push
   ```

3. Ejecutar la aplicación:
   ```bash
   # Modo desarrollo con recarga automática
   bun run dev
   
   # Modo producción
   bun run start
   
   # O ejecutar directamente con Bun
   bun run src/index.ts
   ```

4. Compilar la aplicación:
   ```bash
   bun run build
   ```

5. Ejecutar pruebas:
   ```bash
   bun run test
   ```

## Documentación de la API

La documentación de la API está disponible a través de Swagger UI en:
- `http://localhost:${PORT}/api-docs` (donde PORT se especifica en el entorno, por defecto: 3001)

## Convenciones de Desarrollo

- Se utiliza TypeScript en todo el proyecto para seguridad de tipos
- El código sigue los principios de arquitectura hexagonal
- Se utiliza Prisma para migraciones de base de datos y ORM
- Se utilizan variables de entorno para configuración
- Se utiliza bcrypt para hash de contraseñas
- Se utiliza Multer para manejar carga de archivos
- El manejo de errores debe ser consistente en toda la aplicación
- Se utilizan anotaciones de Swagger para documentación de API

## Flujo de Pedidos

El sistema implementa un flujo completo de pedidos de fotografías que incluye:
1. Creación de pedidos con información del cliente y detalles del paquete
2. Gestión de estados de pedidos (Pendiente, Enviado, Imprimiendo, etc.)
3. Subida de imágenes relacionadas con los pedidos
4. Integración con sistemas de pago (Stripe - conceptualmente definido)
5. Seguimiento de pedidos por parte de clientes y administradores

## Seguridad

- Hash de contraseñas con bcrypt
- Validación de entradas en todos los endpoints
- Configuración de CORS
- Protección contra inyección SQL a través de Prisma ORM
- Almacenamiento seguro de credenciales AWS y claves de API en variables de entorno

## Arquitectura Hexagonal

El proyecto implementa el patrón de arquitectura hexagonal que separa claramente:
- La lógica de dominio (entidades y puertos) de las dependencias externas
- Los casos de uso que orquestan la lógica de negocio
- Los adaptadores de infraestructura que implementan los puertos
- Esto permite una mejor testabilidad, mantenibilidad y desacoplamiento del framework y servicios externos