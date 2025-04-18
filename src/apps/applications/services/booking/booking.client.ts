import { Injectable } from '@nestjs/common'
import { HoldTicketsDto, TheaterDto, TicketDto } from 'apps/cores'
import { ClientProxyService, InjectClientProxy } from 'common'
import { Messages } from 'shared'
import {
    FindShowdatesDto,
    FindShowingTheatersDto,
    FindShowtimesDto,
    ShowtimeSalesStatusDto
} from './dtos'

@Injectable()
export class BookingClient {
    constructor(@InjectClientProxy() private proxy: ClientProxyService) {}

    findShowingTheaters(dto: FindShowingTheatersDto): Promise<TheaterDto[]> {
        return this.proxy.getJson(Messages.Booking.findShowingTheaters, dto)
    }

    findShowdates(dto: FindShowdatesDto): Promise<Date[]> {
        return this.proxy.getJson(Messages.Booking.findShowdates, dto)
    }

    findShowtimes(dto: FindShowtimesDto): Promise<ShowtimeSalesStatusDto[]> {
        return this.proxy.getJson(Messages.Booking.findShowtimes, dto)
    }

    getAvailableTickets(showtimeId: string): Promise<TicketDto[]> {
        return this.proxy.getJson(Messages.Booking.getAvailableTickets, showtimeId)
    }

    holdTickets(dto: HoldTicketsDto): Promise<{ success: boolean }> {
        return this.proxy.getJson(Messages.Booking.holdTickets, dto)
    }
}
