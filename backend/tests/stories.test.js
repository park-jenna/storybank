const request = require("supertest");

const { app } = require("../src/app");
const { prisma, resetDb } = require("./helpers/db");

async function signupAndGetToken(email = "stories@test.com") {
  const res = await request(app).post("/auth/signup").send({
    email,
    password: "test1234",
  });

  return {
    token: res.body.token,
    user: res.body.user,
  };
}

describe("stories routes", () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("rejects unauthenticated story access", async () => {
    const res = await request(app).get("/stories");

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Authorization header is missing");
  });

  it("creates a story for the authenticated user", async () => {
    const { token } = await signupAndGetToken();

    const res = await request(app)
      .post("/stories")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Fixed a production bug",
        categories: ["Problem Solving", "Communication"],
        situation: "A report was timing out in prod.",
        action: "I traced the query and added an index.",
        result: "The page loaded in under a second.",
      });

    expect(res.status).toBe(201);
    expect(res.body.story.title).toBe("Fixed a production bug");
    expect(res.body.story.userId).toEqual(expect.any(String));
  });

  it("rejects invalid story payloads", async () => {
    const { token } = await signupAndGetToken();

    const res = await request(app)
      .post("/stories")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "",
        categories: [],
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid request body");
  });

  it("returns only the authenticated user's stories", async () => {
    const firstUser = await signupAndGetToken("owner@test.com");
    const secondUser = await signupAndGetToken("other@test.com");

    await request(app)
      .post("/stories")
      .set("Authorization", `Bearer ${firstUser.token}`)
      .send({
        title: "Owner story",
        categories: ["Leadership"],
        situation: "Owner situation",
        action: "Owner action",
        result: "Owner result",
      });

    await request(app)
      .post("/stories")
      .set("Authorization", `Bearer ${secondUser.token}`)
      .send({
        title: "Other story",
        categories: ["Teamwork / Collaboration"],
        situation: "Other situation",
        action: "Other action",
        result: "Other result",
      });

    const res = await request(app)
      .get("/stories")
      .set("Authorization", `Bearer ${firstUser.token}`);

    expect(res.status).toBe(200);
    expect(res.body.stories).toHaveLength(1);
    expect(res.body.stories[0].title).toBe("Owner story");
  });
});
