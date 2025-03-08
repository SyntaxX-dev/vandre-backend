import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient, type Prisma } from '@prisma/client';
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
      const boardingLocations = Array.isArray(travelPackage.boardingLocations)
        ? travelPackage.boardingLocations
        : typeof travelPackage.boardingLocations === 'string'
          ? [travelPackage.boardingLocations as unknown as string]
          : [];
      const createdPackage = await this.prisma.travelPackage.create({
        data: {
          name: travelPackage.name,
          price: Number(travelPackage.price),
          description: travelPackage.description,
          image: travelPackage.image,
          pdfUrl: travelPackage.pdfUrl,
          maxPeople: Number(travelPackage.maxPeople),
          boardingLocations: boardingLocations,
          travelMonth: travelPackage.travelMonth,
          travelDate: travelPackage.travelDate,
          travelTime: travelPackage.travelTime,
        },
      });

      return new TravelPackage(
        createdPackage.id,
        createdPackage.name,
        createdPackage.price,
        createdPackage.description,
        Buffer.from(createdPackage.image),
        createdPackage.pdfUrl,
        createdPackage.maxPeople,
        createdPackage.boardingLocations,
        createdPackage.travelMonth,
        createdPackage.created_at,
        createdPackage.updated_at,
        createdPackage.travelDate,
        createdPackage.travelTime,
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
        Buffer.from(travelPackage.image),
        travelPackage.pdfUrl,
        travelPackage.maxPeople,
        travelPackage.boardingLocations,
        travelPackage.travelMonth,
        travelPackage.created_at,
        travelPackage.updated_at,
        travelPackage.travelDate,
        travelPackage.travelTime,
      );
    } catch (error) {
      this.logger.error(`Erro ao buscar pacote de viagem com ID ${id}:`, error);
      throw error;
    }
  }

  async findAll(): Promise<TravelPackage[]> {
    try {
      const travelPackages = await this.prisma.travelPackage.findMany();

      return travelPackages.map(
        (pkg) =>
          new TravelPackage(
            pkg.id,
            pkg.name,
            pkg.price,
            pkg.description,
            Buffer.from(pkg.image),
            pkg.pdfUrl,
            pkg.maxPeople,
            pkg.boardingLocations,
            pkg.travelMonth,
            pkg.created_at,
            pkg.updated_at,
            pkg.travelDate,
            pkg.travelTime,
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
          image: travelPackage.image,
          pdfUrl: travelPackage.pdfUrl,
          maxPeople: travelPackage.maxPeople,
          boardingLocations: travelPackage.boardingLocations,
          travelMonth: travelPackage.travelMonth,
          travelDate: travelPackage.travelDate,
          travelTime: travelPackage.travelTime,
          updated_at: new Date(),
        },
      });

      return new TravelPackage(
        updatedPackage.id,
        updatedPackage.name,
        updatedPackage.price,
        updatedPackage.description,
        Buffer.from(updatedPackage.image),
        updatedPackage.pdfUrl,
        updatedPackage.maxPeople,
        updatedPackage.boardingLocations,
        updatedPackage.travelMonth,
        updatedPackage.created_at,
        updatedPackage.updated_at,
        updatedPackage.travelDate,
        updatedPackage.travelTime,
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

  async findImageById(id: string): Promise<Buffer | null> {
    try {
      const travelPackage = await this.prisma.travelPackage.findUnique({
        where: { id },
        select: { image: true },
      });

      if (!travelPackage) return null;

      return travelPackage.image ? Buffer.from(travelPackage.image) : null;
    } catch (error) {
      this.logger.error(
        `Erro ao buscar imagem do pacote de viagem com ID ${id}:`,
        error,
      );
      throw error;
    }
  }

  async findByMonth(
    month: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: TravelPackage[]; total: number; pages: number }> {
    try {
      page = page > 0 ? page : 1;
      limit = limit > 0 && limit <= 100 ? limit : 10;

      const skip = (page - 1) * limit;

      let whereCondition: Prisma.TravelPackageWhereInput = {};

      if (month) {
        whereCondition = {
          travelMonth: {
            startsWith: month,
            mode: 'insensitive',
          },
        };
      }

      const travelPackages = await this.prisma.travelPackage.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: {
          created_at: 'desc',
        },
      });

      const total = await this.prisma.travelPackage.count({
        where: whereCondition,
      });

      const pages = Math.ceil(total / limit);

      const data = travelPackages.map(
        (pkg) =>
          new TravelPackage(
            pkg.id,
            pkg.name,
            pkg.price,
            pkg.description,
            Buffer.from(pkg.image),
            pkg.pdfUrl,
            pkg.maxPeople,
            pkg.boardingLocations,
            pkg.travelMonth,
            pkg.created_at,
            pkg.updated_at,
            pkg.travelDate,
            pkg.travelTime,
          ),
      );

      return {
        data,
        total,
        pages,
      };
    } catch (error) {
      this.logger.error('Erro ao buscar pacotes de viagem por mês:', error);
      throw error;
    }
  }
}
