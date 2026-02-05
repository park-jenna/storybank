// 미들웨어? 요청이 라우트에 도착하기 전에 끼어드는 함수
// 형식: (req, res, next) => {...}

const { verifyToken } = require("../utils/jwt");

function requireAuth(req, res, next) {

    try {
        // 1) 요청 헤더에서 Authorization 헤더 가져오기
        const authHeader = req.headers.authorization;

        // 헤더가 없으면: 로그인 안 한 요청
        if (!authHeader) {
            return res.status(401).json({ error: "Authorization header is missing" });
        }

        // 2) "Bearer <token>" 형식인지 확인
        const [type, token] = authHeader.split(" ");

        if (type !== "Bearer" || !token) {
            return res.status(401).json({ error: "Invalid Authorization header format" });
        }

        // 3) 토큰 검증
        const payload = verifyToken(token);

        req.user = payload; // 라우트에서 쓸 수 있게 req.user에 페이로드 저장

        // 4) 통과
        return next();

    } catch (error) {
        return res.status(401).json({ error: "Invalid token" });
    }
}

module.exports = { requireAuth };