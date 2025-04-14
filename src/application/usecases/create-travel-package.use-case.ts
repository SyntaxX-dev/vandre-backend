import type { ITravelPackageRepository } from 'src/domain/repositories/travel-package.repository.interface';
import type { CreateTravelPackageDto } from '../dtos/create-travel-package.dto';
import { TravelPackage } from 'src/domain/entities/travelPackage.entity';
import { S3 } from 'aws-sdk';
export class CreateTravelPackageUseCase {
  constructor(
    private readonly travelPackageRepository: ITravelPackageRepository,
  ) {}

  async execute(
    dto: CreateTravelPackageDto,
    fileBuffer: Buffer,
  ): Promise<TravelPackage> {
    const now = new Date();
    const s3 = new S3();
    const key = `travel-packages/${Date.now()}-${dto.name}.jpg`;
    const uploadResult = await s3
      .upload({
        Bucket: process.env.AWS_BUCKET_NAME || 'vandre-aws',
        Key: key,
        Body: fileBuffer,
      })
      .promise();

    const s3ImageUrl = uploadResult.Location;

    const travelPackage = new TravelPackage(
      '',
      dto.name,
      dto.price,
      dto.description,
      s3ImageUrl,
      dto.pdfUrl,
      dto.maxPeople,
      Array.isArray(dto.boardingLocations) ? dto.boardingLocations : [dto.boardingLocations],
      dto.travelMonth,
      now,
      now,
      dto.travelDate,
      dto.travelTime,
    );
    return await this.travelPackageRepository.create(travelPackage);
  }
}