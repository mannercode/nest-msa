import {
    CustomersService,
    MovieDto,
    MoviesService,
    Seatmap,
    ShowtimeDto,
    ShowtimesService,
    TheaterDto,
    TheatersService,
    TicketsService,
    TicketStatus
} from 'apps/cores'
import { DateUtil } from 'common'
import { nullObjectId } from 'testlib'
import { createCustomerAndLogin } from './customers-auth.fixture'
import { createMovie } from './movies.fixture'
import { createShowtimeDto, createShowtimes } from './showtimes.fixture'
import { createTheater } from './theaters.fixture'
import { createTickets } from './tickets.fixture'
import { AllTestContexts, createAllTestContexts } from './utils'

export interface Fixture {
    testContext: AllTestContexts
    movie: MovieDto
    accessToken: string
}

export async function createFixture() {
    const testContext = await createAllTestContexts()
    const module = testContext.coresContext.module

    const customersService = module.get(CustomersService)
    const { accessToken } = await createCustomerAndLogin(customersService)

    const moviesService = module.get(MoviesService)
    const movie = await createMovie(moviesService, {})

    const theatersService = module.get(TheatersService)
    const theaters = await Promise.all(
        Array.from({ length: 10 }, (_, index) =>
            createTheater(theatersService, {
                latlong: { latitude: 30.0 + index, longitude: 130.0 + index }
            })
        )
    )

    const showtimesService = module.get(ShowtimesService)
    const startTimes = [
        new Date('2999-01-01T12:00'),
        new Date('2999-01-01T14:00'),
        new Date('2999-01-03T12:00'),
        new Date('2999-01-03T14:00'),
        new Date('2999-01-02T12:00'),
        new Date('2999-01-02T14:00')
    ]
    const showtimeDtos = theaters.slice(0, 5).flatMap((theater) =>
        startTimes.map((startTime) =>
            createShowtimeDto({
                movieId: movie.id,
                theaterId: theater.id,
                startTime,
                endTime: DateUtil.addMinutes(startTime, 90)
            })
        )
    )
    const showtimes = await createShowtimes(showtimesService, showtimeDtos)

    const ticketsService = module.get(TicketsService)
    await createAllTickets(ticketsService, theaters, showtimes)

    return { testContext, movie, accessToken }
}

export async function closeFixture(fixture: Fixture) {
    await fixture.testContext.close()
}

const createAllTickets = async (
    ticketsService: TicketsService,
    theaters: TheaterDto[],
    showtimes: ShowtimeDto[]
) => {
    const theatersById = new Map(theaters.map((theater) => [theater.id, theater]))

    const createDtos = showtimes.flatMap((showtime) => {
        const theater = theatersById.get(showtime.theaterId)!

        return Seatmap.getAllSeats(theater.seatmap).map((seat) => ({
            batchId: nullObjectId,
            movieId: showtime.movieId,
            theaterId: showtime.theaterId,
            showtimeId: showtime.id,
            status: TicketStatus.available,
            seat
        }))
    })

    await createTickets(ticketsService, createDtos)
}
