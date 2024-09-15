import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import validSchema from '../utils/joi/valid.schema.js'

const router = express.Router();

/** 아이템 구매 API **/
router.post('/buy/:charId', authMiddleware, async (req, res, next) => {
    try{
        const { charId } = req.params;
        const { itemId, count} = req.body;
        const { userTag } = req.user;
        
        // 아이템 존재 확인
        const item = await prisma.items.findUnique({
            where: { itemId: +itemId },
            select: {price: true}
        });
        if(item==null)
            return res.status(404).json({ message: '존재하지 않는 아이템입니다.'});

        const char = await prisma.characters.findFirst({
            where: { charId: +charId },
            select: { 
                userTag: true,
                money: true 
            }
        });
        if(char==null)
            return res.status(404).json({ message: '존재하지 않는 캐릭터입니다.' });
        if(char.userTag != userTag)
            return res.status(404).json({ message: '소유권이 없는 캐릭터입니다.' });

        // 소지금액이 충분한지 확인
        const change = char.money - item.price*count
        if(change < 0)
            return res.status(403).json({ message: '소지금이 부족합니다.' });
        
        // 인벤토리 아이템 유무 확인
        const inventory = await prisma.inventory.findFirst({
            where: { 
                itemId: +itemId,
                charId: +charId
            },
            select: {count: true}
        });
        if(inventory==null){
            // 인벤토리에 신규 아이템 추가
            await prisma.inventory.create({
                data: {
                    itemId: +itemId,
                    charId: +charId,
                    count: count
                },
            });
        } else {
            // 인벤토리에 기존 아이템 개수 추가
            await prisma.inventory.update({
                where: {
                    itemId_charId: {
                        itemId: +itemId,
                        charId: +charId
                    }
                },
                data: {
                    count: inventory.count + count
                },
            });
        }

        // 소지금 업데이트
        await prisma.characters.update({
            where: {charId: +charId},
            data: {
                money: change
            },
        });


        return res.status(201).json({ money: change, message: "성공적으로 구매했습니다."});
    } catch(error){
        next(error)
    }
});

/** 아이템 판매 API **/
router.post('/sell/:charId', authMiddleware, async (req, res, next) => {
    try{
        const { charId } = req.params;
        const { itemId, count} = req.body;
        const { userTag } = req.user;
        
        // 아이템 존재 확인
        const item = await prisma.items.findUnique({
            where: { itemId: +itemId },
            select: {price: true}
        });
        if(item==null)
            return res.status(404).json({ message: '존재하지 않는 아이템입니다.'});

        const char = await prisma.characters.findFirst({
            where: { charId: +charId },
            select: { 
                userTag: true,
                money: true 
            }
        });
        if(char==null)
            return res.status(404).json({ message: '존재하지 않는 캐릭터입니다.' });
        if(char.userTag != userTag)
            return res.status(404).json({ message: '소유권이 없는 캐릭터입니다.' });

        // 판매 후 총 수익금
        const netProfit = char.money + (item.price*count*0.6)<<0
        
        // 인벤토리 아이템 유무 확인
        const inventory = await prisma.inventory.findFirst({
            where: { 
                itemId: +itemId,
                charId: +charId
            },
            select: {count: true}
        });
        if(inventory==null)
            return res.status(403).json({ message: '소지량이 부족합니다.' });

        // 판매하려는 수만큼 소지한지 확인
        if(inventory.count < count)
            return res.status(403).json({ message: '소지량이 부족합니다.' });

        if(inventory.count == count){
            // 소지량이 0 이라면 삭제
            await prisma.inventory.delete({
                where: {
                    itemId_charId: {
                        itemId: +itemId,
                        charId: +charId
                    }
                }
            })
        } else {
            // 인벤토리에 기존 아이템 개수 차감
            await prisma.inventory.update({
                where: {
                    itemId_charId: {
                        itemId: +itemId,
                        charId: +charId
                    }
                },
                data: {
                    count: inventory.count - count
                },
            });
        }

        // 소지금 업데이트
        await prisma.characters.update({
            where: {charId: +charId},
            data: {
                money: netProfit
            },
        });

        return res.status(201).json({ money: netProfit, remain: (inventory.count - count), message: "성공적으로 판매했습니다."});
    } catch(error){
        next(error)
    }
});

/** 인벤토리 목록 조회 API **/
router.get('/stash/:charId', authMiddleware, async (req, res, next) => {
    try{
        const { charId } = req.params;
        const { userTag } = req.user;
        const char = await prisma.characters.findFirst({
            where: {
                charId: +charId,
            },
            select: {
            userTag: true,
            name: true,
            health: true,
            power: true,
            money: true
            },
        });
        if(char==null)
            return res.status(404).json({ message: '존재하지 않는 캐릭터입니다.' });
        if(char.userTag != userTag)
            return res.status(401).json({ message: '소유권이 없는 캐릭터입니다.' });

        const inventory = await prisma.inventory.findMany({
            where: {
                charId: +charId,
            },
            select: {
                itemId: true,    
                charId: true,
                count: true
            },
            orderBy:{
                itemId: 'asc'
            }
        });
        if(inventory==null){
            return res.status(404).json({ message: '아이템이 없습니다.' });
        }

        return res.status(201).json({data: inventory});
    } catch(error){
        next(error);
    }
});

export default router;