import { Controller, Get, Param } from "@nestjs/common";
import { LibraryService } from "./library.service";

@Controller("v1/library")
export class LibraryController {
  constructor(private readonly library: LibraryService) {}

  @Get("objects")
  listSystem() {
    return this.library.listSystemObjects();
  }

  @Get("objects/team/:teamId")
  listForTeam(@Param("teamId") teamId: string) {
    return this.library.listForTeam(teamId);
  }
}
