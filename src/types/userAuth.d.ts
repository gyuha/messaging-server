import { Request } from 'express'

export interface IAuthInfo {
  id: number
  tag: string
  role: number
  iot: number
  image: string
}

export interface IRequestAuth extends Request {
  userAuth: IAuthInfo
}
