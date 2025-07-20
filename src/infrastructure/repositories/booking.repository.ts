import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Booking } from 'src/domain/entities/booking.entity';
import { IBookingRepository } from 'src/domain/repositories/booking.repository.interface';

@Injectable()
export class BookingRepository implements IBookingRepository {
  private prisma: PrismaClient;
  private readonly logger: Logger = new Logger(BookingRepository.name);

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(booking: Booking): Promise<Booking> {
    try {
      const createdBooking = await this.prisma.booking.create({
        data: {
          travelPackageId: booking.travelPackageId,
          userId: booking.userId,
          fullName: booking.fullName,
          rg: booking.rg,
          cpf: booking.cpf,
          birthDate: booking.birthDate,
          phone: booking.phone,
          email: booking.email,
          boardingLocation: booking.boardingLocation,
          city: booking.city,
          howDidYouMeetUs: booking.howDidYouMeetUs,
        },
      });

      return new Booking(
        createdBooking.id,
        createdBooking.travelPackageId,
        createdBooking.userId,
        createdBooking.fullName,
        createdBooking.rg,
        createdBooking.cpf,
        createdBooking.birthDate,
        createdBooking.phone,
        createdBooking.email,
        createdBooking.boardingLocation,
        createdBooking.city,
        createdBooking.howDidYouMeetUs,
        createdBooking.created_at,
        createdBooking.updated_at,
      );
    } catch (error) {
      this.logger.error('Erro ao criar reserva:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<Booking | null> {
    try {
      const booking = await this.prisma.booking.findUnique({
        where: { id },
      });

      if (!booking) return null;

      return new Booking(
        booking.id,
        booking.travelPackageId,
        booking.userId,
        booking.fullName,
        booking.rg,
        booking.cpf,
        booking.birthDate,
        booking.phone,
        booking.email,
        booking.boardingLocation,
        booking.city,
        booking.howDidYouMeetUs,
        booking.created_at,
        booking.updated_at,
      );
    } catch (error) {
      this.logger.error(`Erro ao buscar reserva com ID ${id}:`, error);
      throw error;
    }
  }

  async findAll(): Promise<Booking[]> {
    try {
      const bookings = await this.prisma.booking.findMany();

      return bookings.map(
        (booking) =>
          new Booking(
            booking.id,
            booking.travelPackageId,
            booking.userId,
            booking.fullName,
            booking.rg,
            booking.cpf,
            booking.birthDate,
            booking.phone,
            booking.email,
            booking.boardingLocation,
            booking.city,
            booking.howDidYouMeetUs,
            booking.created_at,
            booking.updated_at,
          ),
      );
    } catch (error) {
      this.logger.error('Erro ao buscar reservas:', error);
      throw error;
    }
  }

  async findByTravelPackageId(travelPackageId: string): Promise<Booking[]> {
    try {
      const bookings = await this.prisma.booking.findMany({
        where: { travelPackageId },
      });

      return bookings.map(
        (booking) =>
          new Booking(
            booking.id,
            booking.travelPackageId,
            booking.userId,
            booking.fullName,
            booking.rg,
            booking.cpf,
            booking.birthDate,
            booking.phone,
            booking.email,
            booking.boardingLocation,
            booking.city,
            booking.howDidYouMeetUs,
            booking.created_at,
            booking.updated_at,
          ),
      );
    } catch (error) {
      this.logger.error(
        `Erro ao buscar reservas para o pacote ${travelPackageId}:`,
        error,
      );
      throw error;
    }
  }

  async findByUserId(userId: string): Promise<Booking[]> {
    try {
      const bookings = await this.prisma.booking.findMany({
        where: { userId },
      });

      return bookings.map(
        (booking) =>
          new Booking(
            booking.id,
            booking.travelPackageId,
            booking.userId,
            booking.fullName,
            booking.rg,
            booking.cpf,
            booking.birthDate,
            booking.phone,
            booking.email,
            booking.boardingLocation,
            booking.city,
            booking.howDidYouMeetUs,
            booking.created_at,
            booking.updated_at,
          ),
      );
    } catch (error) {
      this.logger.error(
        `Erro ao buscar reservas para o usuário ${userId}:`,
        error,
      );
      throw error;
    }
  }

  async update(booking: Booking): Promise<Booking> {
    try {
      const updatedBooking = await this.prisma.booking.update({
        where: { id: booking.id },
        data: {
          travelPackageId: booking.travelPackageId,
          userId: booking.userId,
          fullName: booking.fullName,
          rg: booking.rg,
          cpf: booking.cpf,
          birthDate: booking.birthDate,
          phone: booking.phone,
          email: booking.email,
          boardingLocation: booking.boardingLocation,
          city: booking.city,
          howDidYouMeetUs: booking.howDidYouMeetUs,
          updated_at: new Date(),
        },
      });

      return new Booking(
        updatedBooking.id,
        updatedBooking.travelPackageId,
        updatedBooking.userId,
        updatedBooking.fullName,
        updatedBooking.rg,
        updatedBooking.cpf,
        updatedBooking.birthDate,
        updatedBooking.phone,
        updatedBooking.email,
        updatedBooking.boardingLocation,
        updatedBooking.city,
        updatedBooking.howDidYouMeetUs,
        updatedBooking.created_at,
        updatedBooking.updated_at,
      );
    } catch (error) {
      this.logger.error(
        `Erro ao atualizar reserva com ID ${booking.id}:`,
        error,
      );
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.booking.delete({
        where: { id },
      });
    } catch (error) {
      this.logger.error(`Erro ao excluir reserva com ID ${id}:`, error);
      throw error;
    }
  }

  async findBookingsWithDetails(): Promise<any[]> {
    try {
      const result = await this.prisma.booking.aggregateRaw({
        pipeline: [
          {
            $lookup: {
              from: 'TravelPackage',
              localField: 'travelPackageId',
              foreignField: '_id',
              as: 'travelPackage',
            },
          },
          {
            $lookup: {
              from: 'users',
              localField: 'userId',
              foreignField: '_id',
              as: 'user',
            },
          },
          {
            $unwind: {
              path: '$travelPackage',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $unwind: {
              path: '$user',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              _id: 1,
              travelPackageId: 1,
              userId: 1,
              fullName: 1,
              rg: 1,
              cpf: 1,
              birthDate: 1,
              phone: 1,
              email: 1,
              boardingLocation: 1,
              city: 1,
              howDidYouMeetUs: 1,
              created_at: 1,
              updated_at: 1,
              'travelPackage.name': 1,
              'travelPackage.price': 1,
              'travelPackage.travelMonth': 1,
              'user.name': 1,
              'user.email': '$user.email',
            },
          },
        ],
      });

      return result as unknown as any[];
    } catch (error) {
      this.logger.error('Erro ao buscar reservas com detalhes:', error);
      throw error;
    }
  }

  async getBookingStatsByCity(): Promise<any[]> {
    try {
      const result = await this.prisma.booking.aggregateRaw({
        pipeline: [
          {
            $match: {
              city: { $ne: null },
            },
          },
          {
            $group: {
              _id: '$city',
              totalBookings: { $sum: 1 },
              averageAge: {
                $avg: {
                  $divide: [
                    {
                      $subtract: [new Date(), '$birthDate'],
                    },
                    365 * 24 * 60 * 60 * 1000,
                  ],
                },
              },
            },
          },
          {
            $sort: { totalBookings: -1 },
          },
          {
            $project: {
              city: '$_id',
              totalBookings: 1,
              averageAge: { $round: ['$averageAge', 0] },
              _id: 0,
            },
          },
        ],
      });

      return result as unknown as any[];
    } catch (error) {
      this.logger.error('Erro ao buscar estatísticas por cidade:', error);
      throw error;
    }
  }

  async getBookingStatsByHowDidYouMeetUs(): Promise<any[]> {
    try {
      const result = await this.prisma.booking.aggregateRaw({
        pipeline: [
          {
            $match: {
              howDidYouMeetUs: { $ne: null },
            },
          },
          {
            $group: {
              _id: '$howDidYouMeetUs',
              totalBookings: { $sum: 1 },
              percentage: { $sum: 1 },
            },
          },
          {
            $sort: { totalBookings: -1 },
          },
          {
            $project: {
              source: '$_id',
              totalBookings: 1,
              _id: 0,
            },
          },
        ],
      });

      const resultArray = result as unknown as any[];
      const total = resultArray.reduce(
        (sum, item) => sum + item.totalBookings,
        0,
      );

      return resultArray.map((item) => ({
        ...item,
        percentage: ((item.totalBookings / total) * 100).toFixed(2) + '%',
      }));
    } catch (error) {
      this.logger.error(
        'Erro ao buscar estatísticas por como conheceu a empresa:',
        error,
      );
      throw error;
    }
  }
}
