import { Controller } from '@nestjs/common'
import { MessagePattern, Payload } from '@nestjs/microservices'
import { Messages } from 'shared'
import { CreatePaymentDto } from './dtos'
import { PaymentsService } from './payments.service'

@Controller()
export class PaymentsController {
    constructor(private service: PaymentsService) {}

    @MessagePattern(Messages.Payments.processPayment)
    processPayment(@Payload() createDto: CreatePaymentDto) {
        return this.service.processPayment(createDto)
    }

    @MessagePattern(Messages.Payments.getPayments)
    getPayments(@Payload() paymentIds: string[]) {
        return this.service.getPayments(paymentIds)
    }
}
