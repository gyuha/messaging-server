import { createServer, Server } from 'http'
import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as cors from 'cors'
import { Chat } from './socket/chat'
import Router from './router'
import errorMiddleware from './middleware/error.middleware'

// import { Message } from './model';
const options: cors.CorsOptions = {
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'X-Access-Token'],
  credentials: true,
  methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  origin: '*'
}

export class App {
  public static readonly PORT: number = 4040
  private app: express.Application
  private server: Server
  private port: string | number
  private chat: Chat

  public constructor() {
    this.initial()
    this.listen()
  }

  private initial() {
    this.app = express()
    const router = new Router()
    this.app.use(express.static('./public'))
    this.app.use(bodyParser.urlencoded({ extended: false }))
    this.app.use(bodyParser.json())
    this.app.use(cors(options))
    this.app.use('/community/', router.router)
    this.app.use(errorMiddleware)
    this.server = createServer(this.app)
    this.port = process.env.SERVER_PORT || App.PORT
    this.chat = new Chat(this.server) // 꼭 마지막에 놓아야 실행 된다.
    this.app.options('*', cors(options))
  }

  private listen(): void {
    this.server.listen(this.port, () => {
      console.log('Running server on port %s', this.port)
    })
  }

  public getApp(): express.Application {
    return this.app
  }
}
