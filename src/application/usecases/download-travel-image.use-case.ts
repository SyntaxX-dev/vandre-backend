import { NotFoundException } from '@nestjs/common';
import type { ITravelPackageRepository } from 'src/domain/repositories/travel-package.repository.interface';

export class DownloadTravelPackageImageUseCase {
  constructor(
    private readonly travelPackageRepository: ITravelPackageRepository,
  ) {}

  async execute(id: string): Promise<Buffer> {
    const imageBuffer = await this.travelPackageRepository.findImageById(id);

    if (!imageBuffer) {
      throw new NotFoundException(
        `Imagem do pacote de viagem com ID ${id} não encontrada`,
      );
    }

    return imageBuffer;
  }
}
