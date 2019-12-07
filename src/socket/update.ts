import * as socketio from 'socket.io'
import { ISocketData } from './index.d'
import { IChat } from '../models/chat'

/**
 * 각종 업데이트 알림용 네임스페이스
 */
export class Update {
  private update: SocketIO.Namespace

  public constructor(update: SocketIO.Namespace) {
    this.update = update
    this.init()
  }

  private init() {
    const _this = this
    this.update.on('connect', async (socket: socketio.Socket) => {
      let channel = ''

      socket.on('join', (data: IChat) => {
        channel = data.channel
        socket.join(data.channel)
      })

      // 채널에서 메시지 보내기
      const onMessage = (data: ISocketData) => {
        _this.onMessage(socket, channel, data)
      }
      socket.on('message', onMessage)

      // 채널 나가기
      const onDisconnect = (data: ISocketData) => {
        _this.onDisconnect(socket, channel, data)
      }
      socket.on('disconnect', onDisconnect)
    })
  }

  private async onDisconnect(socket: SocketIO.Socket, channel: string, data: any) {}

  public async onMessage(socket: SocketIO.Socket, channel: string, data: any) {
    this.update.to(channel).emit('message', data)
  }
}
