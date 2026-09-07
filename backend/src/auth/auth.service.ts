import {
    ConflictException,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service.js";
import { LoginDto, SignUpDto } from "./dto.js";

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwt: JwtService,
    ) {}

    async signUp(dto: SignUpDto) {
        const existing = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existing) throw new ConflictException("Email already in use");

        const passwordHash = await bcrypt.hash(dto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                passwordHash,
                displayName: dto.displayName,
            },
        });

        return this.issueToken(user.id, user.email);
    }

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (!user) throw new UnauthorizedException("Invalid credentials");

        const valid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!valid) throw new UnauthorizedException("Invalid credentials");

        return this.issueToken(user.id, user.email);
    }

    private issueToken(userId: string, email: string) {
        const accessToken = this.jwt.sign({ sub: userId, email });
        return { accessToken };
    }
}
