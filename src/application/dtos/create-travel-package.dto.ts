import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Min,
} from 'class-validator';
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

  @ApiProperty({
    example: 'Janeiro/2026',
    description: 'Mês/Ano da viagem',
  })
  @IsString()
  @IsNotEmpty({ message: 'O mês da viagem é obrigatório' })
  @Matches(/^[A-Za-zÀ-ÖØ-öø-ÿ]+\/\d{4}$/, {
    message:
      'O mês da viagem deve estar no formato "Mês/Ano" (ex: Janeiro/2025)',
  })
  travelMonth: string;

  @ApiProperty({
    example: '15/01/2026',
    description: 'Data da viagem no formato dia/mês/ano',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Matches(/^\d{2}\/\d{2}\/\d{4}$/, {
    message: 'A data deve estar no formato dia/mês/ano (ex: 15/01/2026)',
  })
  travelDate?: string;

  @ApiProperty({
    example: '08:00',
    description: 'Horário da viagem no formato HH:MM',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'O horário deve estar no formato HH:MM (ex: 08:00)',
  })
  travelTime?: string;

  @IsOptional()
  @IsArray({ message: 'Locais de embarque deve ser um array' })
  @ArrayMinSize(1, { message: 'É necessário ao menos um local de embarque' })
  @IsString({
    each: true,
    message: 'Cada local de embarque deve ser uma string',
  })
  boardingLocations?: string[];
}
