import { Controller, Post, Body, HttpCode, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleLoginDto } from './dto/google-login.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    /**
     * Endpoint para autenticación con Google
     * Recibe el ID Token de Google y devuelve un JWT propio
     * 
     * @param googleLoginDto - Contiene el idToken de Google
     * @returns access_token y datos del usuario
     */
    @Post('google')
    @HttpCode(HttpStatus.OK)
    async googleLogin(@Body() googleLoginDto: GoogleLoginDto) {
        return this.authService.googleLogin(googleLoginDto.idToken);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginDto: LoginDto) {
        const user = await this.authService.validateUser(loginDto.correo, loginDto.password);
        if (!user) {
            throw new UnauthorizedException('Credenciales inválidas');
        }
        return this.authService.generateJwtToken(user);
    }

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() registerDto: RegisterDto) {
        // Aquí va la lógica para crear el nuevo usuario
        return this.authService.registerUser(registerDto);
    }

}
