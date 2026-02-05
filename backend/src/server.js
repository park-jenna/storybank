require("dotenv").config();

const express = require("express");
const cors = require("cors");

const storiesRouter = require("./routes/stories");
const authRouter = require("./routes/auth");

const app = express();

app.use(cors({ origin: "*" })); // 모든 도메인 허용
app.use(express.json());

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

// 라우터들 연결
app.use("/auth", authRouter);   // auth 관련 라우트들 (signup, login)
app.use("/stories", storiesRouter); // stories 관련 라우트들 

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});