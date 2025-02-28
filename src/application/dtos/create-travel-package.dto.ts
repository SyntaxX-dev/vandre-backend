import { IsNotEmpty, IsNumber, IsString, IsUrl, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTravelPackageDto {
  @ApiProperty({
    example: 'Praia de Maragogi',
    description: 'Nome do pacote de viagem',
  })
  @IsString()
  @IsNotEmpty({ message: 'O nome da viagem é obrigatório' })
  name: string;

  @ApiProperty({
    example: 1499.99,
    description: 'Preço da viagem em reais',
  })
  @IsNumber({}, { message: 'O preço deve ser um número válido' })
  @Min(0, { message: 'O preço deve ser maior ou igual a zero' })
  @IsNotEmpty({ message: 'O preço é obrigatório' })
  price: number;

  @ApiProperty({
    example: 'Uma incrível viagem para as praias paradisíacas de Maragogi...',
    description: 'Descrição detalhada do pacote de viagem',
  })
  @IsString()
  @IsNotEmpty({ message: 'A descrição é obrigatória' })
  description: string;

  @ApiProperty({
    example: 'https://example.com/pdf/maragogi-itinerary.pdf',
    description: 'Link para o PDF com detalhes da viagem',
  })
  @IsString()
  @IsUrl({}, { message: 'A URL do PDF deve ser válida' })
  @IsNotEmpty({ message: 'O link do PDF é obrigatório' })
  pdfUrl: string;

  @ApiProperty({
    example: 20,
    description: 'Número máximo de pessoas para a viagem',
  })
  @IsNumber({}, { message: 'O limite de pessoas deve ser um número' })
  @Min(1, { message: 'O limite de pessoas deve ser maior que zero' })
  @IsNotEmpty({ message: 'O limite de pessoas é obrigatório' })
  maxPeople: number;
}
