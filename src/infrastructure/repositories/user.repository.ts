import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import type { IUserRepository } from 'src/domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class UserRepository implements IUserRepository {
  private prisma: PrismaClient;
  private readonly logger: Logger = new Logger(UserRepository.name);

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(user: User): Promise<User> {
    const createdUser = await this.prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
      },
    });

    return new User(
      createdUser.id,
      createdUser.name,
      createdUser.email,
      createdUser.password,
      createdUser.created_at,
      createdUser.updated_at,
    );
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) return null;

    return new User(
      user.id,
      user.name,
      user.email,
      user.password,
      user.created_at,
      user.updated_at,
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) return null;

    return new User(
      user.id,
      user.name,
      user.email,
      user.password,
      user.created_at,
      user.updated_at,
    );
  }

  async findAll(): Promise<User[]> {
    try {
      const users = await this.prisma.user.findMany();

      return users.map(
        (user) =>
          new User(
            user.id,
            user.name,
            user.email,
            user.password,
            user.created_at,
            user.updated_at,
          ),
      );
    } catch (error) {
      this.logger.error('Erro ao buscar usuários:', error);
      throw error;
    }
  }

  async update(user: User): Promise<User> {
    try {
      const updatedUser = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          name: user.name,
          email: user.email,
          password: user.password,
          updated_at: new Date(),
        },
      });

      return new User(
        updatedUser.id,
        updatedUser.name,
        updatedUser.email,
        updatedUser.password,
        updatedUser.created_at,
        updatedUser.updated_at,
      );
    } catch (error) {
      this.logger.error(`Erro ao atualizar usuário com ID ${user.id}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      this.logger.error(`Erro ao excluir usuário com ID ${id}:`, error);
      throw error;
    }
  }
}