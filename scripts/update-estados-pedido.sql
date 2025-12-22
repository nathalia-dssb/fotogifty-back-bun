-- Actualizar estados de pedido para que coincidan con el código TypeScript
-- Este script reemplaza los estados antiguos con los nuevos

-- Primero eliminar los estados antiguos (si no hay pedidos asociados)
-- Si hay pedidos, esto fallará por restricción de clave foránea
DELETE FROM estados_pedido;

-- Insertar los estados correctos que coinciden con EstadoPedido enum
INSERT INTO estados_pedido (id, nombre, descripcion) VALUES
(1, 'Pendiente', 'Pedido recibido, en espera de procesamiento'),
(2, 'Enviado', 'Pedido enviado al cliente'),
(3, 'Imprimiendo', 'Las fotos están siendo impresas'),
(4, 'Empaquetado', 'El pedido está siendo empaquetado'),
(5, 'En reparto', 'El pedido está en camino al cliente'),
(6, 'Entregado', 'Pedido entregado al cliente'),
(7, 'Archivado', 'Pedido archivado');
