import * as redis from 'redis'
import RedisSingleton from '../redisSingleton'
import * as _ from 'lodash'
import { IChannelUser, IChannelInfo } from './index.d'

export default class RoomChannel {
  public channel: string = null
  private redis: RedisSingleton

  constructor() {
    this.redis = RedisSingleton.getInstance()
  }

  public setChannel(channel: string) {
    this.channel = channel
  }

  public id() {
    return 'room:' + this.channel
  }

  private inUsers(users: IChannelUser[]): IChannelInfo {
    let channelUsers: IChannelInfo = {
      count: 0,
      users: []
    }

    for (let user of users) {
      if (
        _.findIndex(channelUsers.users, u => {
          return user.tag === u.tag
        }) === -1
      ) {
        channelUsers.count++
        channelUsers.users.push(user)
      }
    }

    return channelUsers
  }

  public async join(tag: string, user: IChannelUser): Promise<IChannelInfo> {
    user.join_dt = +new Date()
    let users: IChannelUser[] = []
    try {
      users = JSON.parse(await this.redis.get(this.id()))
      if (!users) {
        users = []
      }
      users.push(user)
      await this.redis.set(this.id(), JSON.stringify(users))
    } catch (e) {
      console.log(e)
      return {} as IChannelInfo
    }

    return this.inUsers(users)
  }

  public async diconnect(socketId: string): Promise<IChannelInfo> {
    let users: IChannelUser[] = []
    try {
      users = JSON.parse(await this.redis.get(this.id()))
      if (!users) {
        users = []
      }
      _.remove(users, (u: IChannelUser) => {
        return u.socketId === socketId
      })

      if (users.length) {
        await this.redis.set(this.id(), JSON.stringify(users))
      } else {
        await this.redis.del(this.id())
      }
    } catch (e) {
      console.log(e)
      return {} as IChannelInfo
    }
    return this.inUsers(users)
  }
}
