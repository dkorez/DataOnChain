import { Inject, Injectable, Scope } from '@nestjs/common';
import { ethers } from 'ethers';
import { DocumentService } from '../document.service';
import { DocumentResourceService } from 'src/document-resource/document-resource.service';

@Injectable({ scope: Scope.REQUEST })
export class DocumentHashService extends DocumentService {
  @Inject(DocumentResourceService)
  private docResService: DocumentResourceService;

  /* implementation for document hashed only */
  public async saveDocumentHash(content: string): Promise<any> {
    try {
      const contract = this.getContract();
      const uuidBytes = ethers.utils.randomBytes(32);
      const uuid = ethers.utils.hexlify(uuidBytes);

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
      };
    } catch (err) {
      const message = (err as Error).message;
      console.log(
        `error in saveDocumentHash ${message}: ` + JSON.stringify(err),
      );
      return Promise.reject(err);
    }
  }

  public async getDocumentBySecred(uuid: string): Promise<string> {
    try {
      const contract = this.getContract();
      const secret = await contract.getDocumentSecret(uuid);
      const payload = await this.docResService.getDocumentContent(uuid);

      const abi = ethers.utils.defaultAbiCoder;
      const decodedContent = abi.decode(['bytes', 'string', 'bytes'], payload);

      if (decodedContent.length != 3) {
        throw new Error('invalid_array_length');
      }

      if (uuid != decodedContent[0]) {
        throw new Error('uuid_not_match');
      }

      if (secret != decodedContent[2]) {
        throw new Error('salt_not_match');
      }

      return decodedContent[1];
    } catch (err) {
      console.log(
        `error in getDocumentBySecred ${err.message}: ` + JSON.stringify(err),
      );
      throw err;
    }
  }

  public async getDocumentContent(uuid: string): Promise<string> {
    try {
      const contract = this.getContract();
      const payload = await this.docResService.getDocumentContent(uuid);

      const content = await contract.getDocumentContent(uuid, payload);

      return Promise.resolve(content);
    } catch (err) {
      console.error(`error in getDocumentContent: ${err.message}`);
      throw err;
    }
  }

  public async getDocumentHashesForUser(user: string): Promise<any> {
    try {
      const contract = this.getPublicContract();
      const documents = await contract.getDocumentHashesForUser(user);
      return documents;
    } catch (err) {
      console.log(
        `error in getDocumentHashesForUser ${err.message}: ${JSON.stringify(
          err,
        )}`,
      );
      throw err;
    }
  }
}
