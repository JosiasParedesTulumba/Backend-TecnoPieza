import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { CartItem } from '../../cart/entities/cart-item.entity';

@Entity('producto_variaciones')
export class ProductVariation {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'producto_id' })
    producto_id: number;

    @ManyToOne(() => Product, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'producto_id' })
    producto: Product;

    @Column({ type: 'varchar', length: 100, nullable: true, unique: true })
    sku: string | null;

    @Column('decimal', { precision: 10, scale: 2 })
    precio: number;

    @Column({ type: 'int', default: 0 })
    inventario: number;

    @Column({ type: 'varchar', length: 50, nullable: true })
    color: string | null;

    @Column({ type: 'varchar', length: 50, nullable: true })
    capacidad: string | null;

    @Column({ type: 'varchar', length: 50, nullable: true })
    potencia: string | null;

    @OneToMany(() => CartItem, cartItem => cartItem.variacion)
    cartItems: CartItem[];
}

