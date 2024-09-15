import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import authMiddleware2 from '../middlewares/auth.middleware2.js';
import validSchema from '../utils/joi/valid.schema.js'

const router = express.Router();

/** 캐릭터 생성 API **/
router.post('/chars', authMiddleware, async (req, res, next) => {
    try{
        const { userTag } = req.user;
        const validateBody = await validSchema.characters.validateAsync(req.body)
        const { name, health, power } = validateBody;

        // 아이디 중복 확인
        const isExistUser = await prisma.characters.findFirst({
            where: {
            name,
            },
        });
    
        if (isExistUser) {
            return res.status(409).json({ message: '이미 존재하는 이름입니다.' });
        }
  
        const char = await prisma.characters.create({
            data: {
            userTag: +userTag,
            name,
            health,
            power,
            money: 10000
            },
        });

        return res.status(201).json({ data: char });
    } catch(error){
        next(error)
    }
});

/** 캐릭터 삭제 API **/
router.post('/delchars/:charId', authMiddleware, async (req, res, next) => {
    try{
        const { charId } = req.params;
        const { userTag } = req.user;
        const char = await prisma.characters.findFirst({
            where: {
                charId: +charId,
            },
            select:{
                userTag: true,
                charId: true
            }
        });
        if(char==null){
            return res.status(404).json({ message: '존재하지 않는 캐릭터입니다.' });
        }
        if(char.userTag != userTag){
            return res.status(401).json({ message: '접근 권한이 없는 캐릭터입니다.' });
        }

        await prisma.characters.delete({
            where: {
                charId: +charId,
            },
        });
        
        return res.status(201).json({ message: '정상적으로 삭제되었습니다.'});
    } catch(error){
        next(error)
    }
});

/** 캐릭터 조회 API **/
router.get('/chars/:charId', authMiddleware2, async (req, res, next) => {
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
            delete char.money
        return res.status(201).json({ data: char });
    } catch(error){
        next(error)
    }
});

/** 돈 획득 API **/
router.put('/earn/:charId', authMiddleware, async (req, res, next) => {
    try{
        const { charId } = req.params;
        const { userTag } = req.user;
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

        await prisma.characters.update({
            data: {money: char.money + 100},
            where: { charId: +charId }
        });

        return res.status(201).json({ message : "소지금이 100원 증가했습니다." });
    } catch(error){
        next(error)
    }
});

export default router;