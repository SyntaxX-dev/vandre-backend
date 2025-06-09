import type { TravelPackage } from '../entities/travelPackage.entity';

export type SortOrder = 'asc' | 'desc';
export type SortBy = 'travelDate' | 'created_at' | 'name' | 'price';

export interface ITravelPackageRepository {
  create(travelPackage: TravelPackage): Promise<TravelPackage>;
  findById(id: string): Promise<TravelPackage | null>;
  findAll(sortBy?: SortBy, sortOrder?: SortOrder): Promise<TravelPackage[]>;
  update(travelPackage: TravelPackage): Promise<TravelPackage>;
  delete(id: string): Promise<void>;
  findImageById(id: string): Promise<Buffer | null>;
  findByMonth(
    month: string,
    page: number,
    limit: number,
    sortBy?: SortBy,
    sortOrder?: SortOrder,
  ): Promise<{ data: TravelPackage[]; total: number; pages: number }>;
}
