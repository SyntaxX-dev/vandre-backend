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
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

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
  @Type(() => Number)
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
  @Type(() => Number)
  maxPeople: number;

  @ApiProperty({
    example: 'Janeiro',
    description: 'Mês da viagem',
  })
  @IsString()
  @IsNotEmpty({ message: 'O mês da viagem é obrigatório' })
  @Matches(/^[A-Za-zÀ-ÖØ-öø-ÿ]+$/, {
    message: 'O mês da viagem deve conter apenas o nome do mês (ex: Janeiro)',
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
    example: '20/01/2026',
    description: 'Data de retorno da viagem no formato dia/mês/ano',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Matches(/^\d{2}\/\d{2}\/\d{4}$/, {
    message: 'A data de retorno deve estar no formato dia/mês/ano (ex: 20/01/2026)',
  })
  returnDate?: string;

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

  @ApiProperty({
    example: ['Terminal Tietê - 08:00', 'Metrô Tatuapé - 08:30'],
    description: 'Locais de embarque (array ou string com valores separados por vírgula)',
  })
  @IsNotEmpty({ message: 'Locais de embarque são obrigatórios' })
  @ValidateIf((o) => Array.isArray(o.boardingLocations))
  @IsArray({ message: 'Locais de embarque deve ser um array' })
  @ArrayMinSize(1, { message: 'É necessário ao menos um local de embarque' })
  @IsString({
    each: true,
    message: 'Cada local de embarque deve ser uma string',
  })
  boardingLocations: string[] | string;
}