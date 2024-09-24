import { prisma } from '../prisma/index.js';

export default async function (accountId, gachaQuantity) {
    const randomPickOne = await prisma.$queryRaw`Select * From player Order by rand() Limit 1`;

    const pickedPlayer = [];
    console.log('randomPickOne =>', randomPickOne)
    for (let i = 0; i < gachaQuantity; i++) {

        pickedPlayer.push({
            playerId: +randomPickOne[0].playerId,
            accountId: +accountId,
        });
        console.log('pickedPlayer: ', pickedPlayer);
    }

    return pickedPlayer;
}
