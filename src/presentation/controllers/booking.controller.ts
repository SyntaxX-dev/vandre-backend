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
  BadRequestException,
} from '@nestjs/common';
import { BookingRepository } from '../../infrastructure/repositories/booking.repository';
import { TravelPackageRepository } from '../../infrastructure/repositories/travel-package.repository';
import { CreateBookingUseCase } from 'src/application/usecases/create-booking.use-case';
import { CreateBookingDto } from 'src/application/dtos/create-booking.dto';
import {
  ApiOperation,
  ApiTags,
  ApiBody,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { Types } from 'mongoose';

interface BookingResponseDto {
  id: string;
  travelPackageId: string;
  userId: string;
  fullName: string;
  rg: string;
  cpf: string;
  birthDate: Date;
  phone: string;
  email: string;
  boardingLocation: string;
  created_at: Date;
  updated_at: Date;
}

@ApiTags('bookings')
@Controller('bookings')
@Injectable()
export class BookingController {
  private readonly createBookingUseCase: CreateBookingUseCase;

  private readonly anonymousUserId = new Types.ObjectId().toString();

  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly travelPackageRepository: TravelPackageRepository,
  ) {
    this.createBookingUseCase = new CreateBookingUseCase(
      this.bookingRepository,
      this.travelPackageRepository,
    );
  }

  @Post()
  @ApiOperation({ summary: 'Cria uma reserva para um pacote de viagem' })
  @ApiBody({
    type: CreateBookingDto,
    description: 'Dados para criação da reserva',
  })
  @ApiResponse({
    status: 201,
    description: 'Reserva criada com sucesso',
    schema: {
      example: {
        id: '507f1f77bcf86cd799439011',
        travelPackageId: '507f1f77bcf86cd799439022',
        userId: '507f1f77bcf86cd799439033',
        fullName: 'João Silva',
        rg: '12.345.678-9',
        cpf: '123.456.789-00',
        birthDate: '1990-01-01T00:00:00.000Z',
        phone: '(11) 98765-4321',
        email: 'joao.silva@example.com',
        boardingLocation: 'Terminal Tietê - 08:00',
        created_at: '2024-03-08T10:00:00.000Z',
        updated_at: '2024-03-08T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou não há mais vagas disponíveis',
  })
  @ApiResponse({
    status: 404,
    description: 'Pacote de viagem não encontrado',
  })
  async create(
    @Body() createBookingDto: CreateBookingDto,
  ): Promise<BookingResponseDto> {
    try {
      const travelPackage = await this.travelPackageRepository.findById(
        createBookingDto.travelPackageId,
      );
      if (!travelPackage) {
        throw new NotFoundException('Pacote de viagem não encontrado');
      }

      if (
        !travelPackage.boardingLocations.includes(
          createBookingDto.boardingLocation,
        )
      ) {
        throw new BadRequestException(
          `Local de embarque "${createBookingDto.boardingLocation}" não disponível para este pacote. Locais disponíveis: ${travelPackage.boardingLocations.join(', ')}`,
        );
      }

      const generatedUserId = new Types.ObjectId().toString();

      return await this.createBookingUseCase.execute(
        generatedUserId,
        createBookingDto,
      );
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Erro ao criar reserva:', error);
      throw new BadRequestException(error.message || 'Erro ao criar reserva');
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lista todas as reservas' })
  @ApiResponse({
    status: 200,
    description: 'Lista de reservas retornada com sucesso',
  })
  async findAll(): Promise<BookingResponseDto[]> {
    return await this.bookingRepository.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Busca uma reserva pelo ID' })
  @ApiParam({
    name: 'id',
    description: 'ID da reserva',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Reserva encontrada com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Reserva não encontrada',
  })
  async findById(@Param('id') id: string): Promise<BookingResponseDto> {
    const booking = await this.bookingRepository.findById(id);
    if (!booking) {
      throw new NotFoundException('Reserva não encontrada');
    }

    return booking;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancela uma reserva' })
  @ApiParam({
    name: 'id',
    description: 'ID da reserva a ser cancelada',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 204,
    description: 'Reserva cancelada com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Reserva não encontrada',
  })
  async cancel(@Param('id') id: string): Promise<void> {
    const booking = await this.bookingRepository.findById(id);
    if (!booking) {
      throw new NotFoundException('Reserva não encontrada');
    }

    await this.bookingRepository.delete(id);
  }
}
