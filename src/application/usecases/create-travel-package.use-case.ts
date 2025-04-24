import type { ITravelPackageRepository } from 'src/domain/repositories/travel-package.repository.interface';
import type { CreateTravelPackageDto } from '../dtos/create-travel-package.dto';
import { TravelPackage } from 'src/domain/entities/travelPackage.entity';
import { S3 } from 'aws-sdk';
import { BadRequestException } from '@nestjs/common';

export class CreateTravelPackageUseCase {
  constructor(
    private readonly travelPackageRepository: ITravelPackageRepository,
  ) {}

  async execute(
    dto: CreateTravelPackageDto,
    imageBuffer: Buffer,
    pdfBuffer?: Buffer,
  ): Promise<TravelPackage> {
    const now = new Date();
    const s3 = new S3({
      region: process.env.AWS_REGION || 'sa-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
    
    // Upload da imagem
    const imageKey = `travel-packages/images/${Date.now()}-${dto.name.replace(/\s+/g, '-').toLowerCase()}.jpg`;
    const imageUploadResult = await s3
      .upload({
        Bucket: process.env.AWS_BUCKET_NAME || 'vandre-aws',
        Key: imageKey,
        Body: imageBuffer,
        ContentType: 'image/jpeg',
      })
      .promise();
  
    const s3ImageUrl = imageUploadResult.Location;
    
    // Verifica se tem PDF para upload ou se usa URL
    let finalPdfUrl: string; // Declarando como string para evitar undefined
    
    if (dto.hasPdfFile && pdfBuffer) {
      const pdfKey = `travel-packages/pdfs/${Date.now()}-${dto.name.replace(/\s+/g, '-').toLowerCase()}.pdf`;
      const pdfUploadResult = await s3
        .upload({
          Bucket: process.env.AWS_BUCKET_NAME || 'vandre-aws',
          Key: pdfKey,
          Body: pdfBuffer,
          ContentType: 'application/pdf',
        })
        .promise();
      
      finalPdfUrl = pdfUploadResult.Location;
    } else if (dto.pdfUrl) {
      finalPdfUrl = dto.pdfUrl;
    } else {
      throw new BadRequestException('É necessário fornecer um link para o PDF ou fazer upload do arquivo');
    }
  
    const travelPackage = new TravelPackage(
      '',
      dto.name,
      dto.price,
      dto.description,
      s3ImageUrl,
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
    return await this.travelPackageRepository.create(travelPackage);
  }
}