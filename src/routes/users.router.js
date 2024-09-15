import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import authMiddleware from '../middlewares/auth.middleware.js'
import validSchema from '../utils/joi/valid.schema.js'

const router = express.Router();

/** 사용자 회원가입 API **/
router.post('/sign-up', async (req, res, next) => {
  try{
    const validateBody = await validSchema.users.validateAsync(req.body)
  
    const { userId, password, name} = validateBody;

    // 아이디 중복 확인
    const isExistUser = await prisma.users.findFirst({
      where: {
        userId,
      },
    });

    if (isExistUser) {
      return res.status(409).json({ message: '이미 존재하는 아이디입니다.' });
    }

    // 사용자 비밀번호를 암호화합니다.
    const hashedPassword = await bcrypt.hash(password, 10);

    // Users 테이블에 사용자를 추가합니다.
    const user = await prisma.users.create({
      data: { 
        userId, 
        password: hashedPassword,
        name
      },
    });

    return res.status(201).json({
      userId,
      name,
      message: '회원가입이 완료되었습니다.' });
  } catch (error){
    next(error)
  }
});

/** 로그인 API **/
router.post('/sign-in', async (req, res, next) => {
    const { userId, password } = req.body;
    const user = await prisma.users.findFirst({ where: { userId } });
  
    if (!user)
      return res.status(401).json({ message: '존재하지 않는 아이디입니다.' });
    // 입력받은 사용자의 비밀번호와 데이터베이스에 저장된 비밀번호를 비교합니다.
    else if (!(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
  
    // 로그인에 성공하면, 사용자의 userId를 바탕으로 토큰을 생성합니다.
    const token = jwt.sign(
      {
        userTag: user.userTag,
      },
      'custom-secret-key',
    );
  
    // authotization 헤더에 Bearer 토큰 형식으로 JWT를 저장합니다.
    res.header('authorization', `Bearer ${token}`);
    return res.status(200).json({ message: '로그인 성공' });
});

/** 사용자 조회 API **/
router.get('/users', authMiddleware, async (req, res, next) => {
    const { userId } = req.user;
  
    const user = await prisma.users.findFirst({
      where: { userId: +userId },
      select: {
        userTag: true,
        userId: true,
        createdAt: true,
        name: true
      },
    });
  
    return res.status(200).json({ data: user });
});

export default router;