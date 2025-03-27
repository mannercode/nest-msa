import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AppConfigService, uniqueWhenTesting } from '../config'

@Module({
    imports: [
        MongooseModule.forRootAsync({
            useFactory: async (config: AppConfigService) => {
                const { user, password, host1, host2, host3, port, replica, database } =
                    config.mongo
                const uri = `mongodb://${user}:${password}@${host1}:${port},${host2}:${port},${host3}:${port}/?replicaSet=${replica}`
                const dbName = uniqueWhenTesting(database)

                return {
                    uri,
                    dbName,
                    waitQueueTimeoutMS: 5000,
                    writeConcern: { w: 'majority', journal: true, wtimeoutMS: 5000 },
                    bufferCommands: true,
                    autoIndex: false,
                    autoCreate: false
                }
            },
            inject: [AppConfigService]
        })
    ]
})
export class MongooseConfigModule {}
