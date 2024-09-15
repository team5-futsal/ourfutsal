import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import validSchema from '../utils/joi/valid.schema.js'

const router = express.Router();

/** 아이템 생성 API **/
router.post('/items', async (req, res, next) => {
    try{
        const validateBody = await validSchema.items.validateAsync(req.body)
        const { name, stat, price} = validateBody;

        // 아이템명 중복 확인
        const isExistUser = await prisma.items.findFirst({
            where: {
            name,
            },
        });
    
        if (isExistUser) {
            return res.status(409).json({ message: '이미 존재하는 이름입니다.' });
        }
  
        const char = await prisma.items.create({
            data: {
            name,
            stat,
            price
            },
        });

        return res.status(201).json({ data: char, message: "아이템 생성 성공"});
    } catch(error){
        next(error)
    }
});

/** 아이템 수정 API **/
router.put('/items/:itemId', async (req, res, next) => {
    try{
        const { itemId } = req.params;
        const validateBody = await validSchema.items.validateAsync(req.body)
        const { name, stat} = validateBody;

        const item = await prisma.items.findUnique({
            where: { itemId: +itemId },
        });
        if(item==null){
            return res.status(404).json({ message: '존재하지 않는 아이템입니다.'});
        }

        await prisma.items.update({
            data: {name, stat},
            where: {
                itemId: +itemId,
            }
        });
        
        return res.status(201).json({message: '정상적으로 수정되었습니다.'});
    } catch(error){
        next(error)
    }
});

/** 아이템 목록 조회 API **/
router.get('/items', async (req, res, next) => {
    try{
        const item = await prisma.items.findMany({
            select: {
                itemId: true,    
                name: true,
                price: true
            },
            orderBy:{
                name: 'asc'
            }
        });
        if(item==null){
            return res.status(404).json({ message: '아이템이 없습니다.' });
        }

        return res.status(201).json({data: item});
    } catch(error){
        next(error);
    }
});

/** 아이템 상세 조회 API **/
router.get('/items/:itemId', async (req, res, next) => {
    try{
        const { itemId } = req.params;
        const item = await prisma.items.findFirst({
            where: {
                itemId: +itemId,
            },
            select: {
            itemId: true,
            name: true,
            stat: true,
            price: true
            },
        });
        if(item==null){
            return res.status(404).json({ message: '존재하지 않는 아이템입니다.' });
        }

        return res.status(201).json({ data: item});
    } catch(error){
        next(error);
    }
});

export default router;