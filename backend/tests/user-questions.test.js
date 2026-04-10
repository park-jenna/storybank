const request = require("supertest");

const { app } = require("../src/app");
const { prisma, resetDb } = require("./helpers/db");

async function signupAndGetToken(email) {
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

describe("user-questions routes", () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("saves a common question and links the selected stories", async () => {
    const { token } = await signupAndGetToken("uq-create@test.com");
    const story = await createStory(token, {
      title: "Linked story",
      categories: ["Conflict Resolution"],
    });

    const res = await request(app)
      .post("/user-questions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        commonQuestionId: "q1",
        storyIds: [story.id],
      });

    expect(res.status).toBe(201);
    expect(res.body.alreadySaved).toBe(false);
    expect(res.body.userQuestion.content).toContain("conflict with a teammate");

    const stored = await prisma.question.findUnique({
      where: { id: res.body.userQuestion.id },
      include: { stories: true },
    });

    expect(stored).not.toBeNull();
    expect(stored.stories).toHaveLength(1);
    expect(stored.stories[0].storyId).toBe(story.id);
  });

  it("returns existing question and refreshes links when the same common question is saved again", async () => {
    const { token } = await signupAndGetToken("uq-repeat@test.com");
    const firstStory = await createStory(token, {
      title: "First link",
      categories: ["Leadership"],
    });
    const secondStory = await createStory(token, {
      title: "Second link",
      categories: ["Teamwork / Collaboration"],
    });

    const firstSave = await request(app)
      .post("/user-questions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        commonQuestionId: "q3",
        storyIds: [firstStory.id],
      });

    const secondSave = await request(app)
      .post("/user-questions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        commonQuestionId: "q3",
        storyIds: [secondStory.id],
      });

    expect(firstSave.status).toBe(201);
    expect(secondSave.status).toBe(200);
    expect(secondSave.body.alreadySaved).toBe(true);
    expect(secondSave.body.userQuestion.id).toBe(firstSave.body.userQuestion.id);

    const allQuestions = await prisma.question.findMany();
    const links = await prisma.questionStory.findMany({
      where: { questionId: firstSave.body.userQuestion.id },
    });

    expect(allQuestions).toHaveLength(1);
    expect(links).toHaveLength(1);
    expect(links[0].storyId).toBe(secondStory.id);
  });

  it("lists only the authenticated user's saved questions with linked stories", async () => {
    const owner = await signupAndGetToken("uq-owner@test.com");
    const other = await signupAndGetToken("uq-other@test.com");
    const ownerStory = await createStory(owner.token, {
      title: "Owner story",
      categories: ["Communication"],
    });

    await request(app)
      .post("/user-questions")
      .set("Authorization", `Bearer ${owner.token}`)
      .send({
        commonQuestionId: "q7",
        storyIds: [ownerStory.id],
      });

    await request(app)
      .post("/user-questions")
      .set("Authorization", `Bearer ${other.token}`)
      .send({
        commonQuestionId: "q9",
      });

    const res = await request(app)
      .get("/user-questions")
      .set("Authorization", `Bearer ${owner.token}`);

    expect(res.status).toBe(200);
    expect(res.body.userQuestions).toHaveLength(1);
    expect(res.body.userQuestions[0].question.content).toContain("technical or complex idea");
    expect(res.body.userQuestions[0].stories).toHaveLength(1);
    expect(res.body.userQuestions[0].stories[0].title).toBe("Owner story");
  });

  it("updates content and only links stories owned by the current user", async () => {
    const owner = await signupAndGetToken("uq-patch-owner@test.com");
    const other = await signupAndGetToken("uq-patch-other@test.com");
    const ownerStory = await createStory(owner.token, {
      title: "Owner story",
      categories: ["Growth / Learning"],
    });
    const otherStory = await createStory(other.token, {
      title: "Other story",
      categories: ["Growth / Learning"],
    });

    const saved = await request(app)
      .post("/user-questions")
      .set("Authorization", `Bearer ${owner.token}`)
      .send({
        commonQuestionId: "q13",
      });

    const res = await request(app)
      .patch(`/user-questions/${saved.body.userQuestion.id}`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({
        content: "Updated custom question",
        recommendedCategories: ["Growth / Learning"],
        storyIds: [ownerStory.id, otherStory.id],
      });

    expect(res.status).toBe(200);
    expect(res.body.userQuestion.question.content).toBe("Updated custom question");
    expect(res.body.userQuestion.stories).toHaveLength(1);
    expect(res.body.userQuestion.stories[0].id).toBe(ownerStory.id);
  });

  it("deletes a saved question and its story links", async () => {
    const { token } = await signupAndGetToken("uq-delete@test.com");
    const story = await createStory(token, {
      title: "Delete link story",
      categories: ["Problem Solving"],
    });

    const saved = await request(app)
      .post("/user-questions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        commonQuestionId: "q9",
        storyIds: [story.id],
      });

    const res = await request(app)
      .delete(`/user-questions/${saved.body.userQuestion.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);

    const deletedQuestion = await prisma.question.findUnique({
      where: { id: saved.body.userQuestion.id },
    });
    const remainingLinks = await prisma.questionStory.findMany({
      where: { questionId: saved.body.userQuestion.id },
    });

    expect(deletedQuestion).toBeNull();
    expect(remainingLinks).toHaveLength(0);
  });
});
