import {
    MovieGenre,
    MovieRating,
    CreateShowtimeDto,
    CreateTicketDto,
    TicketStatus
} from 'apps/cores'
import { DateTimeRange } from 'common'
import { omit, uniq } from 'lodash'
import { nullDate, nullObjectId } from 'testlib'
import { CommonFixture, TestFiles } from './utils'

export const createCustomerAndLogin = async (fix: CommonFixture) => {
    const email = 'user@mail.com'
    const password = 'password'
    const customer = await createCustomer(fix, { email, password })

    const { accessToken } = await fix.customersClient.generateAuthTokens({
        customerId: customer.id,
        email
    })

    return { customer, accessToken }
}

export const biuldCustomerCreateDto = (overrides = {}) => {
    const createDto = {
        name: 'name',
        email: 'name@mail.com',
        birthdate: new Date('2020-12-12'),
        password: 'password',
        ...overrides
    }
    const expectedDto = { id: expect.any(String), ...omit(createDto, 'password') }
    return { createDto, expectedDto }
}

export const createCustomer = async (fix: CommonFixture, override = {}) => {
    const { createDto } = biuldCustomerCreateDto(override)

    const customer = await fix.customersClient.createCustomer(createDto)
    return customer
}

export const buildMovieCreateDto = (overrides = {}) => {
    const createDto = {
        title: `MovieTitle`,
        genre: [MovieGenre.Action],
        releaseDate: new Date('1900-01-01'),
        plot: `MoviePlot`,
        durationMinutes: 90,
        director: 'James Cameron',
        rating: MovieRating.PG,
        ...overrides
    }
    const expectedDto = { id: expect.any(String), images: expect.any(Array), ...createDto }
    return { createDto, expectedDto }
}

export const createMovie = async (fix: CommonFixture, override = {}) => {
    const { createDto } = buildMovieCreateDto(override)

    const movie = await fix.moviesClient.createMovie(createDto, [TestFiles.image])
    return movie
}

export const buildTheaterCreateDto = (overrides = {}) => {
    const createDto = {
        name: `theater name`,
        latlong: { latitude: 38.123, longitude: 138.678 },
        seatmap: { blocks: [{ name: 'A', rows: [{ name: '1', seats: 'OOOOXXOOOO' }] }] },
        ...overrides
    }
    const expectedDto = { id: expect.any(String), ...createDto }
    return { createDto, expectedDto }
}

export const createTheater = async (fix: CommonFixture, override = {}) => {
    const { createDto } = buildTheaterCreateDto(override)

    const theater = await fix.theatersClient.createTheater(createDto)
    return theater
}

export const buildShowtimeCreateDto = (overrides: Partial<CreateShowtimeDto> = {}) => {
    const createDto = {
        batchId: nullObjectId,
        movieId: nullObjectId,
        theaterId: nullObjectId,
        timeRange: DateTimeRange.create({ start: new Date('2000-01-01T12:00'), minutes: 1 }),
        ...overrides
    }
    const expectedDto = { id: expect.any(String), ...omit(createDto, 'batchId') }
    return { createDto, expectedDto }
}

export const createShowtimes = async (fix: CommonFixture, createDtos: CreateShowtimeDto[]) => {
    const { success } = await fix.showtimesClient.createShowtimes(createDtos)
    expect(success).toBeTruthy()

    const batchIds = uniq(createDtos.map((dto) => dto.batchId))

    const showtimes = await fix.showtimesClient.searchShowtimes({ batchIds })
    return showtimes
}

export const buildTicketCreateDto = (overrides = {}) => {
    const createDto = {
        batchId: nullObjectId,
        movieId: nullObjectId,
        theaterId: nullObjectId,
        showtimeId: nullObjectId,
        status: TicketStatus.available,
        seat: { block: '1b', row: '1r', seatnum: 1 },
        ...overrides
    }
    const expectedDto = { id: expect.any(String), ...omit(createDto, 'batchId') }
    return { createDto, expectedDto }
}

export const createTickets = async (fix: CommonFixture, createDtos: CreateTicketDto[]) => {
    const { success } = await fix.ticketsClient.createTickets(createDtos)
    expect(success).toBeTruthy()

    const batchIds = uniq(createDtos.map((dto) => dto.batchId))

    const tickets = await fix.ticketsClient.searchTickets({ batchIds })
    return tickets
}

export const buildWatchRecordCreateDto = (overrides = {}) => {
    const createDto = {
        customerId: nullObjectId,
        movieId: nullObjectId,
        purchaseId: nullObjectId,
        watchDate: nullDate,
        ...overrides
    }
    const expectedDto = { id: expect.any(String), ...createDto }
    return { createDto, expectedDto }
}

export const createWatchRecord = async (fix: CommonFixture, override = {}) => {
    const { createDto } = buildWatchRecordCreateDto(override)

    const watchRecord = await fix.watchRecordsClient.createWatchRecord(createDto)
    return watchRecord
}
