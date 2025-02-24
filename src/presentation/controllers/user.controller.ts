import {
  Controller,
  Post,
  Body,
  Injectable,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { CreateUserUseCase } from 'src/application/usecases/create-user.use-case';
import type { CreateUserDto } from 'src/application/dtos/create-user.dto';
import { ApiOperation, ApiTags, ApiBody, ApiResponse } from '@nestjs/swagger';
import { GetAllUsersUseCase } from 'src/application/usecases/get-all-users.use-case';

@ApiTags('users')
@Controller('users')
@Injectable()
export class UserController {
  private createUserUseCase: CreateUserUseCase;
  private readonly getAllUsersUseCase: GetAllUsersUseCase;

  constructor(private readonly userRepository: UserRepository) {
    this.createUserUseCase = new CreateUserUseCase(userRepository);
    this.getAllUsersUseCase = new GetAllUsersUseCase(userRepository);
  }

  @Post()
  @ApiOperation({ summary: 'Cria um usuário' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name', 'email', 'password'],
      properties: {
        name: {
          type: 'string',
          example: 'John Doe',
          description: 'Nome do usuário',
        },
        email: {
          type: 'string',
          example: 'john.doe@example.com',
          description: 'Email do usuário',
        },
        password: {
          type: 'string',
          example: '123456',
          description: 'Senha do usuário (mínimo 6 caracteres)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Usuário criado com sucesso',
    schema: {
      example: {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: '123456',
        created_at: '2024-02-23T10:00:00.000Z',
        updated_at: '2024-02-23T10:00:00.000Z',
      },
    },
  })
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.createUserUseCase.execute(createUserDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lista todos os usuários' })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários retornada com sucesso',
    schema: {
      example: [
        {
          id: '507f1f77bcf86cd799439011',
          name: 'John Doe',
          email: 'john.doe@example.com',
          password: '123456',
          created_at: '2024-02-23T10:00:00.000Z',
          updated_at: '2024-02-23T10:00:00.000Z',
        },
      ],
    },
  })
  async findAll() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await this.getAllUsersUseCase.execute();
  }
}
