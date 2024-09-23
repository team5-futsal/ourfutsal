import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import { Prisma } from '@prisma/client';
import gacha from '../utils/service/onegacha.js';
import doGacha from '../utils/service/gacha.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

// 가챠상품 생성
router.post('/gacha', async (req, res, next) => {
    const { gachaName, gachaPrice } = req.body;
    const newGacha = await prisma.gacha.create({
        data: {
            gachaName: gachaName,
            gachaPrice: +gachaPrice,
        },
    });

    return res.status(201).json({ message: '가챠 상품 등록 성공', data: newGacha });
});

// 가챠상품 조회
router.get('/gacha', async (req, res, next) => {
    const allGachaList = await prisma.gacha.findMany({});
    return res.status(200).json({ message: '갸차상품 전체조회', data: allGachaList });
});

// 가차 시행 API 예시 (웅상)
router.post('/gacha/buy', authMiddleware, async (req, res, next) => {
    try {
        const { gachaTry, contains } = req.body;
        const { accountId, cash } = req.user;

        const gachaInfo = await prisma.gacha.findFirst({
            where: {
                gachaName: {
                    contains: contains,
                },
            },
        });

        if(gachaInfo.gachaPrice * gachaTry > cash)
            return res.status(400).json({ message : "잔액이 부족합니다." })

        // 잔액부터 변동시킴
        const gachaTransaction = await prisma.$transaction(
            async tx => {
                const updatedCash = await tx.account.update({
                    where: { accountId: +accountId },
                    data: { cash: cash - (gachaInfo.gachaPrice * gachaTry) },
                });
                const purchaseHistory = await tx.purchaseHistory.create({
                    data: {
                        accountId: +accountId,
                        purchaseQuantity: +gachaTry,
                        changedCash: -(gachaInfo.gachaPrice * gachaTry),
                    },
                });

                return [updatedCash, purchaseHistory];
            },
            {
                isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
            },
        );

        const resultGacha = await doGacha(accountId, gachaTry);

        // const createManyPlayer = await prisma.roster.createMany({
        //     data: resultGacha,
        // });

        console.log('gachaTransaction:', gachaTransaction)
        console.log('resultGacha', resultGacha)

        return res.status(201).json({ message: `${resultGacha[0].playerName} 선수를 획득했습니다. 남은 Cash : ${gachaTransaction[0].cash}` });
    } catch (error) {
        switch (error.message) {
            case 'notEnoughMoney':
                return res.status(400).json({ message: ' 소지금이 부족합니다.' });
            default:
                return res.status(401).json({ message: error.message ?? '비정상적인 요청입니다.' });
        }
    }
});

// 상품 구매 api 예시 (웅상)
router.post('/gacha/buy', authMiddleware, async (req, res, next) => {
    try {
        //랜덤 선수 로또
        const resultGacha = await gacha(gachaTry, accountId);

        const createGacha = resultGacha.map(({ playerName, ...rest }) => rest);
        const findName = resultGacha.map(({ playerName }) => playerName);
        console.log(findName);

        // 위에서 뽑은 결과로 createMany
        await prisma.roster.createMany({
            data: createGacha,
        });

        return res.status(201).json({ message: `${findName} 선수를 획득했습니다. 남은 Cash : ${cashGo.cash}` });
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
