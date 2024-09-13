import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma/index.js';

export default async function (req, res, next) {
  try {
    const { authorization } = req.headers;
    if (!authorization) throw new Error('토큰이 존재하지 않습니다.');

    const [tokenType, token] = authorization.split(' ');

    if (tokenType !== 'Bearer')
      throw new Error('토큰 타입이 일치하지 않습니다.');

    const decodedToken = jwt.verify(token, 'custom-secret-key');
    const userTag = decodedToken.userTag;

    const user = await prisma.users.findFirst({
      where: { userTag: +userTag },
    });
    if (!user) {
      res.clearCookie('authorization');
      throw new Error('토큰 사용자가 존재하지 않습니다.');
    }

    // req.user에 사용자 정보를 저장합니다.
    req.user = user;

    next();
  } catch (error) {
    req.user = {userTag: null};

    next();
  }
}