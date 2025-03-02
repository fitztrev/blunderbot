import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ENV } from './config/config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new IoAdapter(app));

  app.enableCors({ origin: '*', methods: '*' });
  await app.listen(ENV.PORT);
}

bootstrap();
