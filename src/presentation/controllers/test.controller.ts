import { Controller, Post, Body, HttpCode, HttpStatus, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';
import { EmailService } from '../../infrastructure/services/email.service';
import { TestEmailDto } from '../../application/dtos/test-email.dto';

@ApiTags('test')
@Controller('test')
export class TestController {
  constructor(private readonly emailService: EmailService) {}

  @Get('health')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Health check do módulo de teste',
    description: 'Verifica se o módulo de teste está funcionando. Disponível apenas em desenvolvimento.'
  })
  @ApiResponse({
    status: 200,
    description: 'Status do módulo de teste',
    schema: {
      example: {
        status: 'ok',
        module: 'test',
        environment: 'development',
        timestamp: '2025-07-20T10:30:00.000Z'
      }
    }
  })
  async healthCheck() {
    return {
      status: 'ok',
      module: 'test',
      environment: process.env.NODE_ENV || 'unknown',
      timestamp: new Date().toISOString(),
      availableEndpoints: [
        'GET /api/test/health',
        'POST /api/test/send-email',
        'POST /api/test/verify-smtp'
      ]
    };
  }

  @Post('send-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Teste de envio de email SMTP',
    description: 'Endpoint para testar o envio de email via SMTP. Disponível apenas em desenvolvimento.'
  })
  @ApiBody({
    type: TestEmailDto,
    description: 'Email para onde o teste será enviado',
  })
  @ApiResponse({
    status: 200,
    description: 'Email de teste enviado com sucesso',
    schema: {
      example: {
        success: true,
        message: 'Email de teste enviado com sucesso',
        emailSent: 'brenohslima@gmail.com',
        timestamp: '2025-07-20T10:30:00.000Z'
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Erro na validação dos dados ou falha no envio',
    schema: {
      example: {
        success: false,
        message: 'Erro ao enviar email de teste',
        error: 'Detalhes do erro'
      }
    }
  })
  @ApiResponse({
    status: 503,
    description: 'Serviço indisponível - problema com configuração SMTP',
    schema: {
      example: {
        success: false,
        message: 'Serviço de email indisponível',
        error: 'Falha na conexão SMTP'
      }
    }
  })
  async sendTestEmail(@Body() testEmailDto: TestEmailDto) {
    // Verificar se está em ambiente de desenvolvimento
    if (process.env.NODE_ENV !== 'development') {
      return {
        success: false,
        message: 'Este endpoint está disponível apenas em ambiente de desenvolvimento',
        environment: process.env.NODE_ENV
      };
    }

    try {
      // Verificar conexão SMTP primeiro
      const connectionOk = await this.emailService.verifyConnection();
      if (!connectionOk) {
        return {
          success: false,
          message: 'Falha na verificação da conexão SMTP',
          error: 'Não foi possível conectar ao servidor de email'
        };
      }

      // Enviar email de teste
      const emailSent = await this.emailService.sendTestEmail(testEmailDto.email);
      
      if (emailSent) {
        return {
          success: true,
          message: 'Email de teste enviado com sucesso',
          emailSent: testEmailDto.email,
          timestamp: new Date().toISOString(),
          smtpConfig: {
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE,
            user: process.env.SMTP_USER
          }
        };
      } else {
        return {
          success: false,
          message: 'Erro ao enviar email de teste',
          error: 'Falha no envio do email'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Erro interno do servidor',
        error: error.message || 'Erro desconhecido'
      };
    }
  }

  @Post('verify-smtp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Verificar conexão SMTP',
    description: 'Verifica se a conexão com o servidor SMTP está funcionando. Disponível apenas em desenvolvimento.'
  })
  @ApiResponse({
    status: 200,
    description: 'Status da conexão SMTP',
    schema: {
      example: {
        success: true,
        message: 'Conexão SMTP verificada com sucesso',
        smtpConfig: {
          host: 'email-ssl.com.br',
          port: '465',
          secure: 'true',
          user: 'atendimento@turmadovandre.com.br'
        }
      }
    }
  })
  async verifySmtpConnection() {
    // Verificar se está em ambiente de desenvolvimento
    if (process.env.NODE_ENV !== 'development') {
      return {
        success: false,
        message: 'Este endpoint está disponível apenas em ambiente de desenvolvimento',
        environment: process.env.NODE_ENV
      };
    }

    try {
      const connectionOk = await this.emailService.verifyConnection();
      
      return {
        success: connectionOk,
        message: connectionOk 
          ? 'Conexão SMTP verificada com sucesso' 
          : 'Falha na verificação da conexão SMTP',
        smtpConfig: {
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          secure: process.env.SMTP_SECURE,
          user: process.env.SMTP_USER
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro na verificação da conexão SMTP',
        error: error.message || 'Erro desconhecido'
      };
    }
  }

  @Post('send-booking-confirmation')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Teste de email de confirmação de reserva',
    description: 'Testa o envio de email de confirmação de reserva com dados fictícios. Disponível apenas em desenvolvimento.'
  })
  @ApiBody({
    type: TestEmailDto,
    description: 'Email para onde o teste será enviado',
  })
  @ApiResponse({
    status: 200,
    description: 'Email de confirmação de reserva enviado com sucesso',
    schema: {
      example: {
        success: true,
        message: 'Email de confirmação de reserva enviado com sucesso',
        emailSent: 'brenohslima@gmail.com',
        timestamp: '2025-07-20T10:30:00.000Z'
      }
    }
  })
  async sendTestBookingConfirmation(@Body() testEmailDto: TestEmailDto) {
    // Verificar se está em ambiente de desenvolvimento
    if (process.env.NODE_ENV !== 'development') {
      return {
        success: false,
        message: 'Este endpoint está disponível apenas em ambiente de desenvolvimento',
        environment: process.env.NODE_ENV
      };
    }

    try {
      // Dados fictícios para teste
      const testBookingData = {
        id: '507f1f77bcf86cd799439011',
        fullName: 'João Silva Teste',
        cpf: '123.456.789-00',
        rg: '12.345.678-9',
        phone: '(11) 98765-4321',
        birthDate: new Date('1990-01-01'),
        boardingLocation: 'Terminal Tietê - 08:00',
        city: 'São Paulo',
        howDidYouMeetUs: 'Instagram',
        travelPackage: {
          name: 'Praia de Maragogi - TESTE',
          price: 1499.99,
          description: 'Uma incrível viagem para as praias paradisíacas de Maragogi...',
          travelDate: '15/03/2025',
          returnDate: '18/03/2025',
          travelTime: '08:00',
          travelMonth: 'Março'
        }
      };

      const emailSent = await this.emailService.sendBookingConfirmationEmail(
        testEmailDto.email,
        testBookingData
      );
      
      if (emailSent) {
        return {
          success: true,
          message: 'Email de confirmação de reserva enviado com sucesso',
          emailSent: testEmailDto.email,
          timestamp: new Date().toISOString(),
          testData: testBookingData
        };
      } else {
        return {
          success: false,
          message: 'Erro ao enviar email de confirmação de reserva',
          error: 'Falha no envio do email'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Erro interno do servidor',
        error: error.message || 'Erro desconhecido'
      };
    }
  }
}
