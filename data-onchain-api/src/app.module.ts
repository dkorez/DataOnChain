import { HttpModule } from '@nestjs/axios';
import { Document } from './document-resource/document.entity';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DocumentHashController } from './protocol/evm/document-hash/document-hash.controller';
import { DocumentHashService } from './protocol/evm/document-hash/document-hash.service';
import { DocumentHashModule } from './protocol/evm/document-hash/document-hash.module';
import { ConfigModule } from '@nestjs/config';
import { FullDocumentController } from './protocol/evm/full-document/full-document.controller';
import { FullDocumentService } from './protocol/evm/full-document/full-document.service';
import { FullDocumentModule } from './protocol/evm/full-document/full-document.module';
import { DocumentService } from './protocol/evm/document.service';
import { DocumentResourceModule } from './document-resource/document-resource.module';
import config from './config/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { PinataService } from './pinata/pinata.service';
import { PinataModule } from './pinata/pinata.module';
import { DocumentHashIpfsController } from './protocol/evm/document-hash-ipfs/document-hash-ipfs.controller';
import { DocumentHashIpfsService } from './protocol/evm/document-hash-ipfs/document-hash-ipfs.service';
import { DocumentHashIpfsModule } from './protocol/evm/document-hash-ipfs/document-hash-ipfs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: ':memory:',
      entities: [Document],
      synchronize: true,
    }),
    DocumentHashModule,
    DocumentHashIpfsModule,
    FullDocumentModule,
    DocumentResourceModule,
    PinataModule,
    HttpModule,
  ],
  controllers: [
    AppController,
    DocumentHashController,
    DocumentHashIpfsController,
    FullDocumentController,
  ],
  providers: [
    AppService,
    DocumentHashService,
    DocumentHashIpfsService,
    FullDocumentService,
    DocumentService,
    PinataService,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
