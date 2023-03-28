import { Inject, Injectable, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Contract, ethers } from 'ethers';
import contractAbi from './../abi/DataOnChain.json';
import { v4 as uuidv4 } from 'uuid';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';


@Injectable({ scope: Scope.REQUEST })
export class DocumentsService {
  constructor(private configService: ConfigService, @Inject(REQUEST) private request: Request) {}

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
      console.log(`error in getDocumentHashFull ${message}: ` + JSON.stringify(err));
      return Promise.reject(err);
    }
  }

  public async getDocumentContentFull(id: number): Promise<string> {
    try {
      const contract = this.getContract();
      const content = await contract.getDocumentContent(id);
      return Promise.resolve(content);
    } catch (err) {
      const message = (err as Error).message;
      console.log(`error in getDocumentContentFull ${message}: ` + JSON.stringify(err));
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
      console.log(`error in saveDocumentContentFull ${message}: ` + JSON.stringify(err));
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
      console.log(`error in saveDocumentHashFull ${message}: ` + JSON.stringify(err));
      return Promise.reject(err);
    }
  }

  

  

  public async saveDocumentHash(content: string): Promise<any> {
    try {
        const contract = this.getContract();
  
        let rawUUID: string = uuidv4();
        rawUUID = rawUUID.substring(0, 30);
        const uuid = ethers.utils.formatBytes32String(rawUUID);
        const tx = await contract.generateDocumentSalt(uuid);
        await this.getTxReceipt(tx.hash);
  
        const hashedSalt = await contract.getDocumentSalt(uuid);
          const abi = ethers.utils.defaultAbiCoder;
        const encodedContent = abi.encode(
          ['bytes', 'string', 'bytes'],
          [uuid, JSON.stringify(content), hashedSalt],
        );

        return Promise.resolve( {
            'uuid': rawUUID,
            'content': encodedContent
        });

      } catch (err) {
        const message = (err as Error).message;
        console.log(`error in saveDocumentHash ${message}: ` + JSON.stringify(err));
        return Promise.reject(err);
      }
  }

  public async getDocumentBySalt(uuid: string, payload: string): Promise<string> {
    try {
      const contract = this.getContract();

      const uuidBytes = ethers.utils.formatBytes32String(uuid);
      const salt = await contract.getDocumentSalt(uuidBytes);

      const abi = ethers.utils.defaultAbiCoder;
      const decodedContent = abi.decode(
        ['bytes', 'string', 'bytes'],
        payload
      );

      if (decodedContent.length != 3) {
        return Promise.reject(new Error("invalid_array_length"));
      }

      if (uuidBytes != decodedContent[0]) {
        return Promise.reject(new Error("uuid_not_match"));
      }

      if (salt != decodedContent[2]) {
        return Promise.reject(new Error("salt_not_match"));
      }

      return Promise.resolve(decodedContent[1]);
    } catch (err) {
      const message = (err as Error).message;
      console.log(`error in getDocumentBySaltV2 ${message}: ` + JSON.stringify(err));
      return Promise.reject(err);
    }
  }

  public async getDocumentContent(uuid: string, payload: string): Promise<string> {
    try {
        const contract = this.getContract();

        const uuidBytes = ethers.utils.formatBytes32String(uuid);
        const content = await contract.getDocumentContentByHash(uuidBytes, payload);

        return Promise.resolve(content);
    }
    catch (err) {
      const message = (err as Error).message;
      console.log(`error in getDocumentContent ${message}: ` + JSON.stringify(err));
      return Promise.reject(err);
    }
  }

  public async getUserDocumentHashes(user: string): Promise<any> {
    try {
      const contract = this.getPublicContract();
      const documents = await contract.getUserDocumentHashes(user);
      
      return Promise.resolve(documents);
    } catch (err) {
      const message = (err as Error).message;
      console.log(`error in getUserDocumentHashes ${message}: ` + JSON.stringify(err));
      return Promise.reject(err);
    }
  }

  public async getUserDocuments(user: string): Promise<any> {
    try {
      const contract = this.getPublicContract();
      const documents = await contract.getUserDocuments(user);
      
      return Promise.resolve(documents);
    } catch (err) {
      const message = (err as Error).message;
      console.log(`error in getUserDocuments ${message}: ` + JSON.stringify(err));
      return Promise.reject(err);
    }
  }

  /** TODO: remove, deprecated */
  public async saveDocumentHashV2Part1(content: string): Promise<string> {
    try {
      const contract = this.getContract();

      let rawUUID: string = uuidv4();
      rawUUID = rawUUID.substring(0, 30);
      const uuid = ethers.utils.formatBytes32String(rawUUID);
      const tx = await contract.generateDocumentSalt(uuid);
      console.log(`generateDocumentSalt tx ${JSON.stringify(tx)}`);
      
      return Promise.resolve(rawUUID);
    } catch (err) {
      const message = (err as Error).message;
      console.log(`error in saveDocumentHashV2Part1 ${message}: ` + JSON.stringify(err));
      return Promise.reject(err);
    }
  }

  /** TODO: remove, deprecated */
  public async saveDocumentHashV2Part2(rawUUID: string, content: string): Promise<string> {
    try {
      const contract = this.getContract();

      const uuid = ethers.utils.formatBytes32String(rawUUID);
      const hashedSalt = await contract.getDocumentSalt(uuid);

      const abi = ethers.utils.defaultAbiCoder;
      const encodedContent = abi.encode(
        ['bytes', 'string', 'bytes'],
        [uuid, JSON.stringify(content), hashedSalt],
      );

      return Promise.resolve(encodedContent);
    } catch (err) {
      const message = (err as Error).message;
      console.log(`error in saveDocumentHashV2Part2 ${message}: ` + JSON.stringify(err));
      return Promise.reject(err);
    }
  }

  private getTxReceipt(txHash: string): Promise<any> {
    const rpcUrl = this.configService.get('RPC_URL');
    return new Promise((resolve, reject) => {
      try {
        const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
        provider
          .waitForTransaction(txHash)
          .then((txReceipt: any) => {
            return resolve(txReceipt);
          })
          .catch((err: any) => {
            console.log('waitForTransaction err: ', err);
            return reject(err);
          });
      }
      catch(err) {
        const message = (err as Error).message;
        console.log(`error in getTxReceipt ${message}: ` + JSON.stringify(err));
        return reject(err);
      }
    });
  }

  private getContract(): Contract {
    const headers = this.request.headers;
    const signerKey = headers['signer-key'] as string;

    const rpcUrl = this.configService.get('RPC_URL');
    const contractAddress = this.configService.get('ADDRESS');
    //const signerKey = this.configService.get('SIGNER_KEY');

    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const signer = new ethers.Wallet(signerKey, provider);
    const contract = new ethers.Contract(
      contractAddress,
      contractAbi,
      signer,
    );

    return contract;
  }

  private getPublicContract(): Contract {
    const rpcUrl = this.configService.get('RPC_URL');
    const contractAddress = this.configService.get('ADDRESS');

    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const contract = new ethers.Contract(
      contractAddress,
      contractAbi,
      provider,
    );

    return contract;
  }
}
