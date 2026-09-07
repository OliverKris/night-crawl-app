import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

interface JwtPayload {
    sub: string;
    email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey:
                process.env.JWT_SECRET ??
                "dev-only-change-before-any-real-deployment",
        });
    }

    validate(payload: JwtPayload) {
        // Whatever this returns gets attached to req.user on guarded routes.
        return { userId: payload.sub, email: payload.email };
    }
}
