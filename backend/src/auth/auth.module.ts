import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthService } from "./auth.service.js";
import { AuthController } from "./auth.controller.js";
import { JwtStrategy } from "./jwt.strategy.js";

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: "jwt" }),
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: {
                expiresIn: parseInt(process.env.JWT_EXPIRES_IN || "604800", 10),
            },
        }),
    ],
    providers: [AuthService, JwtStrategy],
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule {}
