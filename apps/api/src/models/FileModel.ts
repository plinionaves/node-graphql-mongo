import { Schema, Types, model } from 'mongoose'
import { FileDocument } from '../types'

const fileSchema = new Schema({
  _id: {
    type: Types.ObjectId,
    required: true,
  },
  filename: {
    type: String,
    required: true,
    trim: true,
  },
  path: {
    type: String,
    required: true,
    trim: true,
  },
  mimetype: {
    type: String,
    required: true,
    trim: true,
  },
  encoding: {
    type: String,
    required: true,
    trim: true,
  },
  object: {
    type: String,
    required: true,
    trim: true,
  },
  objectId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
})

export default model<FileDocument>('File', fileSchema)
