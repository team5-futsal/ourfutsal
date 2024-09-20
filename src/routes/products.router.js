import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

// 캐시 구매
router.put('/account/:accountId', async (req, res, next) => {
    const { accountId } = req.params;
    const { cash } = req.body;

    // 캐시 구매할 어카운트가 있는지부터 검증
    const findAccount = await prisma.account.findFirst({
        where: { accountId: +accountId },
    });
    // if(!findAccount)
    //     return res.status(401).json({ message : "유효하지 않은 사용자입니다."})
    if (cash <= 0) return res.status(400).json({ message: '올바른 금액을 입력해 주세요.' });
    if (cash > Number.MAX_SAFE_INTEGER) return res.status(400).json({ message: '입력 가능한 금액을 초과하였습니다.' });

    const chargeCash = await prisma.account.update({
        where: { accountId: +accountId },
        data: {
            cash: findAccount.cash + cash,
        },
    });

    console.log('chargeCash.data: ', chargeCash.cash);
    return res.status(200).json({ message: '잔액 충전 성공', cash: chargeCash.cash });
});

export default router;
