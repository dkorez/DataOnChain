import {
  Inject,
  Injectable,
  Scope,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Contract, ethers } from 'ethers';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { ContractSetup } from './contract-setup';

@Injectable({ scope: Scope.REQUEST })
export class DocumentService {
  private provider: ethers.providers.JsonRpcProvider;
  private rpcUrl: string;
  private contractAddress: string;
  private contractAbi: any;

  constructor(
    protected configService: ConfigService,
    @Inject(REQUEST) protected request: Request,
  ) {}

  protected setup(contractSetup: ContractSetup) {
    this.rpcUrl = contractSetup.rpcUrl;
    this.contractAddress = contractSetup.contractAddress;
    this.contractAbi = contractSetup.contractAbi;

    this.provider = new ethers.providers.JsonRpcProvider(this.rpcUrl);
  }

  public async getTxReceipt(txHash: string): Promise<any> {
    const provider = new ethers.providers.JsonRpcProvider(this.rpcUrl);

    try {
      const txReceipt = await provider.waitForTransaction(txHash);
      return txReceipt;
    } catch (err) {
      console.error(`error in getTxReceipt: ${err.message}`);
      throw err;
    }
  }

  public getContract(): Contract {
    const { headers } = this.request;
    const signerKey = headers['signer-key'] as string;

    if (!signerKey) {
      throw new UnauthorizedException('signer-key is missing');
    }

    const signer = new ethers.Wallet(signerKey, this.provider);
    const contract = new ethers.Contract(
      this.contractAddress,
      this.contractAbi,
      signer,
    );

    return contract;
  }

  public getPublicContract(): Contract {
    const contract = new ethers.Contract(
      this.contractAddress,
      this.contractAbi,
      this.provider,
    );

    return contract;
  }
}
