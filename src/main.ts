import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);  
  
  const configService = app.get(ConfigService);

  if (configService.get('FRONTEND_URL')) {
    app.enableCors({
      origin: configService.get('FRONTEND_URL'),
      credentials: true,
    });
  }

  
  await app.listen(configService.get('PORT'));

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();