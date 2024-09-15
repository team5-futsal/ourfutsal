import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import validSchema from '../utils/joi/valid.schema.js'

const router = express.Router();

/** 랭킹 조회 API **/
router.get('/rank', async (req, res, next) => {
    try{
        // 유저 정보 조회
        const sortedMMR = await prisma.account.findMany({
            select:{
                userId: true,
                accountId: true,
                mmr: true
            }, 
            orderBy:{
                mmr: 'desc'
            }
        });
        
        if (!sortedMMR) {
            return res.status(404).json({ message: '유저 정보가 없습니다.'});
        }
        
        for(const accountInfo of sortedMMR){
            const games = await prisma.results.count();
            const wins = await prisma.results.count({
                where:{
                    result: 1
                }
            });
            // 판수가 0일 경우 승률:0
            accountInfo["winRate"] = games ? Math.floor(wins/games,2) : 0               
        }
        
        return res.status(200).json({ data: sortedMMR, message: "랭크 조회 성공"});
    } catch(error){
        next(error)
    }
});

/** 사용자 게임 가능 확인 API **/
router.post('/custom', async (req, res, next) => {
    try{
        // 인증 기능 구현 필요
        const accountId = req.headers

        // 유저 정보 조회
        const isExistUser = await prisma.account.findFirst({
            where:{
                accountId: +accountId,
            },
            orderBy:{
                mmr: 'desc'
            }
        });
        if (!isExistUser) {
            return res.status(404).json({ message: '유저 정보가 없습니다.'});
        }
        
        const activePlayers = await prisma.roster.count({
            where:{
                accountId: +accountId,
                isPicked: 1 // 출전하는 경우
            }
        });
        
        return res.status(200).json({ data: sortedMMR, message: "랭크 조회 성공"});
    } catch(error){
        next(error)
    }
});
export default router;