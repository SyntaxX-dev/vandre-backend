import { NotFoundException } from '@nestjs/common';
import type { TravelPackage } from 'src/domain/entities/travelPackage.entity';
import type { ITravelPackageRepository } from 'src/domain/repositories/travel-package.repository.interface';

export class GetTravelPackageByIdUseCase {
  constructor(
    private readonly travelPackageRepository: ITravelPackageRepository,
  ) {}

  async execute(id: string): Promise<TravelPackage> {
    const travelPackage = await this.travelPackageRepository.findById(id);

    if (!travelPackage) {
      throw new NotFoundException(
        `Pacote de viagem com ID ${id} não encontrado`,
      );
    }

    return travelPackage;
  }
}
