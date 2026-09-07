import { describe, it, expect, vi, beforeEach } from "vitest";
import { Test } from "@nestjs/testing";
import { ConflictException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { AuthService } from "./auth.service.js";
import { PrismaService } from "../prisma/prisma.service.js";

vi.mock("bcrypt");

describe("AuthService", () => {
    let service: AuthService;
    let prisma: {
        user: {
            findUnique: ReturnType<typeof vi.fn>;
            create: ReturnType<typeof vi.fn>;
        };
    };
    let jwt: { sign: ReturnType<typeof vi.fn> };

    beforeEach(async () => {
        prisma = { user: { findUnique: vi.fn(), create: vi.fn() } };
        jwt = { sign: vi.fn().mockReturnValue("signed-token") };

        const moduleRef = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: PrismaService, useValue: prisma },
                { provide: JwtService, useValue: jwt },
            ],
        }).compile();

        service = moduleRef.get(AuthService);
        vi.clearAllMocks();
        jwt.sign.mockReturnValue("signed-token");
    });

    describe("signUp", () => {
        it("hashes the password, creates a user, and returns a token", async () => {
            prisma.user.findUnique.mockResolvedValue(null);
            vi.mocked(bcrypt.hash).mockResolvedValue(
                "hashed-password" as never,
            );
            prisma.user.create.mockResolvedValue({
                id: "user-1",
                email: "a@b.com",
                displayName: "A",
            });

            const result = await service.signUp({
                email: "a@b.com",
                password: "password123",
                displayName: "A",
            });

            expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
            expect(jwt.sign).toHaveBeenCalledWith({
                sub: "user-1",
                email: "a@b.com",
            });
            expect(result).toEqual({ accessToken: "signed-token" });
        });

        it("throws ConflictException if email already exists", async () => {
            prisma.user.findUnique.mockResolvedValue({ id: "existing" });
            await expect(
                service.signUp({
                    email: "a@b.com",
                    password: "password123",
                    displayName: "A",
                }),
            ).rejects.toThrow(ConflictException);
            expect(prisma.user.create).not.toHaveBeenCalled();
        });
    });

    describe("login", () => {
        it("returns a token when credentials are valid", async () => {
            prisma.user.findUnique.mockResolvedValue({
                id: "user-1",
                email: "a@b.com",
                passwordHash: "hashed-password",
                displayName: "A",
            });
            vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

            const result = await service.login({
                email: "a@b.com",
                password: "password123",
            });

            expect(result).toEqual({ accessToken: "signed-token" });
        });

        it("throws UnauthorizedException when user does not exist", async () => {
            prisma.user.findUnique.mockResolvedValue(null);
            await expect(
                service.login({ email: "nope@b.com", password: "password123" }),
            ).rejects.toThrow(UnauthorizedException);
        });

        it("throws UnauthorizedException when password is wrong", async () => {
            prisma.user.findUnique.mockResolvedValue({
                id: "user-1",
                email: "a@b.com",
                passwordHash: "hashed-password",
                displayName: "A",
            });
            vi.mocked(bcrypt.compare).mockResolvedValue(false as never);
            await expect(
                service.login({ email: "a@b.com", password: "wrong" }),
            ).rejects.toThrow(UnauthorizedException);
        });
    });
});
