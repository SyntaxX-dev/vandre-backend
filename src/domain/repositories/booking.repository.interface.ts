import { Booking } from '../entities/booking.entity';

export interface IBookingRepository {
  create(booking: Booking): Promise<Booking>;
  findById(id: string): Promise<Booking | null>;
  findAll(): Promise<Booking[]>;
  findByTravelPackageId(travelPackageId: string): Promise<Booking[]>;
  findByUserId(userId: string): Promise<Booking[]>;
  update(booking: Booking): Promise<Booking>;
  delete(id: string): Promise<void>;
  findBookingsWithDetails(): Promise<any[]>;
  getBookingStatsByCity(): Promise<any[]>;
  getBookingStatsByHowDidYouMeetUs(): Promise<any[]>;
}
