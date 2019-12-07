import { Server, createServer } from 'http'
import * as socketio from 'socket.io'
import * as redisAdapter from 'socket.io-redis'
import * as redis from 'redis'
import { Room } from './room'
import { Update } from './update'
import { User } from './user'

export class Chat {
  private io: SocketIO.Server
  private room: Room
  private update: Update
  private user: User

  public constructor(server: Server) {
    this.io = socketio(server, { transports: ['websocket', 'polling'] })
    const redisOpt = {
      host: process.env.REDIS_HOST,
      port: +process.env.REDIS_PORT
    }
    if (process.env.REDIS_AUTH) {
      redisOpt['auth_pass'] = process.env.REDIS_AUTH
    }
    console.log(redisOpt)

    this.io.adapter(redisAdapter(redisOpt))
    this.room = new Room(this.io.of('/room'))
    this.update = new Update(this.io.of('/update'))
    this.user = new User(this.io.of('/user'))

    return this
  }
}
