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
}
