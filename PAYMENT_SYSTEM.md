# Sistema de Pagos - Documentación

## Resumen de Cambios

Se ha implementado un sistema simple de gestión de pagos para los pedidos. Los cambios incluyen:

### 1. **Campos agregados a la tabla `pedidos`**:
- `metodo_pago`: Método de pago utilizado (TARJETA_CREDITO, TARJETA_DEBITO, PAYPAL, etc.)
- `estado_pago`: Estado del pago (PENDIENTE, PAGADO, FALLIDO, REEMBOLSADO)
- `referencia_pago`: ID de transacción del procesador de pagos
- `pagado_el`: Fecha y hora en que se confirmó el pago

### 2. **Nuevos Enums en TypeScript**:
```typescript
export enum PaymentMethod {
    TARJETA_CREDITO = 'TARJETA_CREDITO',
    TARJETA_DEBITO = 'TARJETA_DEBITO',
    PAYPAL = 'PAYPAL',
    TRANSFERENCIA = 'TRANSFERENCIA',
    EFECTIVO = 'EFECTIVO',
    MERCADO_PAGO = 'MERCADO_PAGO'
}

export enum PaymentStatus {
    PENDIENTE = 'PENDIENTE',
    PAGADO = 'PAGADO',
    FALLIDO = 'FALLIDO',
    REEMBOLSADO = 'REEMBOLSADO'
}
```

## Migración de Base de Datos

**⚠️ IMPORTANTE**: Antes de usar el sistema, debes ejecutar la migración SQL:

```bash
# Ejecuta el script SQL en tu base de datos MySQL
mysql -u tu_usuario -p tu_base_de_datos < database/migrations/add_payment_fields_to_pedidos.sql
```

O copia y pega el contenido del archivo en tu cliente MySQL (Workbench, phpMyAdmin, etc.)

## Uso de la API

### 1. **Crear un pedido con información de pago**

```http
POST /orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "metodo_pago": "TARJETA_CREDITO",
  "referencia_pago": "txn_1234567890"
}
```

**Nota**: Ambos campos son opcionales. Si no se especifican, el pedido se crea con `estado_pago: PENDIENTE`.

### 2. **Actualizar el estado de pago**

```http
PUT /orders/:id/payment-status
Authorization: Bearer <token>
Content-Type: application/json

{
  "estado_pago": "PAGADO",
  "referencia_pago": "txn_1234567890"
}
```

### 3. **Confirmar un pago (atajo)**

```http
POST /orders/:id/confirm-payment
Authorization: Bearer <token>
Content-Type: application/json

{
  "referencia_pago": "txn_1234567890"
}
```

Este endpoint automáticamente:
- Cambia `estado_pago` a `PAGADO`
- Registra la fecha actual en `pagado_el`
- Opcionalmente actualiza `referencia_pago`

### 4. **Consultar pedidos**

```http
GET /orders
Authorization: Bearer <token>
```

Respuesta incluye los nuevos campos:
```json
{
  "id": 1,
  "usuario_id": 1,
  "monto_total": 150.00,
  "metodo_pago": "TARJETA_CREDITO",
  "estado_pago": "PAGADO",
  "referencia_pago": "txn_1234567890",
  "pagado_el": "2025-12-03T16:30:00.000Z",
  "estado": "PROCESANDO",
  "creado_el": "2025-12-03T16:25:00.000Z",
  "items": [...]
}
```

## Flujo Recomendado

### Opción A: Pago al crear el pedido
1. Usuario completa el checkout
2. Frontend procesa el pago (Stripe, PayPal, MercadoPago, etc.)
3. Frontend recibe confirmación del procesador
4. Frontend crea el pedido con `metodo_pago` y `referencia_pago`
5. Backend crea el pedido con `estado_pago: PENDIENTE`
6. Frontend llama a `/orders/:id/confirm-payment` para confirmar

### Opción B: Pago después de crear el pedido
1. Frontend crea el pedido sin información de pago
2. Usuario selecciona método de pago
3. Frontend procesa el pago
4. Frontend llama a `/orders/:id/payment-status` para actualizar

### Opción C: Pago contra entrega (EFECTIVO)
1. Frontend crea el pedido con `metodo_pago: EFECTIVO`
2. `estado_pago` permanece en `PENDIENTE`
3. Cuando se entrega y cobra, se llama a `/orders/:id/confirm-payment`

## Validaciones Implementadas

- ✅ No se puede confirmar un pago ya confirmado
- ✅ Solo el dueño del pedido puede actualizar el estado de pago
- ✅ Se registra automáticamente la fecha cuando el pago es confirmado

## Próximos Pasos (Opcional)

Si necesitas funcionalidad más avanzada:
- Webhooks para procesadores de pago (Stripe, PayPal)
- Tabla separada de `pagos` para múltiples intentos
- Soporte para reembolsos parciales
- Integración directa con pasarelas de pago

## Archivos Modificados

- ✅ `src/orders/entities/order.entity.ts` - Agregados campos y enums
- ✅ `src/orders/dto/create-order.dto.ts` - Agregados campos opcionales
- ✅ `src/orders/dto/update-payment-status.dto.ts` - Nuevo DTO
- ✅ `src/orders/orders.service.ts` - Nuevos métodos de pago
- ✅ `src/orders/orders.controller.ts` - Nuevos endpoints
- ✅ `database/migrations/add_payment_fields_to_pedidos.sql` - Script de migración
