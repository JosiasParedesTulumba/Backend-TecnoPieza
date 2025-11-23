import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
    PROCESANDO = 'PROCESANDO',
    ENVIADO = 'ENVIADO',
    ENTREGADO = 'ENTREGADO',
    CANCELADO = 'CANCELADO'
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

