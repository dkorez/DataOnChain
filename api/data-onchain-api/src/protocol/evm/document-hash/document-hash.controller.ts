import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { DocumentHashService } from './document-hash.service';

@Controller('evm/document-hash')
export class DocumentHashController {
  constructor(private documentService: DocumentHashService) {}

  @Post('/save-hash')
  @Header('Content-type', 'application/json')
  public async saveDocumentHash(@Body() payload, @Res() response) {
    try {
      const content = await this.documentService.saveDocumentHash(payload);
      response.status(200).send(content);
    } catch (err) {
      response.status(500).send(err);
    }
  }

  @Get('/:id/get-hash')
  @Header('Accept', 'text/plain')
  public async getDocumentBySalt(@Param('id') uuid: string, @Res() response) {
    try {
      const content = await this.documentService.getDocumentBySecred(uuid);
      response.status(200).send(content);
    } catch (err) {
      response.status(500).send(err);
    }
  }

  @Get('/:id/get-content')
  @Header('Accept', 'text/plain')
  public async getDocumentContent(@Param('id') uuid: string, @Res() response) {
    try {
      const content = await this.documentService.getDocumentContent(uuid);
      response.status(200).send(content);
    } catch (err) {
      response.status(500).send(err);
    }
  }

  @Get('user-document-hashes/:address')
  public async getUserDocumentHashes(
    @Param('address') address: string,
    @Res() response,
  ) {
    try {
      const content = await this.documentService.getDocumentHashesForUser(
        address,
      );
      response.status(200).send(content);
    } catch (err) {
      response.status(500).send(err);
    }
  }
}
