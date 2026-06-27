const request = require("supertest");

const { app } = require("../../src/app");
const prisma = require("../../src/prisma");

function assertSafeTestDatabase() {
  if (process.env.NODE_ENV !== "test") {
    throw new Error("resetDb can only run in test mode.");
  }

  if (!process.env.TEST_DATABASE_URL) {
    throw new Error("resetDb requires TEST_DATABASE_URL.");
  }
}

async function resetDb() {
  assertSafeTestDatabase();
  await prisma.questionStory.deleteMany();
  await prisma.question.deleteMany();
  await prisma.story.deleteMany();
  await prisma.user.deleteMany();
}

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

module.exports = { prisma, resetDb, signupAndGetToken, createStory };
