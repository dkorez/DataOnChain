import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { DocumentService } from '../document.service';
import contractAbi from '../../../abi/DataOnChainSimple.json';
import { ContractSetup } from '../contract-setup';

@Injectable()
export class FullDocumentService extends DocumentService {
  constructor(
    protected configService: ConfigService,
    @Inject(REQUEST) protected request: Request,
  ) {
    super(configService, request);

    const rpcUrl = this.configService.get<string>('RPC_URL');
    const contract = this.configService.get('CONTRACT.SIMPLE');
    const contractSetup: ContractSetup = {
      rpcUrl: rpcUrl,
      contractAddress: contract,
      contractAbi: contractAbi,
    };
    this.setup(contractSetup);
  }

  public async getDocumentHashFull(id: number): Promise<string> {
    try {
      const contract = this.getContract();
      const content = await contract.getDocumentHash(id);
      const hexContent = ethers.utils.hexlify(content);

      const abi = ethers.utils.defaultAbiCoder;
      const decodedContent = abi.decode(
        ['string'],
        ethers.utils.hexDataSlice(hexContent, 0),
      );

      return Promise.resolve(decodedContent[0]);
    } catch (err) {
      const message = (err as Error).message;
      console.log(
        `error in getDocumentHashFull ${message}: ` + JSON.stringify(err),
      );
      return Promise.reject(err);
    }
  }

  public async getDocumentContentFull(id: number): Promise<string> {
    try {
      const contract = this.getContract();
      const content = await contract.getDocument(id);
      return Promise.resolve(content);
    } catch (err) {
      const message = (err as Error).message;
      console.log(
        `error in getDocumentContentFull ${message}: ` + JSON.stringify(err),
      );
      return Promise.reject(err);
    }
  }

  public async saveDocumentContentFull(content: string): Promise<void> {
    try {
      const contract = this.getContract();
      await contract.addDocument(JSON.stringify(content));
      return Promise.resolve();
    } catch (err) {
      const message = (err as Error).message;
      console.log(
        `error in saveDocumentContentFull ${message}: ` + JSON.stringify(err),
      );
      return Promise.reject(err);
    }
  }

  public async saveDocumentHashFull(content: string): Promise<void> {
    try {
      const abi = ethers.utils.defaultAbiCoder;
      const encodedContent = abi.encode(['string'], [JSON.stringify(content)]);

      const contract = this.getContract();
      await contract.addDocumentHash(encodedContent);
      return Promise.resolve();
    } catch (err) {
      const message = (err as Error).message;
      console.log(
        `error in saveDocumentHashFull ${message}: ` + JSON.stringify(err),
      );
      return Promise.reject(err);
    }
  }
}
