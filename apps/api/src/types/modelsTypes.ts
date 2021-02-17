import { Model } from 'mongoose'
import {
  AddressDocument,
  CardDocument,
  FileDocument,
  OrderDocument,
  PaymentDocument,
  ProductDocument,
  UserDocument,
} from '.'

export interface Models {
  Address: Model<AddressDocument>
  Card: Model<CardDocument>
  File: Model<FileDocument>
  Order: Model<OrderDocument>
  Payment: Model<PaymentDocument>
  Product: Model<ProductDocument>
  User: Model<UserDocument>
}
