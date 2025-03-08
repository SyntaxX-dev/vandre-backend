import { Injectable } from '@nestjs/common';
import { TravelPackage } from 'src/domain/entities/travelPackage.entity';
import { ITravelPackageRepository } from 'src/domain/repositories/travel-package.repository.interface';
import type { PaginationResponse } from 'src/domain/repositories/pagination.repository.interface';
import type { FilterTravelPackagesDto } from '../dtos/filter-travel-package.dto';

@Injectable()
export class FilterTravelPackagesUseCase {
  constructor(
    private readonly travelPackageRepository: ITravelPackageRepository,
  ) {}

  async execute(
    filterDto: FilterTravelPackagesDto,
  ): Promise<PaginationResponse<TravelPackage>> {
    const { month, page = 1, limit = 10 } = filterDto;

    const result = await this.travelPackageRepository.findByMonth(
      month || '',
      page,
      limit,
    );

    const { data, total, pages } = result;

    return {
      data,
      meta: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: total,
        totalPages: pages,
        hasNextPage: page < pages,
        hasPreviousPage: page > 1,
      },
    };
  }
}
