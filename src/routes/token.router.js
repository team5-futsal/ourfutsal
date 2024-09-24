import express from 'express';
import { createAccessToken, validateToken } from '../utils/tokens/tokens.js';

const router = express.Router();

// Refresh Token을 이용하여 AccessToken 재발급하는 API
router.post('/refreshToken', (req, res, next) => {
    // Access 토큰이 만료되었는지 확인
    let isValidAccessToken = true;
    const authorization = req.headers['authorization'];
    const [tokenType, token] = authorization.split(' ');

    if (tokenType !== 'Bearer') {
        isValidAccessToken = false;
    }

    const decodedAccess = validateToken(token, process.env.OUR_SECRET_ACCESS_KEY);
    if (!decodedAccess) {
        isValidAccessToken = false;
    }

    // AccessToken이 만료되었다면 refresh Token을 통해 재발급
    if (isValidAccessToken === false) {
        // console.log('여기 리프레시를 통해 재발급하는곳임.')
        const { refreshToken } = req.cookies;
        // console.log(refreshToken);

        // refresh Token이 쿠키에 있는지 확인
        if (!refreshToken) {
            return res.status(401).json({ errorMessage: '리프레시가 없습니다. 다시 로그인해주세요.' });
        }

        const decodedRefresh = validateToken(refreshToken, process.env.OUR_SECRET_REFRESH_KEY);

        if (!decodedRefresh) {
            console.log('토큰이 유효하지 않음.');
            return res.status(401).json({ errorMessage: '리프레시가 만료되었거나 유효하지 않습니다.' });
        }
      
        // console.log(decodedRefresh);
        const newAccessToken = createAccessToken(decodedRefresh.accountId);
        // console.log(newAccessToken);

        // 액세스토큰을 헤더를 통해 메모리에 담을 예정으로 header로 보낸다.
        // res.header('authorization', `Bearer ${newAccessToken}`);
        return res.json({ isCreate: true, newAccessToken });
    } else {
        return res.json({ isCreate: false, message: 'Access Token이 유효합니다.' });
    }
});

export default router;
