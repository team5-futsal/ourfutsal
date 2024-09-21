import {prisma} from '../utils/prisma/index.js';
import { createAccessToken, validateToken } from '../utils/tokens/tokens.js';

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

// export default async function (req, res, next) {
//     try {
//         const authorization = req.headers['authorization'];
//         if (!authorization) throw new Error('토큰이 존재하지 않습니다.');
//         const [tokenType, token] = authorization.split(' ');

//         if (tokenType !== 'Bearer') throw new Error('토큰 타입이 일치하지 않습니다.');

//         const decodedToken = validateToken(token, process.env.OUR_SECRET_ACCESS_KEY);

//         const accountId = decodedToken.accountId;

//         const user = await prisma.account.findFirst({
//             where: { accountId: +accountId },
//         });
//         if (!user) {
//             res.clearCookie('authorization');
//             throw new Error('토큰 사용자가 존재하지 않습니다.');
//         }

//         // req.user에 사용자 정보를 저장합니다.
//         req.user = user;

//         next();
//     } catch (error) {
//         res.clearCookie('authorization');

//         // 토큰이 만료되었거나, 조작되었을 때, 에러 메시지를 다르게 출력합니다.
//         switch (error.name) {
//             case 'TokenExpiredError':
//                 return res.status(401).json({ message: '토큰이 만료되었습니다.' });
//             case 'JsonWebTokenError':
//                 return res.status(401).json({ message: '토큰이 조작되었습니다.' });
//             default:
//                 return res.status(401).json({ message: error.message ?? '비정상적인 요청입니다.' });
//         }
//     }
// }

export default async function (req, res, next) {
    try {
        // request 헤더로 전달받은 authorization 쿠키를 받아온다.
        const authorization = req.headers["authorization"];
        
        // access token이 만료되어 authorization의 값이 없다면 token 재발급을 요청한다.
        // 만약 refresh token도 만료되었다면 사용자 인증 만료 에러메시지를 발생시킨다.
        if(!authorization) {
            const {authorization} = async function (req, res, next) {
                const {refreshToken} = req.cookies;
                
                if(!refreshToken) {
                    throw new Error('사용자 인증이 만료되어 로그인이 필요합니다.');
                }

                // 리프레시 토큰의 값이 유효한지 확인
                const validToken = validateToken(refreshToken, process.env.OUR_SECRET_REFRESH_KEY);
                
                if(validToken === null) {
                    throw new Error('유효한 토큰이 아닙니다.');
                }

                const userInfo = prisma.tokenStorage.findFirst({
                    where: {accountsId: accountsId,
                        expiredAt: {
                            gt: Date.now()
                        }
                    }
                });

                if(!userInfo) {
                    throw new Error('유효한 refresh token이 없습니다.');
                }

                const newAccessToken = createAccessToken(userInfo.userId);

                // res.cookie('authorization', `Bearer ${newAccessToken}`);
                
                console.log('message: Access Token을 정상적으로 새롭게 발급했습니다.');
            }
        }

        // authorization header 값에서 토큰 타입과 토큰을 분리한다.
        const [tokenType, token] = authorization.split(' ');
        
        // 토큰 타입이 Bearer 형태가 아니라면 토큰 타입 에러메시지를 발생시킨다.
        if(tokenType !== 'Bearer') {
            throw new Error('토큰의 타입이 Bearer가 아닙니다.');
        }

        // 액세스 토큰의 값이 유효한지 확인 후 Payload를 반환한다.
        const decodedToken = validateToken(token, process.env.MY_SECRET_ACCESS_KEY);

        // 반환받은 Payload가 값이 없다면 유효하지 않은 토큰 에러메시지를 발생시킨다.
        if(!decodedToken) {
            throw new Error('유효하지 않은 토큰입니다.')
        }

        // 반환받은 Payload에서 유저의 아이디를 저장한다.
        const accountsId = decodedToken.accountsId;

        // Payload의 유저아이디를 DB 유저에서 조회되는지 검색한다.
        const user = await prisma.accounts.findFirst({where:{accountsId:accountsId}})

        // DB에서 유저가 조회되지 않는 경우 사용자 ID가 존재하지 않는다는 에러메시지를 발생시킨다.
        if(!user) {
            throw new Error('사용자 ID가 존재하지 않습니다.');
        }

        // req.user에 DB에서 조회된 유저를 저장하여 다음 미들웨어에 보낸다.
        req.user = user;

        // 인증을 마친 후 다음 미들웨어 수행하도록 한다.
        next();
    }
    catch(err) {
        if(err.name === 'TokenExpiredError')
            return res.status(401).json({errorMessage: '토큰이 만료되었습니다. 로그인 해주세요.'});
        if(err.name === 'JsonWebTokenError')
            return res.status(401).json({errorMessage: '유효한 토큰이 아닙니다.'});
        return res.status(400).json({errorMessage: err.message});
    }
}