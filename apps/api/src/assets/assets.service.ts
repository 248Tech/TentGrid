import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { StorageService } from "../storage/storage.service";
import { AuditService } from "../audit/audit.service";

@Injectable()
export class AssetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly audit: AuditService,
  ) {}

  async initiateUpload(teamId: string, userId: string, params: {
    type: string;
    originalFilename: string;
    mimeType: string;
    byteSize?: number;
  }) {
    const objectKey = `teams/${teamId}/assets/${Date.now()}-${params.originalFilename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const bucket = process.env["S3_BUCKET_NAME"] ?? "eventgrid-assets";

    const asset = await this.prisma.asset.create({
      data: {
        teamId,
        type: params.type as any,
        status: "UPLOADING",
        storageProvider: "s3",
        bucket,
        objectKey,
        originalFilename: params.originalFilename,
        mimeType: params.mimeType,
        byteSize: params.byteSize ? BigInt(params.byteSize) : undefined,
        createdByUserId: userId,
      },
    });

    const uploadUrl = await this.storage.getPresignedUploadUrl(bucket, objectKey, params.mimeType);

    return { asset, uploadUrl };
  }

  async markReady(teamId: string, id: string) {
    const asset = await this.prisma.asset.findFirst({ where: { id, teamId } });
    if (!asset) throw new NotFoundException("Asset not found");

    return this.prisma.asset.update({
      where: { id },
      data: { status: "READY" },
    });
  }

  async list(teamId: string, type?: string) {
    return this.prisma.asset.findMany({
      where: { teamId, deletedAt: null, ...(type ? { type: type as any } : {}) },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  async getDownloadUrl(teamId: string, id: string) {
    const asset = await this.prisma.asset.findFirst({ where: { id, teamId, deletedAt: null } });
    if (!asset) throw new NotFoundException("Asset not found");

    const url = await this.storage.getPresignedDownloadUrl(asset.bucket, asset.objectKey);
    return { url, asset };
  }
}
