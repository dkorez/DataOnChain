import { Document } from './document-resource/document.entity';
import { Module } from '@nestjs/common';
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
    FullDocumentModule,
    DocumentResourceModule,
  ],
  controllers: [AppController, DocumentHashController, FullDocumentController],
  providers: [
    AppService,
    DocumentHashService,
    FullDocumentService,
    DocumentService,
  ],
})
export class AppModule {}
