import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  app.use(rawBodyParser);

  await app.listen(3000);
}
bootstrap();

const rawBodyParser = function (req, res, next) {
  req.rawData = '';
  if (req.header('content-type') == 'text/plain') {
    req.on('data', function (chunk) {
      req.rawData += chunk;
    });
    req.on('end', function () {
      next();
    });
  } else {
    next();
  }
};
