import { ProductCreateInput, ProductDeleteInput, Resolver } from '../types'

const createProduct: Resolver<ProductCreateInput> = (_, args, { db }) => {
  const { Product } = db
  const { data } = args
  const product = new Product(data)
  return product.save()
}

const deleteProduct: Resolver<ProductDeleteInput> = (_, args, { db }) => {
  const { Product } = db
  const { _id } = args
  return Product.findByIdAndDelete(_id)
}

export default {
  createProduct,
  deleteProduct,
}
