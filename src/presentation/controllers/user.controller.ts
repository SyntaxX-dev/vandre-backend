import { Controller, Post, Body } from '@nestjs/common';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { CreateUserUseCase } from 'src/application/usecases/create-user.use-case';
import type { CreateUserDto } from 'src/application/dtos/create-user.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UserController {
  private createUserUseCase: CreateUserUseCase;

  constructor() {
    const userRepository = new UserRepository();
    this.createUserUseCase = new CreateUserUseCase(userRepository);
  }

  @Post()
  @ApiOperation({ summary: 'Cria um usuário' })
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.createUserUseCase.execute(createUserDto);
  }
}
