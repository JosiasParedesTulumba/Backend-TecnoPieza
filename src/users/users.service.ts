import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    return await this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async findOne(id: number): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({ 
      where: { correo_electronico: email } 
    });
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return await this.usersRepository.findOne({ 
      where: { google_id: googleId } 
    });
  }

  async createGoogleUser(googleId: string, email: string, name: string): Promise<User> {
    const user = this.usersRepository.create({
      google_id: googleId,
      correo_electronico: email,
      nombre_usuario: name,
      contraseña_hash: null, // Los usuarios de Google no tienen contraseña
    });
    return await this.usersRepository.save(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User | null> {
    await this.usersRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    if (!user.contraseña_hash) {
      return false; // Usuario de Google sin contraseña
    }
    return await bcrypt.compare(password, user.contraseña_hash);
  }
}
