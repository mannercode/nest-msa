import { Injectable } from '@nestjs/common'
import { getChecksum, mapDocToDto, Path } from 'common'
import { HydratedDocument } from 'mongoose'
import { AppConfigService } from 'shared'
import { StorageFileCreateDto, StorageFileDto } from './dtos'
import { StorageFile, StorageFileDocument } from './models'
import { StorageFilesRepository } from './storage-files.repository'

@Injectable()
export class StorageFilesService {
    constructor(
        private repository: StorageFilesRepository,
        private config: AppConfigService
    ) {}

    async saveFiles(createDtos: StorageFileCreateDto[]) {
        const checksumByPath = new Map<string, string>()

        for (const createDto of createDtos) {
            const checksum = await getChecksum(createDto.path)
            checksumByPath.set(createDto.path, checksum)
        }

        const storageFiles = await this.repository.withTransaction(async (session) => {
            const storageFiles: HydratedDocument<StorageFile>[] = []

            for (const createDto of createDtos) {
                const storageFile = await this.repository.createStorageFile(
                    createDto,
                    checksumByPath.get(createDto.path)!,
                    session
                )

                /**
                 * 대부분 원본과 저장 위치의 파일 시스템이 달라서 move를 할 수 없다.
                 */
                await Path.copy(createDto.path, this.getStoragePath(storageFile.id))

                storageFiles.push(storageFile)
            }

            return storageFiles
        })

        return this.toDtos(storageFiles)
    }

    async getFiles(fileIds: string[]) {
        const files = await this.repository.getByIds(fileIds)
        return this.toDtos(files)
    }

    async deleteFiles(fileIds: string[]) {
        await this.repository.deleteByIds(fileIds)

        for (const fileId of fileIds) {
            const targetPath = this.getStoragePath(fileId)
            await Path.delete(targetPath)
        }

        return true
    }

    private getStoragePath(fileId: string) {
        const path = Path.join(this.config.fileUpload.directory, `${fileId}.file`)
        return path
    }

    private toDto = (file: StorageFileDocument) => {
        const dto = mapDocToDto(file, StorageFileDto, [
            'id',
            'originalname',
            'mimetype',
            'size',
            'checksum'
        ])
        dto.storedPath = this.getStoragePath(file.id)

        return dto
    }
    private toDtos = (files: StorageFileDocument[]) => files.map((file) => this.toDto(file))
}
