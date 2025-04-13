import {
  Controller,
  Post,
  Body,
  Injectable,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  NotFoundException,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { CreateUserUseCase } from 'src/application/usecases/create-user.use-case';
import type { CreateUserDto } from 'src/application/dtos/create-user.dto';
import {
  ApiOperation,
  ApiTags,
  ApiBody,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GetAllUsersUseCase } from 'src/application/usecases/get-all-users.use-case';
import { UpdateUserDto } from 'src/application/dtos/update-user.dto';
import { UpdateUserUseCase } from 'src/application/usecases/update-user.use-case';
import { DeleteUserUseCase } from 'src/application/usecases/delete-user.use-case';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('users')
@Controller('users')
@Injectable()
export class UserController {
  private createUserUseCase: CreateUserUseCase;
  private readonly getAllUsersUseCase: GetAllUsersUseCase;
  private readonly updateUserUseCase: UpdateUserUseCase;
  private readonly deleteUserUseCase: DeleteUserUseCase;

  constructor(private readonly userRepository: UserRepository) {
    this.createUserUseCase = new CreateUserUseCase(userRepository);
    this.getAllUsersUseCase = new GetAllUsersUseCase(userRepository);
    this.updateUserUseCase = new UpdateUserUseCase(userRepository);
    this.deleteUserUseCase = new DeleteUserUseCase(userRepository);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
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
        created_at: '2024-02-23T10:00:00.000Z',
        updated_at: '2024-02-23T10:00:00.000Z',
      },
    },
  })
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.createUserUseCase.execute(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
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
          created_at: '2024-02-23T10:00:00.000Z',
          updated_at: '2024-02-23T10:00:00.000Z',
        },
      ],
    },
  })
  async findAll() {
    return await this.getAllUsersUseCase.execute();
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Atualiza um usuário' })
  @ApiParam({
    name: 'id',
    description: 'ID do usuário a ser atualizado',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({
    type: UpdateUserDto,
    description: 'Dados a serem atualizados no usuário',
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          example: 'John Updated',
          description: 'Nome atualizado do usuário',
        },
        email: {
          type: 'string',
          example: 'john.updated@example.com',
          description: 'Email atualizado do usuário',
        },
        password: {
          type: 'string',
          example: 'newpassword',
          description: 'Senha atualizada do usuário (mínimo 6 caracteres)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Usuário atualizado com sucesso',
    schema: {
      example: {
        id: '507f1f77bcf86cd799439011',
        name: 'John Updated',
        email: 'john.updated@example.com',
        created_at: '2024-02-23T10:00:00.000Z',
        updated_at: '2024-02-23T11:15:30.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
  })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    try {
      return await this.updateUserUseCase.execute(id, updateUserDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw error;
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Exclui um usuário' })
  @ApiParam({
    name: 'id',
    description: 'ID do usuário a ser excluído',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 204,
    description: 'Usuário excluído com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
  })
  async delete(@Param('id') id: string) {
    try {
      await this.deleteUserUseCase.execute(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw error;
    }
  }
}