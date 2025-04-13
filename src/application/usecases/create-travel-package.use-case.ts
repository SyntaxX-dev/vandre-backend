import type { ITravelPackageRepository } from 'src/domain/repositories/travel-package.repository.interface';
import type { CreateTravelPackageDto } from '../dtos/create-travel-package.dto';
import { TravelPackage } from 'src/domain/entities/travelPackage.entity';
import { S3 } from 'aws-sdk';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class CreateTravelPackageUseCase {
  private readonly logger: Logger = new Logger(CreateTravelPackageUseCase.name);

  constructor(
    private readonly travelPackageRepository: ITravelPackageRepository,
  ) {}

  async execute(
    dto: CreateTravelPackageDto,
    fileBuffer: Buffer,
  ): Promise<TravelPackage> {
    const now = new Date();
    let s3ImageUrl = '';

    try {
      try {
        const s3 = new S3({
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          region: process.env.AWS_REGION || 'us-east-1',
        });
        
        const key = `travel-packages/${Date.now()}-${dto.name}.jpg`;
        const uploadResult = await s3
          .upload({
            Bucket: process.env.AWS_BUCKET_NAME || 'vandre-aws',
            Key: key,
            Body: fileBuffer,
          })
          .promise();

        s3ImageUrl = uploadResult.Location;
      } catch (error) {
        this.logger.warn('Erro ao fazer upload para S3, usando URL local:', error);
        s3ImageUrl = `/images/travel-packages/${Date.now()}-${dto.name}.jpg`;
      }

      let boardingLocations: string[] = [];
      
      if (Array.isArray(dto.boardingLocations)) {
        boardingLocations = dto.boardingLocations.flatMap(location => {
          if (typeof location === 'string' && location.includes(',')) {
            return location.split(',').map(loc => loc.trim());
          }
          return location;
        });
      } else if (typeof dto.boardingLocations === 'string') {
        const locationString = dto.boardingLocations as string;
        boardingLocations = locationString.split(',').map(loc => loc.trim());
      }

      const travelPackage = new TravelPackage(
        '',
        dto.name,
        dto.price,
        dto.description,
        s3ImageUrl,
        dto.pdfUrl,
        dto.maxPeople,
        boardingLocations,
        dto.travelMonth,
        now,
        now,
        dto.travelDate,
        dto.travelTime,
      );
      
      return await this.travelPackageRepository.create(travelPackage);
    } catch (error) {
      this.logger.error('Erro ao criar pacote de viagem:', error);
      throw error;
    }
  }
}