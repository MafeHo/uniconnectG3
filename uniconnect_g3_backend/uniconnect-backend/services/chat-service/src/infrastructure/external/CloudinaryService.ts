import { v2 as cloudinary, UploadApiOptions } from 'cloudinary';
// @ts-ignore
import streamifier from 'streamifier';

import { MulterFile } from '../../application/validations/BaseHandler';

export interface CloudinaryConfig {
  cloudName?: string;
  apiKey?: string;
  apiSecret?: string;
}

export interface UploadedFileResult {
  fileName: string;
  fileUrl: string;
}

export class CloudinaryService {
  constructor(config: CloudinaryConfig) {
    cloudinary.config({
      cloud_name: config.cloudName,
      api_key: config.apiKey,
      api_secret: config.apiSecret
    });
  }

  async uploadFile(file: MulterFile): Promise<UploadedFileResult> {
    return new Promise((resolve, reject) => {
      const extension = file.originalname.includes('.')
        ? file.originalname.split('.').pop()?.toLowerCase() || ''
        : '';
      const isRaw = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'zip', 'rar'].includes(extension);
      
      const safeName = file.originalname
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9]/g, "_");
      
      const uploadOptions: UploadApiOptions = {
        folder: 'uniconnect_chats',
        resource_type: isRaw ? 'raw' : 'auto',
        public_id: `archivo_${Date.now()}_${safeName}${isRaw && extension ? '.' + extension : ''}`
      };

      if (!isRaw && extension) {
        uploadOptions.format = extension;
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error('Error en Cloudinary:', error);
            reject(new Error('Error al subir a Cloudinary'));
          } else if (result) {
            resolve({
              fileName: file.originalname,
              fileUrl: result.secure_url
            });
          } else {
            reject(new Error('Unknown error uploading to Cloudinary'));
          }
        }
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }
}
