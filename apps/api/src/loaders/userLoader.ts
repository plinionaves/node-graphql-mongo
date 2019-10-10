import DataLoader from 'dataloader'

const userLoader = new DataLoader(ids => {
  console.log('DataLoader')
  console.log('Ids: ', ids)
  return Promise.resolve(ids.map(id => {}))
})

export { userLoader }
