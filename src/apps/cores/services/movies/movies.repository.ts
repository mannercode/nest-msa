import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { MongooseRepository, objectIds, QueryBuilder, QueryBuilderOptions } from 'common'
import { Model } from 'mongoose'
import { CreateMovieDto, SearchMoviesDto, UpdateMovieDto } from './dtos'
import { Movie } from './models'

@Injectable()
export class MoviesRepository extends MongooseRepository<Movie> {
    constructor(@InjectModel(Movie.name) model: Model<Movie>) {
        super(model)
    }

    async createMovie(createDto: CreateMovieDto, storageFileIds: string[]) {
        const movie = this.newDocument()
        movie.title = createDto.title
        movie.genre = createDto.genre
        movie.releaseDate = createDto.releaseDate
        movie.plot = createDto.plot
        movie.durationMinutes = createDto.durationMinutes
        movie.director = createDto.director
        movie.rating = createDto.rating
        movie.imageFileIds = objectIds(storageFileIds)

        return movie.save()
    }

    async updateMovie(movieId: string, updateDto: UpdateMovieDto) {
        const movie = await this.getById(movieId)

        if (updateDto.title) movie.title = updateDto.title
        if (updateDto.genre) movie.genre = updateDto.genre
        if (updateDto.releaseDate) movie.releaseDate = updateDto.releaseDate
        if (updateDto.plot) movie.plot = updateDto.plot
        if (updateDto.durationMinutes) movie.durationMinutes = updateDto.durationMinutes
        if (updateDto.director) movie.director = updateDto.director
        if (updateDto.rating) movie.rating = updateDto.rating

        return movie.save()
    }

    async searchMoviesPage(searchDto: SearchMoviesDto) {
        const { take, skip, orderby } = searchDto

        const paginated = await this.findWithPagination({
            callback: (helpers) => {
                const query = this.buildQuery(searchDto, { allowEmpty: true })

                helpers.setQuery(query)
            },
            pagination: { take, skip, orderby }
        })

        return paginated
    }

    private buildQuery(searchDto: SearchMoviesDto, options: QueryBuilderOptions) {
        const { title, genre, releaseDate, plot, director, rating } = searchDto

        const builder = new QueryBuilder<Movie>()
        builder.addRegex('title', title)
        builder.addEqual('genre', genre)
        builder.addEqual('releaseDate', releaseDate)
        builder.addRegex('plot', plot)
        builder.addRegex('director', director)
        builder.addEqual('rating', rating)

        const query = builder.build(options)
        return query
    }
}
