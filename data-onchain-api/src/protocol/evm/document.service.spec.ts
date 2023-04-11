import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import contractAbi from '../../abi/DataOnChain.json';
import { ethers } from 'ethers';
import { DocumentService } from './document.service';

describe('DocumentService', () => {
  let documentService: DocumentService;
  let configService: ConfigService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    documentService = await module.resolve<DocumentService>(DocumentService);
    configService = await module.resolve<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 500)); // avoid jest open handle error
  });

  describe('getTxReceipt method', () => {
    it('should be defined', async () => {
      expect(documentService).toBeDefined();
    });

    it('should return the transaction receipt', async () => {
      const txHash = '0x1234';
      jest.spyOn(ethers.providers, 'JsonRpcProvider').mockReturnValue({
        waitForTransaction: jest.fn().mockResolvedValue('txReceipt'),
      } as any);

      const result = await documentService.getTxReceipt(txHash);
      expect(result).toBe('txReceipt');
    });
  });

  describe('getContract method', () => {
    const walletSpy = jest.spyOn(ethers, 'Wallet').mockReturnValue({
      connect: jest.fn(),
    } as any);
    jest.spyOn(ethers, 'Contract').mockReturnValue({
      contract: jest.fn(),
    } as any);

    it('should return a valid Contract instance when signer-key header is present', () => {
      const headers = { 'signer-key': 'my-signer-key' };
      documentService['request'] = { headers } as any;

      const result = documentService.getContract();

      expect(result).toBeTruthy();
      expect(walletSpy).toHaveBeenCalledWith(
        headers['signer-key'],
        documentService['provider'],
      );
    });

    it('should throw an UnauthorizedException when signer-key header is missing', () => {
      documentService['request'] = { headers: {} } as any;

      try {
        documentService.getContract();
      } catch (err) {
        expect(err).toBeInstanceOf(UnauthorizedException);
        expect(err.message).toBe('signer-key is missing');
      }
    });
  });

  describe('getPublicContract method', () => {
    it('should return a valid Contract instance', () => {
      const result = documentService.getPublicContract();

      expect(result).toBeTruthy();
      expect(ethers.Contract).toHaveBeenCalledTimes(1);
    });
  });
});
