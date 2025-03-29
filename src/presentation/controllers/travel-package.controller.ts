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
  Put,
  Delete,
  UploadedFile,
  HttpException,
  UseInterceptors,
  Res,
  Query,
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
  ApiConsumes,
  ApiQuery,
} from '@nestjs/swagger';
import { GetAllTravelPackagesUseCase } from 'src/application/usecases/get-all-travel-package.use-case';
import { GetTravelPackageByIdUseCase } from 'src/application/usecases/get-travel-package-by-id.use-case';
import { UpdateTravelPackageDto } from 'src/application/dtos/update-travel-package.dto';
import { UpdateTravelPackageUseCase } from 'src/application/usecases/update-travel-package.use-case';
import { DeleteTravelPackageUseCase } from 'src/application/usecases/delete-travel-package.use-case';
import { TravelPackage } from 'src/domain/entities/travelPackage.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { FilterTravelPackagesUseCase } from 'src/application/usecases/filter-travel-package.use-case';
import type { FilterTravelPackagesDto } from 'src/application/dtos/filter-travel-package.dto';
import type { PaginationResponse } from 'src/domain/repositories/pagination.repository.interface';

export interface TravelPackageResponseDto {
  id: string;
  name: string;
  price: number;
  description: string;
  pdfUrl: string;
  maxPeople: number;
  boardingLocations: string[];
  travelMonth: string;
  travelDate?: string | null;
  travelTime?: string | null;
  created_at: Date;
  updated_at: Date;
  imageUrl?: string;
}

@ApiTags('travel-packages')
@Controller('travel-packages')
@Injectable()
export class TravelPackageController {
  private readonly createTravelPackageUseCase: CreateTravelPackageUseCase;
  private readonly getAllTravelPackagesUseCase: GetAllTravelPackagesUseCase;
  private readonly getTravelPackageByIdUseCase: GetTravelPackageByIdUseCase;
  private readonly updateTravelPackageUseCase: UpdateTravelPackageUseCase;
  private readonly deleteTravelPackageUseCase: DeleteTravelPackageUseCase;
  private readonly filterTravelPackagesUseCase: FilterTravelPackagesUseCase;

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
    this.updateTravelPackageUseCase = new UpdateTravelPackageUseCase(
      this.travelPackageRepository,
    );
    this.deleteTravelPackageUseCase = new DeleteTravelPackageUseCase(
      this.travelPackageRepository,
    );
    this.filterTravelPackagesUseCase = new FilterTravelPackagesUseCase(
      this.travelPackageRepository,
    );
  }
  @Get('filter')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Filtra pacotes de viagem por mês com paginação' })
  @ApiQuery({
    name: 'month',
    required: false,
    description: 'Nome do mês para filtrar (ex: Janeiro)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número da página',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Itens por página',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de pacotes de viagem retornada com sucesso',
  })
  async filter(
    @Query('month') month?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<PaginationResponse<TravelPackageResponseDto>> {
    let processedMonth = month;

    if (processedMonth && processedMonth.includes('/')) {
      processedMonth = processedMonth.split('/')[0];
    }

    const filterDto: FilterTravelPackagesDto = {
      month: processedMonth,
      page: page || 1,
      limit: limit || 10,
    };

    const result = await this.filterTravelPackagesUseCase.execute(filterDto);

    const transformedData = result.data.map((pkg) =>
      this.transformResponse(pkg),
    );

    return {
      data: transformedData,
      meta: result.meta,
    };
  }

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Dados do pacote de viagem e imagem (campo "image")',
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          example: 'Praia de Maragogi',
          description: 'Nome do pacote de viagem',
        },
        price: {
          type: 'number',
          example: 1499.99,
          description: 'Preço da viagem em reais',
        },
        description: {
          type: 'string',
          example:
            'Uma incrível viagem para as praias paradisíacas de Maragogi...',
          description: 'Descrição detalhada do pacote de viagem',
        },
        pdfUrl: {
          type: 'string',
          example: 'https://example.com/pdf/maragogi-itinerary.pdf',
          description: 'Link para o PDF com detalhes da viagem',
        },
        maxPeople: {
          type: 'number',
          example: 20,
          description: 'Número máximo de pessoas para a viagem',
        },
        boardingLocations: {
          type: 'array',
          items: {
            type: 'string',
          },
          example: ['Terminal Tietê - 08:00', 'Metrô Tatuapé - 08:30'],
          description: 'Locais de embarque',
        },
        travelMonth: {
          type: 'string',
          example: 'Março',
          description: 'Mês da viagem',
        },
        travelDate: {
          type: 'string',
          example: '15/03/2025',
          description: 'Data da viagem no formato dia/mês/ano (opcional)',
        },
        travelTime: {
          type: 'string',
          example: '08:00',
          description: 'Horário da viagem (opcional)',
        },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo da imagem a ser enviado',
        },
      },
      required: [
        'name',
        'price',
        'description',
        'pdfUrl',
        'maxPeople',
        'boardingLocations',
        'image',
      ],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Pacote de viagem criado com sucesso',
    type: TravelPackage,
  })
  @ApiResponse({
    status: 400,
    description:
      'Requisição inválida. Verifique os dados enviados e se o arquivo de imagem foi informado.',
  })
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createDto: CreateTravelPackageDto,
  ): Promise<TravelPackageResponseDto> {
    if (!file) {
      throw new HttpException(
        'O arquivo de imagem é obrigatório',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (typeof createDto.boardingLocations === 'string') {
      createDto.boardingLocations = [createDto.boardingLocations];
    } else if (!createDto.boardingLocations) {
      createDto.boardingLocations = [];
    }

    const travelPackage = await this.createTravelPackageUseCase.execute(
      createDto,
      file.buffer,
    );
    return this.transformResponse(travelPackage);
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
          imageUrl: '/travel-packages/1675938274892/image',
          pdfUrl: 'https://example.com/pdf/maragogi-itinerary.pdf',
          maxPeople: 20,
          boardingLocations: [
            'Terminal Tietê - 08:00',
            'Metrô Tatuapé - 08:30',
          ],
          travelMonth: 'Março',
          travelDate: '15/03/2025',
          travelTime: '08:00',
          created_at: '2024-02-23T10:00:00.000Z',
          updated_at: '2024-02-23T10:00:00.000Z',
        },
      ],
    },
  })
  async findAll(): Promise<TravelPackageResponseDto[]> {
    const packages = await this.getAllTravelPackagesUseCase.execute();
    return packages.map((pkg) => this.transformResponse(pkg));
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
        imageUrl: '/travel-packages/1675938274892/image',
        pdfUrl: 'https://example.com/pdf/maragogi-itinerary.pdf',
        maxPeople: 20,
        boardingLocations: ['Terminal Tietê - 08:00', 'Metrô Tatuapé - 08:30'],
        travelMonth: 'Março',
        travelDate: '15/03/2025',
        travelTime: '08:00',
        created_at: '2024-02-23T10:00:00.000Z',
        updated_at: '2024-02-23T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Pacote de viagem não encontrado',
  })
  async findById(@Param('id') id: string): Promise<TravelPackageResponseDto> {
    const travelPackage = await this.getTravelPackageByIdUseCase.execute(id);
    if (!travelPackage) {
      throw new NotFoundException('Pacote de viagem não encontrado');
    }
    return this.transformResponse(travelPackage);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Atualiza um pacote de viagem' })
  @ApiParam({
    name: 'id',
    description: 'ID do pacote de viagem a ser atualizado',
    example: '1675938274892',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Praia de Maragogi' },
        price: { type: 'number', example: 1499.99 },
        description: {
          type: 'string',
          example:
            'Uma incrível viagem para as praias paradisíacas de Maragogi...',
        },
        pdfUrl: {
          type: 'string',
          example: 'https://example.com/pdf/maragogi-itinerary.pdf',
        },
        maxPeople: { type: 'number', example: 20 },
        boardingLocations: {
          type: 'array',
          items: { type: 'string' },
          example: ['Terminal Tietê - 08:00', 'Metrô Tatuapé - 08:30'],
        },
      },
      example: {
        name: 'Praia de Maragogi',
        price: 1499.99,
        description:
          'Uma incrível viagem para as praias paradisíacas de Maragogi...',
        pdfUrl: 'https://example.com/pdf/maragogi-itinerary.pdf',
        maxPeople: 20,
        boardingLocations: ['Terminal Tietê - 08:00', 'Metrô Tatuapé - 08:30'],
        travelMonth: 'Março',
        travelDate: '15/03/2025',
        travelTime: '08:00',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Pacote de viagem atualizado com sucesso',
    schema: {
      example: {
        id: '1675938274892',
        name: 'Praia de Maragogi Atualizado',
        price: 1599.99,
        description:
          'Uma incrível viagem para as praias paradisíacas de Maragogi com pacote atualizado...',
        imageUrl: '/travel-packages/1675938274892/image',
        pdfUrl: 'https://example.com/pdf/maragogi-itinerary-updated.pdf',
        maxPeople: 25,
        boardingLocations: [
          'Terminal Tietê - 07:30',
          'Metrô Tatuapé - 08:00',
          'Shopping Aricanduva - 08:30',
        ],
        created_at: '2024-02-23T10:00:00.000Z',
        updated_at: '2024-02-23T11:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Pacote de viagem não encontrado',
  })
  async update(
    @Param('id') id: string,
    @Body() updateTravelPackageDto: UpdateTravelPackageDto,
  ): Promise<TravelPackageResponseDto> {
    const updatedPackage = await this.updateTravelPackageUseCase.execute(
      id,
      updateTravelPackageDto,
    );
    if (!updatedPackage) {
      throw new NotFoundException('Pacote de viagem não encontrado');
    }
    return this.transformResponse(updatedPackage);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Exclui um pacote de viagem' })
  @ApiParam({
    name: 'id',
    description: 'ID do pacote de viagem a ser excluído',
    example: '1675938274892',
  })
  @ApiResponse({
    status: 204,
    description: 'Pacote de viagem excluído com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Pacote de viagem não encontrado',
  })
  async delete(@Param('id') id: string): Promise<void> {
    await this.deleteTravelPackageUseCase.execute(id);
  }

  @Get(':id/image')
  @ApiOperation({ summary: 'Baixar imagem do pacote de viagem' })
  @ApiResponse({
    status: 200,
    description: 'Imagem retornada com sucesso',
    content: { 'image/jpeg': {} },
  })
  @ApiResponse({
    status: 404,
    description: 'Pacote de viagem ou imagem não encontrada',
  })
  async downloadImage(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<any> {
    const travelPackage = await this.travelPackageRepository.findById(id);
    if (!travelPackage) {
      throw new NotFoundException('Pacote de viagem não encontrado');
    }
    if (!travelPackage.imageUrl) {
      throw new NotFoundException(
        'Imagem não encontrada para esse pacote de viagem',
      );
    }
    return res.json({ imageUrl: travelPackage.imageUrl });
  }

  private transformResponse(pkg: TravelPackage): TravelPackageResponseDto {
    const { imageUrl, ...data } = pkg;
    return {
      ...data,
      imageUrl: imageUrl,
    };
  }
}
