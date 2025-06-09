import { User } from 'src/domain/entities/user.entity';
import type { IUserRepository } from 'src/domain/repositories/user.repository.interface';
import type { CreateUserDto } from '../dtos/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { ConflictException } from '@nestjs/common';

export class CreateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(dto: CreateUserDto): Promise<User> {
    // Verificar se o email já está em uso
    const existingUser = await this.userRepository.findByEmail(dto.email);
    
    if (existingUser) {
      throw new ConflictException('Email já está em uso');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    
    const now = new Date();
    const user = new User(
      '',
      dto.name,
      dto.email,
      hashedPassword,
      now,
      now,
    );
    
    return await this.userRepository.create(user);
  }
}
