import * as msgpack from 'notepack.io'
import RedisSingleton from '../redisSingleton'
import { promisify } from 'util'

export default async function sendMessage(
  namespace: string,
  channel: string,
  message: string,
  user: any
): Promise<boolean> {
  const redis: RedisSingleton = RedisSingleton.getInstance()

  const pubChannel = 'socket.io#/' + namespace + '#' + channel + '#'

  let data = [
    'system',
    {
      type: 2,
      data: [
        'message',
        {
          channel,
          message,
          user
        }
      ],
      nsp: '/' + namespace
    },
    { rooms: [channel], flags: {} }
  ]
  const msg = msgpack.encode(data)
  try {
    await redis.publish(pubChannel, msg)
  } catch (e) {
    return false
  }
  return true
}
