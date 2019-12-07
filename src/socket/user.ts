import * as socketio from 'socket.io'
import UserChannel, { UserCommands, UserChannels } from './userChannel'
import { ISocketData } from './index.d'

/**
 * 사용자 접속 체크 및 사용자 개인 메시지 경로
 * command : 사용자 용도별
 */
export class User {
  private user: SocketIO.Namespace

  public constructor(user: SocketIO.Namespace) {
    this.user = user
    this.init()
  }

  private init() {
    const _this = this
    this.user.on('connect', async (socket: socketio.Socket) => {
      let userChannel: UserChannel = new UserChannel()

      // 유저 접속
      const onJoin = (data: ISocketData) => {
        _this.onJoin(socket, userChannel, data)
      }
      socket.on('join', onJoin)

      // 채널에서 메시지 받기
      const onMessage = async (data: ISocketData) => {
        _this.onMessage(userChannel, data)
      }
      socket.on('message', onMessage)

      // 채널 나가기
      const onDisconnect = async (data: ISocketData) => {
        _this.onDisconnect(userChannel, data)
      }
      socket.on('disconnect', onDisconnect)
    })
  }

  private async onJoin(socket: SocketIO.Socket, userChannel: UserChannel, data: ISocketData) {
    userChannel.setChannel(data.channel as UserChannels, data.command as UserCommands)
    await socket.join(userChannel.getChannel())

    let isLogin = {
      channel: data.channel,
      command: UserCommands.IS_LOGIN,
      data: {
        login: false
      }
    }

    if (userChannel.command === UserCommands.LOGIN) {
      // 로그인 했다고 신고
      userChannel.setConnected()
      // 로그인 확인하는 사람들에게 알려주기
      isLogin.data.login = true
      this.user.to(userChannel.getIsLoginChannel()).emit('message', isLogin)
      return
    }

    // 로그인 체크라면...
    const login = await userChannel.isLogin()
    isLogin.data.login = login ? true : false
    await this.user.to(userChannel.getIsLoginChannel()).emit('message', isLogin)
  }

  private async logout(userChannel: UserChannel) {
    // 로그아웃 확인 절차
    await userChannel.diconnect()
    // 같은 계정은 모두 로그아웃 시켜 버린다.
    this.user.to(userChannel.getChannel()).emit('message', {
      channel: UserChannels.LOGIN,
      command: UserCommands.LOGOUT
    })

    // 로그인 확인 중인 곳에 나갔다고 알림
    this.user.to(userChannel.getIsLoginChannel()).emit('message', {
      command: UserCommands.IS_LOGIN,
      channel: userChannel.channel,
      data: {
        login: false
      }
    })
  }

  private async onDisconnect(userChannel: UserChannel, data: ISocketData) {}

  private async onMessage(userChannel: UserChannel, data: ISocketData) {
    if (data.command === UserCommands.LOGOUT) {
      this.logout(userChannel)
      return
    }
    this.user.to(userChannel.getChannel()).emit('message', data)
  }
}
