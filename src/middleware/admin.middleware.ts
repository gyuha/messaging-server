import { NextFunction, Response } from 'express';
import { IAuthInfo, IRequestAuth } from '../types/userAuth';
import * as jwt from 'jsonwebtoken';
import HttpException from '../exceptions/HttpException';
import config from '../config';

async function adminMiddleware(req: IRequestAuth, res: Response, next: NextFunction) {
  const token = req.headers.authorization;

  if (!token) {
    next(new HttpException(400, '인증 오류'));
  }

  if (token) {
    let userAuthData: IAuthInfo;
    try {
      userAuthData = (await jwt.verify(token, config.jwt_secret)) as IAuthInfo;

      if (userAuthData.role > 100) {
        next(new HttpException(400, `관리자만 접근이 가능 합니다.`));
      }
    } catch (err) {
      next(new HttpException(400, `잘 못 된 인증 코드 입니다. 다시 로그인 해 주세요.`));
    }
    req.userAuth = userAuthData;
  }
  next();
}

export default adminMiddleware;
