import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Min,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

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
  @ValidateIf(o => !o.hasPdfFile)
  @IsOptional()
  pdfUrl?: string;

  @ApiProperty({
    example: false,
    description: 'Indica se foi enviado um arquivo PDF para atualização',
    type: Boolean,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  hasPdfFile?: boolean;

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
    example: 'Janeiro',
    description: 'Mês da viagem',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Matches(/^[A-Za-zÀ-ÖØ-öø-ÿ]+$/, {
    message: 'O mês da viagem deve conter apenas o nome do mês (ex: Janeiro)',
  })
  travelMonth?: string;

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
    type: [String],
    description: 'Locais de embarque (opcional, pode ser uma string separada por vírgulas ou array)',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map(item => item.trim());
    }
    return value;
  })
  @IsArray({ message: 'Os locais de embarque devem ser um array de strings' })
  @IsString({ each: true, message: 'Cada local de embarque deve ser uma string' })
  boardingLocations?: string[];
}