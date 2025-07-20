export class Booking {
  constructor(
    public readonly id: string,
    public readonly travelPackageId: string,
    public readonly userId: string,
    public readonly fullName: string,
    public readonly rg: string,
    public readonly cpf: string,
    public readonly birthDate: Date,
    public readonly phone: string,
    public readonly email: string,
    public readonly boardingLocation: string,
    public readonly city: string | null,
    public readonly howDidYouMeetUs: string | null,
    public readonly created_at: Date,
    public readonly updated_at: Date,
  ) {}
}
