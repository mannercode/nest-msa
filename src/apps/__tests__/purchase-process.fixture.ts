import {
    CustomerDto,
    CustomersService,
    MovieDto,
    PurchaseCreateDto,
    PurchaseItemType,
    PurchasesService,
    Seatmap,
    ShowtimeDto,
    ShowtimesService,
    TheaterDto,
    TheatersService,
    TicketDto,
    TicketHoldingService,
    TicketsService,
    TicketStatus
} from 'apps/cores'
import { PaymentsService } from 'apps/infrastructures'
import { DateUtil, pickIds } from 'common'
import { nullObjectId } from 'testlib'
import { TicketPurchaseProcessor } from '../applications/services/purchase-process/processors'
import { createCustomer } from './customers.fixture'
import { createMovie } from './movies.fixture'
import { createShowtimeDto, createShowtimes } from './showtimes.fixture'
import { createTheater } from './theaters.fixture'
import { createTicketDto, createTickets } from './tickets.fixture'
import { AllTestContexts, createAllTestContexts } from './utils'

export interface Fixture {
    testContext: AllTestContexts
    customer: CustomerDto
    movie: MovieDto
    theater: TheaterDto
    showtimesService: ShowtimesService
    purchasesService: PurchasesService
    paymentsService: PaymentsService
    ticketsService: TicketsService
    ticketHoldingService: TicketHoldingService
    ticketPurchaseProcessor: TicketPurchaseProcessor
}

export async function createFixture() {
    const testContext = await createAllTestContexts()
    const module = testContext.coresContext.module

    const customersService = module.get(CustomersService)
    const customer = await createCustomer(customersService)

    const movie = await createMovie(testContext)

    const theater = await createTheater(testContext, {
        seatmap: { blocks: [{ name: 'A', rows: [{ name: '1', seats: 'OOOOOOOOOOOO' }] }] }
    })

    const showtimesService = module.get(ShowtimesService)
    const ticketsService = module.get(TicketsService)
    const ticketHoldingService = module.get(TicketHoldingService)
    const purchasesService = module.get(PurchasesService)
    const paymentsService = testContext.infrasContext.module.get(PaymentsService)
    const ticketPurchaseProcessor = testContext.appsContext.module.get(TicketPurchaseProcessor)

    return {
        testContext,
        customer,
        movie,
        theater,
        purchasesService,
        paymentsService,
        ticketsService,
        ticketHoldingService,
        showtimesService,
        ticketPurchaseProcessor
    }
}

export async function closeFixture(fixture: Fixture) {
    await fixture.testContext.close()
}

export const createShowtime = async (fixture: Fixture, startTime: Date) => {
    const createDto = createShowtimeDto({
        movieId: fixture.movie.id,
        theaterId: fixture.theater.id,
        startTime,
        endTime: DateUtil.addMinutes(startTime, 90)
    })
    const showtimes = await createShowtimes(fixture.showtimesService, [createDto])
    return showtimes[0]
}

export const createAllTickets = async (fixture: Fixture, showtime: ShowtimeDto) => {
    const createDtos = Seatmap.getAllSeats(fixture.theater.seatmap).map((seat) =>
        createTicketDto({
            movieId: showtime.movieId,
            theaterId: showtime.theaterId,
            showtimeId: showtime.id,
            status: TicketStatus.available,
            seat
        })
    )

    const tickets = await createTickets(fixture.ticketsService, createDtos)
    return tickets
}

export const createPurchase = async (
    purchasesService: PurchasesService,
    override: Partial<PurchaseCreateDto>
) => {
    const createDto = {
        customerId: nullObjectId,
        totalPrice: 1000,
        items: [{ type: PurchaseItemType.ticket, ticketId: nullObjectId }],
        ...override
    } as PurchaseCreateDto

    return purchasesService.createPurchase(createDto)
}

export const holdTickets = async (fixture: Fixture, showtimeId: string, tickets: TicketDto[]) => {
    await fixture.ticketHoldingService.holdTickets({
        customerId: fixture.customer.id,
        showtimeId,
        ticketIds: pickIds(tickets)
    })
}
