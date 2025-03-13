import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { MongooseConfig } from 'shared'
import { WatchRecord, WatchRecordSchema } from './models'
import { WatchRecordsController } from './watch-records.controller'
import { WatchRecordsRepository } from './watch-records.repository'
import { WatchRecordsService } from './watch-records.service'

@Module({
    imports: [
        MongooseModule.forFeature(
            [{ name: WatchRecord.name, schema: WatchRecordSchema }],
            MongooseConfig.connName
        )
    ],
    providers: [WatchRecordsService, WatchRecordsRepository],
    controllers: [WatchRecordsController]
})
export class WatchRecordsModule {}
