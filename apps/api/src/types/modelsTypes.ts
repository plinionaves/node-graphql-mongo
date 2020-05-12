import { Model } from 'mongoose'
import { FileDocument, OrderDocument, ProductDocument, UserDocument } from '.'

export interface Models {
  File: Model<FileDocument>
  Order: Model<OrderDocument>
  Product: Model<ProductDocument>
  User: Model<UserDocument>
}
