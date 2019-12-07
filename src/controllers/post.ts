import { Request, Response, NextFunction } from 'express'
import { Post, IPost } from '../models/post'
import HttpException from '../exceptions/HttpException'
import { IRequestAuth } from '../types/userAuth'

export async function getPost(req: Request, res: Response, next: NextFunction) {
  const id = req.params.id
  let data: IPost
  try {
    data = await Post.findById(id)
    data.readed = data.readed + 1
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

export async function getPostList(req: Request, res: Response, next: NextFunction) {
  const channel: string = req.params.channel
  const page: number = parseInt(req.params.page)
  let size: number = parseInt(req.query.size)
  let search: string = req.query.search
  let pages: number = 1
  let count: number = 0

  if (!size) {
    size = 25
  }

  const reg = new RegExp(search, 'i')
  let where = {
    $and: [{ channel }, { deletedAt: null }]
  }

  if (search) {
    const reg = new RegExp(search, 'i')
    where['$or'] = [{ title: reg }, { content: reg }, { 'user.name': reg }]
  }

  let data: IPost[] = []

  try {
    count = await Post.countDocuments(where)
    pages = Math.ceil(count / size)
    let skip = (page - 1) * size
    if (skip < 0) skip = 1

    data = await Post.find(where, 'user title readed createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(size)
  } catch (e) {
    next(new HttpException(500, e.toString()))
    return
  }

  res.json({
    result: true,
    count,
    pages,
    data
  })
}

export async function postPost(req: Request, res: Response, next: NextFunction) {
  const channel = req.params.channel

  let post = new Post({
    ...req.body
  })

  if (post.channel !== channel) {
    next(new HttpException(500, '글을 채널을 확인 해 주세요.'))
  }

  try {
    await post.save()
  } catch (e) {
    next(new HttpException(500, e.toString()))
  }

  res.json({
    result: true
  })
}

export async function patchPost(req: IRequestAuth, res: Response, next: NextFunction) {
  if (req.userAuth.tag !== req.body.user.tag && req.userAuth.role > 100) {
    next(new HttpException(401, '글을 쓴 사람만이 수정이 가능 합니다.'))
  }

  let id = req.params.id

  let data: IPost
  try {
    data = await Post.findById(id)
  } catch (e) {
    next(new HttpException(500, e.toString()))
  }

  if (data.deletedAt !== null) {
    next(new HttpException(500, '삭제 된 게시물 입니다'))
  }

  const body = req.body as IPost

  data.title = body.title
  data.channel = body.channel
  data.category = body.category
  data.content = body.content
  data.files = body.files

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

export async function deletePost(req: Request, res: Response, next: NextFunction) {
  let id = req.params.id

  try {
    let data = await Post.findById(id)
    data.deletedAt = new Date()
    await data.save()
  } catch (e) {
    next(new HttpException(500, '삭제 오류'))
  }
  res.json({
    result: true
  })
}
