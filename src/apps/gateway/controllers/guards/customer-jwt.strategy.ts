import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { AuthTokenPayload } from 'common'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { AppConfigService } from 'shared'

@Injectable()
export class CustomerJwtStrategy extends PassportStrategy(Strategy, 'customer-jwt') {
    constructor(config: AppConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.auth.accessSecret
        })
    }

    validate(payload: AuthTokenPayload): AuthTokenPayload | null {
        /**
         * 아래처럼 중간에서 제어할 수 있다
         * const exists = await this.service.customersExist([payload.userId])
         * return exists ? payload : null
         */
        return payload
    }
}
