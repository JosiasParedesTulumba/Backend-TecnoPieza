import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaymentMethod } from '../entities/order.entity';

export class CreateOrderDto {
    @IsEnum(PaymentMethod)
    @IsOptional()
    metodo_pago?: PaymentMethod;

    @IsString()
    @IsOptional()
    referencia_pago?: string;
}


