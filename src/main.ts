import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import * as mongoose from 'mongoose';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3000;
  
  // Enable CORS for Vercel deployment
  app.enableCors();
  
  // Define a prefix for all API routes
  app.setGlobalPrefix('api');

  // Connect to MongoDB
  await mongoose.connect(
    process.env.MONGO_URI || 'mongodb://localhost:27017/meuBanco',
  );
  mongoose.connection.on('connected', () =>
    console.log('✅ Connected to MongoDB!'),
  );
  mongoose.connection.on('error', (error) =>
    console.error('❌ MongoDB Error:', error),
  );

  // Configure Swagger (only in development)
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('My Project API')
      .setDescription('API Documentation')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    
    // Only write file in local environment
    if (process.env.NODE_ENV === 'development') {
      writeFileSync('./openapi.json', JSON.stringify(document, null, 2));
    }
    
    console.log(`📖 Swagger available at: http://localhost:${port}/api/docs`);
  }

  await app.listen(port, '0.0.0.0');
  console.log(`🚀 API running at: http://localhost:${port}/api`);
}
bootstrap();
