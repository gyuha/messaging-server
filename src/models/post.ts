import * as mongoose from 'mongoose'

/**
 * 게시판 글
 */
export interface IPost extends mongoose.Document {
  channel: string
  category: string
  user: object
  title: string
  content: string
  files: string[]
  readed: number
  createdAt: Date
  updatedAt?: Date
  deletedAt: null | Date
}

export const postSchema = new mongoose.Schema({
  channel: {
    type: String,
    required: true
  },
  category: {
    type: String
  },
  user: {
    type: Object,
    default: null
  },
  title: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    default: ''
  },
  files: {
    type: [String],
    default: []
  },
  readed: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  deletedAt: {
    type: Date,
    default: null
  }
})

postSchema.pre('save', (next: any) => {
  if (!this.updatedAt) {
    this.updatedAt = new Date()
  }
  next()
})

export const Post = mongoose.model<IPost>('post', postSchema)
