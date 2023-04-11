import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Test } from '@nestjs/testing';
import { Document } from './document.entity';
import { DocumentResourceService } from './document-resource.service';

describe('DocumentResourceService', () => {
  let service: DocumentResourceService;
  let repository: jest.Mocked<Repository<Document>>;

  beforeEach(async () => {
    repository = {
      findOne: jest.fn(),
      save: jest.fn(),
    } as any;

    const module = await Test.createTestingModule({
      providers: [
        DocumentResourceService,
        { provide: getRepositoryToken(Document), useValue: repository },
      ],
    }).compile();

    service = module.get<DocumentResourceService>(DocumentResourceService);
  });

  describe('createDocument', () => {
    it('should create a new document', async () => {
      const uuid = '1234';
      const content = 'Random content';

      const document = new Document();
      document.uuid = uuid;
      document.content = content;

      repository.save.mockResolvedValue(document);
      const result = await service.createDocument(uuid, content);

      expect(result).toEqual(document);
      expect(repository.save).toHaveBeenCalledWith(document);
    });
  });

  describe('updateDocumentContent', () => {
    it('should update the content of an existing document', async () => {
      const uuid = '1234';
      const content = 'Changed content';

      const document = new Document();
      document.uuid = uuid;
      document.content = 'Original content';

      repository.findOne.mockResolvedValue(document);
      repository.save.mockResolvedValue(document);

      const result = await service.updateDocumentContent(uuid, content);

      expect(result).toEqual(document);
      expect(result.content).toEqual(content);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { uuid } });
      expect(repository.save).toHaveBeenCalledWith(document);
    });

    it('should throw a NotFoundException if the document does not exist', async () => {
      const uuid = '1234';
      const content = 'Some content';

      repository.findOne.mockResolvedValue(undefined);
      await expect(
        service.updateDocumentContent(uuid, content),
      ).rejects.toThrow(NotFoundException);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { uuid } });
    });
  });

  describe('getDocumentContent', () => {
    it('should return the content of an existing document', async () => {
      const uuid = '1234';
      const content = 'Some content';

      const document = new Document();
      document.uuid = uuid;
      document.content = content;

      repository.findOne.mockResolvedValue(document);
      const result = await service.getDocumentContent(uuid);

      expect(result).toEqual(content);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { uuid } });
    });

    it('should throw a NotFoundException if the document does not exist', async () => {
      const uuid = '1234';

      repository.findOne.mockResolvedValue(undefined);
      await expect(service.getDocumentContent(uuid)).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.findOne).toHaveBeenCalledWith({ where: { uuid } });
    });
  });
});
