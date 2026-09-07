import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    UseGuards,
} from "@nestjs/common";
import { AuthService } from "./auth.service.js";
import { LoginDto, SignUpDto } from "./dto.js";
import { JwtAuthGuard } from "./jwt-auth.guard.js";

@Controller("auth")
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post("signup")
    signUp(@Body() dto: SignUpDto) {
        return this.authService.signUp(dto);
    }

    @HttpCode(HttpStatus.OK)
    @Post("login")
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @UseGuards(JwtAuthGuard)
    @Get("me")
    me(@Req() req: any) {
        return req.user;
    }
}
