const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
const { spawnSync } = require("child_process");

const envPath = path.resolve(__dirname, "../.env.test");

if (!fs.existsSync(envPath)) {
  throw new Error("backend/.env.test is required before running test:db:push.");
}

dotenv.config({
  path: envPath,
  override: true,
  quiet: true,
});

if (!process.env.TEST_DATABASE_URL) {
  throw new Error("TEST_DATABASE_URL is required in backend/.env.test.");
}

const prismaBin = path.resolve(__dirname, "../node_modules/.bin/prisma");
const result = spawnSync(prismaBin, ["db", "push"], {
  stdio: "inherit",
  env: {
    ...process.env,
    DATABASE_URL: process.env.TEST_DATABASE_URL,
  },
});

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
