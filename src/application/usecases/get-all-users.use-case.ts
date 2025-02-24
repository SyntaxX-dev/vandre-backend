import { User } from 'src/domain/entities/user.entity';
import type { IUserRepository } from 'src/domain/repositories/user.repository.interface';

export class GetAllUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(): Promise<User[]> {
    return await this.userRepository.findAll();
  }
}
