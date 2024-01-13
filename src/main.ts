import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Weather')
    .setDescription('The Weather API')
    .setVersion('1.0')
    .addTag('weather')
    .addTag('user')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'jwt',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  document.paths['/user'].get.security = [{ jwt: [] }];
  document.paths['/user/favorites'].get.security = [{ jwt: [] }];
  document.paths['/user/add-favorite'].post.security = [{ jwt: [] }];
  document.paths['/user/remove-favorite'].delete.security = [{ jwt: [] }];
  document.paths['/weather/{city}'].get.security = [{ jwt: [] }];

  await app.listen(3000);
}
bootstrap();
