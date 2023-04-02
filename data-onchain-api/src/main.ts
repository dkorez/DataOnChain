import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { WinstonModule } from 'nest-winston';
import { transports, format } from 'winston';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './middleware/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
    logger: setupLogger(),
  });

  const swaggerDoc = setupSwagger(app);
  SwaggerModule.setup('api', app, swaggerDoc);

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3000);
}
bootstrap();

function setupLogger() {
  const errorTransport = new transports.File({
    filename: `logs/error.log`,
    level: 'error',
    format: format.combine(
      format.timestamp(),
      format.errors({ stack: true }),
      format.json(),
    ),
  });

  const combinedTransport = new transports.File({
    filename: `logs/combined.log`,
    format: format.combine(format.timestamp(), format.json()),
  });

  const consoleTransport = new transports.Console({
    format: format.combine(
      format.cli(),
      format.splat(),
      format.timestamp(),
      format.printf((info) => {
        return `${info.timestamp} ${info.level}: ${info.message}`;
      }),
    ),
  });

  return WinstonModule.createLogger({
    transports: [errorTransport, combinedTransport, consoleTransport]
  });
}

function setupSwagger(app) {
  const swaggetConfig = new DocumentBuilder()
    .setTitle('Data on Chain')
    .setDescription('API gateway to manipulate data on blockchain')
    .setVersion('0.1')
    .addApiKey(
      {
        type: 'apiKey',
        name: 'signer-key',
        description: "eth account's private key",
        in: 'header',
      },
      'Api-Key',
    )
    .build();
  return SwaggerModule.createDocument(app, swaggetConfig);
}
