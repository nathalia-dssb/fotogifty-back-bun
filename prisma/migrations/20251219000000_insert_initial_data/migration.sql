-- Insert initial data for estados_pedido
-- This migration ensures that Railway deployment has the correct order statuses

INSERT IGNORE INTO estados_pedido (id, nombre, descripcion) VALUES
(1, 'Pendiente', 'Pedido recibido, en espera de procesamiento'),
(2, 'Enviado', 'Pedido enviado al cliente'),
(3, 'Imprimiendo', 'Las fotos están siendo impresas'),
(4, 'Empaquetado', 'El pedido está siendo empaquetado'),
(5, 'En reparto', 'El pedido está en camino al cliente'),
(6, 'Entregado', 'Pedido entregado al cliente'),
(7, 'Archivado', 'Pedido archivado');

-- Insert initial data for tipo_paquete
INSERT IGNORE INTO tipo_paquete (id, nombre, descripcion) VALUES
(1, 'Básico', 'Paquetes básicos de fotos'),
(2, 'Premium', 'Paquetes premium con más fotos'),
(3, 'Personalizado', 'Paquetes personalizados'),
(4, 'Expansión', 'Expansiones para paquetes existentes'),
(5, 'Calendario', 'Paquetes de calendario');
