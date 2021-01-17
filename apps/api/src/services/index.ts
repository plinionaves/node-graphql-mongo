import { UploadService } from './UploadService'
import { makePaymentsService } from '../factories'

const paymentsService = makePaymentsService()
const uploadService = new UploadService()

export { paymentsService, uploadService }
