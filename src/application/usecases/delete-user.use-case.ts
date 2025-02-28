import type { IUserRepository } from 'src/domain/repositories/user.repository.interface';
import { NotFoundException } from '@nestjs/common';

export class DeleteUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(id: string): Promise<void> {
    const existingUser = await this.userRepository.findById(id);

    if (!existingUser) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    await this.userRepository.delete(id);
  }
}
