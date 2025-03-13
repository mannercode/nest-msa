import { createTestingModule } from 'testlib'
import { ConfigModule } from '@nestjs/config'
import { AppConfigService } from 'shared'
import { TestingModule } from '@nestjs/testing'

describe('AppConfigService', () => {
    let module: TestingModule
    let configService: AppConfigService

    beforeEach(async () => {
        module = await createTestingModule({
            imports: [ConfigModule.forRoot({})],
            providers: [AppConfigService]
        })
        configService = module.get(AppConfigService)
    })

    afterEach(async () => {
        await module?.close()
    })

    it('커버리지를 위해서 작성함. services는 main.ts에서만 호출돼서 coverage에 포함되지 않는다.', () => {
        expect(configService.services).not.toBeUndefined()
    })
})
