import { Controller, Get, Post, Provider } from '@nestjs/common'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { MessagePattern, NatsOptions, Transport } from '@nestjs/microservices'
import { SuccessLoggingInterceptor } from 'common'
import {
    createHttpTestContext,
    getNatsTestConnection,
    HttpTestClient,
    RpcTestClient,
    withTestId
} from 'testlib'

@Controller()
class TestController {
    @Post('success')
    async httpSuccess() {
        return { result: 'success' }
    }

    // TODO subject. 모두 지우자?
    @MessagePattern(withTestId('subject.success'))
    rpcSuccess() {
        return { result: 'success' }
    }

    @Get('exclude-path')
    async getExcludePath() {
        return { result: 'success' }
    }

    @MessagePattern(withTestId('exclude-path'))
    excludeRpc() {
        return { result: 'success' }
    }
}

export interface Fixture {
    teardown: () => Promise<void>
    httpClient: HttpTestClient
    rpcClient: RpcTestClient
    spyVerbose: jest.SpyInstance
    spyError: jest.SpyInstance
}

export async function createFixture(providers: Provider[]) {
    const { servers } = getNatsTestConnection()
    const brokerOptions = { transport: Transport.NATS, options: { servers } } as NatsOptions

    const { httpClient, ...testContext } = await createHttpTestContext({
        metadata: {
            controllers: [TestController],
            providers: [
                { provide: APP_INTERCEPTOR, useClass: SuccessLoggingInterceptor },
                ...providers
            ]
        },
        configureApp: async (app) => {
            app.connectMicroservice(brokerOptions, { inheritAppConfig: true })
            await app.startAllMicroservices()
        }
    })

    const { Logger } = await import('@nestjs/common')
    const spyVerbose = jest.spyOn(Logger, 'verbose')
    const spyError = jest.spyOn(Logger, 'error')

    const rpcClient = RpcTestClient.create(brokerOptions)

    const teardown = async () => {
        await rpcClient.close()
        await testContext.close()
    }

    return { teardown, httpClient, rpcClient, spyVerbose, spyError }
}
