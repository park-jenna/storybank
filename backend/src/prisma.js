const { PrismaClient } = require("@prisma/client");

const isTest = process.env.NODE_ENV === "test";
const testDatabaseUrl = process.env.TEST_DATABASE_URL;

if (isTest && !testDatabaseUrl) {
  throw new Error(
    "TEST_DATABASE_URL must be set when NODE_ENV=test to avoid using the default database.",
  );
}

const prisma = new PrismaClient(
  isTest
    ? {
        datasources: {
          db: {
            url: testDatabaseUrl,
          },
        },
      }
    : undefined,
);

module.exports = prisma;
