import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('usuario')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombre_usuario: string;

    @Column()
    contraseña_hash: string;

    @Column()
    correo_electronico: string;

    @Column({ name: 'creado_el', type: 'timestamp' })
    creado_el: Date;
}
