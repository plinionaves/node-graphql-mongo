import { Schema, model } from 'mongoose'
import { AddressDocument } from '../types'

const addressSchema = new Schema({
  complement: {
    type: String,
    trim: true,
  },
  city: {
    type: String,
    trim: true,
    required: true,
  },
  neighborhood: {
    type: String,
    trim: true,
    required: true,
  },
  number: {
    type: Number,
    trim: true,
    required: true,
  },
  receiver: {
    type: String,
    trim: true,
    required: true,
  },
  state: {
    type: String,
    trim: true,
    required: true,
  },
  street: {
    type: String,
    trim: true,
    required: true,
  },
  zipcode: {
    type: String,
    trim: true,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
})

export default model<AddressDocument>('Address', addressSchema)
