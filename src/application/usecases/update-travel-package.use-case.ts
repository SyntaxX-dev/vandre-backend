import { NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import type { ITravelPackageRepository } from 'src/domain/repositories/travel-package.repository.interface';
import type { UpdateTravelPackageDto } from '../dtos/update-travel-package.dto';
import { TravelPackage } from 'src/domain/entities/travelPackage.entity';
import { S3 } from 'aws-sdk';
import * as sharp from 'sharp';
import { PdfOptimizerService } from '../../infrastructure/services/pdf-optimizer.service';

export class UpdateTravelPackageUseCase {
  private readonly logger = new Logger(UpdateTravelPackageUseCase.name);
  private readonly s3: S3;
  private readonly pdfOptimizer: PdfOptimizerService;

  constructor(
    private readonly travelPackageRepository: ITravelPackageRepository,
  ) {
    this.s3 = new S3({
      region: process.env.AWS_REGION || 'sa-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      httpOptions: {
        timeout: 10000,
        connectTimeout: 5000
      },
      maxRetries: 3
    });
    
    this.pdfOptimizer = new PdfOptimizerService();
  }

  async execute(
    id: string,
    dto: UpdateTravelPackageDto,
    imageBuffer?: Buffer,
    pdfBuffer?: Buffer,
  ): Promise<TravelPackage> {
    const startTime = Date.now();
    this.logger.log(`Iniciando atualização do pacote de viagem com ID: ${id}`);

    try {
      // Verificação rápida do PDF
      if (pdfBuffer && pdfBuffer.length > 15 * 1024 * 1024) {
        throw new BadRequestException('O arquivo PDF é muito grande. O tamanho máximo permitido é 15MB.');
      }

      // Buscar o pacote existente
      const existingPackage = await this.travelPackageRepository.findById(id);
      if (!existingPackage) {
        throw new NotFoundException(`Pacote de viagem com ID ${id} não encontrado`);
      }

      // Preparar dados
      const name = dto.name || existingPackage.name;
      const sanitizedName = this.sanitizeFileName(name);
      
      // Processar imagem e PDF em paralelo (se necessário)
      const imagePromise = imageBuffer ? this.optimizeImage(imageBuffer) : Promise.resolve(null);
      const pdfPromise = pdfBuffer ? this.pdfOptimizer.optimizePdf(pdfBuffer) : Promise.resolve(null);
      
      const [optimizedImageBuffer, optimizedPdfBuffer] = await Promise.all([imagePromise, pdfPromise]);
      
      // Upload da imagem otimizada (se necessário)
      let updatedImageUrl = existingPackage.imageUrl;
      if (optimizedImageBuffer) {
        const imageKey = `travel-packages/images/${Date.now()}-${sanitizedName}.jpg`;
        const uploadResult = await this.uploadFile({
          Bucket: process.env.AWS_BUCKET_NAME || 'vandre-aws',
          Key: imageKey,
          Body: optimizedImageBuffer,
          ContentType: 'image/jpeg',
        });
        updatedImageUrl = uploadResult.Location;
      }
      
      // Upload do PDF otimizado (se necessário)
      let updatedPdfUrl = existingPackage.pdfUrl;
      if (dto.hasPdfFile && optimizedPdfBuffer) {
        // Log do tamanho antes e depois da otimização
        if (pdfBuffer) {
          this.logger.log(
            `Tamanho do PDF: Original=${pdfBuffer.length / 1024} KB, ` +
            `Otimizado=${optimizedPdfBuffer.length / 1024} KB, ` +
            `Redução=${((1 - optimizedPdfBuffer.length / pdfBuffer.length) * 100).toFixed(2)}%`
          );
        }
        
        const pdfKey = `travel-packages/pdfs/${Date.now()}-${sanitizedName}.pdf`;
        const pdfUploadResult = await this.uploadFile({
          Bucket: process.env.AWS_BUCKET_NAME || 'vandre-aws',
          Key: pdfKey,
          Body: optimizedPdfBuffer,
          ContentType: 'application/pdf',
        });
        updatedPdfUrl = pdfUploadResult.Location;
      } else if (dto.pdfUrl) {
        updatedPdfUrl = dto.pdfUrl;
      }

      // Criar objeto atualizado
      const updatedPackage = new TravelPackage(
        existingPackage.id,
        dto.name !== undefined ? dto.name : existingPackage.name,
        dto.price !== undefined ? dto.price : existingPackage.price,
        dto.description !== undefined ? dto.description : existingPackage.description,
        updatedImageUrl,
        updatedPdfUrl,
        dto.maxPeople !== undefined ? dto.maxPeople : existingPackage.maxPeople,
        dto.boardingLocations !== undefined && dto.boardingLocations.length > 0
          ? dto.boardingLocations
          : existingPackage.boardingLocations,
        dto.travelMonth !== undefined ? dto.travelMonth : existingPackage.travelMonth,
        existingPackage.created_at,
        new Date(),
        dto.travelDate !== undefined ? dto.travelDate : existingPackage.travelDate,
        dto.returnDate !== undefined ? dto.returnDate : existingPackage.returnDate,
        dto.travelTime !== undefined ? dto.travelTime : existingPackage.travelTime,
      );

      // Atualizar no banco de dados
      const result = await this.travelPackageRepository.update(updatedPackage);
      
      const totalTime = Date.now() - startTime;
      this.logger.log(`Pacote de viagem atualizado em ${totalTime}ms: ${name}`);
      
      return result;
    } catch (error) {
      const totalTime = Date.now() - startTime;
      this.logger.error(`Erro ao atualizar pacote de viagem (${totalTime}ms): ${error.message}`, error.stack);
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

  private async uploadFile(params: S3.PutObjectRequest): Promise<S3.ManagedUpload.SendData> {
    try {
      return await this.s3.upload(params).promise();
    } catch (error) {
      this.logger.error(`Erro ao fazer upload para S3: ${error.message}`);
      throw new BadRequestException(`Falha ao fazer upload do arquivo: ${error.message}`);
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