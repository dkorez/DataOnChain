import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { PinataService } from './pinata.service';
import { HttpModule, HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException, forwardRef } from '@nestjs/common';
import PinataClient, { PinataPinResponse } from '@pinata/sdk';
import { PinataModule } from './pinata.module';

describe('PinataService', () => {
  let pinataService: PinataService;
  let httpService: HttpService;
  let configService: ConfigService;

  const apiKey = 'testApiKey';
  const apiSecret = 'testApiSecret';
  const pinataGateway = 'https://gateway.pinata.cloud/ipfs/';

  const mockHttpClient = {
    get: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      switch (key) {
        case 'PINATA_GATEWAY':
          return pinataGateway;
        case 'PINATA_APIKEY':
          return apiKey;
        case 'PINATA_APISECRET':
          return apiSecret;
        default:
          return undefined;
      }
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      //imports: [forwardRef(() => HttpModule)],
      //imports: [forwardRef(() => PinataModule)],
      //imports: [HttpModule],
      providers: [
        PinataService,
        {
          provide: HttpService,
          useValue: mockHttpClient
        },
        {
          provide: ConfigService,
          useValue: mockConfigService
        }

      ],
    }).compile();

    pinataService = await module.resolve<PinataService>(PinataService);
    httpService = await module.resolve<HttpService>(HttpService);
    configService = await module.resolve<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /*it('should be defined', () => {
    expect(pinataService).toBeDefined();
  });*/

  describe('pinContentToIPFS', () => {
    const content = { data: 'test' };
    const uuid = 'testUuid';

    it('should pin content to IPFS', async () => {
      const response: PinataPinResponse = {
        IpfsHash: 'testIpfsHash',
        PinSize: 0,
        Timestamp: ''
      };

      jest.spyOn(PinataClient.prototype, 'pinJSONToIPFS').mockResolvedValueOnce(response);

      const result = await pinataService.pinContentToIPFS(content, uuid);

      expect(result).toEqual(response.IpfsHash);
      expect(PinataClient.prototype.pinJSONToIPFS).toHaveBeenCalledWith(content, {
        pinataMetadata: {
          name: `${uuid}.json`,
        },
        pinataOptions: {
          cidVersion: 1,
        },
      });
    });

    it('should throw InternalServerErrorException when pinning fails', async () => {
      const error = new Error('testError');

      jest.spyOn(PinataClient.prototype, 'pinJSONToIPFS').mockRejectedValueOnce(error);

      await expect(pinataService.pinContentToIPFS(content, uuid)).rejects.toThrowError(
        new InternalServerErrorException('error uploading to IPFS', error.message),
      );
    });
  });
});
