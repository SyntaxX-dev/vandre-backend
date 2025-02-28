import { NotFoundException } from '@nestjs/common';
import type { ITravelPackageRepository } from 'src/domain/repositories/travel-package.repository.interface';

export class DeleteTravelPackageUseCase {
  constructor(
    private readonly travelPackageRepository: ITravelPackageRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const existingPackage = await this.travelPackageRepository.findById(id);

    if (!existingPackage) {
      throw new NotFoundException(
        `Pacote de viagem com ID ${id} não encontrado`,
      );
    }

    await this.travelPackageRepository.delete(id);
  }
}
