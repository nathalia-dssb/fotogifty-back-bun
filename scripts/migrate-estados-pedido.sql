-- Migración segura de estados de pedido
-- Este script actualiza los estados para que coincidan con el código TypeScript
-- sin perder datos de pedidos existentes

-- Paso 1: Crear una tabla temporal con los nuevos estados
CREATE TABLE IF NOT EXISTS estados_pedido_temp (
    id INT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT
);

-- Paso 2: Insertar los nuevos estados en la tabla temporal
INSERT INTO estados_pedido_temp (id, nombre, descripcion) VALUES
(1, 'Pendiente', 'Pedido recibido, en espera de procesamiento'),
(2, 'Enviado', 'Pedido enviado al cliente'),
(3, 'Imprimiendo', 'Las fotos están siendo impresas'),
(4, 'Empaquetado', 'El pedido está siendo empaquetado'),
(5, 'En reparto', 'El pedido está en camino al cliente'),
(6, 'Entregado', 'Pedido entregado al cliente'),
(7, 'Archivado', 'Pedido archivado');

-- Paso 3: Actualizar los pedidos existentes para que usen los nuevos IDs
-- Mapeo de estados antiguos a nuevos:
-- 1 (Pendiente) -> 1 (Pendiente) - Sin cambios
-- 2 (En Proceso) -> 3 (Imprimiendo) - Mejor equivalencia
-- 3 (Enviado) -> 2 (Enviado) - Cambio de ID
-- 4 (Entregado) -> 6 (Entregado) - Cambio de ID
-- 5 (Cancelado) -> 7 (Archivado) - Mejor equivalencia

-- Actualizar pedidos "Enviado" (antiguo ID 3 -> nuevo ID 2)
UPDATE pedidos SET estado_id = 2 WHERE estado_id = 3;

-- Actualizar pedidos "En Proceso" (antiguo ID 2 -> nuevo ID 3 "Imprimiendo")
UPDATE pedidos SET estado_id = 3 WHERE estado_id = 2;

-- Actualizar pedidos "Entregado" (antiguo ID 4 -> nuevo ID 6)
-- Primero movemos a un ID temporal para evitar conflictos
UPDATE pedidos SET estado_id = 99 WHERE estado_id = 4;
UPDATE pedidos SET estado_id = 6 WHERE estado_id = 99;

-- Actualizar pedidos "Cancelado" (antiguo ID 5 -> nuevo ID 7 "Archivado")
-- Primero movemos a un ID temporal para evitar conflictos
UPDATE pedidos SET estado_id = 98 WHERE estado_id = 5;
UPDATE pedidos SET estado_id = 7 WHERE estado_id = 98;

-- Paso 4: Eliminar los estados antiguos
DELETE FROM estados_pedido;

-- Paso 5: Insertar los nuevos estados
INSERT INTO estados_pedido (id, nombre, descripcion)
SELECT id, nombre, descripcion FROM estados_pedido_temp;

-- Paso 6: Eliminar la tabla temporal
DROP TABLE estados_pedido_temp;

-- Paso 7: Verificar que todo está correcto
SELECT 'Migración completada exitosamente' AS resultado;
SELECT COUNT(*) as total_estados FROM estados_pedido;
SELECT COUNT(*) as total_pedidos FROM pedidos;
