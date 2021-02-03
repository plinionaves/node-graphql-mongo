import { Model } from 'mongoose'
import {
  AddressDocument,
  FileDocument,
  OrderDocument,
  PaymentDocument,
  ProductDocument,
  UserDocument,
} from '.'

export interface Models {
  Address: Model<AddressDocument>
  File: Model<FileDocument>
  Order: Model<OrderDocument>
  Payment: Model<PaymentDocument>
  Product: Model<ProductDocument>
  User: Model<UserDocument>
}
