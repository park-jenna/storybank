const express = require("express");
const cors = require("cors");

const storiesRouter = require("./routes/stories");
const authRouter = require("./routes/auth");
const questionsRouter = require("./routes/questions");
const userQuestionsRouter = require("./routes/user-questions");

const app = express();

app.use(
  cors({
    origin: true,
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
