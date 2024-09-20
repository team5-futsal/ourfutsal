import { prisma } from '../utils/prisma/index.js';
import { validateToken } from '../utils/tokens/tokens.js';

/**
 * 인증 미들웨어
 * HTTP와 인증을 하는 방식을 고려하여 수정할 예정
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 *
 * 1. 로컬 스토리지, 세션 스토리지에 토큰을 담는 것은 XSS 공격에 위험
 * 2. 쿠키에 토큰을 담으면 CSRF 공격에 취약
 * 3. 액세스 토큰과 리프레시 토큰은 로그인할 때 새로 발급
 * 4. 인증을 할때 리프레시 토큰이 남아있다면 액세스 토큰을 발급
 * 5. 리프레시 토큰은 액세스 토큰을 재발급하는 용도이기 때문에 쿠키에 담아도 된다고 판단
 * 6. 그럼 액세스 토큰을 어디에 둘지 고려해봐야 함 => 내부 private 변수로 설정하여 탈취 및 공격을 방지
 * 7. 하지만 이것은 React 처럼 HTML이 이동되는 것이 아닌 새로운 HTML이 불러와지는 형식이라서 구현 가능성 확인이 필요
 */

export default async function (req, res, next) {
    try {
        const authorization = req.headers['authorization'];
        console.log(authorization);
        if (!authorization) throw new Error('토큰이 존재하지 않습니다.');
        const [tokenType, token] = authorization.split(' ');

        if (tokenType !== 'Bearer') throw new Error('토큰 타입이 일치하지 않습니다.');

        const decodedToken = validateToken(token, process.env.OUR_SECRET_ACCESS_KEY);

        const accountId = decodedToken.accountId;

        const user = await prisma.account.findFirst({
            where: { accountId: +accountId },
        });
        if (!user) {
            res.clearCookie('authorization');
            throw new Error('토큰 사용자가 존재하지 않습니다.');
        }

        // req.user에 사용자 정보를 저장합니다.
        req.user = user;

        next();
    } catch (error) {
        res.clearCookie('authorization');

        // 토큰이 만료되었거나, 조작되었을 때, 에러 메시지를 다르게 출력합니다.
        switch (error.name) {
            case 'TokenExpiredError':
                return res.status(401).json({ message: '토큰이 만료되었습니다.' });
            case 'JsonWebTokenError':
                return res.status(401).json({ message: '토큰이 조작되었습니다.' });
            default:
                return res.status(401).json({ message: error.message ?? '비정상적인 요청입니다.' });
        }
    }
}
