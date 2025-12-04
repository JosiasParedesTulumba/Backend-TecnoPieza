import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
    PROCESANDO = 'PROCESANDO',
    ENVIADO = 'ENVIADO',
    ENTREGADO = 'ENTREGADO',
    CANCELADO = 'CANCELADO'
}

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

@Entity('pedidos')
export class Order {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'usuario_id' })
    usuario_id: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'usuario_id' })
    usuario: User;

    @Column({ name: 'monto_total', type: 'decimal', precision: 10, scale: 2 })
    monto_total: number;

    @Column({
        name: 'metodo_pago',
        type: 'enum',
        enum: PaymentMethod,
        nullable: true
    })
    metodo_pago: PaymentMethod;

    @Column({
        name: 'estado_pago',
        type: 'enum',
        enum: PaymentStatus,
        default: PaymentStatus.PENDIENTE
    })
    estado_pago: PaymentStatus;

    @Column({ name: 'referencia_pago', type: 'varchar', length: 255, nullable: true })
    referencia_pago: string;

    @Column({ name: 'pagado_el', type: 'timestamp', nullable: true })
    pagado_el: Date;

    @Column({
        type: 'enum',
        enum: OrderStatus,
        default: OrderStatus.PROCESANDO
    })
    estado: OrderStatus;

    @Column({ name: 'creado_el', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    creado_el: Date;

    @OneToMany(() => OrderItem, orderItem => orderItem.pedido, { cascade: true })
    items: OrderItem[];
}

