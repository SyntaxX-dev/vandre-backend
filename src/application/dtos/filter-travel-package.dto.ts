import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class FilterTravelPackagesDto {
  @ApiProperty({
    example: 'Janeiro/2025',
    description: 'Mês/Ano da viagem para filtrar',
    required: false,
  })
  @IsOptional()
  @IsString()
  month?: string;

  @ApiProperty({
    example: 1,
    description: 'Número da página (começando em 1)',
    required: false,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'A página deve ser um número inteiro' })
  @Min(1, { message: 'A página deve ser pelo menos 1' })
  page?: number = 1;

  @ApiProperty({
    example: 10,
    description: 'Quantidade de itens por página',
    required: false,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'O limite deve ser um número inteiro' })
  @Min(1, { message: 'O limite deve ser pelo menos 1' })
  @Max(100, { message: 'O limite não pode ser maior que 100' })
  limit?: number = 10;
}
