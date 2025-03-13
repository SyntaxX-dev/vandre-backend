import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import * as mongoose from 'mongoose';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3000;

  // 🔹 Define um prefixo para todas as rotas da API
  app.setGlobalPrefix('api');

  // 🔹 Conectar ao MongoDB
  await mongoose.connect(
    process.env.MONGO_URI || 'mongodb://localhost:27017/meuBanco',
  );

  mongoose.connection.on('connected', () =>
    console.log('✅ Conectado ao MongoDB!'),
  );
  mongoose.connection.on('error', (error) =>
    console.error('❌ Erro no MongoDB:', error),
  );

  // 🔹 Configurar Swagger (somente em desenvolvimento)
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('API do Meu Projeto')
      .setDescription('Documentação da API')
      .setVersion('1.0')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    writeFileSync('./openapi.json', JSON.stringify(document, null, 2));

    console.log(`📖 Swagger disponível em: http://localhost:${port}/api/docs`);
  }

  await app.listen(port, '0.0.0.0');

  console.log(`🚀 API rodando em: http://localhost:${port}/api`);
}
bootstrap();
