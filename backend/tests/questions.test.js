const request = require("supertest");

const { app } = require("../src/app");
const { COMMON_QUESTIONS } = require("../src/constants/commonQuestions");
const { prisma, resetDb, signupAndGetToken, createStory } = require("./helpers/db");

describe("questions routes", () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("returns the common question list with alreadySaved flags", async () => {
    const { token } = await signupAndGetToken("questions-common@test.com");

    await request(app)
      .post("/user-questions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        commonQuestionId: "q1",
      });

    const res = await request(app)
      .get("/questions/common")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.questions).toHaveLength(COMMON_QUESTIONS.length);

    const savedQuestion = res.body.questions.find((q) => q.id === "q1");
    const unsavedQuestion = res.body.questions.find((q) => q.id === "q2");

    expect(savedQuestion.alreadySaved).toBe(true);
    expect(unsavedQuestion.alreadySaved).toBe(false);
  });

  it("recommends stories that match the common question categories", async () => {
    const owner = await signupAndGetToken("questions-rec-owner@test.com");
    const other = await signupAndGetToken("questions-rec-other@test.com");

    const matchingStory = await createStory(owner.token, {
      title: "Matching story",
      categories: ["Problem Solving"],
    });
    await createStory(owner.token, {
      title: "Non-matching story",
      categories: ["Leadership"],
    });
    await createStory(other.token, {
      title: "Other user story",
      categories: ["Problem Solving"],
    });

    const res = await request(app)
      .get("/questions/q9/recommendations")
      .set("Authorization", `Bearer ${owner.token}`);

    expect(res.status).toBe(200);
    expect(res.body.question.id).toBe("q9");
    expect(res.body.recommendedStories).toHaveLength(1);
    expect(res.body.recommendedStories[0].id).toBe(matchingStory.id);
    expect(res.body.recommendedStories[0].title).toBe("Matching story");
  });

  it("returns 404 for an invalid common question id", async () => {
    const { token } = await signupAndGetToken("questions-rec-404@test.com");

    const res = await request(app)
      .get("/questions/invalid-id/recommendations")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.code).toBe("QUESTION_NOT_FOUND");
  });
});
