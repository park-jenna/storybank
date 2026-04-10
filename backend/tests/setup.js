const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

const testEnvPath = path.resolve(__dirname, "../.env.test");
const defaultEnvPath = path.resolve(__dirname, "../.env");

dotenv.config({
  path: fs.existsSync(testEnvPath) ? testEnvPath : defaultEnvPath,
  override: true,
  quiet: true,
});

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";
