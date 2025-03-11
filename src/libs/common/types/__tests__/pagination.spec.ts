import { plainToInstance } from 'class-transformer'
import { CommonErrors, PaginationOptionDto } from 'common'
import { HttpTestClient } from 'testlib'

describe('Pagination', () => {
    let teardown = () => {}
    let client: HttpTestClient

    beforeEach(async () => {
        const { createFixture } = await import('./pagination.fixture')

        const fixture = await createFixture()
        teardown = fixture.teardown
        client = fixture.client
    })

    afterEach(async () => {
        await teardown()
    })

    it('페이지네이션 옵션을 올바르게 적용해야 한다', async () => {
        const skip = 2
        const take = 3
        await client
            .get('/samples')
            .query({ skip, take, orderby: 'name:asc' })
            .ok({ orderby: { direction: 'asc', name: 'name' }, skip, take })
    })

    it('입력이 이미 객체일 경우 그대로 반환해야 한다', () => {
        const input = { name: 'createdAt', direction: 'asc' }

        const instance = plainToInstance(PaginationOptionDto, { orderby: input })

        expect(instance.orderby).toEqual(input)
    })

    it('orderby 형식이 잘못되었을 때 BadRequest를 반환해야 한다', async () => {
        await client
            .get('/samples')
            .query({ orderby: 'wrong' })
            .badRequest(CommonErrors.Pagination.FormatInvalid)
    })

    it('정렬 방향이 잘못되었을 때 BadRequest를 반환해야 한다', async () => {
        await client
            .get('/samples')
            .query({ orderby: 'name:wrong' })
            .badRequest(CommonErrors.Pagination.DirectionInvalid)
    })

    it("'take' 값이 지정된 제한을 초과하면 BadRequest를 반환해야 한다", async () => {
        const take = 51
        await client
            .get('/samples/takeLimit')
            .query({ take })
            .badRequest({
                ...CommonErrors.Pagination.TakeLimitExceeded,
                take,
                takeLimit: 50
            })
    })

    it("'take' 값이 지정되지 않은 경우 기본값이 사용되어야 한다", async () => {
        await client.get('/samples/takeLimit').query({}).ok({ skip: 0, take: 50 })
    })
})
