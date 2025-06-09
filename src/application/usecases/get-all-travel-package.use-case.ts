import type { TravelPackage } from 'src/domain/entities/travelPackage.entity';
import type { ITravelPackageRepository, SortBy, SortOrder } from 'src/domain/repositories/travel-package.repository.interface';

export class GetAllTravelPackagesUseCase {
  constructor(
    private readonly travelPackageRepository: ITravelPackageRepository,
  ) {}

  async execute(
    sortBy: SortBy = 'travelDate', 
    sortOrder: SortOrder = 'asc'
  ): Promise<TravelPackage[]> {
    return await this.travelPackageRepository.findAll(sortBy, sortOrder);
  }
}
