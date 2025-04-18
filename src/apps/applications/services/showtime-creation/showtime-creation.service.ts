import { Injectable } from '@nestjs/common'
import { newObjectId, CommonQueryDto } from 'common'
import { MoviesClient, ShowtimesClient, TheatersClient } from 'apps/cores'
import { ShowtimeBatchCreateDto, ShowtimeBatchCreateResponse } from './dtos'
import { ShowtimeCreationWorkerService } from './services'

@Injectable()
export class ShowtimeCreationService {
    constructor(
        private theatersService: TheatersClient,
        private moviesService: MoviesClient,
        private showtimesService: ShowtimesClient,
        private batchCreationService: ShowtimeCreationWorkerService
    ) {}

    async findMovies(queryDto: CommonQueryDto) {
        return this.moviesService.findMovies(queryDto)
    }

    async findTheaters(queryDto: CommonQueryDto) {
        return this.theatersService.findTheaters(queryDto)
    }

    async findShowtimes(theaterIds: string[]) {
        return this.showtimesService.findAllShowtimes({
            theaterIds,
            endTimeRange: { start: new Date() }
        })
    }

    async createBatchShowtimes(createDto: ShowtimeBatchCreateDto) {
        const batchId = newObjectId()

        this.batchCreationService.enqueueTask({ ...createDto, batchId })

        return { batchId } as ShowtimeBatchCreateResponse
    }
}
