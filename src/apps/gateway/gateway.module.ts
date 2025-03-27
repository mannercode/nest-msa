import { Module } from '@nestjs/common'
import {
    BookingClient,
    PurchaseProcessClient,
    RecommendationClient,
    ShowtimeCreationClient
} from 'apps/applications'
import { CustomersClient, MoviesClient, PurchasesClient, TheatersClient } from 'apps/cores'
import { StorageFilesClient } from 'apps/infrastructures'
import { CommonModule } from 'shared'
import {
    BookingController,
    CustomerJwtStrategy,
    CustomerLocalStrategy,
    CustomersController,
    MoviesController,
    PurchasesController,
    ShowtimeCreationController,
    StorageFilesController,
    TheatersController
} from './controllers'
import { HealthModule, MulterConfigModule } from './modules'

@Module({
    imports: [CommonModule, HealthModule, MulterConfigModule],
    providers: [
        CustomerLocalStrategy,
        CustomerJwtStrategy,
        CustomersClient,
        StorageFilesClient,
        MoviesClient,
        TheatersClient,
        ShowtimeCreationClient,
        BookingClient,
        PurchasesClient,
        RecommendationClient,
        PurchaseProcessClient
    ],
    controllers: [
        CustomersController,
        StorageFilesController,
        MoviesController,
        TheatersController,
        ShowtimeCreationController,
        BookingController,
        PurchasesController
    ]
})
export class GatewayModule {}
