import { prisma } from '../prisma/index.js';

// 가차를 돌리자

export default function (gachaTry, playerId, accountId) {
    const answer = [];
    for (let i = 0; i < gachaTry; i++) {
        let randomPlayer = Math.round(Math.random() * (playerId - 1)) + 1;
        answer.push({ playerId: randomPlayer, accountId: +accountId });
    }

    return answer;
}
