import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EnvironmentConfigModule } from './enviroment-config/enviroment-config.module';
import { DatabaseModule } from './infrastructure/database/database.module';
import { UserController } from './presentation/controllers/user.controller';
import { TravelPackageRepository } from './infrastructure/repositories/travel-package.repository';
import { TravelPackageController } from './presentation/controllers/travel-package.controller';
import { BookingController } from './presentation/controllers/booking.controller';
import { BookingRepository } from './infrastructure/repositories/booking.repository';
import { AuthModule } from './auth/auth.module';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    EnvironmentConfigModule,
    DatabaseModule,
    AuthModule,
    MulterModule.register({
      storage: memoryStorage(),
      limits: {
        fileSize: 15 * 1024 * 1024, // 15 MB
      },
    }),
  ],
  controllers: [
    AppController,
    UserController,
    TravelPackageController,
    BookingController,
  ],
  providers: [AppService, TravelPackageRepository, BookingRepository],
})
export class AppModule {}