import fs from 'fs'
import { resolve } from 'path'
import { promisify } from 'util'
import { FileUpload } from 'graphql-upload'
import { Types } from 'mongoose'
import aws from 'aws-sdk'
import mkdirpCb from 'mkdirp'
import sharp from 'sharp'

import { File, FileData } from '../types'

const exists = promisify(fs.access)
const mkdirp = promisify(mkdirpCb)
const {
  NODE_ENV,
  DO_SPACES_ACCESS_KEY,
  DO_SPACES_BUCKET,
  DO_SPACES_ENDPOINT,
  DO_SPACES_SECRET_KEY,
} = process.env

export class UploadService {
  private isProduction: boolean
  private S3: aws.S3
  private uploadDir: string

  constructor() {
    this.init()
  }

  private init(): void {
    this.isProduction = NODE_ENV === 'production'

    if (this.isProduction) {
      this.S3 = new aws.S3({
        accessKeyId: DO_SPACES_ACCESS_KEY,
        secretAccessKey: DO_SPACES_SECRET_KEY,
        endpoint: DO_SPACES_ENDPOINT,
      })
    } else {
      this.createUploadDir()
    }
  }

  private async createUploadDir(): Promise<void> {
    this.uploadDir = resolve(__dirname, '..', '..', 'tmp', 'uploads')

    try {
      await exists(this.uploadDir)
    } catch (error) {
      await mkdirp(this.uploadDir)
    }
  }

  async processUpload(upload: Promise<FileUpload>): Promise<File> {
    const {
      createReadStream,
      encoding,
      mimetype,
      filename: originalname,
    } = await upload

    const _id = new Types.ObjectId()
    const filename = `${_id}-${originalname}`
    const resize = sharp().resize(400, 400)
    const format = mimetype.includes('png') ? resize.png() : resize.jpeg()
    const stream = createReadStream().pipe(format)
    const path = `static/${filename}`

    const fileData = {
      _id,
      filename,
      encoding,
      mimetype,
      path,
      stream,
    }

    return this.isProduction
      ? this.processUploadProduction(fileData)
      : this.processUploadDevelopment(fileData)
  }

  private processUploadDevelopment(fileData: FileData): Promise<File> {
    const { filename, path, stream, ...rest } = fileData

    const fullPath = `${this.uploadDir}/${filename}`

    return new Promise((resolve, reject): void => {
      stream
        .pipe(fs.createWriteStream(fullPath))
        .on('finish', () => resolve({ ...rest, filename, path }))
        .on('error', reject)
    })
  }

  private async processUploadProduction(fileData: FileData): Promise<File> {
    const { _id, encoding, filename, mimetype, path, stream } = fileData

    const S3Upload = await this.S3.upload({
      ACL: 'public-read',
      Bucket: DO_SPACES_BUCKET,
      Key: path,
      Body: stream,
      ContentType: mimetype,
      ContentEncoding: encoding,
    }).promise()

    return {
      _id,
      encoding,
      filename,
      mimetype,
      path,
      url: S3Upload.Location,
    }
  }
}
