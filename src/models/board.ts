import * as mongoose from 'mongoose';

/**
 * 게시판 설정
 */
export interface IBoard extends mongoose.Document {
  channel: string;
  title: string;
  css: string;
  categories: string[];
  permission: string[];
  owners: Object[]; // 관리자들
  createdAt: Date;
  updatedAt: Date;
  deletedAt: null | Date;
}

export const boardSchema = new mongoose.Schema({
  channel: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  css: {
    type: String,
    default: ''
  },
  categories: {
    type: [String],
    default: []
  },
  permission: {
    type: [String],
    default: []
  },
  owners: {
    type: [Object],
    default: []
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
});

boardSchema.pre('save', (next: any) => {
  if (!this.updatedAt) {
    this.updatedAt = new Date();
  }
  next();
});

/**
 * 게시판 글
 */
export interface IBoardContent extends mongoose.Document {
  channel: string;
  category: string;
  user: object;
  title: string;
  content: string;
  files: string[];
  readed: number;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt: null | Date;
}

export const boardContentSchema = new mongoose.Schema({
  channel: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  user: {
    type: String,
    default: ''
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
});

boardContentSchema.pre('save', (next: any) => {
  if (!this.updatedAt) {
    this.updatedAt = new Date();
  }
  next();
});

export const Board = mongoose.model<IBoard>('board', boardSchema);
export const BoardContent = mongoose.model<IBoardContent>('boardContent', boardContentSchema);
