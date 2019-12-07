import * as mongoose from 'mongoose'

export enum MESSAGE_TYPE {
  USER = 'user',
  SYSTEM = 'system'
}

export interface IMessage extends mongoose.Document {
  type: MESSAGE_TYPE
  fromTag: string
  from: object
  toTag: string
  to: object
  message: string
  createdAt: Date
  readedAt: null | Date
  deletedAt: null | Date
}

export const messageSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['system', 'user'],
    required: true
  },
  fromTag: {
    type: String,
    required: true
  },
  from: {
    type: Object,
    default: null
  },
  toTag: {
    type: String,
    default: ''
  },
  to: {
    type: Object,
    default: null
  },
  message: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  readedAt: {
    type: Date,
    default: null
  },
  deletedAt: {
    type: Date,
    default: null
  }
})

export const Message = mongoose.model<IMessage>('message', messageSchema)
