import { Request, Response, NextFunction } from 'express'
import { Chat } from '../models/chat'
import RedisSingleton from '../redisSingleton'
import * as msgpack from 'notepack.io'
import HttpException from '../exceptions/HttpException'
import SendMessage from '../util/sendMessage'

/**
 *  저장 된 메시지를 DB에서 읽어 오기
 */
export async function getChat(req: Request, res: Response, next: NextFunction) {
  const channel: string = 'room:' + req.params.channel
  let lastAt = req.query.lastAt
  let limit = parseInt(req.query.limit)
  if (!limit) {
    limit = 50
  }

  let where = { channel }

  if (lastAt) {
    where['createdAt'] = { $lt: new Date(lastAt) }
  }

  let total = 0
  try {
    total = await Chat.find(where).countDocuments()
  } catch (e) {
    next(new HttpException(500, e.toString()))
    return
  }
  const skip = total > limit ? total - limit : 0

  let data = await Chat.find(where)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: 1 })

  res.json({
    result: true,
    data
  })
  return
}

/**
 * 메시지 직접 보내기
 */
export async function postChat(req: Request, res: Response, next: NextFunction) {
  const redis: RedisSingleton = RedisSingleton.getInstance()
  const namespace = req.params.namespace
  let { type, toTag, message, user } = req.body

  const result = await SendMessage(namespace, 'LOGIN:' + toTag, message, user)

  res.json({
    result
  })
}
