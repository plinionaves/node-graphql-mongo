import { Document, Types } from 'mongoose'
import { Address } from '.'

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export interface User {
  _id: Types.ObjectId
  birthday: Date
  cpf: string
  phones: string[]
  name: string
  email: string
  password: string
  role: UserRole
  addresses: Address[]
}

export interface UserDocument extends User, Document {
  _id: Types.ObjectId
}

interface UserSignInInput {
  email: string
  password: string
}

export interface UserSignUpArgs {
  data: UserSignInInput & {
    birthday: string
    cpf: string
    phones: string[]
    name: string
  }
}

export interface UserSignInArgs {
  data: UserSignInInput
}

export interface AuthUser {
  _id: Types.ObjectId
  role: UserRole
}
