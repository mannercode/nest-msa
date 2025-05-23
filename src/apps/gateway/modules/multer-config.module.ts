import { Injectable, Module, UnsupportedMediaTypeException } from '@nestjs/common'
import { MulterModule, MulterModuleOptions, MulterOptionsFactory } from '@nestjs/platform-express'
import { generateShortId } from 'common'
import { diskStorage } from 'multer'
import { AppConfigService } from 'shared'

export const MulterConfigServiceErrors = {
    InvalidFileType: {
        code: 'ERR_FILE_UPLOAD_INVALID_FILE_TYPE',
        message: 'File type not allowed.'
    }
}

@Injectable()
class MulterConfigService implements MulterOptionsFactory {
    constructor(private config: AppConfigService) {}

    createMulterOptions(): MulterModuleOptions {
        const tempFileLength = 20

        const { directory, maxFileSizeBytes, maxFilesPerUpload, allowedMimeTypes } =
            this.config.fileUpload

        return {
            storage: diskStorage({
                destination: (_req, _file, cb) => cb(null, directory),
                filename: (_req, _file, cb) => cb(null, `${generateShortId(tempFileLength)}.tmp`)
            }),
            fileFilter: (_req, file, cb) => {
                let error: Error | null = null

                if (!allowedMimeTypes.includes(file.mimetype)) {
                    error = new UnsupportedMediaTypeException({
                        ...MulterConfigServiceErrors.InvalidFileType,
                        allowedTypes: allowedMimeTypes
                    })
                }

                cb(error, error === null)
            },
            limits: { fileSize: maxFileSizeBytes, files: maxFilesPerUpload }
        }
    }
}

@Module({
    imports: [MulterModule.registerAsync({ useClass: MulterConfigService })],
    exports: [MulterModule]
})
export class MulterConfigModule {}
