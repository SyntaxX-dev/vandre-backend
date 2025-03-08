export class TravelPackage {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly price: number,
    public readonly description: string,
    public readonly image: Buffer,
    public readonly pdfUrl: string,
    public readonly maxPeople: number,
    public readonly boardingLocations: string[] = [],
    public readonly created_at: Date,
    public readonly updated_at: Date,
  ) {}
}
