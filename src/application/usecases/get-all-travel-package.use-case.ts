import type { TravelPackage } from 'src/domain/entities/travelPackage.entity';
import type { ITravelPackageRepository } from 'src/domain/repositories/travel-package.repository.interface';

export class GetAllTravelPackagesUseCase {
  constructor(
    private readonly travelPackageRepository: ITravelPackageRepository,
  ) {}

  async execute(): Promise<TravelPackage[]> {
    return await this.travelPackageRepository.findAll();
  }
}
