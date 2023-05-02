import {
    NotFoundException,
    UnprocessableEntityException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DocumentHashIpfsController } from './document-hash-ipfs.controller';
import { DocumentHashIpfsService } from './document-hash-ipfs.service';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { DocumentDto } from './../../../protocol/dto/document.dto';
import { PinataService } from './../../../pinata/pinata.service';

describe('DocumentService', () => {
    let documentHashIpfsService: DocumentHashIpfsService;
    let pinataService: PinataService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [DocumentHashIpfsController],
            providers: [
                DocumentHashIpfsService,
                ConfigService,
                {
                    provide: PinataService,
                    useValue: {
                        pinContentToIPFS: jest.fn(),
                        getContentFromIPFS: jest.fn(),
                    },
                },
            ],
        }).compile();

        documentHashIpfsService = await module.resolve<DocumentHashIpfsService>(
            DocumentHashIpfsService,
        );
        pinataService = await module.resolve<PinataService>(
            PinataService,
        );
    });

    describe('saveDocumentHashIpfs', () => {
        it('should generate a new document secret and save the document content to IPFS', async () => {
            const document: DocumentDto = {
                data: 'some content',
                type: 'text/plain',
            };
            const uuid = ethers.utils.formatBytes32String('validuuid');
            const secret = ethers.utils.formatBytes32String('secret');
            const ipfsHash = 'ipfshash';

            jest.spyOn(documentHashIpfsService, 'getContract').mockReturnValue({
                generateDocumentSecret: jest.fn(),
                getDocumentSecret: jest.fn(),
                updateDocument: jest.fn(),
            } as any);
            jest.spyOn(documentHashIpfsService, 'getTxReceipt').mockReturnValue({
                tx: jest.fn(),
            } as any);
            jest.spyOn(ethers.utils, 'hexlify').mockReturnValue(uuid);

            const generateDocumentSecretSpy = jest
                .spyOn(documentHashIpfsService.getContract(), 'generateDocumentSecret')
                .mockResolvedValue({ hash: '0xabc123' });
            const getDocumentSecretSpy = jest
                .spyOn(documentHashIpfsService.getContract(), 'getDocumentSecret')
                .mockResolvedValue(secret);
            const pinContentSpy = jest
                .spyOn(pinataService, 'pinContentToIPFS')
                .mockResolvedValue(ipfsHash);

            const encodedContent = ethers.utils.defaultAbiCoder.encode(
                ['bytes', 'string', 'bytes'],
                [uuid, JSON.stringify(document.data), secret],
            );
            const data = {
                content: encodedContent,
            };
            const ipfsHashBytes = ethers.utils.toUtf8Bytes(ipfsHash);

            const updateDocumentSpy = jest
                .spyOn(documentHashIpfsService.getContract(), 'updateDocument')
                .mockResolvedValue(undefined);

            const result = await documentHashIpfsService.saveDocumentHashIpfs(document);

            expect(result).toEqual({
                uuid: uuid,
                ipfs: ipfsHash,
            });
            expect(generateDocumentSecretSpy).toHaveBeenCalledWith(uuid);
            expect(getDocumentSecretSpy).toHaveBeenCalledWith(uuid);
            expect(pinContentSpy).toHaveBeenCalledWith(data, uuid);
            expect(updateDocumentSpy).toHaveBeenCalledWith(uuid,ipfsHashBytes);
        });
    });

    /*describe('getDocumentBySecret', () => {
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
    });*/
});
