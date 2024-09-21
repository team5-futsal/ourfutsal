import { prisma } from '../prisma/index.js';

export default async function (req, res, next) {
    const { productId } = req.params;
    const { accountId } = req.user;

    const findProduct = await prisma.product.findUnique({
        where: { productId: +productId },
    });
    if (!findProduct) return res.status(404).json({ message: '존재하지 않는 상품입니다. ' });

    const findGacha = await prisma.gacha.findFirst({
        where: { productId: +productId },
    });
    if (!findGacha) return res.status(404).json({ message: '존재하지 않는 가챠입니다. ' });

    const playerCount = await prisma.player.count();
    const gachaQuantity = findGacha.gachaQuantity;
    const gachaPrice = findProduct.price;

    if (req.user.cash < gachaPrice)
        return res.status(400).json({ message: `소지금이 부족합니다. 가격 ${gachaPrice}, 소지금 ${req.user.cash}` });

    const gachaLogic = async function (accountId, gachaQuantity) {
        let pickedPlayer = [];
        for (let i = 0; i < gachaQuantity; i++) {
            const randomPlayers = Math.floor(Math.random() * playerCount) + 1;

            const getGachaResult = await prisma.roster.createMany({
                data: {
                    accountId: +accountId,
                    playerId: randomPlayers,
                },
            });

            const findPlayer = await prisma.player.findFirst({
                where : {playerId : +randomPlayers}
            })
            pickedPlayer.push(findPlayer.playerName);
        }
        return pickedPlayer;
    };
    return gachaLogic(accountId, gachaQuantity);
}
