-- Migración segura de estados de pedido (versión 2)
-- Desactiva temporalmente las restricciones de clave foránea

-- Paso 1: Desactivar las restricciones de clave foránea temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Paso 2: Eliminar todos los estados antiguos
DELETE FROM estados_pedido;

-- Paso 3: Insertar los nuevos estados con los IDs correctos
INSERT INTO estados_pedido (id, nombre, descripcion) VALUES
(1, 'Pendiente', 'Pedido recibido, en espera de procesamiento'),
(2, 'Enviado', 'Pedido enviado al cliente'),
(3, 'Imprimiendo', 'Las fotos están siendo impresas'),
(4, 'Empaquetado', 'El pedido está siendo empaquetado'),
(5, 'En reparto', 'El pedido está en camino al cliente'),
(6, 'Entregado', 'Pedido entregado al cliente'),
(7, 'Archivado', 'Pedido archivado');

-- Paso 4: Reactivar las restricciones de clave foránea
SET FOREIGN_KEY_CHECKS = 1;

-- Paso 5: Verificar que todo está correcto
SELECT '✅ Migración completada exitosamente' AS resultado;
SELECT 'Estados de pedido:' AS info;
SELECT id, nombre, descripcion FROM estados_pedido ORDER BY id;
SELECT 'Total de pedidos:' AS info;
SELECT COUNT(*) as total_pedidos FROM pedidos;
SELECT 'Pedidos por estado:' AS info;
SELECT e.nombre as estado, COUNT(p.id) as cantidad
FROM estados_pedido e
LEFT JOIN pedidos p ON e.id = p.estado_id
GROUP BY e.id, e.nombre
ORDER BY e.id;
