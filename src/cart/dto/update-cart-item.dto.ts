import { IsInt, Min } from 'class-validator';

export class UpdateCartItemDto {
    @IsInt()
    @Min(1, { message: 'La cantidad debe ser al menos 1' })
    cantidad: number;
}
