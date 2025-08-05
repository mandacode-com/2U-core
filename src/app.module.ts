import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ProjectModule } from './project/modules/project.module';
import { MessageAdminModule } from './message/modules/admin.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Config } from './common/schemas/config.schema';
import { validate } from './common/config/validate';
import { ProjectCheckModule } from './project/modules/check.module';
import { DevController } from './dev.controller';
import { MessageUserModule } from './message/modules/user.module';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: validate,
      isGlobal: true,
    }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Config, true>) => ({
        secret: config.get<Config['auth']>('auth').gatewayJwtSecret,
        global: true,
      }),
      global: true,
    }),
    MulterModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Config, true>) => ({
        storage: memoryStorage(),
        limits: {
          fileSize: config.get<Config['storage']>('storage').maxFileSize,
        },
        fileFilter: (req, file, callback) => {
          const allowedTypes =
            config.get<Config['storage']>('storage').allowedFileTypes;
          if (allowedTypes.includes(file.mimetype)) {
            callback(null, true);
          } else {
            callback(new Error('Invalid file type'), false);
          }
        },
      }),
    }),
    ProjectModule,
    MessageAdminModule,
    MessageUserModule,
    ProjectCheckModule,
  ],
  controllers: [AppController, DevController],
})
export class AppModule {}
