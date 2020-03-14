import { FileUpload } from 'graphql-upload'

export interface UploadCreateInput {
  file: FileUpload
}

export interface UploadCreateArgs {
  data: UploadCreateInput
}
