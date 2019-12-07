import * as redis from 'redis'
import { promisify } from 'util'

class RedisSingleton {
  private static _instance: RedisSingleton = new RedisSingleton()
  private redisClient: redis.RedisClient

  public get: any
  public mget: any
  public set: any
  public del: any
  public publish: any

  constructor() {
    if (RedisSingleton._instance) {
      throw new Error('Error: Instantiation failed: Use RedisSingleton.getInstance()')
    }
    this.redisClient = redis.createClient(+process.env.REDIS_PORT, process.env.REDIS_HOST)
    if (typeof process.env.REDIS_PASSWORD !== 'undefined' && process.env.REDIS_PASSWORD) {
      this.redisClient.auth(process.env.REDIS_PASSWORD)
    }
    RedisSingleton._instance = this

    this.get = promisify(this.redisClient.get).bind(this.redisClient)
    this.mget = promisify(this.redisClient.mget).bind(this.redisClient)
    this.set = promisify(this.redisClient.set).bind(this.redisClient)
    this.del = promisify(this.redisClient.del).bind(this.redisClient)
    this.publish = promisify(this.redisClient.publish).bind(this.redisClient)
  }

  public static getInstance(): RedisSingleton {
    return RedisSingleton._instance
  }
}

export default RedisSingleton
