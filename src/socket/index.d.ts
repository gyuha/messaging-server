import { IRequestAuth, IAuthInfo } from '../types/userAuth'

export interface ISocketData {
  channel: string
  command?: string
  user: IAuthInfo
  data: any
  message: string
  createdAt?: Date
}

export interface IChannelUser {
  tag: string
  socketId?: string
  name: string
  image: string
  data?: any
  join_dt?: number
}

export interface IChannelInfo {
  count: number
  users: IChannelUser[]
}
