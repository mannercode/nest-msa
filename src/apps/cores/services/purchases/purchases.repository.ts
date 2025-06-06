import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { MongooseRepository, objectId } from 'common'
import { Model } from 'mongoose'
import { CreatePurchaseDto } from './dtos'
import { Purchase } from './models'

@Injectable()
export class PurchasesRepository extends MongooseRepository<Purchase> {
    constructor(@InjectModel(Purchase.name) model: Model<Purchase>) {
        super(model)
    }

    async createPurchase(createDto: CreatePurchaseDto & { paymentId: string }) {
        const purchase = this.newDocument()
        purchase.customerId = objectId(createDto.customerId)
        purchase.paymentId = objectId(createDto.paymentId)
        purchase.totalPrice = createDto.totalPrice
        purchase.purchaseItems = createDto.purchaseItems.map((item) => ({
            ...item,
            ticketId: objectId(item.ticketId)
        }))

        await purchase.save()

        return purchase
    }
}
