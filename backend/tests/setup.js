const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

const testEnvPath = path.resolve(__dirname, "../.env.test");
process.env.NODE_ENV = "test";

if (fs.existsSync(testEnvPath)) {
  dotenv.config({
    path: testEnvPath,
    override: true,
    quiet: true,
  });
}

if (!process.env.TEST_DATABASE_URL) {
  throw new Error(
    "TEST_DATABASE_URL is required for backend tests. Create backend/.env.test from backend/.env.test.example.",
  );
}

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";
