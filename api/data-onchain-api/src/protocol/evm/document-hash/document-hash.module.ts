import { Module } from '@nestjs/common';
import { DocumentResourceModule } from 'src/document-resource/document-resource.module';
import { DocumentHashController } from './document-hash.controller';
import { DocumentHashService } from './document-hash.service';

@Module({
  imports: [DocumentResourceModule],
  providers: [DocumentHashService],
  controllers: [DocumentHashController],
  exports: [DocumentHashService],
})
export class DocumentHashModule {}
