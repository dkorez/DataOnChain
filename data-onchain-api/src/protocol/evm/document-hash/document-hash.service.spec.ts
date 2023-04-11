import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DocumentHashController } from './document-hash.controller';
import { DocumentResourceService } from './../../../document-resource/document-resource.service';
import { DocumentHashService } from './document-hash.service';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';

describe('DocumentService', () => {
  let documentHashService: DocumentHashService;
  let docResourceService: DocumentResourceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentHashController],
      providers: [
        DocumentHashService,
        ConfigService,
        {
          provide: DocumentResourceService,
          useValue: {
            createDocument: jest.fn(),
            getDocumentContent: jest.fn(),
          },
        },
      ],
    }).compile();

    documentHashService = await module.resolve<DocumentHashService>(
      DocumentHashService,
    );
    docResourceService = await module.resolve<DocumentResourceService>(
      DocumentResourceService,
    );
  });

  describe('saveDocumentHash', () => {
    it('should generate a new document secret and save the document content', async () => {
      const content = 'some content';
      const uuid = ethers.utils.formatBytes32String('validuuid');
      const secret = ethers.utils.formatBytes32String('secret');

      jest.spyOn(documentHashService, 'getContract').mockReturnValue({
        generateDocumentSecret: jest.fn(),
        getDocumentSecret: jest.fn(),
      } as any);
      jest.spyOn(documentHashService, 'getTxReceipt').mockReturnValue({
        tx: jest.fn(),
      } as any);
      jest.spyOn(ethers.utils, 'hexlify').mockReturnValue(uuid);

      const generateDocumentSecretSpy = jest
        .spyOn(documentHashService.getContract(), 'generateDocumentSecret')
        .mockResolvedValue({ hash: '0xabc123' });
      const getDocumentSecretSpy = jest
        .spyOn(documentHashService.getContract(), 'getDocumentSecret')
        .mockResolvedValue(secret);
      const createDocumentSpy = jest
        .spyOn(docResourceService, 'createDocument')
        .mockResolvedValue(undefined);

      const result = await documentHashService.saveDocumentHash(content);

      const encodedContent = ethers.utils.defaultAbiCoder.encode(
        ['bytes', 'string', 'bytes'],
        [uuid, JSON.stringify(content), secret],
      );

      expect(result).toEqual({
        uuid: uuid,
        content: encodedContent,
      });
      expect(generateDocumentSecretSpy).toHaveBeenCalledWith(uuid);
      expect(getDocumentSecretSpy).toHaveBeenCalledWith(uuid);
      expect(createDocumentSpy).toHaveBeenCalledWith(uuid, encodedContent);
    });
  });

  describe('getDocumentBySecret', () => {
    it('should be defined', async () => {
      expect(documentHashService).toBeDefined();
    });

    it('throws a NotFoundException if the document secret is not found', async () => {
      const uuid = 'non-existent-uuid';

      jest.spyOn(documentHashService, 'getContract').mockReturnValue({
        getDocumentSecret: jest.fn(),
      } as any);
      jest
        .spyOn(documentHashService.getContract(), 'getDocumentSecret')
        .mockResolvedValue(null);

      await expect(
        documentHashService.getDocumentBySecred(uuid),
      ).rejects.toThrowError(NotFoundException);
      await expect(
        documentHashService.getDocumentBySecred(uuid),
      ).rejects.toThrowError(`document secret for uuid ${uuid} was not found`);
    });

    it('throws an UnprocessableEntityException if the UUID does not match', async () => {
      const uuid = ethers.utils.formatBytes32String('validuuid');
      const invalidUuid = ethers.utils.formatBytes32String('invaliduuid');
      const secret = ethers.utils.formatBytes32String('secret');

      jest.spyOn(documentHashService, 'getContract').mockReturnValue({
        getDocumentSecret: jest.fn(),
      } as any);
      jest
        .spyOn(documentHashService.getContract(), 'getDocumentSecret')
        .mockResolvedValue(secret);
      jest
        .spyOn(docResourceService, 'getDocumentContent')
        .mockResolvedValue(
          ethers.utils.defaultAbiCoder.encode(
            ['bytes', 'string', 'bytes'],
            [invalidUuid, 'validcontent', secret],
          ),
        );

      await expect(
        documentHashService.getDocumentBySecred(uuid),
      ).rejects.toThrowError(UnprocessableEntityException);
      await expect(
        documentHashService.getDocumentBySecred(uuid),
      ).rejects.toThrowError('uuid_not_match');
    });

    it('throws an UnprocessableEntityException if the secret does not match', async () => {
      const uuid = ethers.utils.formatBytes32String('validuuid');
      const secret = ethers.utils.formatBytes32String('secret');
      const differentSecret =
        ethers.utils.formatBytes32String('differentsecret');

      jest.spyOn(documentHashService, 'getContract').mockReturnValue({
        getDocumentSecret: jest.fn(),
      } as any);
      jest
        .spyOn(documentHashService.getContract(), 'getDocumentSecret')
        .mockResolvedValue(differentSecret);
      jest
        .spyOn(docResourceService, 'getDocumentContent')
        .mockResolvedValue(
          ethers.utils.defaultAbiCoder.encode(
            ['bytes', 'string', 'bytes'],
            [uuid, 'valid-content', secret],
          ),
        );

      await expect(
        documentHashService.getDocumentBySecred(uuid),
      ).rejects.toThrowError(UnprocessableEntityException);
      await expect(
        documentHashService.getDocumentBySecred(uuid),
      ).rejects.toThrowError('secret_not_match');
    });

    it('returns the decoded document content if all checks pass', async () => {
      const uuid = ethers.utils.formatBytes32String('validuuid');
      const secret = ethers.utils.formatBytes32String('secret');
      const validContent = ethers.utils.formatBytes32String('valid content');

      jest.spyOn(documentHashService, 'getContract').mockReturnValue({
        getDocumentSecret: jest.fn(),
      } as any);
      jest
        .spyOn(documentHashService.getContract(), 'getDocumentSecret')
        .mockResolvedValue(secret);
      jest
        .spyOn(docResourceService, 'getDocumentContent')
        .mockResolvedValue(
          ethers.utils.defaultAbiCoder.encode(
            ['bytes', 'string', 'bytes'],
            [uuid, validContent, secret],
          ),
        );

      await expect(documentHashService.getDocumentBySecred(uuid)).resolves.toBe(
        validContent,
      );
    });
  });
});
