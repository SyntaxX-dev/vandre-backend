import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EnvironmentConfigModule } from './enviroment-config/enviroment-config.module';
import { DatabaseModule } from './infrastructure/database/database.module';
import { UserController } from './presentation/controllers/user.controller';
import { TravelPackageRepository } from './infrastructure/repositories/travel-package.repository';
import { TravelPackageController } from './presentation/controllers/travel-package.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    EnvironmentConfigModule,
    DatabaseModule,
  ],
  controllers: [AppController, UserController, TravelPackageController],
  providers: [AppService, TravelPackageRepository],
})
export class AppModule {}
