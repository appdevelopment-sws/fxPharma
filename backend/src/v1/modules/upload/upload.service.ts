import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type PresignedUrlInput = {
  fileName?: string;
  fileType?: string;
};

export class UploadService {
  async generatePresignedUrl({ fileName, fileType }: PresignedUrlInput) {
    if (!fileName || !fileType) {
      throw new Error("File name and file type are required");
    }

    const accountId = process.env.R2_ACCOUNT_ID;
    const bucketName = process.env.R2_BUCKET_NAME || "parkpal-media";
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const publicDomain =
      process.env.R2_PUBLIC_DOMAIN || "https://pub-mockid.r2.dev";

    const uniqueId = crypto.randomUUID();
    const extension = path.extname(fileName).replace(".", "") || "jpg";
    const safeName = `${uniqueId}.${extension}`;
    const r2Key = `images/${safeName}`;
    const expiresIn = 3600;

    if (accountId && accessKeyId && secretAccessKey) {
      const s3Client = new S3Client({
        region: "auto",
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });

      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: r2Key,
        ContentType: fileType,
      });

      const presignedUrl = await getSignedUrl(s3Client, command, {
        expiresIn,
      });
      const publicUrl = `${publicDomain}/${r2Key}`;

      return {
        presignedUrl,
        publicUrl,
        expiresIn,
        key: r2Key,
      };
    }

    const r2Endpoint = `https://${accountId || "mock-account"}.r2.cloudflarestorage.com/${bucketName}/${r2Key}`;
    const presignedUrl = `${r2Endpoint}?AWSAccessKeyId=MOCK_R2_KEY&Expires=${expiresIn}&Signature=MOCK_R2_SIG`;
    const publicUrl = `${publicDomain}/${r2Key}`;

    return {
      presignedUrl,
      publicUrl,
      expiresIn,
      key: r2Key,
    };
  }

  async uploadLocalFile(file: Express.Multer.File) {
    const fileName = `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
    const uploadDir = path.join(process.cwd(), "src/uploads");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const uploadPath = path.join(uploadDir, fileName);
    fs.writeFileSync(uploadPath, file.buffer);

    const fileUrl = `/uploads/${fileName}`;

    return {
      url: fileUrl,
      path: fileUrl,
      fileName,
    };
  }
}

export const uploadService = new UploadService();
