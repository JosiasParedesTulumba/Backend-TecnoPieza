import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Cart } from './cart.entity';
import { ProductVariation } from '../../product-variations/entities/product-variation.entity';

@Entity('items_carrito')
export class CartItem {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'carrito_id' })
    carrito_id: number;

    @ManyToOne(() => Cart, cart => cart.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'carrito_id' })
    carrito: Cart;

    @Column({ name: 'variacion_id' })
    variacion_id: number;

    @ManyToOne(() => ProductVariation, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'variacion_id' })
    variacion: ProductVariation;

    @Column({ type: 'int' })
    cantidad: number;

    @Column({ name: 'agregado_el', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    agregado_el: Date;
}

