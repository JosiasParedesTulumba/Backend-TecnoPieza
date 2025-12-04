import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaymentStatus } from '../entities/order.entity';

export class UpdatePaymentStatusDto {
    @IsEnum(PaymentStatus)
    estado_pago: PaymentStatus;

    @IsString()
    @IsOptional()
    referencia_pago?: string;
}
