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

async function createStory(token, overrides = {}) {
  const res = await request(app)
    .post("/stories")
    .set("Authorization", `Bearer ${token}`)
    .send({
      title: "Story title",
      categories: ["Problem Solving"],
      situation: "Situation",
      action: "Action",
      result: "Result",
      ...overrides,
    });

  return res.body.story;
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

  it("returns a single story for the authenticated user", async () => {
    const { token } = await signupAndGetToken("story-get@test.com");
    const story = await createStory(token, {
      title: "Detail story",
      categories: ["Communication"],
    });

    const res = await request(app)
      .get(`/stories/${story.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.story.id).toBe(story.id);
    expect(res.body.story.title).toBe("Detail story");
  });

  it("returns 404 when fetching another user's story", async () => {
    const owner = await signupAndGetToken("story-get-owner@test.com");
    const other = await signupAndGetToken("story-get-other@test.com");
    const story = await createStory(owner.token, {
      title: "Private story",
      categories: ["Leadership"],
    });

    const res = await request(app)
      .get(`/stories/${story.id}`)
      .set("Authorization", `Bearer ${other.token}`);

    expect(res.status).toBe(404);
    expect(res.body.code).toBe("STORY_NOT_FOUND");
  });

  it("updates selected story fields", async () => {
    const { token } = await signupAndGetToken("story-patch@test.com");
    const story = await createStory(token, {
      title: "Original title",
      categories: ["Problem Solving"],
      situation: "Original situation",
    });

    const res = await request(app)
      .patch(`/stories/${story.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Updated title",
        result: "Updated result",
      });

    expect(res.status).toBe(200);
    expect(res.body.story.title).toBe("Updated title");
    expect(res.body.story.result).toBe("Updated result");
    expect(res.body.story.situation).toBe("Original situation");
  });

  it("returns 400 when patch has no valid fields to update", async () => {
    const { token } = await signupAndGetToken("story-patch-empty@test.com");
    const story = await createStory(token);

    const res = await request(app)
      .patch(`/stories/${story.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("NO_FIELDS_TO_UPDATE");
  });

  it("returns 404 when updating another user's story", async () => {
    const owner = await signupAndGetToken("story-patch-owner@test.com");
    const other = await signupAndGetToken("story-patch-other@test.com");
    const story = await createStory(owner.token);

    const res = await request(app)
      .patch(`/stories/${story.id}`)
      .set("Authorization", `Bearer ${other.token}`)
      .send({ title: "Hijacked title" });

    expect(res.status).toBe(404);
    expect(res.body.code).toBe("STORY_NOT_FOUND");
  });

  it("deletes the authenticated user's story", async () => {
    const { token } = await signupAndGetToken("story-delete@test.com");
    const story = await createStory(token, {
      title: "Delete me",
      categories: ["Adaptability"],
    });

    const res = await request(app)
      .delete(`/stories/${story.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);

    const deletedStory = await prisma.story.findUnique({
      where: { id: story.id },
    });

    expect(deletedStory).toBeNull();
  });

  it("deletes question links when deleting a linked story", async () => {
    const { token } = await signupAndGetToken("story-delete-links@test.com");
    const story = await createStory(token, {
      title: "Linked story",
      categories: ["Conflict Resolution"],
    });

    const saved = await request(app)
      .post("/user-questions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        commonQuestionId: "q1",
        storyIds: [story.id],
      });

    expect(saved.status).toBe(201);

    const linksBefore = await prisma.questionStory.findMany({
      where: { storyId: story.id },
    });
    expect(linksBefore).toHaveLength(1);

    const res = await request(app)
      .delete(`/stories/${story.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);

    const deletedStory = await prisma.story.findUnique({
      where: { id: story.id },
    });
    const remainingLinks = await prisma.questionStory.findMany({
      where: { storyId: story.id },
    });
    const savedQuestion = await prisma.question.findUnique({
      where: { id: saved.body.userQuestion.id },
    });

    expect(deletedStory).toBeNull();
    expect(remainingLinks).toHaveLength(0);
    expect(savedQuestion).not.toBeNull();
  });

  it("returns 404 when deleting another user's story", async () => {
    const owner = await signupAndGetToken("story-delete-owner@test.com");
    const other = await signupAndGetToken("story-delete-other@test.com");
    const story = await createStory(owner.token);

    const res = await request(app)
      .delete(`/stories/${story.id}`)
      .set("Authorization", `Bearer ${other.token}`);

    expect(res.status).toBe(404);
    expect(res.body.code).toBe("STORY_NOT_FOUND");

    const stillThere = await prisma.story.findUnique({
      where: { id: story.id },
    });

    expect(stillThere).not.toBeNull();
  });
});
