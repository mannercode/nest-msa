import { ShowtimeDto } from 'apps/cores'
import { DateUtil, pickIds } from 'common'
import { expectEqualUnsorted, nullObjectId, testObjectId } from 'testlib'
import {
    createShowtimeDto,
    createShowtimeDtos,
    createShowtimes,
    Fixture
} from './showtimes.fixture'

describe('Showtimes Module', () => {
    let fix: Fixture

    beforeEach(async () => {
        const { createFixture } = await import('./showtimes.fixture')
        fix = await createFixture()
    })

    afterEach(async () => {
        await fix?.teardown()
    })

    it('createShowtimes', async () => {
        const { createDtos, expectedDtos } = createShowtimeDtos()

        const { success } = await fix.showtimesClient.createShowtimes(createDtos)
        expect(success).toBeTruthy()

        const showtimes = await fix.showtimesClient.findAllShowtimes({
            startTimeRange: { start: new Date(0), end: new Date('9999') }
        })

        expect(showtimes).toEqual(expectedDtos)
    })

    describe('findAllShowtimes', () => {
        beforeEach(async () => {
            const { createDtos } = createShowtimeDtos()
            const { success } = await fix.showtimesClient.createShowtimes(createDtos)
            expect(success).toBeTruthy()
        })

        const createAndFindShowtimes = async (overrides = {}, findFilter = {}) => {
            const { createDtos, expectedDtos } = createShowtimeDtos(overrides)
            const { success } = await fix.showtimesClient.createShowtimes(createDtos)
            expect(success).toBeTruthy()

            const showtimes = await fix.showtimesClient.findAllShowtimes(findFilter)
            expectEqualUnsorted(showtimes, expectedDtos)
        }

        it('batchIds', async () => {
            const batchId = testObjectId('a1')
            await createAndFindShowtimes({ batchId }, { batchIds: [batchId] })
        })

        it('movieIds', async () => {
            const movieId = testObjectId('a1')
            await createAndFindShowtimes({ movieId }, { movieIds: [movieId] })
        })

        it('theaterIds', async () => {
            const theaterId = testObjectId('a1')
            await createAndFindShowtimes({ theaterId }, { theaterIds: [theaterId] })
        })

        it('startTimeRange', async () => {
            const startTimeRange = {
                start: new Date(2000, 0, 1, 0, 0),
                end: new Date(2000, 0, 1, 49, 0)
            }

            const showtimes = await fix.showtimesClient.findAllShowtimes({ startTimeRange })
            expect(showtimes).toHaveLength(50)
        })

        it('1개 이상의 필터를 설정하지 않으면 BAD_REQUEST(400)를 반환해야 한다', async () => {
            const promise = createAndFindShowtimes({})
            await expect(promise).rejects.toThrow('At least one filter condition must be provided')
        })
    })

    describe('getShowtimes', () => {
        let showtimes: ShowtimeDto[]

        beforeEach(async () => {
            const { createDtos } = createShowtimeDtos()
            showtimes = await createShowtimes(fix, createDtos)
        })

        it('상영시간 정보를 가져와야 한다', async () => {
            const gotShowtime = await fix.showtimesClient.getShowtimes(pickIds(showtimes))
            expect(gotShowtime).toEqual(showtimes)
        })

        it('상영시간이 존재하지 않으면 NOT_FOUND(404)를 반환해야 한다', async () => {
            const promise = fix.showtimesClient.getShowtimes([nullObjectId])
            await expect(promise).rejects.toThrow(`One or more documents not found`)
        })
    })

    it('findShowingMovieIds', async () => {
        const movieIds = [testObjectId('a1'), testObjectId('a2')]
        const now = new Date()
        const createDtos = [
            createShowtimeDto({
                startTime: DateUtil.addMinutes(now, -90),
                endTime: DateUtil.addMinutes(now, -30)
            }),
            createShowtimeDto({
                movieId: movieIds[0],
                startTime: DateUtil.addMinutes(now, 30),
                endTime: DateUtil.addMinutes(now, 90)
            }),
            createShowtimeDto({
                movieId: movieIds[1],
                startTime: DateUtil.addMinutes(now, 120),
                endTime: DateUtil.addMinutes(now, 150)
            })
        ]

        const { success } = await fix.showtimesClient.createShowtimes(createDtos)
        expect(success).toBeTruthy()

        const foundIds = await fix.showtimesClient.findShowingMovieIds()
        expect(foundIds).toEqual(movieIds)
    })

    it('findTheaterIds', async () => {
        const movieId = testObjectId('a1')
        const createDtos = [
            createShowtimeDto({
                movieId: testObjectId('a2'),
                theaterId: testObjectId('b1')
            }),
            createShowtimeDto({
                movieId,
                theaterId: testObjectId('b2')
            }),
            createShowtimeDto({
                movieId,
                theaterId: testObjectId('b3')
            })
        ]

        const { success } = await fix.showtimesClient.createShowtimes(createDtos)
        expect(success).toBeTruthy()

        const theaterIds = await fix.showtimesClient.findTheaterIds({ movieIds: [movieId] })
        expect(theaterIds).toEqual([testObjectId('b2'), testObjectId('b3')])
    })

    it('findShowdates', async () => {
        const movieId = testObjectId('a1')
        const theaterId = testObjectId('b1')
        const createDtos = [
            createShowtimeDto({
                movieId,
                theaterId,
                startTime: new Date('2000-01-02'),
                endTime: new Date('2000-01-03')
            }),
            createShowtimeDto({
                movieId,
                theaterId,
                startTime: new Date('2000-01-04'),
                endTime: new Date('2000-01-04')
            }),
            createShowtimeDto({
                movieId,
                theaterId: testObjectId('A1'),
                startTime: new Date('2000-01-05'),
                endTime: new Date('2000-01-06')
            })
        ]

        const { success } = await fix.showtimesClient.createShowtimes(createDtos)
        expect(success).toBeTruthy()

        const showdates = await fix.showtimesClient.findShowdates({
            movieIds: [movieId],
            theaterIds: [theaterId]
        })
        expect(showdates.map((showdate) => showdate.getTime())).toEqual([
            new Date('2000-01-02').getTime(),
            new Date('2000-01-04').getTime()
        ])
    })
})
