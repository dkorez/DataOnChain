import {
  Inject,
  Injectable,
  Scope,
  NotFoundException,
  UnprocessableEntityException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ethers } from 'ethers';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { DocumentService } from '../document.service';
import { DocumentResourceService } from './../../../document-resource/document-resource.service';
import { ConfigService } from '@nestjs/config';

@Injectable({ scope: Scope.REQUEST })
export class DocumentHashService extends DocumentService {
  private readonly logger = new Logger(DocumentHashService.name);

  constructor(
    protected configService: ConfigService,
    @Inject(REQUEST) protected request: Request,
    private readonly docResService: DocumentResourceService,
  ) {
    super(configService, request);
  }

  /* implementation for document hashed only */
  public async saveDocumentHash(content: string): Promise<any> {
    const contract = this.getContract();
    const uuidBytes = ethers.utils.randomBytes(32);
    const uuid = ethers.utils.hexlify(uuidBytes);

    try {
      const tx = await contract.generateDocumentSecret(uuid);
      await this.getTxReceipt(tx.hash);

      const hashedSecret = await contract.getDocumentSecret(uuid);
      const abi = ethers.utils.defaultAbiCoder;
      const encodedContent = abi.encode(
        ['bytes', 'string', 'bytes'],
        [uuid, JSON.stringify(content), hashedSecret],
      );

      await this.docResService.createDocument(uuid, encodedContent);

      return {
        uuid: uuid,
        content: encodedContent,
      };
    } catch (err) {
      this.logger.error(
        `error in saveDocumentHash ${err.message}: ` + JSON.stringify(err),
      );
      throw new InternalServerErrorException(
        'error in saveDocumentHash',
        err.message,
      );
    }
  }

  public async getDocumentBySecred(uuid: string): Promise<string> {
    const contract = this.getContract();
    const secret = await contract.getDocumentSecret(uuid);
    if (!secret) {
      throw new NotFoundException(
        `document secret for uuid ${uuid} was not found`,
      );
    }
    const payload = await this.docResService.getDocumentContent(uuid);

    const abi = ethers.utils.defaultAbiCoder;
    const decodedContent = abi.decode(['bytes', 'string', 'bytes'], payload);

    if (decodedContent.length != 3) {
      throw new UnprocessableEntityException('invalid_array_length');
    }

    if (uuid != decodedContent[0]) {
      throw new UnprocessableEntityException('uuid_not_match');
    }

    if (secret != decodedContent[2]) {
      throw new UnprocessableEntityException('secret_not_match');
    }

    return decodedContent[1];
  }

  public async getDocumentContent(uuid: string): Promise<string> {
    const contract = this.getContract();
    const payload = await this.docResService.getDocumentContent(uuid);

    try {
      const content = await contract.getDocumentContent(uuid, payload);
      return content;
    } catch (err) {
      this.logger.error(`error in getDocumentContent: ${err.message}`);
      throw new InternalServerErrorException(
        'error in getDocumentContent',
        err.message,
      );
    }
  }

  public async getDocumentHashesForUser(user: string): Promise<any> {
    const contract = this.getPublicContract();
    try {
      const documents = await contract.getDocumentHashesForUser(user);
      return documents;
    } catch (err) {
      this.logger.error(
        `error in getDocumentHashesForUser ${err.message}: ${JSON.stringify(
          err,
        )}`,
      );
      throw new InternalServerErrorException(
        'error in getDocumentHashesForUser',
        err.message,
      );
    }
  }
}
