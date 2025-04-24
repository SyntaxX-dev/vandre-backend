import type { ITravelPackageRepository } from 'src/domain/repositories/travel-package.repository.interface';
import type { CreateTravelPackageDto } from '../dtos/create-travel-package.dto';
import { TravelPackage } from 'src/domain/entities/travelPackage.entity';
import { S3 } from 'aws-sdk';
import { BadRequestException, Logger, Inject, forwardRef } from '@nestjs/common';
import * as sharp from 'sharp';
import { AsyncUploadService } from '../../infrastructure/services/async-upload.service';
import * as crypto from 'crypto';

export class CreateTravelPackageUseCase {
  private readonly logger = new Logger(CreateTravelPackageUseCase.name);
  private readonly s3: S3;
  private readonly asyncUploadService: AsyncUploadService;

  constructor(
    private readonly travelPackageRepository: ITravelPackageRepository,
    asyncUploadService?: AsyncUploadService
  ) {
    // Inicializar o cliente S3 no construtor para reutilização
    this.s3 = new S3({
      region: process.env.AWS_REGION || 'sa-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      httpOptions: {
        timeout: 300000,
        connectTimeout: 5000
      },
      maxRetries: 3
    });

    // Se o serviço não foi injetado, crie uma nova instância
    this.asyncUploadService = asyncUploadService || new AsyncUploadService();
  }

  async execute(
    dto: CreateTravelPackageDto,
    imageBuffer: Buffer,
    pdfBuffer?: Buffer,
  ): Promise<TravelPackage> {
    const now = new Date();
    const startTime = Date.now();
    this.logger.log(`Iniciando criação do pacote de viagem: ${dto.name}`);

    try {
      // Validação do DTO
      this.validateDto(dto);
      const sanitizedName = this.sanitizeFileName(dto.name);
      
      // Otimizar a imagem
      const optimizedImageBuffer = await this.optimizeImage(imageBuffer);
      
      // Upload da imagem (este arquivo é menor e pode ser feito de forma síncrona)
      const imageKey = `travel-packages/images/${Date.now()}-${sanitizedName}.jpg`;
      const imageUploadResult = await this.s3.upload({
        Bucket: process.env.AWS_BUCKET_NAME || 'vandre-aws',
        Key: imageKey,
        Body: optimizedImageBuffer,
        ContentType: 'image/jpeg',
      }).promise();
      
      let finalPdfUrl: string;
      
      if (dto.hasPdfFile && pdfBuffer) {
        // Verifica tamanho máximo
        if (pdfBuffer.length > 50 * 1024 * 1024) { // 50MB
          throw new BadRequestException('O arquivo PDF é muito grande. O tamanho máximo permitido é 50MB.');
        }
        
        // Gera um nome único para o PDF baseado em um timestamp e um hash
        const timestamp = Date.now();
        const hash = crypto.createHash('md5').update(sanitizedName + timestamp).digest('hex').substring(0, 8);
        const pdfKey = `travel-packages/pdfs/${timestamp}-${hash}-${sanitizedName}.pdf`;
        
        // Calcula a URL final sem fazer o upload agora
        finalPdfUrl = this.asyncUploadService.generateS3Url(pdfKey);
        
        // Coloca o PDF na fila para upload assíncrono
        await this.asyncUploadService.queueUpload(pdfBuffer, 'application/pdf', pdfKey);
        
        this.logger.log(`PDF agendado para upload assíncrono: ${pdfKey}`);
      } else if (dto.pdfUrl) {
        finalPdfUrl = dto.pdfUrl;
      } else {
        throw new BadRequestException('É necessário fornecer um link para o PDF ou fazer upload do arquivo');
      }
      
      // Cria o objeto do pacote de viagem
      const travelPackage = new TravelPackage(
        '',
        dto.name,
        dto.price,
        dto.description,
        imageUploadResult.Location,
        finalPdfUrl,
        dto.maxPeople,
        Array.isArray(dto.boardingLocations) ? dto.boardingLocations : [dto.boardingLocations],
        dto.travelMonth,
        now,
        now,
        dto.travelDate,
        dto.returnDate,
        dto.travelTime,
      );
      
      // Salva no banco de dados
      const result = await this.travelPackageRepository.create(travelPackage);
      
      const totalTime = Date.now() - startTime;
      this.logger.log(`Pacote de viagem criado em ${totalTime}ms: ${dto.name}`);
      
      return result;
    } catch (error) {
      const totalTime = Date.now() - startTime;
      this.logger.error(`Erro ao criar pacote de viagem (${totalTime}ms): ${error.message}`, error.stack);
      throw error;
    }
  }

  // Métodos auxiliares
  
  private async optimizeImage(imageBuffer: Buffer): Promise<Buffer> {
    try {
      return await sharp(imageBuffer)
        .resize(800, null, { 
          withoutEnlargement: true
        })
        .jpeg({ 
          quality: 70,
          progressive: true
        })
        .toBuffer();
    } catch (error) {
      this.logger.warn(`Falha ao otimizar imagem: ${error.message}`);
      return imageBuffer;
    }
  }

  private validateDto(dto: CreateTravelPackageDto): void {
    if (!dto.name || dto.name.trim() === '') {
      throw new BadRequestException('Nome do pacote de viagem é obrigatório');
    }
    
    if (!dto.price || dto.price <= 0) {
      throw new BadRequestException('Preço deve ser maior que zero');
    }
  }

  private sanitizeFileName(name: string): string {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .substring(0, 50);
  }
}