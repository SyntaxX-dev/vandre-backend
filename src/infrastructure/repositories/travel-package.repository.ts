import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { TravelPackage } from 'src/domain/entities/travelPackage.entity';
import type { ITravelPackageRepository } from 'src/domain/repositories/travel-package.repository.interface';

export type SortOrder = 'asc' | 'desc';
export type SortBy = 'travelDate' | 'created_at' | 'name' | 'price';

@Injectable()
export class TravelPackageRepository implements ITravelPackageRepository {
  private prisma: PrismaClient;
  private readonly logger: Logger = new Logger(TravelPackageRepository.name);

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Converte data em formato dd/mm/yyyy para Date object para comparação
   */
  private parseTravelDate(dateStr: string | null): Date | null {
    if (!dateStr) return null;
    
    try {
      const [day, month, year] = dateStr.split('/').map(Number);
      if (!day || !month || !year) return null;
      
      return new Date(year, month - 1, day); // month é 0-indexed em JavaScript
    } catch {
      return null;
    }
  }

  /**
   * Função auxiliar para ordenar viagens por data (otimizada)
   */
  private sortTravelPackagesByDate(packages: any[], sortOrder: SortOrder = 'asc'): any[] {
    return packages.sort((a, b) => {
      const dateA = this.parseTravelDate(a.travelDate);
      const dateB = this.parseTravelDate(b.travelDate);
      
      // Se ambas as datas são null, manter ordem por created_at
      if (!dateA && !dateB) {
        const createdA = new Date(a.created_at).getTime();
        const createdB = new Date(b.created_at).getTime();
        return sortOrder === 'asc' ? createdA - createdB : createdB - createdA;
      }
      
      // Viagens sem data vão para o final
      if (!dateA) return 1;
      if (!dateB) return -1;
      
      // Ordenar por data
      const comparison = dateA.getTime() - dateB.getTime();
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }

  /**
   * Usa agregação do MongoDB para ordenação otimizada (quando possível)
   */
  private async findWithAggregation(
    whereCondition: any = {},
    sortBy: SortBy = 'travelDate',
    sortOrder: SortOrder = 'asc',
    skip: number = 0,
    limit?: number
  ): Promise<any[]> {
    try {
      // Para campos normais, usar ordenação direta
      if (sortBy !== 'travelDate') {
        const orderBy = { [sortBy]: sortOrder };
        const options: any = {
          where: whereCondition,
          orderBy,
          skip,
        };
        
        if (limit) options.take = limit;
        
        return await this.prisma.travelPackage.findMany(options);
      }

      // Para travelDate, usar find normal e ordenar no código (mais seguro para MongoDB)
      const allPackages = await this.prisma.travelPackage.findMany({
        where: whereCondition,
        orderBy: { created_at: 'asc' }, // Ordem base
      });

      // Ordenar por data
      const sortedPackages = this.sortTravelPackagesByDate(allPackages, sortOrder);

      // Aplicar paginação se necessário
      if (limit) {
        return sortedPackages.slice(skip, skip + limit);
      }

      return sortedPackages;
    } catch (error) {
      this.logger.error('Erro na agregação:', error);
      throw error;
    }
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
          imageUrl: travelPackage.imageUrl || '',
          pdfUrl: travelPackage.pdfUrl,
          maxPeople: Number(travelPackage.maxPeople),
          boardingLocations: boardingLocations,
          travelMonth: travelPackage.travelMonth,
          travelDate: travelPackage.travelDate,
          returnDate: travelPackage.returnDate,
          travelTime: travelPackage.travelTime,
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
        createdPackage.boardingLocations,
        createdPackage.travelMonth,
        createdPackage.created_at,
        createdPackage.updated_at,
        createdPackage.travelDate,
        createdPackage.returnDate,
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
        travelPackage.imageUrl,
        travelPackage.pdfUrl,
        travelPackage.maxPeople,
        travelPackage.boardingLocations,
        travelPackage.travelMonth,
        travelPackage.created_at,
        travelPackage.updated_at,
        travelPackage.travelDate,
        travelPackage.returnDate,
        travelPackage.travelTime,
      );
    } catch (error) {
      this.logger.error(`Erro ao buscar pacote de viagem com ID ${id}:`, error);
      throw error;
    }
  }

  async findAll(sortBy: SortBy = 'travelDate', sortOrder: SortOrder = 'asc'): Promise<TravelPackage[]> {
    try {
      const packages = await this.findWithAggregation({}, sortBy, sortOrder);

      return packages.map(
        (pkg) =>
          new TravelPackage(
            pkg.id,
            pkg.name,
            pkg.price,
            pkg.description,
            pkg.imageUrl || '',
            pkg.pdfUrl,
            pkg.maxPeople,
            pkg.boardingLocations,
            pkg.travelMonth,
            pkg.created_at,
            pkg.updated_at,
            pkg.travelDate,
            pkg.returnDate,
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
          imageUrl: travelPackage.imageUrl || '',
          pdfUrl: travelPackage.pdfUrl,
          maxPeople: travelPackage.maxPeople,
          boardingLocations: travelPackage.boardingLocations,
          travelMonth: travelPackage.travelMonth,
          travelDate: travelPackage.travelDate,
          returnDate: travelPackage.returnDate,
          travelTime: travelPackage.travelTime,
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
        updatedPackage.boardingLocations,
        updatedPackage.travelMonth,
        updatedPackage.created_at,
        updatedPackage.updated_at,
        updatedPackage.travelDate,
        updatedPackage.returnDate,
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
        select: { imageUrl: true },
      });

      if (!travelPackage) return null;

      return travelPackage.imageUrl
        ? Buffer.from(travelPackage.imageUrl)
        : null;
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
    sortBy: SortBy = 'travelDate',
    sortOrder: SortOrder = 'asc',
  ): Promise<{ data: TravelPackage[]; total: number; pages: number }> {
    try {
      page = page > 0 ? page : 1;
      limit = limit > 0 && limit <= 100 ? limit : 10;
      const skip = (page - 1) * limit;
  
      let whereCondition: Prisma.TravelPackageWhereInput = {};
  
      if (month) {
        whereCondition = {
          travelMonth: {
            equals: month,
            mode: 'insensitive',
          },
        };
      }

      // Buscar dados paginados
      const packages = await this.findWithAggregation(
        whereCondition,
        sortBy,
        sortOrder,
        skip,
        limit
      );

      // Contar total (necessário fazer separadamente)
      const total = await this.prisma.travelPackage.count({
        where: whereCondition,
      });

      const pages = Math.ceil(total / limit);

      const data = packages.map(
        (pkg) =>
          new TravelPackage(
            pkg.id,
            pkg.name,
            pkg.price,
            pkg.description,
            pkg.imageUrl,
            pkg.pdfUrl,
            pkg.maxPeople,
            pkg.boardingLocations,
            pkg.travelMonth,
            pkg.created_at,
            pkg.updated_at,
            pkg.travelDate,
            pkg.returnDate,
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
