import fs from 'fs'
import { resolve } from 'path'
import { promisify } from 'util'
import { FileUpload } from 'graphql-upload'
import { Types } from 'mongoose'
import mkdirpCb from 'mkdirp'
import sharp from 'sharp'

import { File, FileData } from '../types'

const exists = promisify(fs.access)
const mkdirp = promisify(mkdirpCb)
const { CDN_ENDPOINT } = process.env

export class UploadService {
  private uploadDir: string

  constructor() {
    this.init()
  }

  private init(): void {
    this.createUploadDir()
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

    return this.processUploadDevelopment(fileData)
  }

  private processUploadDevelopment(fileData: FileData): Promise<File> {
    const { filename, path, stream, ...rest } = fileData

    const url = `${CDN_ENDPOINT}/${path}`
    const fullPath = `${this.uploadDir}/${filename}`

    return new Promise((resolve, reject): void => {
      stream
        .pipe(fs.createWriteStream(fullPath))
        .on('finish', () => resolve({ ...rest, filename, url, path }))
        .on('error', reject)
    })
  }
}
