import { prisma } from '../prisma/index.js';

export default async function (req, res, next) {
    const { productId } = req.params;
    const { accountId } = req.user;

    const findProduct = await prisma.product.findUnique({
        where: { productId: +productId },
    });
    if(!findProduct)
        return res.status(404).json({ message : "존재하지 않는 상품입니다. "})
    const findGacha = await prisma.gacha.findFirst({
        where: { productId: +productId },
    });
    if(!findGacha)
        return res.status(404).json({ message : "존재하지 않는 가챠입니다. "})

    const playerCount = await prisma.player.count();
    const randomPlayers = Math.floor(Math.random() * playerCount) + 1;
    const gachaQuantity = findGacha.gachaQuantity;
    const gachaPrice = findProduct.price * findGacha.gachaQuantity;

    if (req.user.cash < gachaPrice) return res.status(400).json({ message: '소지금이 부족합니다' });

    const gachaLogic = async function (accountId, gachaQuantity) {
        let pickedPlayer = [];
        for (let i = 0; i < gachaQuantity; i++) {
            randomPlayers;

            const getGachaResult = await prisma.roster.create({
                data: {
                    accountId: +accountId,
                    playerId: randomPlayers,
                },
            });
            pickedPlayer[i] = getGachaResult;
        }
        return pickedPlayer;
    }
    return gachaLogic(accountId, gachaQuantity)
}
