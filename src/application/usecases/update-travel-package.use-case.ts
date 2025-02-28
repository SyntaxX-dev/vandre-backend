import { NotFoundException } from '@nestjs/common';
import type { ITravelPackageRepository } from 'src/domain/repositories/travel-package.repository.interface';
import type { UpdateTravelPackageDto } from '../dtos/update-travel-package.dto';
import { TravelPackage } from 'src/domain/entities/travelPackage.entity';

export class UpdateTravelPackageUseCase {
  constructor(
    private readonly travelPackageRepository: ITravelPackageRepository,
  ) {}

  async execute(
    id: string,
    dto: UpdateTravelPackageDto,
  ): Promise<TravelPackage> {
    const existingPackage = await this.travelPackageRepository.findById(id);

    if (!existingPackage) {
      throw new NotFoundException(
        `Pacote de viagem com ID ${id} não encontrado`,
      );
    }

    const updatedPackage = new TravelPackage(
      existingPackage.id,
      dto.name !== undefined ? dto.name : existingPackage.name,
      dto.price !== undefined ? dto.price : existingPackage.price,
      dto.description !== undefined
        ? dto.description
        : existingPackage.description,
      dto.imageUrl !== undefined ? dto.imageUrl : existingPackage.imageUrl,
      dto.pdfUrl !== undefined ? dto.pdfUrl : existingPackage.pdfUrl,
      dto.maxPeople !== undefined ? dto.maxPeople : existingPackage.maxPeople,
      existingPackage.created_at,
      new Date(),
    );

    return await this.travelPackageRepository.update(updatedPackage);
  }
}
