const prisma = require("../../src/prisma");

async function resetDb() {
  await prisma.questionStory.deleteMany();
  await prisma.question.deleteMany();
  await prisma.story.deleteMany();
  await prisma.user.deleteMany();
}

module.exports = { prisma, resetDb };
