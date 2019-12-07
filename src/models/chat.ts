import * as mongoose from 'mongoose'

/**
 * 채팅 메시지
 */
export interface IChat extends mongoose.Document {
  channel: string
  message: string
  user: object
  createdAt?: Date
}

export const chatSchema = new mongoose.Schema({
  channel: {
    type: String
  },
  message: {
    type: String
  },
  user: {
    type: Object,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

chatSchema.pre('save', (next: any) => {
  if (!this.createdAt) {
    this.createdAt = new Date()
  }
  next()
})

export const Chat = mongoose.model<IChat>('chat', chatSchema)
