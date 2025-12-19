import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Sembrando datos iniciales...');

  // Insertar estados de pedido
  console.log('📦 Insertando estados de pedido...');
  const estadosPedido = [
    { id: 1, nombre: 'Pendiente', descripcion: 'Pedido recibido, en espera de procesamiento' },
    { id: 2, nombre: 'Enviado', descripcion: 'Pedido enviado al cliente' },
    { id: 3, nombre: 'Imprimiendo', descripcion: 'Las fotos están siendo impresas' },
    { id: 4, nombre: 'Empaquetado', descripcion: 'El pedido está siendo empaquetado' },
    { id: 5, nombre: 'En reparto', descripcion: 'El pedido está en camino al cliente' },
    { id: 6, nombre: 'Entregado', descripcion: 'Pedido entregado al cliente' },
    { id: 7, nombre: 'Archivado', descripcion: 'Pedido archivado' },
  ];

  for (const estado of estadosPedido) {
    await prisma.estados_pedido.upsert({
      where: { id: estado.id },
      update: {},
      create: estado,
    });
  }
  console.log('✅ Estados de pedido insertados');

  // Insertar tipos de paquete
  console.log('📦 Insertando tipos de paquete...');
  const tiposPaquete = [
    { id: 1, nombre: 'Básico', descripcion: 'Paquetes básicos de fotos' },
    { id: 2, nombre: 'Premium', descripcion: 'Paquetes premium con más fotos' },
    { id: 3, nombre: 'Personalizado', descripcion: 'Paquetes personalizados' },
    { id: 4, nombre: 'Expansión', descripcion: 'Expansiones para paquetes existentes' },
    { id: 5, nombre: 'Calendario', descripcion: 'Paquetes de calendario' },
  ];

  for (const tipo of tiposPaquete) {
    await prisma.tipo_paquete.upsert({
      where: { id: tipo.id },
      update: {},
      create: tipo,
    });
  }
  console.log('✅ Tipos de paquete insertados');

  console.log('🎉 ¡Datos iniciales sembrados exitosamente!');
}

main()
  .catch((e) => {
    console.error('❌ Error sembrando datos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
