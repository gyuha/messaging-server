import * as express from 'express'
import { getChat, postChat } from './controllers/chat'
import { getBoard, postBoard, patchBoard, deleteBoard } from './controllers/board'
import { getPost, postPost, patchPost, deletePost, getPostList } from './controllers/post'
import {
  postMessageSend,
  getMessageList,
  getMessageUnreaedCount,
  patchMessageRead,
  patchMessageReadAll,
  patchMessageDeleteAll
} from './controllers/message'
import authMiddleware from './middleware/auth.middleware'
import adminMiddleware from './middleware/admin.middleware'

class Router {
  router: express.Router
  constructor() {
    this.router = express.Router()
    this.router.post('/message/send/:namespace', postMessageSend)
    this.router.get('/message/list/:type/:tag', getMessageList)
    this.router.get('/message/unreaded/:tag', getMessageUnreaedCount)
    this.router.patch('/message/read/:id', patchMessageRead)
    this.router.patch('/message/readAll/:type/:tag', patchMessageReadAll)
    this.router.patch('/message/delete/:id', patchMessageDeleteAll)
    this.router.patch('/message/deleteAll/:type/:tag', patchMessageDeleteAll)

    this.router.get('/chat/:channel', getChat)
    this.router.post('/chat/:namespace', postChat)

    this.router.get('/board/post/:id', getPost)
    this.router.get('/board/post/list/:channel/:page', getPostList)
    this.router.post('/board/post/:channel', postPost)

    // this.router.delete('/board/post/:id', authMiddleware, deletePost)
    // this.router.post('/board/post/:channel', authMiddleware, postPost)
    this.router.delete('/board/post/:id', deletePost)
    this.router.patch('/board/post/:id', patchPost)

    this.router.get('/board/:channel', getBoard)
    this.router.post('/board', adminMiddleware, postBoard)
    this.router.patch('/board/:id', adminMiddleware, patchBoard)
    this.router.delete('/board/:id', adminMiddleware, deleteBoard)
  }
}

export default Router
