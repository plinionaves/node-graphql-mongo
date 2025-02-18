import { Schema, model } from 'mongoose'
import { ProductDocument } from '../types'

const productSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  photos: [
    {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'File',
    },
  ],
  price: {
    type: Number,
    required: true,
  },
  unit: {
    type: String,
    enum: ['UN', 'LT', 'GR', 'KG'],
    required: true,
  },
})

export default model<ProductDocument>('Product', productSchema)
