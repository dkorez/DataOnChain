import { HttpModule } from '@nestjs/axios';
import { Module, forwardRef } from '@nestjs/common';
import { PinataService } from './pinata.service';

@Module({
  imports: [forwardRef(() => HttpModule)],
  providers: [PinataService],
  exports: [PinataService],
})
export class PinataModule {}
