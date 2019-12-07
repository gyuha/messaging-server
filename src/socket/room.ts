import * as socketio from 'socket.io'
import { IChannelUser, IChannelInfo } from './index.d'
import RoomChannel from './roomChannel'
import { Chat, IChat, chatSchema } from '../models/chat'

export class Room {
  private room: SocketIO.Namespace
  private chatSchema = Chat

  public constructor(room: SocketIO.Namespace) {
    this.room = room
    this.init()
  }

  private init() {
    const _this = this
    this.room.on('connection', async (socket: socketio.Socket) => {
      let user: IChannelUser = {} as IChannelUser // 룸에 접속 한 사람 정보
      let channel: RoomChannel = new RoomChannel() // 채널 정보

      // 채널에 입장
      const onJoin = (data: any) => {
        _this.onJoin(socket, channel, user, data).then(res => {
          channel = res.channel
          user = res.user
        })
      }
      socket.on('join', onJoin)

      // 채널에서 메시지 받기
      const onMessage = (data: any) => {
        _this.onMessage(socket, channel, user, data)
      }
      socket.on('message', onMessage)

      // 채널 나가기
      const onDisconnect = (data: any) => {
        _this.onDisconnect(socket, channel, user, data)
      }
      socket.on('disconnect', onDisconnect)
    })
  }

  private async onJoin(socket: SocketIO.Socket, channel: RoomChannel, user, data: IChat) {
    try {
      channel.setChannel(data.channel)
      await socket.join(channel.id())
      if (!user) {
        // 사용자 정보가 없으면 넘어감..
        return
      }

      user = data.user
      user.socketId = socket.id

      data.message = user.name + '님이 입장하셨습니다.'
      //  사용자 정보가 있을 경우에만 알림.
      this.room.to(channel.id()).emit('message', data)

      const channelInfo: IChannelInfo = await channel.join(channel.id(), user)
      this.room.to(channel.id()).emit('connected', channelInfo)

      return { channel, user }
    } catch (e) {
      console.log(e)
    }
    return { channel, user }
  }

  private async onDisconnect(socket: SocketIO.Socket, channel: RoomChannel, user, data: any) {
    if (!user) return
    const channelInfo: IChannelInfo = await channel.diconnect(socket.id)
    this.room.to(channel.id()).emit('message', { user, message: user.name + '님이 방나감' })
    this.room.to(channel.id()).emit('connected', channelInfo)
  }

  public async onMessage(socket: SocketIO.Socket, channel: RoomChannel, user, data: any) {
    // 메시지를 DB에 저장
    let newChat = new this.chatSchema({
      channel: channel.id(),
      ...data,
      createdAt: +new Date()
    })
    // console.log(newMessage);
    await newChat.save()
    this.room.to(channel.id()).emit('message', data)
  }
}
