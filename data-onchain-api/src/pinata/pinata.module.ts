import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { PinataService } from './pinata.service';

@Module({
  imports: [HttpModule],
  providers: [PinataService],
  exports: [PinataService],
})
export class PinataModule {}
