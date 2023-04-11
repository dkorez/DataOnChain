import { SaveDocumentDto } from './../../dto/save-document.dto';
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
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('EVM: Storing only document hashes')
@Controller('evm/document-hash')
export class DocumentHashController {
  constructor(private documentService: DocumentHashService) {}

  @ApiOperation({
    description:
      'Saves any content you provide in the body to the blockchain and returns UUID ',
  })
  @ApiBody({
    description: 'any payload you want to save on blockchain',
    type: SaveDocumentDto,
  })
  @ApiSecurity('Api-Key')
  @ApiOkResponse({ description: 'Document sucessfully saved', schema: {} })
  @ApiUnauthorizedResponse({ description: 'Unauthorised' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  @Post('/save-hash')
  @Header('Content-type', 'application/json')
  @Header('Accept', 'application/json')
  public async saveDocumentHash(
    @Body() payload: SaveDocumentDto,
    @Res() response,
  ) {
    const content = await this.documentService.saveDocumentHash(payload.data);
    response.status(HttpStatus.OK).send(content);
  }

  @ApiOperation({
    description: 'Retrieves secret from blockchain and decodes data offchain',
  })
  @ApiSecurity('Api-Key')
  @ApiOkResponse({ description: 'Document retrieved' })
  @ApiUnauthorizedResponse({ description: 'Unauthorised' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  @Get('/:id/decode-offchain')
  @Header('Accept', 'text/plain')
  public async getDocumentBySecred(@Param('id') uuid: string, @Res() response) {
    if (!uuid) {
      return response
        .status(HttpStatus.BAD_REQUEST)
        .send('parameter UUID is required');
    }
    const content = await this.documentService.getDocumentBySecred(uuid);
    response.status(200).send(content);
  }

  @ApiOperation({
    description: 'Retrieves decoded data from blockchain',
  })
  @ApiSecurity('Api-Key')
  @ApiOkResponse({ description: 'Document retrieved' })
  @ApiUnauthorizedResponse({ description: 'Unauthorised' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  @Get('/:id/decode-onchain')
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

  @ApiOperation({
    description: 'Retrieves stored hashes for given address',
  })
  @ApiOkResponse({ description: 'Hashed retrieved' })
  @ApiBadRequestResponse({ description: 'Bad request' })
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
