import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { CartItem } from './cart-item.entity';

@Entity('carritos')
export class Cart {
    @PrimaryGeneratedColumn()
    id: number;

    // @Column({ name: 'usuario_id' })
    // usuario_id: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'usuario_id' })
    usuario: User;

    @Column({ name: 'creado_el', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    creado_el: Date;

    @Column({ name: 'actualizado_el', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    actualizado_el: Date;

    @OneToMany(() => CartItem, cartItem => cartItem.carrito, { cascade: true })
    items: CartItem[];
}

