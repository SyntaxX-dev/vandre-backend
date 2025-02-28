import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { TravelPackage } from 'src/domain/entities/travelPackage.entity';
import type { ITravelPackageRepository } from 'src/domain/repositories/travel-package.repository.interface';

@Injectable()
export class TravelPackageRepository implements ITravelPackageRepository {
  private prisma: PrismaClient;
  private readonly logger: Logger = new Logger(TravelPackageRepository.name);

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(travelPackage: TravelPackage): Promise<TravelPackage> {
    try {
      const createdPackage = await this.prisma.travelPackage.create({
        data: {
          name: travelPackage.name,
          price: travelPackage.price,
          description: travelPackage.description,
          imageUrl: travelPackage.imageUrl,
          pdfUrl: travelPackage.pdfUrl,
          maxPeople: travelPackage.maxPeople,
        },
      });

      return new TravelPackage(
        createdPackage.id,
        createdPackage.name,
        createdPackage.price,
        createdPackage.description,
        createdPackage.imageUrl,
        createdPackage.pdfUrl,
        createdPackage.maxPeople,
        createdPackage.created_at,
        createdPackage.updated_at,
      );
    } catch (error) {
      this.logger.error('Erro ao criar pacote de viagem:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<TravelPackage | null> {
    try {
      const travelPackage = await this.prisma.travelPackage.findUnique({
        where: { id },
      });

      if (!travelPackage) return null;

      return new TravelPackage(
        travelPackage.id,
        travelPackage.name,
        travelPackage.price,
        travelPackage.description,
        travelPackage.imageUrl,
        travelPackage.pdfUrl,
        travelPackage.maxPeople,
        travelPackage.created_at,
        travelPackage.updated_at,
      );
    } catch (error) {
      this.logger.error(`Erro ao buscar pacote de viagem com ID ${id}:`, error);
      throw error;
    }
  }

  async findAll(): Promise<TravelPackage[]> {
    try {
      const travelPackages = await this.prisma.travelPackage.findMany();

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return travelPackages.map(
        (pkg) =>
          new TravelPackage(
            pkg.id,
            pkg.name,
            pkg.price,
            pkg.description,
            pkg.imageUrl,
            pkg.pdfUrl,
            pkg.maxPeople,
            pkg.created_at,
            pkg.updated_at,
          ),
      );
    } catch (error) {
      this.logger.error('Erro ao buscar pacotes de viagem:', error);
      throw error;
    }
  }

  async update(travelPackage: TravelPackage): Promise<TravelPackage> {
    try {
      const updatedPackage = await this.prisma.travelPackage.update({
        where: { id: travelPackage.id },
        data: {
          name: travelPackage.name,
          price: travelPackage.price,
          description: travelPackage.description,
          imageUrl: travelPackage.imageUrl,
          pdfUrl: travelPackage.pdfUrl,
          maxPeople: travelPackage.maxPeople,
          updated_at: new Date(),
        },
      });

      return new TravelPackage(
        updatedPackage.id,
        updatedPackage.name,
        updatedPackage.price,
        updatedPackage.description,
        updatedPackage.imageUrl,
        updatedPackage.pdfUrl,
        updatedPackage.maxPeople,
        updatedPackage.created_at,
        updatedPackage.updated_at,
      );
    } catch (error) {
      this.logger.error(
        `Erro ao atualizar pacote de viagem com ID ${travelPackage.id}:`,
        error,
      );
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.travelPackage.delete({
        where: { id },
      });
    } catch (error) {
      this.logger.error(
        `Erro ao excluir pacote de viagem com ID ${id}:`,
        error,
      );
      throw error;
    }
  }
}
