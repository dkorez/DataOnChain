import { Module } from '@nestjs/common';
import { FullDocumentController } from './full-document.controller';
import { FullDocumentService } from './full-document.service';

@Module({
  providers: [FullDocumentService],
  controllers: [FullDocumentController],
  exports: [FullDocumentService],
})
export class FullDocumentModule {}
