import { Injectable } from "@nestjs/common";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { pinoLogger } from "../common/logger";

@Injectable()
export class StorageService {
  private readonly s3: S3Client;
  private readonly logger = pinoLogger.child({ context: "StorageService" });

  constructor() {
    const endpoint = process.env["S3_ENDPOINT_URL"];
    this.s3 = new S3Client({
      region: process.env["AWS_REGION"] ?? "us-east-1",
      ...(endpoint ? { endpoint, forcePathStyle: true } : {}),
      credentials: process.env["AWS_ACCESS_KEY_ID"]
        ? {
            accessKeyId: process.env["AWS_ACCESS_KEY_ID"]!,
            secretAccessKey: process.env["AWS_SECRET_ACCESS_KEY"]!,
          }
        : undefined,
    });
  }

  async getPresignedUploadUrl(bucket: string, key: string, contentType: string, expiresIn = 3600): Promise<string> {
    const command = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType });
    const url = await getSignedUrl(this.s3, command, { expiresIn });
    this.logger.debug({ bucket, key }, "Generated presigned upload URL");
    return url;
  }

  async getPresignedDownloadUrl(bucket: string, key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    return getSignedUrl(this.s3, command, { expiresIn });
  }

  getClient(): S3Client {
    return this.s3;
  }
}
