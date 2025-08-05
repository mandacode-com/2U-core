import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Config } from 'src/common/schemas/config.schema';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StorageService {
  private storagePath: string;

  constructor(private readonly config: ConfigService<Config, true>) {
    this.storagePath = this.config.get<Config['storage']>('storage').path;
  }

  /**
   * Uploads a file to the specified destination with the given filename.
   * @param file - The file to upload, typically provided by Multer.
   * @param destination - The directory within the storage path where the file should be saved.
   * @param filename - The name of the file to save.
   * @return The full path of the uploaded file.
   **/
  async uploadFile(
    file: Express.Multer.File,
    destination: string,
    filename: string,
  ): Promise<void> {
    const fullPath = path.join(this.storagePath, destination, filename);
    const dir = path.dirname(fullPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    await fs.promises.writeFile(fullPath, file.buffer);

    if (!fs.existsSync(fullPath)) {
      throw new InternalServerErrorException(
        `Failed to upload file: ${fullPath} does not exist after writing`,
      );
    }
  }

  /**
   * Downloads a file from the specified destination with the given filename.
   * @param destination - The directory within the storage path where the file is located.
   * @param filename - The name of the file to download.
   * @return A readable stream of the file.
   **/
  downloadFile(destination: string, filename: string): fs.ReadStream {
    const fullPath = path.join(this.storagePath, destination, filename);
    if (!fs.existsSync(fullPath)) {
      throw new NotFoundException(`File not found: ${fullPath}`);
    }
    const stream = fs.createReadStream(fullPath);
    stream.on('error', () => {
      throw new InternalServerErrorException(
        `Failed to read file: ${fullPath}`,
      );
    });
    return stream;
  }
}
