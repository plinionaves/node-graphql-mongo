import { Schema, model } from 'mongoose'
import { UserDocument } from '../types'

const userSchema = new Schema({
  birthday: {
    type: Date,
    required: true,
  },
  cpf: {
    type: String,
    required: true,
    trim: true,
  },
  phones: {
    type: [String],
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['USER', 'ADMIN'],
    default: 'USER',
  },
})

export default model<UserDocument>('User', userSchema)
