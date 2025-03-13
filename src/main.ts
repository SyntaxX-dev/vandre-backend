import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as mongoose from 'mongoose';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  // Only attempt MongoDB connection when handling requests, not during build
  if (process.env.MONGO_URI) {
    mongoose
      .connect(process.env.MONGO_URI)
      .then(() => console.log('✅ Connected to MongoDB!'))
      .catch((error) => console.error('❌ MongoDB Error:', error));
  }

  // Configure Swagger (in-memory only)
  const config = new DocumentBuilder()
    .setTitle('API do Meu Projeto')
    .setDescription('Documentação da API')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // In Vercel, we don't need to specify the port
  await app.listen(process.env.PORT || 3000);
}

bootstrap();
