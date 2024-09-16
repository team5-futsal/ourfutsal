import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import gacha from '../utils/service/onegacha.js';

const router = express.Router();

router.post('/gacha/buy', async (req, res, next) => {
    try {
        const { gachaTry } = req.body;
        //가차 뽑기 호출

        const resultGacha = await gacha(req, res, gachaTry);

        return res.status(201).json({ message: `${resultGacha} 선수를 획득했습니다.` });
    } catch (error) {
        if ((error = 'notFound')) {
            return res.status(404).json({ message: '찾을 수 없습니다' });
        }
    }
});

export default router;
