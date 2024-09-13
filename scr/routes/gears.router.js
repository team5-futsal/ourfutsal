import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import validSchema from '../utils/joi/valid.schema.js'

const router = express.Router();

/** 장비 탈착 API **/
router.post('/unequip/:charId', authMiddleware, async (req, res, next) => {
    try{
        const { charId } = req.params;
        const { itemId } = req.body;
        const { userTag } = req.user;
        
        // 캐릭터 확인
        const char = await prisma.characters.findFirst({
            where: { charId: +charId },
            select: { 
                userTag: true,
                health: true,
                power: true
            }
        });
        if(char==null)
            return res.status(404).json({ message: '존재하지 않는 캐릭터입니다.' });
        if(char.userTag != userTag)
            return res.status(404).json({ message: '소유권이 없는 캐릭터입니다.' });
        
        // 장비 유무 확인
        const gear = await prisma.gears.findFirst({
            where: { 
                charId: +charId
            },
            select: {equip: true}
        });
        if(gear==null){
            return res.status(404).json({massage :  "장착 중인 장비가 없습니다."})
        }
        // 장비 삭제
        await prisma.gears.delete({
            where: { itemId_charId: {itemId: +itemId, charId: +charId}}
        })
        // 인벤토리에 기존 아이템 개수 추가
        const inventory = await prisma.inventory.findFirst({
            where: { 
                itemId: +itemId,
                charId: +charId
            },
            select: {count: true}
        });

        if(inventory!=null){
            await prisma.inventory.update({
                where: {
                    itemId_charId: {
                        itemId: +itemId,
                        charId: +charId
                    }
                },
                data: {
                    count: inventory.count + 1
                },
            });
        } else {
            // 인벤토리에 없다면 생성
            await prisma.inventory.create({
                data: {
                    itemId: +itemId,
                    charId: +charId,
                    count: 1
                }
            });
        }

        // 캐릭터 스텟 반영
        const item = await prisma.items.findFirst({
            where: { itemId : +itemId},
            select: {
                stat: true
            }
        })
        const { power,health} =  item.stat

        await prisma.characters.update({
            where: { charId: +charId },
            data: {
                health: char.health - health,
                power: char.power - power
            },
        });

        return res.status(201).json({ stat: {health, power}, message: "장비를 해제했습니다."});
    } catch(error){
        next(error)
    }
});

/** 아이템 장착 API **/
router.post('/equip/:charId', authMiddleware, async (req, res, next) => {
    try{
        const { charId } = req.params;
        const { itemId } = req.body;
        const { userTag } = req.user;
        
        // 캐릭터 확인
        const char = await prisma.characters.findFirst({
            where: { charId: +charId },
            select: { 
                userTag: true,
                health: true,
                power: true
            }
        });
        if(char==null)
            return res.status(404).json({ message: '존재하지 않는 캐릭터입니다.' });
        if(char.userTag != userTag)
            return res.status(404).json({ message: '소유권이 없는 캐릭터입니다.' });
        
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

        if(inventory.count == 1){
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
                    count: inventory.count - 1
                },
            });
        }
        // 장비 장착
        await prisma.gears.create({
            data: {
                charId: +charId,
                itemId: +itemId,
                equip: true
            },
        });

        // 캐릭터 스텟 반영
        const item = await prisma.items.findFirst({
            where: { itemId : +itemId},
            select: {
                stat: true
            }
        })
        const { power,health} =  item.stat

        await prisma.characters.update({
            where: { charId: +charId },
            data: {
                health: char.health + health,
                power: char.power + power
            },
        });

        return res.status(201).json({ stat: {health, power}, message: "성공적으로 장착했습니다."});
    } catch(error){
        next(error)
    }
});

/** 장비 목록 조회 API **/
router.get('/equip/:charId', async (req, res, next) => {
    try{
        const { charId } = req.params;
        const inventory = await prisma.inventory.findMany({
            where: {
                charId: +charId,
            },
            select: {
                itemId: true,
            },
            orderBy:{
                itemId: 'asc'
            }
        });

        return res.status(201).json({data: inventory});
    } catch(error){
        next(error);
    }
});

export default router;