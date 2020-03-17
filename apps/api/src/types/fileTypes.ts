import { FileUpload } from 'graphql-upload'
import { Types } from 'mongoose'
import { ReadStream } from 'fs'

export interface File {
  _id: Types.ObjectId
  filename: string
  path: string
  mimetype: string
  encoding: string
  url: string
}

export interface FileData extends Omit<File, 'url'> {
  stream: ReadStream
}

export interface UploadCreateInput {
  file: FileUpload
}

export interface UploadCreateArgs {
  data: UploadCreateInput
}
