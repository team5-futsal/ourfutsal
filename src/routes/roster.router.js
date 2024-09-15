import express from 'express';

const router = express.Router();

/** 보유 선수 조회
    인증 미들웨어를 통해
    로그인 여부 확인 및
    해당 유저인지 체크 **/
router.get('/players', /*미들웨어*/ async (req, res) => {

} )

export default router;