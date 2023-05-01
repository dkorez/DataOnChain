import { Controller, Get, Post, Param } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppService } from './app.service';
import { PinataService } from './pinata/pinata.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private configService: ConfigService,
    private pinataService: PinataService,
  ) {}

  @Get('api/version')
  getHello(): string {
    return this.configService.get<string>('env') + '-0.0.2';
  }

  @Post('test-ipfs/:uuid')
  saveContentToIpfs(@Param('uuid') uuid): Promise<any> {
    const data = {
      data: 'come random content',
    };

    return this.pinataService.pinContentToIPFS(data, uuid);
  }

  @Get('test-ipfs/:cid')
  getContentFromIpfs(@Param('cid') cid): Promise<any> {
    return this.pinataService.getContentFromIPFS(cid);
  }
}
