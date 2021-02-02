import { Model } from 'mongoose'
import {
  AddressDocument,
  FileDocument,
  OrderDocument,
  ProductDocument,
  UserDocument,
} from '.'

export interface Models {
  Address: Model<AddressDocument>
  File: Model<FileDocument>
  Order: Model<OrderDocument>
  Product: Model<ProductDocument>
  User: Model<UserDocument>
}
