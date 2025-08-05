import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Config } from './common/schemas/config.schema';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService<Config, true>);

  app.enableCors({
    origin: config.get<Config['cors']>('cors').origin,
    credentials: config.get<Config['cors']>('cors').credentials,
    methods: config.get<Config['cors']>('cors').methods,
  });

  await app.listen(config.get<Config['server']>('server').port);
}
bootstrap().catch((error) => {
  console.error('Error during application bootstrap:', error);
  process.exit(1);
});
