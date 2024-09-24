import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import { Prisma } from '@prisma/client';

const router = express.Router();

// 캐시 구매
router.put('/account/cash', authMiddleware, async (req, res, next) => {
    const { accountId } = req.user;
    const { cash } = req.body;

    // 캐시 구매할 어카운트가 있는지부터 검증
    const findAccount = await prisma.account.findFirst({
        where: { accountId: +accountId },
    });
    if (!findAccount) return res.status(401).json({ message: '유효하지 않은 사용자입니다.' });
    if (cash <= 0) return res.status(400).json({ message: '올바른 금액을 입력해 주세요.' });
    if (cash > Number.MAX_SAFE_INTEGER) return res.status(400).json({ message: '입력 가능한 금액을 초과하였습니다.' });

    const cashTransaction = await prisma.$transaction(
        async tx => {
            const chargeCash = await tx.account.update({
                where: { accountId: +accountId },
                data: {
                    cash: +(findAccount.cash + cash),
                },
            });
            const purchaseHistory = await tx.purchaseHistory.create({
                data: {
                    accountId: +accountId,
                    changedCash: +cash,
                },
            });
            return [chargeCash, purchaseHistory];
        },
        {
            isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
        },
    );

    return res.status(200).json({ message: `잔액 충전 성공, ${cashTransaction[0].cash}` });
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

const purchaseHistoryList = {
    purchaseId: true,
    productId: true,
    purchaseQuantity: true,
    beforePurchaseCash: true,
    afterPurchaseCash: true,
    createdAt: true,
};

// 구매이력조회
router.get('/product/purchasehistory', async (req, res, next) => {
    const purchaseHistory = await prisma.purchaseHistory.findMany({});
    return res.status(200).json({ message: '조회 완료', data: purchaseHistory });
});

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

    if (!productId) return res.status(404).json({ message: '해당 상품이 존재하지 않습니다' });

    const productSpecific = await prisma.product.findFirst({
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
    const { accountId, cash } = req.user;

    const findProduct = await prisma.product.findUnique({
        where: { productId: +productId },
    });

    if (!findProduct) return res.status(404).json({ message: '상품이 존재하지 않습니다' });
    if (findProduct.price * count > cash) return res.status(400).json({ message: '소지금이 부족합니다' });

    // 구매 후 잔액변동 및 구매이력 생성 로직부터 실행 - 선불제
    const buyingTransaction = await prisma.$transaction(
        async tx => {
            const changeBalance = await tx.account.update({
                where: { accountId: +accountId },
                data: { cash: cash - findProduct.price * count },
            });
            const makePurchaseHistory = await tx.purchaseHistory.create({
                data: {
                    purchaseQuantity: +count,
                    changedCash: -findProduct.price * count,
                    accountId : +accountId
                },
            });
            return [changeBalance, makePurchaseHistory];
        },
        {
            isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
        },
    );

    return res.status(200).json({
        message: `${findProduct.productName} 아이템 ${count}개 구매 성공, 잔액 ${buyingTransaction[0].cash}`,
    });
});

export default router;
