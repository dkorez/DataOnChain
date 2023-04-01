import { Inject, Injectable, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Contract, ethers } from 'ethers';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import contractAbi from '../../abi/DataOnChain.json';

@Injectable({ scope: Scope.REQUEST })
export class DocumentService {
  private provider: ethers.providers.JsonRpcProvider;
  private rpcUrl: string;
  private contractAddress: string;

  constructor(
    protected configService: ConfigService,
    @Inject(REQUEST) protected request: Request,
  ) {
    this.rpcUrl = this.configService.get('RPC_URL');
    this.contractAddress = this.configService.get('ADDRESS');

    this.provider = new ethers.providers.JsonRpcProvider(this.rpcUrl);
  }

  protected async getTxReceipt(txHash: string): Promise<any> {
    const rpcUrl = this.configService.get('RPC_URL');
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

    try {
      const txReceipt = await provider.waitForTransaction(txHash);
      return txReceipt;
    } catch (err) {
      console.error(`error in getTxReceipt: ${err.message}`);
      throw err;
    }
  }

  protected getContract(): Contract {
    const { headers } = this.request;
    const signerKey = headers['signer-key'] as string;

    const signer = new ethers.Wallet(signerKey, this.provider);
    const contract = new ethers.Contract(
      this.contractAddress,
      contractAbi,
      signer,
    );

    return contract;
  }

  protected getPublicContract(): Contract {
    const contract = new ethers.Contract(
      this.contractAddress,
      contractAbi,
      this.provider,
    );

    return contract;
  }
}
