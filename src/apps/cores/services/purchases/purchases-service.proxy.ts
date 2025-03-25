import { Injectable } from '@nestjs/common'
import { ClientProxyService, InjectClientProxy } from 'common'
import { ClientProxyConfig, Messages } from 'shared'
import { PurchaseCreateDto, PurchaseDto } from './dtos'

@Injectable()
export class PurchasesServiceProxy {
    constructor(
        @InjectClientProxy(ClientProxyConfig.connName) private service: ClientProxyService
    ) {}

    createPurchase(createDto: PurchaseCreateDto): Promise<PurchaseDto> {
        return this.service.getJson(Messages.Purchases.createPurchase, createDto)
    }

    getPurchase(purchaseId: string): Promise<PurchaseDto> {
        return this.service.getJson(Messages.Purchases.getPurchase, purchaseId)
    }
}
