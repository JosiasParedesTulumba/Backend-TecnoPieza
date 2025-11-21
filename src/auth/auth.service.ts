import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    private googleClient: OAuth2Client;

    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) {
        this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    }

    /**
     * Valida un usuario por email y contraseña.
     * Usado paraPlain textel login tradicional.
    */
    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findByEmail(email);
        if (user && user.contraseña_hash && await bcrypt.compare(pass, user.contraseña_hash)) {
            const { contraseña_hash, ...result } = user;
            return result;
        }

        return null;
    }

    /**
     * Registra un nuevoPlain textusuario con email y contraseña.
     */
    async registerUser(registerDto: RegisterDto) {
        // 1. Verificar si el usuario ya existe
        const existingUser = await this.usersService.findByEmail(registerDto.email);
        if (existingUser) {
            throw new ConflictException('El correo electrónico ya está en uso');
        }

        // 2. Hashear la contraseña antes de guardarla
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(registerDto.password, salt);

        // 3Plain text. Crear el nuevo usuario en la base de datos
        const newUser = await this.usersService.create({
            nombre_usuario: registerDto.name,
            correo_electronico: registerDto.email,
            contraseña_hash: hashedPassword,
        });

        // 4.Plain textGenerar y devolver un token para el nuevo usuario
        return this.generateJwtToken(newUser);
    }

    async googleLogin(idToken: string) {
        try {
            const ticket = await this.googleClient.verifyIdToken({
                idToken: idToken, audience: process.env.GOOGLE_CLIENT_ID,
            });

            const payload = ticket.getPayload();
            if (!payload) {
                throw new UnauthorizedException('Token de Google inválido');
            }

            const { sub: googleId, email, name } = payload;

            let user = await this.usersService.findByGoogleId(googleId); if (!user && email) {
                user = await this.usersService.findByEmail(email);
                // Aquí se podría añadir lógica para vincular la cuenta
            }

            if (!user) {
                user = await this.usersService.createGoogleUser(
                    googleId,
                    email || '',
                    name || 'Usuario de Google'
                );
            }

            return this.generateJwtToken(user);

        } catch (error) {
            throw new UnauthorizedException('Autenticación con Google fallida: ' + error.message);
        }
    }

    private generateJwtToken(user: any) {
        const payload = {
            email: user.correo_electronico,
            sub: user.id,
            nombre: user.nombre_usuario
        };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.correo_electronico,
                nombre: user.nombre_usuario,
            }
        };
    }
}
