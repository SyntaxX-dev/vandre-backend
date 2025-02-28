import {
  Controller,
  Post,
  Body,
  Injectable,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TravelPackageRepository } from '../../infrastructure/repositories/travel-package.repository';
import { CreateTravelPackageUseCase } from 'src/application/usecases/create-travel-package.use-case';
import { CreateTravelPackageDto } from 'src/application/dtos/create-travel-package.dto';
import { ApiOperation, ApiTags, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('travel-packages')
@Controller('travel-packages')
@Injectable()
export class TravelPackageController {
  private createTravelPackageUseCase: CreateTravelPackageUseCase;

  constructor(
    private readonly travelPackageRepository: TravelPackageRepository,
  ) {
    this.createTravelPackageUseCase = new CreateTravelPackageUseCase(
      travelPackageRepository,
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cria um novo pacote de viagem' })
  @ApiBody({
    type: CreateTravelPackageDto,
    description: 'Dados para criação do pacote de viagem',
  })
  @ApiResponse({
    status: 201,
    description: 'Pacote de viagem criado com sucesso',
    schema: {
      example: {
        id: '1675938274892',
        name: 'Praia de Maragogi',
        price: 1499.99,
        description:
          'Uma incrível viagem para as praias paradisíacas de Maragogi...',
        imageUrl: 'https://example.com/images/maragogi.jpg',
        pdfUrl: 'https://example.com/pdf/maragogi-itinerary.pdf',
        maxPeople: 20,
        created_at: '2024-02-23T10:00:00.000Z',
        updated_at: '2024-02-23T10:00:00.000Z',
      },
    },
  })
  async create(@Body() createTravelPackageDto: CreateTravelPackageDto) {
    return await this.createTravelPackageUseCase.execute(
      createTravelPackageDto,
    );
  }
}
