import { Request, Response, NextFunction } from 'express'
import { Board, IBoard } from '../models/board'
import HttpException from '../exceptions/HttpException'
import { IRequestAuth } from '../types/userAuth'

export async function getBoard(req: Request, res: Response, next: NextFunction) {
  const channel = req.params.channel
  let data: IBoard
  try {
    data = await Board.findOne({
      channel,
      deletedAt: null
    })
  } catch (e) {
    next(new HttpException(500, e.toString()))
  }

  if (!data) {
    next(new HttpException(500, '게시판이 존재하지 않습니다.'))
  }

  res.json({
    result: true,
    data
  })
}

export async function postBoard(req: IRequestAuth, res: Response, next: NextFunction) {
  let board = new Board({
    ...req.body
  })

  try {
    await board.save()
  } catch (e) {
    next(new HttpException(500, e.toString()))
  }

  res.json({
    result: true
  })
}

export async function patchBoard(req: Request, res: Response, next: NextFunction) {
  let id = req.params.id

  let data: IBoard
  try {
    data = await Board.findById(id)
  } catch (e) {
    next(new HttpException(500, e.toString()))
  }

  if (data.deletedAt !== null) {
    next(new HttpException(500, '삭제 된 게시판입니다'))
  }

  const body = req.body

  data.title = body.title
  data.channel = body.channel
  data.categories = body.categories
  data.owners = body.owners

  try {
    await data.save()
  } catch (e) {
    next(new HttpException(500, e.toString()))
  }

  res.json({
    result: true,
    data
  })
}

export async function deleteBoard(req: Request, res: Response, next: NextFunction) {
  let id = req.params.id

  try {
    let data = await Board.findById(id)
    data.deletedAt = new Date()
    await data.save()
  } catch (e) {
    next(new HttpException(500, '삭제 오류'))
  }
  res.json({
    result: true
  })
}
