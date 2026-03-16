import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class LibraryService {
  constructor(private readonly prisma: PrismaService) {}

  async listSystemObjects() {
    return this.prisma.libraryObjectDefinition.findMany({
      where: { isSystem: true, isActive: true },
      orderBy: [{ type: "asc" }, { subtype: "asc" }],
    });
  }

  async listForTeam(teamId: string) {
    return this.prisma.libraryObjectDefinition.findMany({
      where: { OR: [{ isSystem: true }, { teamId }], isActive: true },
      orderBy: [{ type: "asc" }, { subtype: "asc" }],
    });
  }
}
