import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import { Prisma } from '@prisma/client';

const router = express.Router();
// router.use(authMiddleware);

// 캐시 구매
router.put('/account/:accountId', authMiddleware, async (req, res, next) => {
    const { accountId } = req.params;
    const { cash } = req.body;

    // 캐시 구매할 계정 유효성 검증
    const findAccount = await prisma.account.findFirst({
        where: { accountId: +accountId },
    });
    if (!findAccount) return res.status(401).json({ message: '유효하지 않은 사용자입니다.' });
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

// 상품 생성
router.post('/product', async (req, res, next) => {
    const { productName, price, productInfo } = req.body;

    const makeProduct = await prisma.product.create({
        data: {
            productName: productName,
            price: +price,
            productInfo: productInfo,
        },
    });

    return res.status(201).json({ message: '상품 생성 완료', data: makeProduct });
});

// 상점 상품 전체/세부조회 시 겹치는 데이터 추출
const productList = {
    productId: true,
    productName: true,
    price: true,
};

// 상품목록 전체조회
router.get('/product', async (req, res, next) => {
    const allProductList = await prisma.product.findMany({
        select: productList,
    });

    return res.status(200).json({ data: allProductList });
});

// 상품목록 세부조회
router.get('/product/:productId', async (req, res, next) => {
    const { productId } = req.params;

    const productSpecific = await prisma.product.findUnique({
        where: { productId: +productId },
        select: {
            ...productList,
            productInfo: true,
        },
    });

    return res.status(200).json({ message: '상품 세부정보', data: productSpecific });
});

//상점 상품 구매
router.post('/product/:productId', authMiddleware, async (req, res, next) => {
    const { productId } = req.params;
    const { count } = req.body;
    const { cash } = req.user;

    //상점 상품 있는지 찾기
    const findProduct = await prisma.product.findUnique({
        where: { productId: +productId },
    });
    if (!findProduct) return res.status(404).json({ message: '상품이 존재하지 않습니다' });
    if (findProduct.price * count > cash) return res.status(400).json({ message: '소지금이 부족합니다' });

    // 이 부분에서 가챠 로직이 돌아가면 좋겠다 (선수추출 및 선수보관함에 저장)
    // 가챠 로직은 함수로 만드는게 나을 것 같기도?

    // 여기는 트랜잭션으로 묶어주자
    const buyingTransaction = prisma.$transaction(
        async tx => {
            const changeBalance = await tx.account.update({
                where: { accountId: +req.user.accountId },
                data: { cash: cash - findProduct.price * count },
            });
            const makePurchaseHistory = await tx.purchaseHistory.create({
                data: {
                    productId: +productId,
                    purchaseQuantity: count,
                    beforePurchaseCash: cash,
                    afterPurchaseCash: cash - findProduct.price * count,
                },
            });
            return [changeBalance, makePurchaseHistory];
        },
        {
            isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
        },
    );

    return res.status(200).json({
        message: `${findProduct.productName} 아이템 ${count}개 구매 성공, 
            잔액 ${changeBalance.cash}`,
    });
});

export default router;
