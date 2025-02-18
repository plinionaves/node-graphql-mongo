import { Types } from 'mongoose'
import { Models, UserRole } from '.'

export interface FindDocumentOptions {
  model: keyof Models
  db: Models
  field?: string
  value?: any
  message?: string
  populate?: string[]
  where?: Record<string, any>
  errorCode?: string
  extensions?: Record<string, any>
  select?: string
  sort?: string
}

export interface TokenPayload {
  sub: Types.ObjectId
  role: UserRole
}

export interface PaginationArgs {
  skip: number
  limit: number
  orderBy: string[]
  where: Record<string, any>
}

export interface GetFieldsOptions {
  include?: string[]
  skip?: string[]
}
