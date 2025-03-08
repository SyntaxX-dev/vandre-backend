import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsDateString,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'ID do pacote de viagem',
  })
  @IsString()
  @IsNotEmpty({ message: 'O ID do pacote de viagem é obrigatório' })
  travelPackageId: string;

  @ApiProperty({
    example: 'João Silva',
    description: 'Nome completo do passageiro',
  })
  @IsString()
  @IsNotEmpty({ message: 'O nome completo é obrigatório' })
  fullName: string;

  @ApiProperty({
    example: '12.345.678-9',
    description: 'RG do passageiro',
  })
  @IsString()
  @IsNotEmpty({ message: 'O RG é obrigatório' })
  rg: string;

  @ApiProperty({
    example: '123.456.789-00',
    description: 'CPF do passageiro',
  })
  @IsString()
  @IsNotEmpty({ message: 'O CPF é obrigatório' })
  @Matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, {
    message: 'CPF inválido, formato esperado: 000.000.000-00',
  })
  cpf: string;

  @ApiProperty({
    example: '1990-01-01',
    description: 'Data de nascimento do passageiro',
  })
  @IsDateString()
  @IsNotEmpty({ message: 'A data de nascimento é obrigatória' })
  birthDate: string;

  @ApiProperty({
    example: '(11) 98765-4321',
    description: 'Telefone do passageiro',
  })
  @IsString()
  @IsNotEmpty({ message: 'O telefone é obrigatório' })
  phone: string;

  @ApiProperty({
    example: 'joao.silva@example.com',
    description: 'Email do passageiro',
  })
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'O email é obrigatório' })
  email: string;

  @ApiProperty({
    example: 'Terminal Tietê - 08:00',
    description: 'Local de embarque selecionado',
  })
  @IsString()
  @IsNotEmpty({ message: 'O local de embarque é obrigatório' })
  boardingLocation: string;
}
