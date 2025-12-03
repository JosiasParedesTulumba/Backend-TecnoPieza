import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Cart } from './cart.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('items_carrito')
export class CartItem {
    @PrimaryGeneratedColumn()
    id: number;

    // @Column({ name: 'carrito_id' })
    // carrito_id: number;

    @ManyToOne(() => Cart, cart => cart.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'carrito_id' })
    carrito: Cart;

    // @Column({ name: 'producto_id' })
    // producto_id: number;

    @ManyToOne(() => Product, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'producto_id' })
    producto: Product;

    @Column({ type: 'int' })
    cantidad: number;

    @Column({ name: 'agregado_el', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    agregado_el: Date;
}

