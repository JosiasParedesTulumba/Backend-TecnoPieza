import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // ⭐ Detecta automáticamente el archivo según NODE_ENV
      envFilePath: process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || 'admin',
      database: process.env.DB_DATABASE || 'app_movil',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false,
      logging: process.env.NODE_ENV === 'development',

      // Configuración SSL (false para local, true para Aiven)
      ssl: process.env.DB_SSL === 'true' ? {
        rejectUnauthorized: true,
      } : false,

      extra: {
        connectionLimit: 10,
      },
    }),

    AuthModule,
    UsersModule,
    ProductsModule,
    CartModule,
    OrdersModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }