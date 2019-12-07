import * as redis from 'redis'
import RedisSingleton from '../redisSingleton'

export enum UserChannels {
  LOGIN = 'LOGIN', // 개인 연결
  IS_LOGIN = 'IS_LOGIN' // 연결 확인 용
}

export enum UserCommands {
  LOGIN = 'LOGIN', // 연결 중
  IS_LOGIN = 'IS_LOGIN', // 로그인 상태 체크
  LOGOUT = 'LOGOUT' // 로그아웃해라
}

export default class UserChannel {
  private redis: RedisSingleton
  public channel: UserChannels
  public command: UserCommands

  constructor() {
    this.redis = RedisSingleton.getInstance()
  }

  public setChannel(channel: UserChannels, userCommand: UserCommands) {
    this.channel = channel
    this.command = userCommand
  }

  public getChannel(): string {
    return this.command + ':' + this.channel
  }

  public getIsLoginChannel(): string {
    return UserCommands.IS_LOGIN + ':' + this.channel
  }

  // 사용자가 로그인 중인지 체크 한다.
  public async isLogin(): Promise<boolean> {
    return await this.redis.get(UserCommands.LOGIN + ':' + this.channel)
  }

  // 연결 중 설정
  public async setConnected() {
    await this.redis.set(this.getChannel(), true)
  }

  public async diconnect() {
    await this.redis.del(this.getChannel())
  }
}
