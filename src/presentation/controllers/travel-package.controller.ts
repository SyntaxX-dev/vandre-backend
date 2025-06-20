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
  UploadedFiles,
  HttpException,
  UseInterceptors,
  Res,
  Query,
  UseGuards,
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
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GetAllTravelPackagesUseCase } from 'src/application/usecases/get-all-travel-package.use-case';
import { GetTravelPackageByIdUseCase } from 'src/application/usecases/get-travel-package-by-id.use-case';
import { UpdateTravelPackageDto } from 'src/application/dtos/update-travel-package.dto';
import { UpdateTravelPackageUseCase } from 'src/application/usecases/update-travel-package.use-case';
import { DeleteTravelPackageUseCase } from 'src/application/usecases/delete-travel-package.use-case';
import { TravelPackage } from 'src/domain/entities/travelPackage.entity';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { FilterTravelPackagesUseCase } from 'src/application/usecases/filter-travel-package.use-case';
import type { FilterTravelPackagesDto } from 'src/application/dtos/filter-travel-package.dto';
import type { PaginationResponse } from 'src/domain/repositories/pagination.repository.interface';
import type { SortBy, SortOrder } from 'src/domain/repositories/travel-package.repository.interface';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

export interface TravelPackageResponseDto {
  id: string;
  name: string;
  price: number;
  description: string;
  pdfUrl: string;
  maxPeople: number;
  boardingLocations?: string[] | string;
  travelMonth: string;
  travelDate?: string | null;
  returnDate?: string | null;
  travelTime?: string | null;
  created_at: Date;
  updated_at: Date;
  imageUrl?: string | null;
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
  @ApiOperation({ summary: 'Filtra pacotes de viagem por mês com paginação e ordenação' })
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
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'Campo para ordenação',
    enum: ['travelDate', 'created_at', 'name', 'price'],
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Direção da ordenação',
    enum: ['asc', 'desc'],
  })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de pacotes de viagem retornada com sucesso, ordenada conforme solicitado',
  })
  async filter(
    @Query('month') month?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: SortBy,
    @Query('sortOrder') sortOrder?: SortOrder,
  ): Promise<PaginationResponse<TravelPackageResponseDto>> {
    const filterDto: FilterTravelPackagesDto = {
      month: month,
      page: page || 1,
      limit: limit || 10,
      sortBy: sortBy || 'travelDate',
      sortOrder: sortOrder || 'asc',
    };

    const result = await this.filterTravelPackagesUseCase.execute(
      filterDto,
      filterDto.sortBy,
      filterDto.sortOrder,
    );

    const transformedData = result.data.map((pkg) =>
      this.transformResponse(pkg),
    );

    return {
      data: transformedData,
      meta: result.meta,
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileFieldsInterceptor(
    [
      { name: 'image', maxCount: 1 },
      { name: 'pdf', maxCount: 1 }
    ],
    {
      limits: {
        fileSize: 15 * 1024 * 1024, // 15 MB por arquivo
      },
      fileFilter: (req, file, cb) => {
        if (file.fieldname === 'image') {
          // Aceitar apenas imagens
          if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
            return cb(new HttpException('Formato de imagem não suportado', HttpStatus.BAD_REQUEST), false);
          }
        } else if (file.fieldname === 'pdf') {
          // Aceitar apenas PDFs
          if (file.mimetype !== 'application/pdf') {
            return cb(new HttpException('Apenas arquivos PDF são permitidos', HttpStatus.BAD_REQUEST), false);
          }
        }
        cb(null, true);
      }
    }
  ))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Dados do pacote de viagem com imagem e opcionalmente PDF',
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
          description: 'Link para o PDF com detalhes da viagem (obrigatório se não enviar arquivo)',
        },
        hasPdfFile: {
          type: 'boolean',
          example: false,
          description: 'Indica se está enviando um arquivo PDF',
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
          example: 'Janeiro',
          description: 'Mês da viagem',
        },
        travelDate: {
          type: 'string',
          example: '15/03/2025',
          description: 'Data da viagem no formato dia/mês/ano (opcional)',
        },
        returnDate: {
          type: 'string',
          example: '20/03/2025',
          description: 'Data de retorno da viagem no formato dia/mês/ano (opcional)',
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
        pdf: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo PDF a ser enviado (opcional, alternativa ao pdfUrl)',
        },
      },
      required: [
        'name',
        'price',
        'description',
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
    @UploadedFiles() files: { image?: Express.Multer.File[], pdf?: Express.Multer.File[] },
    @Body() createDto: CreateTravelPackageDto,
  ): Promise<TravelPackageResponseDto> {
    // Verificação da imagem
    if (!files.image || files.image.length === 0) {
      throw new HttpException(
        'O arquivo de imagem é obrigatório',
        HttpStatus.BAD_REQUEST,
      );
    }
    
    // Validação para o PDF (ou URL ou arquivo)
    if (createDto.hasPdfFile && (!files.pdf || files.pdf.length === 0)) {
      throw new HttpException(
        'O arquivo PDF é obrigatório quando hasPdfFile é true',
        HttpStatus.BAD_REQUEST,
      );
    }
    
    if (!createDto.hasPdfFile && !createDto.pdfUrl) {
      throw new HttpException(
        'É necessário fornecer um link para o PDF ou fazer upload do arquivo',
        HttpStatus.BAD_REQUEST,
      );
    }
    
    // Converte boardingLocations para array se necessário
    if (typeof createDto.boardingLocations === 'string') {
      createDto.boardingLocations = [createDto.boardingLocations];
    } else if (!createDto.boardingLocations) {
      createDto.boardingLocations = [];
    }

    const pdfBuffer = files.pdf && files.pdf.length > 0 ? files.pdf[0].buffer : undefined;

    const travelPackage = await this.createTravelPackageUseCase.execute(
      createDto,
      files.image[0].buffer,
      pdfBuffer,
    );
    
    return this.transformResponse(travelPackage);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lista todos os pacotes de viagem com ordenação' })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'Campo para ordenação',
    enum: ['travelDate', 'created_at', 'name', 'price'],
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Direção da ordenação',
    enum: ['asc', 'desc'],
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de pacotes de viagem retornada com sucesso, ordenada conforme solicitado',
    schema: {
      example: [
        {
          id: '1675938274892',
          name: 'Praia de Maragogi',
          price: 1499.99,
          description:
            'Uma incrível viagem para as praias paradisíacas de Maragogi...',
          imageUrl: '/travel-packages/1675938274892/image',
          pdfUrl: 'https://vandre-aws.s3.sa-east-1.amazonaws.com/travel-packages/pdfs/1675938274892-praia-de-maragogi.pdf',
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
  async findAll(
    @Query('sortBy') sortBy?: SortBy,
    @Query('sortOrder') sortOrder?: SortOrder,
  ): Promise<TravelPackageResponseDto[]> {
    const packages = await this.getAllTravelPackagesUseCase.execute(
      sortBy || 'travelDate',
      sortOrder || 'asc',
    );
    
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
        imageUrl: 'https://vandre-aws.s3.sa-east-1.amazonaws.com/travel-packages/images/1675938274892-praia-de-maragogi.jpg',
        pdfUrl: 'https://vandre-aws.s3.sa-east-1.amazonaws.com/travel-packages/pdfs/1675938274892-praia-de-maragogi.pdf',
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Atualiza um pacote de viagem' })
  @ApiParam({
    name: 'id',
    description: 'ID do pacote de viagem a ser atualizado',
    example: '1675938274892',
  })
  @UseInterceptors(FileFieldsInterceptor(
    [
      { name: 'image', maxCount: 1 },
      { name: 'pdf', maxCount: 1 }
    ],
    {
      limits: {
        fileSize: 15 * 1024 * 1024, // 15 MB por arquivo
      },
      fileFilter: (req, file, cb) => {
        if (file.fieldname === 'image') {
          // Aceitar apenas imagens
          if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
            return cb(new HttpException('Formato de imagem não suportado', HttpStatus.BAD_REQUEST), false);
          }
        } else if (file.fieldname === 'pdf') {
          // Aceitar apenas PDFs
          if (file.mimetype !== 'application/pdf') {
            return cb(new HttpException('Apenas arquivos PDF são permitidos', HttpStatus.BAD_REQUEST), false);
          }
        }
        cb(null, true);
      }
    }
  ))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { 
          type: 'string', 
          example: 'Praia de Maragogi',
          description: 'Nome do pacote de viagem' 
        },
        price: { 
          type: 'number', 
          example: 1499.99,
          description: 'Preço da viagem em reais' 
        },
        description: {
          type: 'string',
          example: 'Uma incrível viagem para as praias paradisíacas de Maragogi...',
          description: 'Descrição detalhada do pacote de viagem'
        },
        pdfUrl: {
          type: 'string',
          example: 'https://example.com/pdf/maragogi-itinerary.pdf',
          description: 'Link para o PDF com detalhes da viagem (obrigatório se não enviar arquivo)'
        },
        hasPdfFile: {
          type: 'boolean',
          example: false,
          description: 'Indica se está enviando um arquivo PDF'
        },
        maxPeople: { 
          type: 'number', 
          example: 20,
          description: 'Número máximo de pessoas para a viagem' 
        },
        boardingLocations: {
          type: 'array',
          items: { type: 'string' },
          example: ['Terminal Tietê - 08:00', 'Metrô Tatuapé - 08:30'],
          description: 'Locais de embarque'
        },
        travelMonth: { 
          type: 'string', 
          example: 'Março',
          description: 'Mês da viagem' 
        },
        travelDate: {
          type: 'string',
          example: '15/03/2025',
          description: 'Data da viagem no formato dia/mês/ano'
        },
        returnDate: {
          type: 'string',
          example: '20/03/2025',
          description: 'Data de retorno da viagem no formato dia/mês/ano'
        },
        travelTime: {
          type: 'string',
          example: '08:00',
          description: 'Horário da viagem'
        },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo da imagem a ser enviado (opcional)'
        },
        pdf: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo PDF a ser enviado (opcional)'
        }
      }
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
        imageUrl: 'https://vandre-aws.s3.sa-east-1.amazonaws.com/travel-packages/images/1675938274892-praia-de-maragogi-atualizado.jpg',
        pdfUrl: 'https://vandre-aws.s3.sa-east-1.amazonaws.com/travel-packages/pdfs/1675938274892-praia-de-maragogi-atualizado.pdf',
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
    @UploadedFiles() files: { image?: Express.Multer.File[], pdf?: Express.Multer.File[] },
  ): Promise<TravelPackageResponseDto> {
    // Pré-processamento de boardingLocations
    if (typeof updateTravelPackageDto.boardingLocations === 'string') {
      updateTravelPackageDto.boardingLocations = (updateTravelPackageDto.boardingLocations as string)
        .split(',')
        .map(item => item.trim());;
    } else if (!updateTravelPackageDto.boardingLocations) {
      // Remove o campo se não for enviado, para evitar sobrescrever com undefined
      delete updateTravelPackageDto.boardingLocations;
    }
  
    const imageBuffer = files.image && files.image.length > 0 
      ? files.image[0].buffer 
      : undefined;
    
    const pdfBuffer = files.pdf && files.pdf.length > 0 
      ? files.pdf[0].buffer 
      : undefined;
    
    // Validação para o PDF (ou URL ou arquivo)
    if (updateTravelPackageDto.hasPdfFile && !pdfBuffer) {
      throw new HttpException(
        'O arquivo PDF é obrigatório quando hasPdfFile é true',
        HttpStatus.BAD_REQUEST,
      );
    }
    
    const updatedPackage = await this.updateTravelPackageUseCase.execute(
      id,
      updateTravelPackageDto,
      imageBuffer,
      pdfBuffer,
    );
    
    if (!updatedPackage) {
      throw new NotFoundException('Pacote de viagem não encontrado');
    }
    
    return this.transformResponse(updatedPackage);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
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

  @Get(':id/pdf')
  @ApiOperation({ summary: 'Baixar PDF do pacote de viagem' })
  @ApiResponse({
    status: 200,
    description: 'URL do PDF retornada com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Pacote de viagem ou PDF não encontrado',
  })
  async downloadPdf(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<any> {
    const travelPackage = await this.travelPackageRepository.findById(id);
    if (!travelPackage) {
      throw new NotFoundException('Pacote de viagem não encontrado');
    }
    if (!travelPackage.pdfUrl) {
      throw new NotFoundException(
        'PDF não encontrado para esse pacote de viagem',
      );
    }
    return res.json({ pdfUrl: travelPackage.pdfUrl });
  }

  private transformResponse(pkg: TravelPackage): TravelPackageResponseDto {
    const { imageUrl, ...data } = pkg;
    return {
      ...data,
      imageUrl: imageUrl || undefined,
    };
  }
}
