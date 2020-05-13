import { FileUpload } from 'graphql-upload'
import { Document, Types } from 'mongoose'
import { Sharp } from 'sharp'

import { Models } from './modelsTypes'

export interface File {
  _id: Types.ObjectId
  filename: string
  path: string
  mimetype: string
  encoding: string
  url?: string
  object?: keyof Models
  objectId?: Types.ObjectId
}

export interface FileDocument extends File, Document {
  _id: Types.ObjectId
}

export interface FileData extends Omit<File, 'url'> {
  stream: Sharp
}

export interface UploadCreateInput {
  file: Promise<FileUpload>
  object: keyof Models
  objectId: string
}

export interface UploadCreateArgs {
  data: UploadCreateInput
}
