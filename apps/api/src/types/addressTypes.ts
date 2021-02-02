import { Document, Types } from 'mongoose'
import { OmitId, User } from '.'

export interface Address {
  _id: Types.ObjectId
  complement?: string
  city: string
  neighborhood: string
  number: string | number
  receiver?: string
  state: string
  street: string
  zipcode: string
  user: User | Types.ObjectId
}

export interface AddressDocument extends Address, Document {
  _id: Types.ObjectId
}

export interface AddressCreateArgs {
  data: OmitId<Address> & { user?: string }
}

export interface AddressByIdArgs {
  _id: string
}

export interface AddressUpdateArgs extends AddressCreateArgs, AddressByIdArgs {}
