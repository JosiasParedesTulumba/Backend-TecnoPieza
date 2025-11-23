import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';

@Entity('items_pedido')
export class OrderItem {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'pedido_id' })
    pedido_id: number;

    @ManyToOne(() => Order, order => order.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'pedido_id' })
    pedido: Order;

    @Column({ name: 'sku_comprado', type: 'varchar', length: 100, nullable: true })
    sku_comprado: string | null;

    @Column({ name: 'nombre_producto', type: 'varchar', length: 255 })
    nombre_producto: string;

    @Column({ name: 'detalles_variacion', type: 'varchar', length: 255, nullable: true })
    detalles_variacion: string | null;

    @Column({ type: 'int' })
    cantidad: number;

    @Column({ name: 'precio_unitario', type: 'decimal', precision: 10, scale: 2 })
    precio_unitario: number;
}

