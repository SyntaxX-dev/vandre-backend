import { NotFoundException, BadRequestException } from '@nestjs/common';
import type { ITravelPackageRepository } from 'src/domain/repositories/travel-package.repository.interface';
import type { UpdateTravelPackageDto } from '../dtos/update-travel-package.dto';
import { TravelPackage } from 'src/domain/entities/travelPackage.entity';
import { S3 } from 'aws-sdk';

export class UpdateTravelPackageUseCase {
  constructor(
    private readonly travelPackageRepository: ITravelPackageRepository,
  ) {}

  async execute(
    id: string,
    dto: UpdateTravelPackageDto,
    imageBuffer?: Buffer,
    pdfBuffer?: Buffer,
  ): Promise<TravelPackage> {
    const existingPackage = await this.travelPackageRepository.findById(id);
  
    if (!existingPackage) {
      throw new NotFoundException(
        `Pacote de viagem com ID ${id} não encontrado`,
      );
    }
  
    // Configurar o cliente S3
    const s3 = new S3({
      region: process.env.AWS_REGION || 'sa-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
  
    // Processar upload de imagem se enviada
    let updatedImageUrl = existingPackage.imageUrl;
    if (imageBuffer) {
      const name = dto.name || existingPackage.name;
      const imageKey = `travel-packages/images/${Date.now()}-${name.replace(/\s+/g, '-').toLowerCase()}.jpg`;
      const uploadResult = await s3
        .upload({
          Bucket: process.env.AWS_BUCKET_NAME || 'vandre-aws',
          Key: imageKey,
          Body: imageBuffer,
          ContentType: 'image/jpeg',
        })
        .promise();
      updatedImageUrl = uploadResult.Location;
    }
  
    // Processar upload de PDF se enviado
    let updatedPdfUrl = existingPackage.pdfUrl;
    if (dto.hasPdfFile && pdfBuffer) {
      const name = dto.name || existingPackage.name;
      const pdfKey = `travel-packages/pdfs/${Date.now()}-${name.replace(/\s+/g, '-').toLowerCase()}.pdf`;
      const pdfUploadResult = await s3
        .upload({
          Bucket: process.env.AWS_BUCKET_NAME || 'vandre-aws',
          Key: pdfKey,
          Body: pdfBuffer,
          ContentType: 'application/pdf',
        })
        .promise();
      updatedPdfUrl = pdfUploadResult.Location;
    } else if (dto.pdfUrl) {
      updatedPdfUrl = dto.pdfUrl;
    }
  
    const updatedPackage = new TravelPackage(
      existingPackage.id,
      dto.name !== undefined ? dto.name : existingPackage.name,
      dto.price !== undefined ? dto.price : existingPackage.price,
      dto.description !== undefined
        ? dto.description
        : existingPackage.description,
      updatedImageUrl,
      updatedPdfUrl,
      dto.maxPeople !== undefined ? dto.maxPeople : existingPackage.maxPeople,
      dto.boardingLocations !== undefined && dto.boardingLocations.length > 0
        ? dto.boardingLocations
        : existingPackage.boardingLocations, // Mantém os valores existentes se não enviado ou vazio
      dto.travelMonth !== undefined
        ? dto.travelMonth
        : existingPackage.travelMonth,
      existingPackage.created_at,
      new Date(),
      dto.travelDate !== undefined
        ? dto.travelDate
        : existingPackage.travelDate,
      dto.returnDate !== undefined 
        ? dto.returnDate 
        : existingPackage.returnDate,
      dto.travelTime !== undefined
        ? dto.travelTime
        : existingPackage.travelTime,
    );
  
    return await this.travelPackageRepository.update(updatedPackage);
  }
}