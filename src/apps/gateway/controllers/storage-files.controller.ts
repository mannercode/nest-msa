import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    StreamableFile,
    UploadedFiles,
    UseFilters,
    UseInterceptors
} from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import { StorageFilesClient } from 'apps/infrastructures'
import { IsString } from 'class-validator'
import { createReadStream } from 'fs'
import { pick } from 'lodash'
import { Routes } from 'shared'
import { MulterExceptionFilter } from './filters'

class UploadFileDto {
    @IsString()
    name?: string
}

@Controller(Routes.Http.StorageFiles)
export class StorageFilesController {
    constructor(private storageFilesService: StorageFilesClient) {}

    @UseFilters(new MulterExceptionFilter())
    @UseInterceptors(FilesInterceptor('files'))
    @Post()
    async saveFiles(@UploadedFiles() files: Express.Multer.File[], @Body() _body: UploadFileDto) {
        const createDtos = files.map((file) =>
            pick(file, 'originalname', 'mimetype', 'size', 'path')
        )

        const storageFiles = await this.storageFilesService.saveFiles(createDtos)
        return { storageFiles }
    }

    @Get(':fileId')
    async downloadFile(@Param('fileId') fileId: string) {
        const files = await this.storageFilesService.getFiles([fileId])
        const file = files[0]

        const readStream = createReadStream(file.storedPath)

        const stream = new StreamableFile(readStream, {
            type: file.mimetype,
            disposition: `attachment; filename="${encodeURIComponent(file.originalname)}"`,
            length: file.size
        })

        return stream
    }

    @Delete(':fileId')
    async deleteFile(@Param('fileId') fileId: string) {
        return this.storageFilesService.deleteFiles([fileId])
    }
}
