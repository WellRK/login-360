/** Subconjunto do arquivo do multer (evita depender de @types/multer). */
export interface UploadedFileInterface {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}
