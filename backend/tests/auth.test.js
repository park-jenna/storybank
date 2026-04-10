const request = require("supertest");

const { app } = require("../src/app");
const { prisma, resetDb } = require("./helpers/db");

describe("auth routes", () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("creates a user and returns a token on signup", async () => {
    const res = await request(app).post("/auth/signup").send({
      email: "signup@test.com",
      password: "test1234",
    });

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe("signup@test.com");
    expect(res.body.token).toEqual(expect.any(String));
  });

  it("rejects invalid signup payloads", async () => {
    const res = await request(app).post("/auth/signup").send({
      email: "not-an-email",
      password: "123",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid request body");
  });

  it("returns 409 for duplicate signup email", async () => {
    await request(app).post("/auth/signup").send({
      email: "duplicate@test.com",
      password: "test1234",
    });

    const res = await request(app).post("/auth/signup").send({
      email: "duplicate@test.com",
      password: "test1234",
    });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe("Email already registered");
  });

  it("logs in an existing user", async () => {
    await request(app).post("/auth/signup").send({
      email: "login@test.com",
      password: "test1234",
    });

    const res = await request(app).post("/auth/login").send({
      email: "login@test.com",
      password: "test1234",
    });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("login@test.com");
    expect(res.body.token).toEqual(expect.any(String));
  });

  it("rejects wrong login credentials", async () => {
    await request(app).post("/auth/signup").send({
      email: "wrong-password@test.com",
      password: "test1234",
    });

    const res = await request(app).post("/auth/login").send({
      email: "wrong-password@test.com",
      password: "wrong1234",
    });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid credentials");
  });
});
