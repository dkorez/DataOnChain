import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './document.entity';

@Injectable()
export class DocumentResourceService {
  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
  ) {}

  async createDocument(uuid: string, content: string) {
    const document = new Document();
    document.uuid = uuid;
    document.content = content;

    return await this.documentRepository.save(document);
  }

  async updateDocumentContent(uuid: string, content: string) {
    const document = await this.documentRepository.findOne({
      where: { uuid: uuid },
    });

    if (!document) {
      throw new NotFoundException(`Document with UUID ${uuid} not found`);
    }

    document.content = content;

    return await this.documentRepository.save(document);
  }

  async getDocumentContent(uuid: string): Promise<string> {
    const document = await this.documentRepository.findOne({
      where: { uuid: uuid },
    });

    if (!document) {
      throw new NotFoundException(`Document with UUID ${uuid} not fount`);
    }

    return document.content;
  }
}
