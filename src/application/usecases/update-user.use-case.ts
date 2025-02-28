import { User } from 'src/domain/entities/user.entity';
import type { IUserRepository } from 'src/domain/repositories/user.repository.interface';
import type { UpdateUserDto } from '../dtos/update-user.dto';
import { NotFoundException } from '@nestjs/common';

export class UpdateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(id: string, dto: UpdateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findById(id);

    if (!existingUser) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    const now = new Date();

    const updatedUser = new User(
      existingUser.id,
      dto.name || existingUser.name,
      dto.email || existingUser.email,
      dto.password || existingUser.password,
      existingUser.created_at,
      now,
    );

    return await this.userRepository.update(updatedUser);
  }
}
