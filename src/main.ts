import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as mongoose from 'mongoose';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  // Habilitar CORS
  app.enableCors({
    origin: '*', // Permitir todas as origens (altere para domínios específicos em produção)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true, // Permitir envio de cookies/autenticação
  });

  // Conectar ao MongoDB se a URI estiver definida
  if (process.env.MONGO_URI) {
    mongoose
      .connect(process.env.MONGO_URI)
      .then(() => console.log('✅ Connected to MongoDB!'))
      .catch((error) => console.error('❌ MongoDB Error:', error));
  }

  // Configurar Swagger
  const config = new DocumentBuilder()
    .setTitle('API do Meu Projeto')
    .setDescription('Documentação da API')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Iniciar servidor
  await app.listen(process.env.PORT || 3000);
}

bootstrap();
