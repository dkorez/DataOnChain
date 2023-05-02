import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { DocumentService } from '../document.service';
import { ConfigService } from '@nestjs/config';
import { ContractSetup } from '../contract-setup';
import contractAbi from '../../../abi/DataOnChainIpfs.json';
import { ethers } from 'ethers';
import { DocumentDto } from './../../../protocol/dto/document.dto';
import { PinataService } from './../../../pinata/pinata.service';
import { IpfsDocumentDto } from './../../../protocol/dto/ipfs.document.dto';

@Injectable()
export class DocumentHashIpfsService extends DocumentService {
  private readonly logger = new Logger(DocumentHashIpfsService.name);

  constructor(
    protected configService: ConfigService,
    @Inject(REQUEST) protected request: Request,
    private readonly pinataService: PinataService,
  ) {
    super(configService, request);

    const rpcUrl = this.configService.get<string>('RPC_URL');
    const contract = this.configService.get('CONTRACT.IPFS');
    const contractSetup: ContractSetup = {
      rpcUrl: rpcUrl,
      contractAddress: contract,
      contractAbi: contractAbi,
    };
    this.setup(contractSetup);
  }

  /* implementation for document hashed only */
  public async saveDocumentHashIpfs(document: DocumentDto): Promise<any> {
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
        [uuid, JSON.stringify(document.data), hashedSecret],
      );

      const data: IpfsDocumentDto = {
        content: encodedContent,
      };
      const ipfsHash = await this.pinataService.pinContentToIPFS(data, uuid);
      const ipfsHashBytes = ethers.utils.toUtf8Bytes(ipfsHash);

      await contract.updateDocument(uuid, ipfsHashBytes);

      return {
        uuid: uuid,
        ipfs: ipfsHash,
      };
    } catch (err) {
      this.logger.error(
        `error in saveDocumentHashIpfs ${err.message}: ` + JSON.stringify(err),
      );
      throw new InternalServerErrorException(
        'error in saveDocumentHashIpfs',
        err.message,
      );
    }
  }

  public async getDocumentByUuid(uuid: string): Promise<string> {
    const contract = this.getContract();
    const secret = await contract.getDocumentSecret(uuid);
    const ipfsBytes = await contract.getDocumentIpfsHash(uuid);
    if (!secret) {
      throw new NotFoundException(
        `document secret for uuid ${uuid} was not found`,
      );
    }
    if (!ipfsBytes) {
      throw new NotFoundException(
        `document ipfs for uuid ${uuid} was not found`,
      );
    }

    const ipfs = ethers.utils.toUtf8String(ipfsBytes);
    const ipfsDocument: IpfsDocumentDto = await this.pinataService.getContentFromIPFS(ipfs);
    const encodedContent = ipfsDocument.content;

    const abi = ethers.utils.defaultAbiCoder;
    const decodedContent = abi.decode(
      ['bytes', 'string', 'bytes'],
      encodedContent,
    );

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

  public async getDocumentContentByUuidAndCid(
    uuid: string,
    cid: string,
  ): Promise<string> {
    const contract = this.getContract();
    const encodedContent = await this.pinataService.getContentFromIPFS(cid);
    if (!encodedContent) {
      throw new NotFoundException(
        `document content for cid ${cid} was not found on IPFS`,
      );
    }

    try {
      const content = await contract.getDocumentContent(uuid, encodedContent);
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
