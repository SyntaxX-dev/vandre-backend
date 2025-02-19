export class User {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    public readonly password: string,
    public readonly created_at: Date,
    public readonly updated_at: Date,
  ) {}
}
