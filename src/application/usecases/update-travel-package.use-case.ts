import { NotFoundException } from '@nestjs/common';
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
    fileBuffer?: Buffer,
  ): Promise<TravelPackage> {
    const existingPackage = await this.travelPackageRepository.findById(id);

    if (!existingPackage) {
      throw new NotFoundException(
        `Pacote de viagem com ID ${id} não encontrado`,
      );
    }
    let updatedImageUrl = existingPackage.imageUrl;
    if (fileBuffer) {
      // Faz upload no S3
      const s3 = new S3();
      const key = `travel-packages/${Date.now()}-${existingPackage.name}.jpg`;
      const uploadResult = await s3
        .upload({
          Bucket: process.env.AWS_BUCKET_NAME || 'nome-do-seu-bucket',
          Key: key,
          Body: fileBuffer,
        })
        .promise();
      updatedImageUrl = uploadResult.Location;
    }

    const updatedPackage = new TravelPackage(
      existingPackage.id,
      dto.name !== undefined ? dto.name : existingPackage.name,
      dto.price !== undefined ? dto.price : existingPackage.price,
      dto.description !== undefined
        ? dto.description
        : existingPackage.description,
      updatedImageUrl,
      dto.pdfUrl !== undefined ? dto.pdfUrl : existingPackage.pdfUrl,
      dto.maxPeople !== undefined ? dto.maxPeople : existingPackage.maxPeople,
      dto.boardingLocations !== undefined
        ? dto.boardingLocations
        : existingPackage.boardingLocations,
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
