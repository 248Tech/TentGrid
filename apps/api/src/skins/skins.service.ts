import { Injectable, NotFoundException, OnModuleInit, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SYSTEM_MATERIAL_PRESETS } from "./material-presets.data";

@Injectable()
export class SkinsService implements OnModuleInit {
  private readonly logger = new Logger(SkinsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedSystemPresets();
  }

  private async seedSystemPresets() {
    for (const preset of SYSTEM_MATERIAL_PRESETS) {
      const existing = await this.prisma.materialPreset.findFirst({
        where: { isSystem: true, name: preset.name },
      });
      if (!existing) {
        await this.prisma.materialPreset.create({
          data: {
            isSystem: true,
            name: preset.name,
            category: preset.category,
            objectTypes: preset.objectTypes,
            styleConfig: preset.styleConfig,
            isActive: true,
          },
        });
      }
    }
    this.logger.log("System material presets seeded");
  }

  async listPresets(teamId?: string, category?: string) {
    return this.prisma.materialPreset.findMany({
      where: {
        isActive: true,
        ...(category ? { category } : {}),
        OR: [{ isSystem: true }, ...(teamId ? [{ teamId }] : [])],
      },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });
  }

  async getPreset(id: string) {
    const preset = await this.prisma.materialPreset.findUnique({ where: { id } });
    if (!preset) throw new NotFoundException("Material preset not found");
    return preset;
  }

  async createCustomPreset(teamId: string, data: {
    name: string;
    category: string;
    objectTypes: string[];
    styleConfig: Record<string, unknown>;
  }) {
    return this.prisma.materialPreset.create({
      data: {
        teamId,
        isSystem: false,
        name: data.name,
        category: data.category,
        objectTypes: data.objectTypes,
        styleConfig: data.styleConfig as any,
        isActive: true,
      },
    });
  }
}
