import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import gacha from '../utils/service/onegacha.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import { Prisma } from '@prisma/client';

const router = express.Router();

// 가차 시행 API 예시 (웅상)
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

// 상품 구매 api 예시 (웅상)
router.post('/gacha/buy/:gachaTry', authMiddleware, async (req, res, next) => {
    try {
        const { gachaTry } = req.params;

        const { accountId } = req.user;

        // // 해당 상품 찾기
        // const findtry = await prisma.gacha.findFirst({
        //     where: {
        //         productId: +productId,
        //     },
        // });

        // if (!findtry) {
        //     return res.status(401).json({ message: ' 없는 상품 번호 입니다. ' });
        // }

        const gachaPrice = gachaTry * 1000;

        console.log(gachaTry);
        // 선불 요금제
        if (req.user.cash < +gachaPrice) {
            throw new Error('notEnoughMoney');
        }

        //랜덤 선수 로또

        const transactionGacha = await prisma.$transaction(
            async tx => {
                const resultGacha = await gacha(gachaTry, accountId);
                const createGacha = resultGacha.map(({ playerName, ...rest }) => rest);
                const findName = resultGacha.map(({ playerName }) => playerName);

                const cashGo = await tx.account.update({
                    data: {
                        cash: req.user.cash - gachaPrice,
                    },
                    where: {
                        accountId: +accountId,
                    },
                });

                // 위에서 뽑은 결과로 createMany
                await tx.roster.createMany({
                    data: createGacha,
                });
                return [cashGo, findName];
            },
            {
                isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
            },
        );
        return res
            .status(201)
            .json({ message: `${transactionGacha[1]} 선수를 획득했습니다. 남은 Cash : ${transactionGacha[0].cash}` });
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
