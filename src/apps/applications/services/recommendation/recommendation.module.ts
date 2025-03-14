import { Module } from '@nestjs/common'
import { MoviesProxy, ShowtimesProxy, WatchRecordsProxy } from 'apps/cores'
import { RecommendationController } from './recommendation.controller'
import { RecommendationService } from './recommendation.service'

@Module({
    providers: [RecommendationService, ShowtimesProxy, MoviesProxy, WatchRecordsProxy],
    controllers: [RecommendationController]
})
export class RecommendationModule {}
