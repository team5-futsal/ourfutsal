import express from 'express';
import { prisma } from '../utils/prisma/index.js';

const router = express.Router();

/** 선수 생성 API **/
router.post('/players', /*미들웨어*/ async (req, res, next) => {
        try {
            const { playerName, playerStrength, playerDefense, playerStamina, positionId } = req.body;

            // 플레이어 명 중복 확인
            const isExistPlayer = await prisma.player.findUnique({
                where: { playerName },
            });

            if (isExistPlayer) {
                return res.status(409).json({ message: '이미 존재하는 선수 입니다.' });
            }

            const player = await prisma.player.create({
                data: {
                    playerName: playerName,
                    positionId: positionId,
                    playerStrength: playerStrength,
                    playerDefense: playerDefense,
                    playerStamina: playerStamina,
                },
            });

            return res.status(201).json({ data: player, message: '선수 생성 성공!' });
        } catch (error) {
            next(error);
        }
    },
);

/** 전체 선수 조회 API **/
router.get('/players', async (req, res,next) => {
    try {
        const players = await prisma.player.findMany({
            select: {
                playerId: true,
                playerName: true,
                positionId: true,
            },
            orderBy: {
                playerId: 'asc',
            },
        });

        if (players.length === 0) {
            return res.status(404).json({ message: '선수가 없습니다.' });
        }

        return res.status(200).json({ data: players });
    } catch (error) {
        next(error);
    }
});

/** 선수 상세 조회 API **/
router.get('/players/:playerName', async (req, res,next) => {
    try {
        const { playerName } = req.params;
        console.log(playerName);
        const player = await prisma.player.findFirst({
            where: {
                playerName: playerName,
            },
            select: {
                playerId: true,
                positionId: true,
                playerName: true,
                playerStrength: true,
                playerDefense: true, // prisma model에서 이 컬럼만 Player가 대문자
                playerStamina: true,
            },
        });

        if (player == null) {
            // 동등 연산자를 통해 null, undefined 둘다 체크 가능
            return res.status(404).json({ message: '존재하지 않는 선수입니다.' });
        }

        return res.status(200).json({ data: player });
    } catch (error) {
        next(error);
    }
});

/** 선수 능력치 수정 API **/
router.put(
    '/players/:playerName',
    /*미들웨어*/ async (req, res,next) => {
        try {
            const { playerName } = req.params;
            const { newPlayerName, newPlayerStrength, newPlayerDefense, newPlayerStamina, newPositionId } = req.body; // 업데이트할 데이터

            const player = await prisma.player.findFirst({
                where: {
                    playerName: playerName,
                },
            });

            if (!player) {
                return res.status(404).json({ message: '존재하지 않는 선수입니다.' });
            }

            const updateData = {};

            if (newPositionId != null) {
                updateData.positionId = newPositionId;
            }
            if (newPlayerName != null) {
                updateData.playerName = newPlayerName;
            }
            if (newPlayerStrength != null) {
                updateData.playerStrength = newPlayerStrength;
            }
            if (newPlayerDefense != null) {
                updateData.playerDefense = newPlayerDefense;
            }
            if (newPlayerStamina != null) {
                updateData.playerStamina = newPlayerStamina;
            }

            const updatePlayer = await prisma.player.update({
                where: {
                    playerName: playerName,
                },
                data: updateData,
            });

            return res.status(200).json({ data: updatePlayer, message: '정상적으로 수정되었습니다.' });
        } catch (error) {
            next(error);
        }
    },
);

export default router;
