import { BadRequestException } from '@nestjs/common';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface.js';
import type { UploadedFileInterface } from '../interfaces/uploaded-file.interface.js';

const IMAGE_MIME = /^image\/(jpe?g|png|webp)$/;

export const imageFileFilter = (
  _req: unknown,
  file: UploadedFileInterface,
  callback: (error: Error | null, accept: boolean) => void,
) => {
  if (!IMAGE_MIME.test(file.mimetype) || !/\.(jpe?g|png|webp)$/i.test(file.originalname))
    return callback(new BadRequestException('apenas imagens jpg, png ou webp'), false);
  callback(null, true);
};

export const imageOptions: MulterOptions = {
  limits: { files: 20, fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: imageFileFilter,
};
