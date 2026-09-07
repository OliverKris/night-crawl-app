import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { Test } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../src/app.module.js";
import { PrismaService } from "../src/prisma/prisma.service.js";

describe("Auth (e2e)", () => {
    let app: INestApplication;
    let prisma: PrismaService;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();
        app = moduleRef.createNestApplication();
        app.useGlobalPipes(
            new ValidationPipe({ whitelist: true, transform: true }),
        );
        await app.init();
        prisma = app.get(PrismaService);
    });

    beforeEach(async () => {
        await prisma.user.deleteMany();
    });

    afterAll(async () => {
        await app.close();
    });

    it("signs up a new user", async () => {
        const res = await request(app.getHttpServer())
            .post("/auth/signup")
            .send({
                email: "test@example.com",
                password: "password123",
                displayName: "Test",
            })
            .expect(201);

        expect(res.body.accessToken).toBeDefined();
        expect(typeof res.body.accessToken).toBe("string");
    });

    it("rejects duplicate signup", async () => {
        const payload = {
            email: "dup@example.com",
            password: "password123",
            displayName: "Dup",
        };
        await request(app.getHttpServer()).post("/auth/signup").send(payload);
        await request(app.getHttpServer())
            .post("/auth/signup")
            .send(payload)
            .expect(409);
    });

    it("logs in with correct credentials", async () => {
        const payload = {
            email: "login@example.com",
            password: "password123",
            displayName: "Login",
        };
        await request(app.getHttpServer()).post("/auth/signup").send(payload);

        const res = await request(app.getHttpServer())
            .post("/auth/login")
            .send({ email: payload.email, password: payload.password })
            .expect(200);

        expect(res.body.accessToken).toBeDefined();
    });

    it("rejects login with wrong password", async () => {
        const payload = {
            email: "wrong@example.com",
            password: "password123",
            displayName: "Wrong",
        };
        await request(app.getHttpServer()).post("/auth/signup").send(payload);

        await request(app.getHttpServer())
            .post("/auth/login")
            .send({ email: payload.email, password: "nope" })
            .expect(401);
    });

    describe("/auth/me", () => {
        it("rejects requests with no token", () => {
            return request(app.getHttpServer()).get("/auth/me").expect(401);
        });

        it("returns the authenticated user with a valid token", async () => {
            const payload = {
                email: "me@example.com",
                password: "password123",
                displayName: "Me",
            };
            const signupRes = await request(app.getHttpServer())
                .post("/auth/signup")
                .send(payload);
            const { accessToken } = signupRes.body;

            const res = await request(app.getHttpServer())
                .get("/auth/me")
                .set("Authorization", `Bearer ${accessToken}`)
                .expect(200);

            expect(res.body.email).toBe(payload.email);
        });
    });
});
