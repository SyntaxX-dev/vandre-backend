import type { ITravelPackageRepository } from 'src/domain/repositories/travel-package.repository.interface';
import type { CreateTravelPackageDto } from '../dtos/create-travel-package.dto';
import { TravelPackage } from 'src/domain/entities/travelPackage.entity';

export class CreateTravelPackageUseCase {
  constructor(
    private readonly travelPackageRepository: ITravelPackageRepository,
  ) {}

  async execute(
    dto: CreateTravelPackageDto,
    imageBuffer: Buffer,
  ): Promise<TravelPackage> {
    const now = new Date();
    const travelPackage = new TravelPackage(
      '',
      dto.name,
      dto.price,
      dto.description,
      imageBuffer,
      dto.pdfUrl,
      dto.maxPeople,
      dto.boardingLocations,
      now,
      now,
    );
    return await this.travelPackageRepository.create(travelPackage);
  }
}
