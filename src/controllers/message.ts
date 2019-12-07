import { Request, Response, NextFunction } from 'express'
import HttpException from '../exceptions/HttpException'
import RedisSingleton from '../redisSingleton'
import { Message, IMessage, MESSAGE_TYPE } from '../models/message'
import SendMessage from '../util/sendMessage'
import { User } from '../socket/user'

export async function getMessage(req: Request, res: Response, next: NextFunction) {
  const id = req.params.id
  let data: IMessage
  try {
    data = await Message.findById(id)
    data.readedAt = new Date()
    data.save()
  } catch (e) {
    next(new HttpException(500, e.toString()))
  }

  if (!data) {
    next(new HttpException(500, '게시물이 존재하지 않습니다.'))
  }

  res.json({
    result: true,
    data
  })
}

export async function getMessageUnreaedCount(req: Request, res: Response, next: NextFunction) {
  const toTag: string = req.params.tag

  let total = 0
  let where = {
    $and: [{ toTag }, { readedAt: null }, { deletedAt: null }]
  }

  total = await Message.countDocuments(where)

  res.json({
    result: true,
    total
  })
}

export async function getMessageList(req: Request, res: Response, next: NextFunction) {
  const toTag: string = req.params.tag
  let type: string = req.params.type
  const page: number = parseInt(req.query.page)
  let size: number = parseInt(req.query.size)
  let pages: number = 1
  let total: number = 0

  if (!size) {
    size = 25
  }

  let where = {
    $and: [{ toTag }, { type }, { deletedAt: null }]
  }

  let data: IMessage[] = []

  try {
    total = await Message.countDocuments(where)
    pages = Math.ceil(total / size)
    let skip = (page - 1) * size
    if (skip < 0) skip = 1

    data = await Message.find(where, 'from message readedAt createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(size)
  } catch (e) {
    next(new HttpException(500, e.toString()))
    return
  }

  res.json({
    result: true,
    total: total,
    pages,
    data
  })
}

export async function patchMessageRead(req: Request, res: Response, next: NextFunction) {
  let _id = req.params.id

  let count = 0
  try {
    const res = await Message.updateOne({ _id }, { readedAt: new Date() })
    count = res.n
  } catch (e) {
    next(new HttpException(500, e.toString()))
  }

  res.json({
    result: count ? true : false,
    count
  })
}

export async function patchMessageReadAll(req: Request, res: Response, next: NextFunction) {
  let toTag = req.params.tag
  let type = req.params.type

  let where = {
    $and: [{ toTag }, { type }, { readedAt: null }]
  }
  try {
    await Message.updateMany(where, { readedAt: new Date() })
  } catch (e) {
    next(new HttpException(500, e.toString()))
  }

  res.json({
    result: true
  })
}

export async function patchMessageDelete(req: Request, res: Response, next: NextFunction) {
  let _id = req.params.id

  let count = 0
  try {
    const res = await Message.updateOne({ _id }, { deletedAt: new Date() })
    count = res.n
  } catch (e) {
    next(new HttpException(500, e.toString()))
  }

  res.json({
    result: count ? true : false,
    count
  })
}

export async function patchMessageDeleteAll(req: Request, res: Response, next: NextFunction) {
  let toTag = req.params.tag
  let type = req.params.type

  let where = {
    $and: [{ toTag }, { type }]
  }
  try {
    await Message.updateMany(where, { deletedAt: new Date() })
  } catch (e) {
    next(new HttpException(500, e.toString()))
  }

  res.json({
    result: true
  })
}

/**
 * 메시지 직접 보내기
 */
export async function postMessageSend(req: Request, res: Response, next: NextFunction) {
  const namespace = req.params.namespace
  console.log(namespace)
  let { toTag, message, from, to, type } = req.body

  if (!type) {
    type = MESSAGE_TYPE.USER
  }

  let result: boolean = false
  try {
    let msg = new Message({
      type,
      toTag,
      message,
      to,
      from,
      fromTag: from.tag
    })
    await msg.save()
    result = await SendMessage(namespace, 'LOGIN:' + toTag, message, from)
  } catch (e) {
    next(new HttpException(500, '전송 오류'))
  }

  res.json({
    result
  })
}
