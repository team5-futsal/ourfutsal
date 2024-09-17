import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import gacha from '../utils/service/onegacha.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/gacha/buy', authMiddleware, async (req, res, next) => {
    try {
        // 임시 = 가차 시행 횟수 body로
        const { gachaTry } = req.body;

        //가차 뽑기 호출
        const resultGacha = await gacha(req, res, gachaTry);
        const remainingMoney = req.user.cash - gachaTry * 1000;

        return res.status(201).json({ message: `${resultGacha} 선수를 획득했습니다. 남은 Cash : ${remainingMoney}` });
    } catch (error) {
        switch (error.message) {
            case 'notEnoughMoney':
                return res.status(409).json({ message: ' Cash 가 부족합니다.' });
            default:
                return res.status(401).json({ message: error.message ?? '비정상적인 요청입니다.' });
        }
    }
});

export default router;
