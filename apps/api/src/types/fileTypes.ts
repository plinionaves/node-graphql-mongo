import { FileUpload } from 'graphql-upload'
import { Types } from 'mongoose'
import { Sharp } from 'sharp'

export interface File {
  _id: Types.ObjectId
  filename: string
  path: string
  mimetype: string
  encoding: string
  url: string
}

export interface FileData extends Omit<File, 'url'> {
  stream: Sharp
}

export interface UploadCreateInput {
  file: Promise<FileUpload>
}

export interface UploadCreateArgs {
  data: UploadCreateInput
}
