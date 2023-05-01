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
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { DocumentHashIpfsService } from './document-hash-ipfs.service';
import { DocumentDto } from 'src/protocol/dto/document.dto';

@ApiTags('EVM: Storing only document hashes')
@Controller('evm/document-hash-ifps')
export class DocumentHashIpfsController {
  constructor(private documentService: DocumentHashIpfsService) {}

  @ApiOperation({
    description:
      'Saves any content you provide in the body to the blockchain and returns UUID and IPFS cid ',
  })
  @ApiBody({
    description: 'any payload you want to save on blockchain',
    type: DocumentDto,
  })
  @ApiSecurity('Api-Key')
  @ApiOkResponse({ description: 'Document sucessfully saved', schema: {} })
  @ApiUnauthorizedResponse({ description: 'Unauthorised' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  @ApiConsumes('application/json')
  @Post('/save')
  @Header('Content-type', 'application/json')
  @Header('Accept', 'application/json')
  public async saveDocumentHash(
    @Body() document: DocumentDto,
    @Res() response,
  ) {
    const content = await this.documentService.saveDocumentHashIpfs(document);
    response.status(HttpStatus.OK).send(content);
  }

  @ApiOperation({
    description:
      'Retrieves data from blockchain by uuid and decodes data offchain',
  })
  @ApiSecurity('Api-Key')
  @ApiOkResponse({ description: 'Document retrieved' })
  @ApiUnauthorizedResponse({ description: 'Unauthorised' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  @Get('/get-by-uuid/:uuid')
  @Header('Accept', 'text/plain')
  public async getDocumentBySecret(
    @Param('uuid') uuid: string,
    @Res() response,
  ) {
    if (!uuid) {
      return response
        .status(HttpStatus.BAD_REQUEST)
        .send('parameter UUID is required');
    }
    const content = await this.documentService.getDocumentByUuid(uuid);
    response.status(200).send(content);
  }

  @ApiOperation({
    description: 'Retrieves decoded data from blockchain by uuid and cid',
  })
  @ApiSecurity('Api-Key')
  @ApiOkResponse({ description: 'Document retrieved' })
  @ApiUnauthorizedResponse({ description: 'Unauthorised' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  @Get('/get/:uuid/:cid')
  @Header('Accept', 'text/plain')
  public async getDocumentContent(
    @Param('uuid') uuid: string,
    @Param('cid') cid: string,
    @Res() response,
  ) {
    if (!uuid) {
      return response
        .status(HttpStatus.BAD_REQUEST)
        .send('parameter UUID is required');
    }
    if (!cid) {
      return response
        .status(HttpStatus.BAD_REQUEST)
        .send('parameter cid is required');
    }
    const content = await this.documentService.getDocumentContentByUuidAndCid(
      uuid,
      cid,
    );
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
