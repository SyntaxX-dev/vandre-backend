import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import * as mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  const corsOptions: CorsOptions = {
    origin: true, // ou liste seus domínios específicos
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  };
  app.enableCors(corsOptions);

  if (process.env.MONGO_URI) {
    mongoose
      .connect(process.env.MONGO_URI)
      .then(() => console.log('✅ Connected to MongoDB!'))
      .catch((error) => console.error('❌ MongoDB Error:', error));
  }

  const config = new DocumentBuilder()
    .setTitle('API do Meu Projeto')
    .setDescription('Documentação da API')
    .addServer('http://localhost:3001')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT || 3001);
}

bootstrap();
