import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTravelPackageDto {
  @ApiProperty({
    example: 'Praia de Maragogi',
    description: 'Nome do pacote de viagem',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    example: 1499.99,
    description: 'Preço da viagem em reais',
    required: false,
  })
  @IsNumber({}, { message: 'O preço deve ser um número válido' })
  @Min(0, { message: 'O preço deve ser maior ou igual a zero' })
  @IsOptional()
  price?: number;

  @ApiProperty({
    example: 'Uma incrível viagem para as praias paradisíacas de Maragogi...',
    description: 'Descrição detalhada do pacote de viagem',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 'https://example.com/images/maragogi.jpg',
    description: 'URL da imagem do destino',
    required: false,
  })
  @IsString()
  @IsUrl({}, { message: 'A URL da imagem deve ser válida' })
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({
    example: 'https://example.com/pdf/maragogi-itinerary.pdf',
    description: 'Link para o PDF com detalhes da viagem',
    required: false,
  })
  @IsString()
  @IsUrl({}, { message: 'A URL do PDF deve ser válida' })
  @IsOptional()
  pdfUrl?: string;

  @ApiProperty({
    example: 20,
    description: 'Número máximo de pessoas para a viagem',
    required: false,
  })
  @IsNumber({}, { message: 'O limite de pessoas deve ser um número' })
  @Min(1, { message: 'O limite de pessoas deve ser maior que zero' })
  @IsOptional()
  maxPeople?: number;

  @ApiProperty({
    example: 'Janeiro/2026',
    description: 'Mês/Ano da viagem',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Matches(/^[A-Za-zÀ-ÖØ-öø-ÿ]+\/\d{4}$/, {
    message:
      'O mês da viagem deve estar no formato "Mês/Ano" (ex: Janeiro/2025)',
  })
  travelMonth?: string;

  @ApiProperty({
    example: ['Terminal Tietê - 08:00', 'Metrô Tatuapé - 08:30'],
    type: [String],
    description: 'Locais de embarque',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  boardingLocations?: string[];
}
