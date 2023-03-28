import { Body, Controller, Get, Header, Headers, Param, Post, RawBodyRequest, Req, Res } from '@nestjs/common';
import { DocumentsService } from './documents.service';

@Controller('documents')
export class DocumentsController {

    constructor(private documentService: DocumentsService) {

    }

    @Get('full-content/:id/hash')
    @Header('Content-type', 'application/json')
    public async getDocumentHashFull(@Param('id') id, @Res() response) {
        try {
            const content = await this.documentService.getDocumentHashFull(id);
            return response.status(200).send(content);
        }
        catch(err) {
            return response.status(500).send(err);
        }
    }

    @Get('full-content/:id/raw')
    @Header('Content-type', 'application/json')
    public async getDocumentContentFull(@Param('id') id, @Res() response) {
        try {
            const content = await this.documentService.getDocumentContentFull(id);
            return response.status(200).send(content);
        }
        catch(err) {
            return response.status(500).send(err);
        }
    }

    @Post('full-content/hash')
    @Header('Content-type', 'application/json')
    public async saveDocumentHashFull(@Body() payload, @Res() response) {
        try {
            await this.documentService.saveDocumentHashFull(payload);
            return response.status(200).send();
        }
        catch(err) {
            return response.status(500).send(err);
        }
    }

    @Post('full-content/raw')
    @Header('Content-type', 'application/json')
    public async saveDocumentContentFull(@Body() payload, @Res() response) {
        try {
            await this.documentService.saveDocumentContentFull(payload);
            return response.status(200).send();
        }
        catch(err) {
            return response.status(500).send(err);
        }
    }

    @Post('hash-content/save-hash')
    @Header('Content-type', 'application/json')
    public async saveDocumentHash(@Body() payload, @Res() response) {
        try {
            const content = await this.documentService.saveDocumentHash(payload);
            return response.status(200).send(content);
        }
        catch(err) {
            return response.status(500).send(err);
        }
    }

    @Get('hash-content/:id/get-hash')
    @Header('Accept', 'text/plain')
    public async getDocumentBySalt(@Param('id') uuid, @Req() req, @Res() response) {
        try {
            const payload = req.rawData.toString();
            const content = await this.documentService.getDocumentBySalt(uuid, payload);
            return response.status(200).send(content);
        }
        catch(err) {
            return response.status(500).send(err);
        }
    }

    @Get('hash-content/:id/get-content')
    @Header('Accept', 'text/plain')
    public async getDocumentContent(@Param('id') uuid, @Req() req, @Res() response) {
        try {
            const payload = req.rawData.toString();
            const content = await this.documentService.getDocumentContent(uuid, payload);
            return response.status(200).send(content);
        }
        catch(err) {
            return response.status(500).send(err);
        }
    }

    /** TODO: implement: getUserDocuments */
    @Get('user-document-hashes/:address')
    @Header('Content-type', 'application/json')
    public async getUserDocumentHashes(@Param('address') address, @Res() response) {
        try {
            const content = await this.documentService.getUserDocumentHashes(address);
            return response.status(200).send(content);
        }
        catch(err) {
            return response.status(500).send(err);
        }
    }

    @Get('user-documents/:address')
    @Header('Content-type', 'application/json')
    public async getUserDocuments(@Param('address') address, @Res() response) {
        try {
            const content = await this.documentService.getUserDocuments(address);
            return response.status(200).send(content);
        }
        catch(err) {
            return response.status(500).send(err);
        }
    }

    /** TODO: remove, deprecated */
    @Post('save-hash-1')
    @Header('Content-type', 'application/json')
    public async saveDocumentHashPart1(@Body() payload, @Res() response) {
        try {
            const content = await this.documentService.saveDocumentHashV2Part1(payload);
            return response.status(200).send(content);
        }
        catch(err) {
            return response.status(500).send(err);
        }
    }

    /** TODO: remove, deprecated */
    @Post('save-hash-2/:id')
    @Header('Content-type', 'application/json')
    public async saveDocumentHashPart2(@Param('id') uuid, @Body() payload, @Res() response) {
        try {
            const content = await this.documentService.saveDocumentHashV2Part2(uuid, payload);
            return response.status(200).send(content);
        }
        catch(err) {
            return response.status(500).send(err);
        }
    }
}
