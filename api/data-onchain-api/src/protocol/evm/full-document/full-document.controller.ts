import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { FullDocumentService } from './full-document.service';

@Controller('evm/full-document')
export class FullDocumentController {
  constructor(private documentService: FullDocumentService) {}

  @Get('/:id/hash')
  @Header('Content-type', 'application/json')
  public async getDocumentHashFull(@Param('id') id, @Res() response) {
    try {
      const content = await this.documentService.getDocumentHashFull(id);
      response.status(200).send(content);
    } catch (err) {
      response.status(500).send(err);
    }
  }

  @Get('/:id/raw')
  @Header('Content-type', 'application/json')
  public async getDocumentContentFull(@Param('id') id, @Res() response) {
    try {
      const content = await this.documentService.getDocumentContentFull(id);
      response.status(200).send(content);
    } catch (err) {
      response.status(500).send(err);
    }
  }

  @Post('/hash')
  @Header('Content-type', 'application/json')
  public async saveDocumentHashFull(@Body() payload, @Res() response) {
    try {
      await this.documentService.saveDocumentHashFull(payload);
      response.status(200).send();
    } catch (err) {
      response.status(500).send(err);
    }
  }

  @Post('/raw')
  @Header('Content-type', 'application/json')
  public async saveDocumentContentFull(@Body() payload, @Res() response) {
    try {
      await this.documentService.saveDocumentContentFull(payload);
      response.status(200).send();
    } catch (err) {
      response.status(500).send(err);
    }
  }
}
