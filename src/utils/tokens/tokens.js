import jwt from 'jsonwebtoken';
// 토큰에 관련된 함수가 정의된 파일

/**
 * 액세스 토큰을 발급하는 함수
 * @param {*} id 유저의 아이디를 받는다
 * @returns 발급된 액세스 토큰을 반환한다
 */
export function createAccessToken(id) {
    const accessToken = jwt.sign(
        { accountId: +id }, // JWT 데이터
        process.env.OUR_SECRET_ACCESS_KEY,
        {expiresIn: '1d'}
    );

    return accessToken;
}

/**
 * Token을 검증하고, Payload를 조회하기 위한 함수
 * @param {*} token 사용자의 토큰을 가져온다
 * @returns 성공 시 Payload를 반환하고, 실패 시 에러와 함께 null을 반환한다.
 */
export function validateToken(token, secretKey) {
    try {
        return jwt.verify(token, secretKey);
    } catch (err) {
        return null;
    }
}
