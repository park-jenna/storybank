const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const { createCorsOriginValidator } = require("./utils/cors");
const storiesRouter = require("./routes/stories");
const authRouter = require("./routes/auth");
const questionsRouter = require("./routes/questions");
const userQuestionsRouter = require("./routes/user-questions");

const app = express();

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(
  cors({
    origin: createCorsOriginValidator(),
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRouter);
app.use("/stories", storiesRouter);
app.use("/questions", questionsRouter);
app.use("/user-questions", userQuestionsRouter);

module.exports = { app };
