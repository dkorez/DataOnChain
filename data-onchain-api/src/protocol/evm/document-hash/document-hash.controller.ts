import {
  Body,
  Controller,
  Get,
  Header,
  HttpStatus,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { DocumentHashService } from './document-hash.service';

@Controller('evm/document-hash')
export class DocumentHashController {
  constructor(private documentService: DocumentHashService) {}

  @Post('/save-hash')
  @Header('Content-type', 'application/json')
  public async saveDocumentHash(@Body() payload, @Res() response) {
    if (!payload) {
      return response
        .status(HttpStatus.BAD_REQUEST)
        .send('payload cannot be empty');
    }

    const content = await this.documentService.saveDocumentHash(payload);
    response.status(HttpStatus.OK).send(content);
  }

  @Get('/:id/get-hash')
  @Header('Accept', 'text/plain')
  public async getDocumentBySalt(@Param('id') uuid: string, @Res() response) {
    if (!uuid) {
      return response
        .status(HttpStatus.BAD_REQUEST)
        .send('parameter UUID is required');
    }
    const content = await this.documentService.getDocumentBySecred(uuid);
    response.status(200).send(content);
  }

  @Get('/:id/get-content')
  @Header('Accept', 'text/plain')
  public async getDocumentContent(@Param('id') uuid: string, @Res() response) {
    if (!uuid) {
      return response
        .status(HttpStatus.BAD_REQUEST)
        .send('parameter UUID is required');
    }
    const content = await this.documentService.getDocumentContent(uuid);
    response.status(200).send(content);
  }

  @Get('user-document-hashes/:address')
  public async getUserDocumentHashes(
    @Param('address') address: string,
    @Res() response,
  ) {
    if (!address) {
      return response
        .status(HttpStatus.BAD_REQUEST)
        .send('parameter address is required');
    }
    const content = await this.documentService.getDocumentHashesForUser(
      address,
    );
    response.status(200).send(content);
  }
}
