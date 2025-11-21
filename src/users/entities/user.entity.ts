import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('usuarios')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombre_usuario: string;

    @Column({ type: 'varchar', nullable: true })
    contraseña_hash: string | null;

    @Column({ type: 'varchar' })
    correo_electronico: string;

    @Column({ name: 'google_id', type: 'varchar', nullable: true, unique: true })
    google_id: string | null;

    @Column({ name: 'creado_el', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    creado_el: Date;
}
