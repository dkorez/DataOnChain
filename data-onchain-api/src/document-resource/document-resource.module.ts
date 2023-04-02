import { Document } from './document.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { DocumentResourceService } from './document-resource.service';

@Module({
  imports: [TypeOrmModule.forFeature([Document])],
  providers: [DocumentResourceService],
  exports: [DocumentResourceService],
})
export class DocumentResourceModule {}
