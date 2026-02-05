const jwt = require("jsonwebtoken");


// payload를 서버 비밀키로 서명해서 토큰 문자열로 반환하는 함수
function signToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
}

// 이 토큰이 서버가 발급한게 맞는지 검증하고 payload 반환하는 함수
function verifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = { signToken, verifyToken };

