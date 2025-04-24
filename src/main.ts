import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { json } from 'express'; // Importar o middleware json

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  
  // Aumentar o limite de tamanho das requisições
  app.use(json({ limit: '50mb' })); // Aumentar o limite para 50MB
  
  const corsOptions: CorsOptions = {
    origin: true, 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  };
  app.enableCors(corsOptions);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  if (process.env.MONGO_URI) {
    mongoose
      .connect(process.env.MONGO_URI)
      .then(() => console.log('✅ Conectado ao MongoDB!'))
      .catch((error) => console.error('❌ Erro no MongoDB:', error));
  }

  const config = new DocumentBuilder()
    .setTitle('API de Pacotes de Viagem')
    .setDescription('Documentação da API para gerenciamento de pacotes de viagem e reservas')
    .setVersion('1.0')
    .addServer('http://localhost:3001')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT || 3001);
  console.log(`Servidor iniciado na porta ${process.env.PORT || 3001}`);
}

bootstrap();