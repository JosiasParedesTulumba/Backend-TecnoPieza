export class CreateProductDto {
    nombre: string;
    descripcion: string;
    especificaciones: string;
    imagenUrl?: string;
    price?: number;
    categoria: string;
}
