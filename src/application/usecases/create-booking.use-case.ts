import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Booking } from 'src/domain/entities/booking.entity';
import { IBookingRepository } from 'src/domain/repositories/booking.repository.interface';
import { ITravelPackageRepository } from 'src/domain/repositories/travel-package.repository.interface';
import { CreateBookingDto } from '../dtos/create-booking.dto';

@Injectable()
export class CreateBookingUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly travelPackageRepository: ITravelPackageRepository,
  ) {}

  async execute(userId: string, dto: CreateBookingDto): Promise<Booking> {
    const travelPackage = await this.travelPackageRepository.findById(
      dto.travelPackageId,
    );
    if (!travelPackage) {
      throw new NotFoundException('Pacote de viagem não encontrado');
    }

    if (!travelPackage.boardingLocations.includes(dto.boardingLocation)) {
      throw new BadRequestException(
        'Local de embarque não disponível para este pacote',
      );
    }

    const existingBookings = await this.bookingRepository.findByTravelPackageId(
      dto.travelPackageId,
    );
    if (existingBookings.length >= travelPackage.maxPeople) {
      throw new BadRequestException(
        'Não há mais vagas disponíveis para este pacote de viagem',
      );
    }

    const now = new Date();
    const booking = new Booking(
      '',
      dto.travelPackageId,
      userId,
      dto.fullName,
      dto.rg,
      dto.cpf,
      new Date(dto.birthDate),
      dto.phone,
      dto.email,
      dto.boardingLocation,
      dto.city || null,
      dto.howDidYouMeetUs || null,
      now,
      now,
    );

    return await this.bookingRepository.create(booking);
  }
}
