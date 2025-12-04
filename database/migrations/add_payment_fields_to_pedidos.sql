-- Agregar campos de pago a la tabla pedidos
ALTER TABLE `pedidos` 
ADD COLUMN `metodo_pago` ENUM('TARJETA_CREDITO', 'TARJETA_DEBITO', 'PAYPAL', 'TRANSFERENCIA', 'EFECTIVO', 'MERCADO_PAGO') DEFAULT NULL AFTER `monto_total`,
ADD COLUMN `estado_pago` ENUM('PENDIENTE', 'PAGADO', 'FALLIDO', 'REEMBOLSADO') NOT NULL DEFAULT 'PENDIENTE' AFTER `metodo_pago`,
ADD COLUMN `referencia_pago` VARCHAR(255) DEFAULT NULL COMMENT 'ID de transacción del procesador de pagos' AFTER `estado_pago`,
ADD COLUMN `pagado_el` TIMESTAMP NULL DEFAULT NULL AFTER `referencia_pago`;

-- Agregar índice para búsquedas por estado de pago
ALTER TABLE `pedidos` 
ADD INDEX `idx_estado_pago` (`estado_pago`);
