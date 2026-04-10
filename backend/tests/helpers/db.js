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

module.exports = { prisma, resetDb };
