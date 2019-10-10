import DataLoader from 'dataloader'
import { Document, Types } from 'mongoose'
import { models as db } from '../models'
import { DataLoaders, DataLoaderParam, Models } from '../types'

const createLoaders = (modelsNames: (keyof Models)[]): DataLoaders =>
  modelsNames.reduce(
    (loaders, modelName) => {
      const loaderName = `${modelName.toLowerCase()}Loader` // userLoader
      return {
        ...loaders,
        [loaderName]: new DataLoader<DataLoaderParam, Document>(
          (params): Promise<Document[]> => batchLoadFn(db[modelName], params),
          {
            cacheKeyFn: (param: DataLoaderParam): Types.ObjectId => param.key,
          },
        ),
      }
    },
    {} as DataLoaders,
  )

export { createLoaders }
