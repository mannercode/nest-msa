import { PurchaseDto, PurchaseItemType, PurchasesService } from 'apps/cores'
import { PaymentsService } from 'apps/infrastructures'
import { nullObjectId } from 'testlib'
import { closeFixture, Fixture } from './purchases.fixture'

describe('Purchases Module', () => {
    let fixture: Fixture
    let purchasesService: PurchasesService
    let paymentsService: PaymentsService

    let purchase: PurchaseDto
    const customerId = nullObjectId
    const totalPrice = 1000
    const items = [{ type: PurchaseItemType.ticket, ticketId: nullObjectId }]

    beforeEach(async () => {
        const { createFixture } = await import('./purchases.fixture')

        fixture = await createFixture()
        purchasesService = fixture.purchasesService
        paymentsService = fixture.paymentsService

        purchase = await purchasesService.createPurchase({ customerId, totalPrice, items })
    })

    afterEach(async () => {
        await closeFixture(fixture)
    })

    it('구매 요청을 성공적으로 처리해야 한다', async () => {
        expect(purchase).toEqual({
            id: expect.any(String),
            paymentId: expect.any(String),
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
            customerId,
            totalPrice,
            items
        })
    })

    it('구매 정보를 조회해야 한다', async () => {
        const gotPurchases = await purchasesService.getPurchases([purchase.id])
        expect(gotPurchases).toEqual([purchase])
    })

    it('결제 정보가 조회돼야 한다', async () => {
        const payments = await paymentsService.getPayments([purchase.paymentId])
        expect(payments[0].amount).toEqual(purchase.totalPrice)
    })
})
