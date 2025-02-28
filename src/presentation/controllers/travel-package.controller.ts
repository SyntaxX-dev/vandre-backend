import {
  Controller,
  Post,
  Body,
  Injectable,
  HttpCode,
  HttpStatus,
  Param,
  NotFoundException,
  Get,
} from '@nestjs/common';
import { TravelPackageRepository } from '../../infrastructure/repositories/travel-package.repository';
import { CreateTravelPackageUseCase } from 'src/application/usecases/create-travel-package.use-case';
import { CreateTravelPackageDto } from 'src/application/dtos/create-travel-package.dto';
import {
  ApiOperation,
  ApiTags,
  ApiBody,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { GetAllTravelPackagesUseCase } from 'src/application/usecases/get-all-travel-package.use-case';
import { GetTravelPackageByIdUseCase } from 'src/application/usecases/get-travel-package-by-id.use-case';

@ApiTags('travel-packages')
@Controller('travel-packages')
@Injectable()
export class TravelPackageController {
  private readonly createTravelPackageUseCase: CreateTravelPackageUseCase;
  private readonly getAllTravelPackagesUseCase: GetAllTravelPackagesUseCase;
  private readonly getTravelPackageByIdUseCase: GetTravelPackageByIdUseCase;

  constructor(
    private readonly travelPackageRepository: TravelPackageRepository,
  ) {
    this.createTravelPackageUseCase = new CreateTravelPackageUseCase(
      this.travelPackageRepository,
    );
    this.getAllTravelPackagesUseCase = new GetAllTravelPackagesUseCase(
      this.travelPackageRepository,
    );
    this.getTravelPackageByIdUseCase = new GetTravelPackageByIdUseCase(
      this.travelPackageRepository,
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
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lista todos os pacotes de viagem' })
  @ApiResponse({
    status: 200,
    description: 'Lista de pacotes de viagem retornada com sucesso',
    schema: {
      example: [
        {
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
      ],
    },
  })
  async findAll() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await this.getAllTravelPackagesUseCase.execute();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Busca um pacote de viagem pelo ID' })
  @ApiParam({
    name: 'id',
    description: 'ID do pacote de viagem',
    example: '1675938274892',
  })
  @ApiResponse({
    status: 200,
    description: 'Pacote de viagem encontrado com sucesso',
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
  @ApiResponse({
    status: 404,
    description: 'Pacote de viagem não encontrado',
  })
  async findById(@Param('id') id: string) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return await this.getTravelPackageByIdUseCase.execute(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw error;
    }
  }
}
