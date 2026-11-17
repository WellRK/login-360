import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { imageOptions } from '../filters/image-file.filter.js';

/** Campo multipart "files" (até 20 imagens de 5MB). Use com @UploadedFiles(). */
export function UploadFiles() {
  return applyDecorators(
    UseInterceptors(FilesInterceptor('files', 20, imageOptions)),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: { files: { type: 'array', items: { type: 'string', format: 'binary' } } },
      },
    }),
  );
}
