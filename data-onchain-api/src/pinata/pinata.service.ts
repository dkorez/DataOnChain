import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import PinataClient from '@pinata/sdk';
import { PinataPinOptions } from '@pinata/sdk';

@Injectable()
export class PinataService {
  private readonly client: PinataClient;

  private pinataGateway: string;
  private apiKey: string;
  private apiSecret: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.pinataGateway = this.configService.get('PINATA_GATEWAY');
    this.apiKey = this.configService.get('PINATA_APIKEY');
    this.apiSecret = this.configService.get('PINATA_APISECRET');

    this.client = new PinataClient({
      pinataApiKey: this.apiKey,
      pinataSecretApiKey: this.apiSecret,
    });
  }

  async pinContentToIPFS(content: any, uuid: string): Promise<string> {
    const options: PinataPinOptions = {
      pinataMetadata: {
        name: `${uuid}.json`,
      },
      pinataOptions: {
        cidVersion: 1,
      },
    };

    try {
      const response = await this.client.pinJSONToIPFS(content, options);
      return response.IpfsHash;
    } catch (err) {
      throw new InternalServerErrorException('error uploading to IPFS', err.message);
    }
  }

  async getContentFromIPFS(cid: string): Promise<any> {
    const reqUrl = `${this.pinataGateway}${cid}`;
    const config = {
      headers: {
        pinata_api_key: this.apiKey,
        pinata_secret_api_key: this.apiSecret,
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      responseType: 'json' as const,
    };

    try {
      const response = await this.httpService.get(reqUrl, config).toPromise();
      return response.data;
    } catch (err) {
      console.error(JSON.stringify(err));
      throw new InternalServerErrorException(
        'error fetching content from IPFS',
        err.message,
      );
    }
  }
}
