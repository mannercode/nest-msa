import { Injectable } from '@nestjs/common'
import { PurchaseCreateDto, PurchasesClient } from 'apps/cores'
import { TicketPurchaseProcessor } from './processors'

@Injectable()
export class PurchaseProcessService {
    constructor(
        private purchasesService: PurchasesClient,
        private ticketProcessor: TicketPurchaseProcessor
    ) {}

    async processPurchase(createDto: PurchaseCreateDto) {
        await this.ticketProcessor.validatePurchase(createDto)

        const purchase = await this.purchasesService.createPurchase(createDto)

        try {
            await this.ticketProcessor.completePurchase(createDto)

            return purchase
        } catch (error) {
            await this.ticketProcessor.rollbackPurchase(createDto)
            throw error
        }
    }
}
