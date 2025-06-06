import { Controller } from '@nestjs/common'
import { MessagePattern, Payload } from '@nestjs/microservices'
import { Messages } from 'shared'
import { TicketHoldingService } from './ticket-holding.service'
import { HoldTicketsDto } from './dtos'

@Controller()
export class TicketHoldingController {
    constructor(private service: TicketHoldingService) {}

    @MessagePattern(Messages.TicketHolding.holdTickets)
    holdTickets(@Payload() holdDto: HoldTicketsDto) {
        return this.service.holdTickets(holdDto)
    }

    @MessagePattern(Messages.TicketHolding.searchHeldTicketIds)
    searchHeldTicketIds(
        @Payload('showtimeId') showtimeId: string,
        @Payload('customerId') customerId: string
    ) {
        return this.service.searchHeldTicketIds(showtimeId, customerId)
    }

    @MessagePattern(Messages.TicketHolding.releaseTickets)
    releaseTickets(
        @Payload('showtimeId') showtimeId: string,
        @Payload('customerId') customerId: string
    ) {
        return this.service.releaseTickets(showtimeId, customerId)
    }
}
