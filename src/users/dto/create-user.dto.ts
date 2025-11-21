export class CreateUserDto {
    nombre_usuario: string;
    contraseña_hash: string;
    correo_electronico: string;
    google_id?: string | null;
}
