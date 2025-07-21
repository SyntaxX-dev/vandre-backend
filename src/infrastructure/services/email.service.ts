import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendTestEmail(to: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.SMTP_USER,
        to: to,
        subject: 'Teste de Email - Turma do Vandre',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">Teste de Email - Turma do Vandre</h2>
            <p>Olá!</p>
            <p>Este é um email de teste enviado pelo sistema da <strong>Turma do Vandre</strong>.</p>
            <p>Se você recebeu este email, significa que o sistema de envio de emails está funcionando corretamente!</p>
            <hr style="border: 1px solid #ecf0f1; margin: 20px 0;">
            <p style="color: #7f8c8d; font-size: 12px;">
              Este email foi enviado em: ${new Date().toLocaleString('pt-BR')}
            </p>
            <p style="color: #7f8c8d; font-size: 12px;">
              Sistema de gerenciamento de viagens - Turma do Vandre
            </p>
          </div>
        `,
      };

      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email de teste enviado com sucesso para ${to}. MessageId: ${result.messageId}`);
      return true;
    } catch (error) {
      this.logger.error(`Erro ao enviar email de teste para ${to}:`, error);
      return false;
    }
  }

  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.SMTP_USER,
        to: to,
        subject: subject,
        html: html,
      };

      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email enviado com sucesso para ${to}. MessageId: ${result.messageId}`);
      return true;
    } catch (error) {
      this.logger.error(`Erro ao enviar email para ${to}:`, error);
      return false;
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      this.logger.log('Conexão SMTP verificada com sucesso');
      return true;
    } catch (error) {
      this.logger.error('Erro na verificação da conexão SMTP:', error);
      return false;
    }
  }

  async sendBookingConfirmationEmail(
    userEmail: string,
    bookingData: {
      id: string;
      fullName: string;
      cpf: string;
      rg: string;
      phone: string;
      birthDate: Date;
      boardingLocation: string;
      city?: string;
      howDidYouMeetUs?: string;
      travelPackage: {
        name: string;
        price: number;
        description: string;
        travelDate?: string;
        returnDate?: string;
        travelTime?: string;
        travelMonth: string;
      };
    }
  ): Promise<boolean> {
    try {
      const formattedPrice = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(bookingData.travelPackage.price);

      const formattedBirthDate = bookingData.birthDate.toLocaleDateString('pt-BR');
      
      const mailOptions = {
        from: process.env.SMTP_USER,
        to: userEmail,
        subject: `Confirmação de Reserva - ${bookingData.travelPackage.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
            <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              
              <!-- Cabeçalho -->
              <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #27ae60; padding-bottom: 20px;">
                <h1 style="color: #2c3e50; margin: 0; font-size: 28px;">🎉 Reserva Confirmada!</h1>
                <h2 style="color: #27ae60; margin: 10px 0 0 0; font-size: 22px;">Turma do Vandre</h2>
              </div>

              <!-- Mensagem de Confirmação -->
              <div style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 5px; padding: 15px; margin-bottom: 25px;">
                <p style="color: #155724; margin: 0; font-size: 16px; text-align: center;">
                  <strong>Parabéns ${bookingData.fullName}!</strong><br>
                  Sua reserva foi confirmada com sucesso! 🚌✈️
                </p>
              </div>

              <!-- Informações da Viagem -->
              <div style="margin-bottom: 25px;">
                <h3 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
                  📍 Detalhes da Viagem
                </h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #2c3e50; width: 40%;">Destino:</td>
                    <td style="padding: 8px 0; color: #34495e;">${bookingData.travelPackage.name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #2c3e50;">Valor:</td>
                    <td style="padding: 8px 0; color: #e74c3c; font-weight: bold; font-size: 18px;">${formattedPrice}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #2c3e50;">Mês da Viagem:</td>
                    <td style="padding: 8px 0; color: #34495e;">${bookingData.travelPackage.travelMonth}</td>
                  </tr>
                  ${bookingData.travelPackage.travelDate ? `
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #2c3e50;">Data de Ida:</td>
                    <td style="padding: 8px 0; color: #34495e;">${bookingData.travelPackage.travelDate}</td>
                  </tr>
                  ` : ''}
                  ${bookingData.travelPackage.returnDate ? `
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #2c3e50;">Data de Volta:</td>
                    <td style="padding: 8px 0; color: #34495e;">${bookingData.travelPackage.returnDate}</td>
                  </tr>
                  ` : ''}
                  ${bookingData.travelPackage.travelTime ? `
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #2c3e50;">Horário de Saída:</td>
                    <td style="padding: 8px 0; color: #34495e;">${bookingData.travelPackage.travelTime}</td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #2c3e50;">Local de Embarque:</td>
                    <td style="padding: 8px 0; color: #34495e;">${bookingData.boardingLocation}</td>
                  </tr>
                </table>
              </div>

              <!-- Informações Pessoais -->
              <div style="margin-bottom: 25px;">
                <h3 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
                  👤 Dados do Passageiro
                </h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #2c3e50; width: 40%;">Nome Completo:</td>
                    <td style="padding: 8px 0; color: #34495e;">${bookingData.fullName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #2c3e50;">CPF:</td>
                    <td style="padding: 8px 0; color: #34495e;">${bookingData.cpf}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #2c3e50;">RG:</td>
                    <td style="padding: 8px 0; color: #34495e;">${bookingData.rg}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #2c3e50;">Data de Nascimento:</td>
                    <td style="padding: 8px 0; color: #34495e;">${formattedBirthDate}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #2c3e50;">Telefone:</td>
                    <td style="padding: 8px 0; color: #34495e;">${bookingData.phone}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #2c3e50;">Email:</td>
                    <td style="padding: 8px 0; color: #34495e;">${userEmail}</td>
                  </tr>
                  ${bookingData.city ? `
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #2c3e50;">Cidade:</td>
                    <td style="padding: 8px 0; color: #34495e;">${bookingData.city}</td>
                  </tr>
                  ` : ''}
                </table>
              </div>

              <!-- Número da Reserva -->
              <div style="background-color: #e8f4fd; border: 1px solid #bee5eb; border-radius: 5px; padding: 15px; margin-bottom: 25px; text-align: center;">
                <p style="margin: 0; color: #0c5460;">
                  <strong>Número da sua reserva:</strong><br>
                  <span style="font-size: 24px; font-weight: bold; color: #2c3e50;">${bookingData.id}</span>
                </p>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #6c757d;">
                  Guarde este número para futuras consultas
                </p>
              </div>

              <!-- Próximos Passos -->
              <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin-bottom: 25px;">
                <h4 style="color: #856404; margin: 0 0 10px 0;">📋 Próximos Passos:</h4>
                <ul style="color: #856404; margin: 0; padding-left: 20px;">
                  <li>Aguarde contato da nossa equipe para mais informações</li>
                  <li>Mantenha seus documentos em dia</li>
                  <li>Fique atento às suas mensagens e emails</li>
                  <li>Em caso de dúvidas, entre em contato conosco</li>
                </ul>
              </div>

              <!-- Informações de Contato -->
              <div style="border-top: 2px solid #ecf0f1; padding-top: 20px; text-align: center;">
                <h4 style="color: #2c3e50; margin: 0 0 10px 0;">📞 Contato</h4>
                <p style="margin: 5px 0; color: #7f8c8d;">
                  <strong>Email:</strong> atendimento@turmadovandre.com.br
                </p>
                <p style="margin: 5px 0; color: #7f8c8d;">
                  <strong>WhatsApp:</strong> Entre em contato através do nosso site
                </p>
              </div>

              <!-- Rodapé -->
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1;">
                <p style="color: #7f8c8d; font-size: 12px; margin: 0;">
                  Email enviado automaticamente em: ${new Date().toLocaleString('pt-BR')}<br>
                  Sistema de Gerenciamento de Viagens - Turma do Vandre<br>
                  <strong>Obrigado por escolher a Turma do Vandre! 🚌✈️</strong>
                </p>
              </div>

            </div>
          </div>
        `,
      };

      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email de confirmação de reserva enviado para ${userEmail}. MessageId: ${result.messageId}`);
      return true;
    } catch (error) {
      this.logger.error(`Erro ao enviar email de confirmação de reserva para ${userEmail}:`, error);
      return false;
    }
  }
}
