import type { IUserRepository } from 'src/domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';

export class UserRepository implements IUserRepository {
  private users: User[] = [];

  async create(user: User): Promise<User> {
    this.users.push(user);
    await Promise.resolve();
    return user;
  }

  async findById(id: string): Promise<User | null> {
    await Promise.resolve();
    return this.users.find((user) => user.id === id) || null;
  }
}
