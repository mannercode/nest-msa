import { ClientProxy, ClientProxyFactory, NatsOptions } from '@nestjs/microservices'
import { ClientProxyService } from 'common'

export class MicroserviceTestClient extends ClientProxyService {
    static create(option: NatsOptions) {
        const proxy = ClientProxyFactory.create(option)

        return new MicroserviceTestClient(proxy)
    }

    constructor(proxy: ClientProxy) {
        super(proxy)
    }

    async close() {
        await this.onModuleDestroy()
    }

    async expect<T>(cmd: string, payload: any, expected: any): Promise<T> {
        const value = await super.getJson<T>(cmd, payload)

        if (expected) {
            expect(value).toEqual(expected)
        }

        return value
    }

    async error(cmd: string, payload: any, expected: any) {
        const promise = super.getJson(cmd, payload)

        await expect(promise).rejects.toEqual(expected)
    }
}
