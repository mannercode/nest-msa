import { expect } from '@jest/globals'
import { TheaterDto } from 'apps/cores'
import { expectEqualUnsorted, HttpTestClient, nullObjectId } from 'testlib'
import {
    closeFixture,
    createTheater,
    createTheaterDto,
    createTheaters,
    Fixture
} from './theaters.fixture'
import { Errors } from './utils'

describe('/theaters', () => {
    let fixture: Fixture
    let client: HttpTestClient

    beforeEach(async () => {
        const { createFixture } = await import('./theaters.fixture')

        fixture = await createFixture()
        client = fixture.testContext.gatewayContext.httpClient
    })

    afterEach(async () => {
        await closeFixture(fixture)
    })

    describe('POST /theaters', () => {
        it('극장을 생성해야 한다', async () => {
            const { createDto, expectedDto } = createTheaterDto()

            await client.post('/theaters').body(createDto).created(expectedDto)
        })

        it('필수 필드가 누락되면 BAD_REQUEST(400)를 반환해야 한다', async () => {
            await client
                .post('/theaters')
                .body({})
                .badRequest({
                    ...Errors.RequestValidation.Failed,
                    details: [
                        {
                            constraints: {
                                isNotEmpty: 'name should not be empty',
                                isString: 'name must be a string'
                            },
                            field: 'name'
                        },
                        {
                            constraints: { isNotEmpty: 'latlong should not be empty' },
                            field: 'latlong'
                        },
                        {
                            constraints: { isNotEmpty: 'seatmap should not be empty' },
                            field: 'seatmap'
                        }
                    ]
                })
        })
    })

    describe('PATCH /theaters/:id', () => {
        let theater: TheaterDto

        beforeEach(async () => {
            theater = await createTheater(fixture.theatersService)
        })

        it('극장 정보를 업데이트해야 한다', async () => {
            const updateDto = {
                name: `Update-Name`,
                latlong: { latitude: 30.0, longitude: 120.0 },
                seatmap: []
            }
            const expected = { ...theater, ...updateDto }

            await client.patch(`/theaters/${theater.id}`).body(updateDto).ok(expected)
            await client.get(`/theaters/${theater.id}`).ok(expected)
        })

        it('극장이 존재하지 않으면 NOT_FOUND(404)를 반환해야 한다', async () => {
            await client
                .patch(`/theaters/${nullObjectId}`)
                .body({})
                .notFound({
                    ...Errors.Mongoose.DocumentNotFound,
                    notFoundId: '000000000000000000000000'
                })
        })
    })

    describe('DELETE /theaters/:id', () => {
        let theater: TheaterDto

        beforeEach(async () => {
            theater = await createTheater(fixture.theatersService)
        })

        it('극장을 삭제해야 한다', async () => {
            await client.delete(`/theaters/${theater.id}`).ok()
            await client.get(`/theaters/${theater.id}`).notFound()
        })

        it('극장이 존재하지 않으면 NOT_FOUND(404)를 반환해야 한다', async () => {
            await client.delete(`/theaters/${nullObjectId}`).notFound({
                ...Errors.Mongoose.MultipleDocumentsNotFound,
                notFoundIds: [nullObjectId]
            })
        })
    })

    describe('GET /theaters/:id', () => {
        let theater: TheaterDto

        beforeEach(async () => {
            theater = await createTheater(fixture.theatersService)
        })

        it('극장 정보를 가져와야 한다', async () => {
            await client.get(`/theaters/${theater.id}`).ok(theater)
        })

        it('극장이 존재하지 않으면 NOT_FOUND(404)를 반환해야 한다', async () => {
            await client.get(`/theaters/${nullObjectId}`).notFound({
                ...Errors.Mongoose.MultipleDocumentsNotFound,
                notFoundIds: [nullObjectId]
            })
        })
    })

    describe('GET /theaters', () => {
        let theaters: TheaterDto[]

        beforeEach(async () => {
            theaters = await createTheaters(fixture.theatersService)
        })

        it('기본 페이지네이션 설정으로 극장을 가져와야 한다', async () => {
            const { body } = await client.get('/theaters').ok()
            const { items, ...paginated } = body

            expect(paginated).toEqual({
                skip: 0,
                take: expect.any(Number),
                total: theaters.length
            })
            expectEqualUnsorted(items, theaters)
        })

        it('잘못된 필드로 검색하면 BAD_REQUEST(400)를 반환해야 한다', async () => {
            await client
                .get('/theaters')
                .query({ wrong: 'value' })
                .badRequest({
                    ...Errors.RequestValidation.Failed,
                    details: [
                        {
                            constraints: { whitelistValidation: 'property wrong should not exist' },
                            field: 'wrong'
                        }
                    ]
                })
        })

        it('이름의 일부로 극장을 검색할 수 있어야 한다', async () => {
            const partialName = 'Theater-'
            const { body } = await client.get('/theaters').query({ name: partialName }).ok()

            const expected = theaters.filter((theater) => theater.name.startsWith(partialName))
            expectEqualUnsorted(body.items, expected)
        })
    })
})
