import fs from 'fs'
import { resolve } from 'path'
import { promisify } from 'util'
import mkdirpCb from 'mkdirp'

const exists = promisify(fs.access)
const mkdirp = promisify(mkdirpCb)

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
}
