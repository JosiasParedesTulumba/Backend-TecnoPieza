import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('productos')
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100 })
    nombre: string;

    @Column('text')
    descripcion: string;

    @Column('text')
    especificaciones: string;

    @Column({ name: 'imagen_url', nullable: true })
    imagenUrl: string;

    @Column('decimal', { precision: 10, scale: 2 })
    precio: number;

    @Column()
    categoria: string;

    @Column({ name: 'creado_el', type: 'timestamp' })
    creadoEl: Date;
}
