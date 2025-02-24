import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EnvironmentConfigModule } from './enviroment-config/enviroment-config.module';
import { DatabaseModule } from './infrastructure/database/database.module';
import { UserController } from './presentation/controllers/user.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    EnvironmentConfigModule,
    DatabaseModule,
  ],
  controllers: [AppController, UserController],
  providers: [AppService],
})
export class AppModule {}
