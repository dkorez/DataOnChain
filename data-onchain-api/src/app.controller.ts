import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private configService: ConfigService) {}

  @Get("api/version")
  getHello(): string {
    return this.configService.get<string>('env') + "-0.0.1";
  }
}
