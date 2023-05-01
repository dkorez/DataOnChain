import { Module } from '@nestjs/common';
import { DocumentHashIpfsService } from './document-hash-ipfs.service';
import { DocumentHashIpfsController } from './document-hash-ipfs.controller';
import { PinataModule } from 'src/pinata/pinata.module';

@Module({
  imports: [PinataModule],
  providers: [DocumentHashIpfsService],
  controllers: [DocumentHashIpfsController],
  exports: [DocumentHashIpfsService],
})
export class DocumentHashIpfsModule {}
