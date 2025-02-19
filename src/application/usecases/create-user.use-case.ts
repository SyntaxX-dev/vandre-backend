import { User } from 'src/domain/entities/user.entity';
import type { IUserRepository } from 'src/domain/repositories/user.repository.interface';
import type { CreateUserDto } from '../dtos/create-user.dto';

export class CreateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(dto: CreateUserDto): Promise<User> {
    const now = new Date();
    const user = new User(
      Date.now().toString(),
      dto.name,
      dto.email,
      dto.password,
      now,
      now,
    );
    return await this.userRepository.create(user);
  }
}
