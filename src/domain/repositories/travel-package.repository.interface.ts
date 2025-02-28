import type { TravelPackage } from '../entities/travelPackage.entity';

export interface ITravelPackageRepository {
  create(travelPackage: TravelPackage): Promise<TravelPackage>;
  findById(id: string): Promise<TravelPackage | null>;
  findAll(): Promise<TravelPackage[]>;
  update(travelPackage: TravelPackage): Promise<TravelPackage>;
  delete(id: string): Promise<void>;
}
