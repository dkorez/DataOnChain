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
import { ApiBody, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';

@ApiTags('EVM: Storing full document content - will become deprecated')
@Controller('evm/full-document')
export class FullDocumentController {
  constructor(private documentService: FullDocumentService) {}

  @ApiOperation({
    description: 'Retrieves secret hash from blockchain',
    deprecated: true,
  })
  @ApiSecurity('Api-Key')
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

  @ApiOperation({
    description: 'Retrieves decoded content from blockchain',
    deprecated: true,
  })
  @ApiSecurity('Api-Key')
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

  @ApiOperation({
    description: 'Encodes data and stores encoded hash to blockchain',
    deprecated: true,
  })
  @ApiSecurity('Api-Key')
  @Post('/hash')
  @ApiBody({ description: 'any payload you want to save on blockchain' })
  @Header('Content-type', 'application/json')
  public async saveDocumentHashFull(@Body() payload, @Res() response) {
    try {
      await this.documentService.saveDocumentHashFull(payload);
      response.status(200).send();
    } catch (err) {
      response.status(500).send(err);
    }
  }

  @ApiOperation({
    description: 'Stores plain data on blockchain',
    deprecated: true,
  })
  @ApiSecurity('Api-Key')
  @Post('/raw')
  @ApiBody({ description: 'any payload you want to save on blockchain' })
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
