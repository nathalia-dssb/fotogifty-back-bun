# Guía de Despliegue en Railway

## 📋 Pre-requisitos

1. Cuenta en [Railway](https://railway.app/)
2. Tu código debe estar en un repositorio de GitHub

## 🚀 Pasos para Desplegar

### 1. Crear Nuevo Proyecto en Railway

1. Ve a [Railway](https://railway.app/) y haz login
2. Click en "New Project"
3. Selecciona "Deploy from GitHub repo"
4. Autoriza Railway para acceder a tu repositorio
5. Selecciona el repositorio `express-bun-api`

### 2. Agregar Base de Datos MySQL

1. En tu proyecto de Railway, click en "+ New"
2. Selecciona "Database" → "Add MySQL"
3. Railway creará automáticamente una base de datos MySQL

### 3. Configurar Variables de Entorno

En la configuración de tu servicio backend, agrega estas variables:

```env
# Railway proporcionará automáticamente DATABASE_URL cuando agregues MySQL
# Pero si necesitas configurarla manualmente, usa el formato:
# DATABASE_URL=mysql://user:password@host:port/database

# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=tu_access_key_id
AWS_SECRET_ACCESS_KEY=tu_secret_access_key
S3_BUCKET_NAME=tu_bucket_name

# Stripe Configuration
STRIPE_SECRET_KEY=tu_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=tu_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=tu_webhook_secret

# JWT Configuration
JWT_SECRET=tu_jwt_secret_muy_seguro
JWT_EXPIRES_IN=24h

# Port (Railway lo asigna automáticamente, pero puedes especificar)
PORT=3001
```

### 4. Configurar Build y Start Commands

En la configuración de Railway:

**Build Command:**
```bash
bun install && bunx prisma generate && bun run build
```

**Start Command:**
```bash
bunx prisma migrate deploy && bun run db:seed && bun run start
```

**Importante:** El comando `prisma migrate deploy` ejecutará todas las migraciones, incluyendo la que inserta los datos iniciales (estados de pedido y tipos de paquete).

### 5. Desplegar

1. Railway detectará automáticamente los cambios en tu repositorio
2. Click en "Deploy" o espera el auto-deploy
3. Railway ejecutará el build y start commands

### 6. Verificar el Despliegue

Una vez desplegado:

1. Railway te proporcionará una URL pública (ej: `https://tu-app.railway.app`)
2. Verifica que la API esté funcionando: `https://tu-app.railway.app/health`
3. Verifica Swagger UI: `https://tu-app.railway.app/api-docs`

### 7. Verificar Datos Iniciales

Para asegurarte que los estados de pedido se insertaron correctamente:

1. Ve a la sección de MySQL en Railway
2. Click en "Query" o conéctate con un cliente MySQL
3. Ejecuta:
   ```sql
   SELECT * FROM estados_pedido;
   ```
4. Deberías ver 7 estados: Pendiente, Enviado, Imprimiendo, Empaquetado, En reparto, Entregado, Archivado

## 🔄 Actualizar el Despliegue

Cuando hagas cambios:

1. **Sin cambios en la base de datos**: Solo haz push a GitHub, Railway re-desplegará automáticamente
2. **Con cambios en el schema de Prisma**:
   - Crea una nueva migración localmente: `bunx prisma migrate dev --name descripcion_del_cambio`
   - Haz commit y push de la nueva migración
   - Railway ejecutará `prisma migrate deploy` automáticamente

## 🛠️ Comandos Útiles

```bash
# Ejecutar migraciones (se ejecuta automáticamente en Railway)
bun run db:migrate

# Sembrar datos iniciales (se ejecuta automáticamente en Railway)
bun run db:seed

# Actualizar schema sin migración (solo local)
bun run db:push

# Generar cliente de Prisma
bunx prisma generate
```

## ⚠️ Troubleshooting

### Error: "tabla estados_pedido está vacía"
- Ejecuta manualmente: `bun run db:seed` en Railway CLI
- O ejecuta la migración SQL manualmente en Railway MySQL Query

### Error: "DATABASE_URL no configurada"
- Verifica que agregaste la base de datos MySQL a tu proyecto
- Railway debe proporcionar automáticamente la variable `DATABASE_URL`

### Error de conexión a base de datos
- Verifica que el servicio de MySQL esté corriendo
- Verifica que el formato de `DATABASE_URL` sea correcto

## 📝 Notas Importantes

1. **Nunca hagas `prisma db push` en producción**, usa siempre migraciones
2. **Los datos de `scripts/init.sql` NO se usan en Railway**, solo funcionan en Docker local
3. **Las migraciones se ejecutan automáticamente** con `prisma migrate deploy`
4. **El seed se ejecuta automáticamente** después de las migraciones
5. **Mantén tus secretos seguros**, nunca hagas commit de archivos `.env`
