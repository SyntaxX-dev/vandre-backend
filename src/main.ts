import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import * as mongoose from 'mongoose';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3000;
  mongoose.connection.on('connected', () => {
    console.log('Conectado ao MongoDB com sucesso!');
  });

  mongoose.connection.on('error', (error) => {
    console.error('Erro na conexão com o MongoDB:', error);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('Desconectado do MongoDB');
  });
  const config = new DocumentBuilder()
    .setTitle('API do Meu Projeto')
    .setDescription('Documentação da API do Meu Projeto')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  writeFileSync('./openapi.json', JSON.stringify(document, null, 2));

  await app.listen(port);

  const scalarUrl = `https://vandre.apidocumentation.com/reference`;

  console.log(`\nAplicação rodando na porta: http://localhost:${port}`);
  console.log(`Acesse a documentação Scalar em: ${scalarUrl}\n`);
}
bootstrap();
