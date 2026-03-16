import { PrismaClient, TeamRole } from "@prisma/client";

const prisma = new PrismaClient();

type ObjectType =
  | "TENT" | "TABLE" | "CHAIR" | "STAGE" | "DANCE_FLOOR" | "BAR"
  | "RESTROOM" | "LOUNGE" | "FENCE" | "SHAPE" | "TEXT" | "MEASUREMENT";

async function upsertLibraryObject(obj: {
  type: ObjectType;
  subtype: string;
  displayName: string;
  defaultDimensions: { width: number; depth: number; unit: string };
  capacityRules?: { seats: number };
  geometryPreset?: Record<string, unknown>;
  styleDefaults?: Record<string, unknown>;
}) {
  const existing = await prisma.libraryObjectDefinition.findFirst({
    where: { isSystem: true, type: obj.type, subtype: obj.subtype },
    select: { id: true },
  });
  if (existing) return;
  await prisma.libraryObjectDefinition.create({
    data: {
      isSystem: true,
      type: obj.type,
      subtype: obj.subtype,
      displayName: obj.displayName,
      defaultDimensions: obj.defaultDimensions as any,
      capacityRules: (obj.capacityRules ?? undefined) as any,
      geometryPreset: (obj.geometryPreset ?? undefined) as any,
      styleDefaults: (obj.styleDefaults ?? undefined) as any,
      isActive: true,
    },
  });
}

async function main() {
  console.log("🌱 Seeding database...");

  // ── Demo team ────────────────────────────────────────────────────────────────
  const team = await prisma.team.upsert({
    where: { slug: "demo-team" },
    update: {},
    create: {
      name: "Demo Team",
      slug: "demo-team",
      settings: { features: { exportEnabled: true } },
    },
  });

  // ── Users ────────────────────────────────────────────────────────────────────
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@eventgrid.dev" },
    update: {},
    create: {
      email: "admin@eventgrid.dev",
      fullName: "Admin User",
      authProvider: "credentials",
      authSubject: "admin@eventgrid.dev",
    },
  });

  await prisma.teamMembership.upsert({
    where: { teamId_userId: { teamId: team.id, userId: adminUser.id } },
    update: {},
    create: {
      teamId: team.id,
      userId: adminUser.id,
      role: TeamRole.ADMIN,
      joinedAt: new Date(),
    },
  });

  const salesUser = await prisma.user.upsert({
    where: { email: "sales@eventgrid.dev" },
    update: {},
    create: {
      email: "sales@eventgrid.dev",
      fullName: "Sales Rep",
      authProvider: "credentials",
      authSubject: "sales@eventgrid.dev",
    },
  });

  await prisma.teamMembership.upsert({
    where: { teamId_userId: { teamId: team.id, userId: salesUser.id } },
    update: {},
    create: {
      teamId: team.id,
      userId: salesUser.id,
      role: TeamRole.SALES,
      joinedAt: new Date(),
    },
  });

  // ── Library objects ──────────────────────────────────────────────────────────

  // TENT
  await upsertLibraryObject({ type: "TENT", subtype: "STANDARD_RECTANGLE", displayName: "Rectangle Tent", defaultDimensions: { width: 40, depth: 60, unit: "FT" } });
  await upsertLibraryObject({ type: "TENT", subtype: "STANDARD_SQUARE", displayName: "Square Tent", defaultDimensions: { width: 40, depth: 40, unit: "FT" } });
  await upsertLibraryObject({ type: "TENT", subtype: "STANDARD_OVAL", displayName: "Oval Tent (40x30)", defaultDimensions: { width: 40, depth: 30, unit: "FT" }, geometryPreset: { shape: "OVAL" } });
  await upsertLibraryObject({ type: "TENT", subtype: "STANDARD_POLYGON", displayName: "Polygon Tent (40x40)", defaultDimensions: { width: 40, depth: 40, unit: "FT" }, geometryPreset: { shape: "POLYGON", sides: 6 } });

  // TABLE
  await upsertLibraryObject({ type: "TABLE", subtype: "ROUND_60", displayName: '60" Round Table', defaultDimensions: { width: 5, depth: 5, unit: "FT" }, capacityRules: { seats: 8 } });
  await upsertLibraryObject({ type: "TABLE", subtype: "BANQUET_8FT", displayName: "8ft Banquet Table", defaultDimensions: { width: 8, depth: 2.5, unit: "FT" }, capacityRules: { seats: 8 } });
  await upsertLibraryObject({ type: "TABLE", subtype: "ROUND_48", displayName: '48" Round Table', defaultDimensions: { width: 4, depth: 4, unit: "FT" }, capacityRules: { seats: 6 } });
  await upsertLibraryObject({ type: "TABLE", subtype: "COCKTAIL_30", displayName: '30" Cocktail Table', defaultDimensions: { width: 2.5, depth: 2.5, unit: "FT" }, capacityRules: { seats: 0 } });
  await upsertLibraryObject({ type: "TABLE", subtype: "FARM_8FT", displayName: "8ft Farm Table", defaultDimensions: { width: 8, depth: 2.5, unit: "FT" }, capacityRules: { seats: 8 } });

  // CHAIR
  await upsertLibraryObject({ type: "CHAIR", subtype: "STANDARD", displayName: "Standard Chair", defaultDimensions: { width: 1.5, depth: 1.5, unit: "FT" }, capacityRules: { seats: 1 } });
  await upsertLibraryObject({ type: "CHAIR", subtype: "CHIAVARI", displayName: "Chiavari Chair", defaultDimensions: { width: 1.5, depth: 1.5, unit: "FT" }, capacityRules: { seats: 1 } });
  await upsertLibraryObject({ type: "CHAIR", subtype: "FOLDING", displayName: "Folding Chair", defaultDimensions: { width: 1.5, depth: 1.5, unit: "FT" }, capacityRules: { seats: 1 } });

  // STAGE
  await upsertLibraryObject({ type: "STAGE", subtype: "STANDARD", displayName: "Stage Section", defaultDimensions: { width: 8, depth: 4, unit: "FT" } });
  await upsertLibraryObject({ type: "STAGE", subtype: "RAISED_SECTION", displayName: "Raised Stage Section", defaultDimensions: { width: 8, depth: 4, unit: "FT" } });

  // DANCE_FLOOR
  await upsertLibraryObject({ type: "DANCE_FLOOR", subtype: "STANDARD", displayName: "Dance Floor", defaultDimensions: { width: 20, depth: 20, unit: "FT" } });
  await upsertLibraryObject({ type: "DANCE_FLOOR", subtype: "WOOD_PARQUET", displayName: "Wood Parquet Floor", defaultDimensions: { width: 20, depth: 20, unit: "FT" } });

  // BAR
  await upsertLibraryObject({ type: "BAR", subtype: "STANDARD", displayName: "Bar Station", defaultDimensions: { width: 8, depth: 2, unit: "FT" } });
  await upsertLibraryObject({ type: "BAR", subtype: "FULL_BAR", displayName: "Full Bar", defaultDimensions: { width: 12, depth: 3, unit: "FT" } });
  await upsertLibraryObject({ type: "BAR", subtype: "COCKTAIL_BAR", displayName: "Cocktail Bar", defaultDimensions: { width: 6, depth: 2, unit: "FT" } });

  // RESTROOM
  await upsertLibraryObject({ type: "RESTROOM", subtype: "STANDARD_UNIT", displayName: "Standard Restroom Unit", defaultDimensions: { width: 4, depth: 8, unit: "FT" } });
  await upsertLibraryObject({ type: "RESTROOM", subtype: "VIP_TRAILER", displayName: "VIP Restroom Trailer", defaultDimensions: { width: 8, depth: 20, unit: "FT" } });

  // LOUNGE
  await upsertLibraryObject({ type: "LOUNGE", subtype: "SOFA", displayName: "Sofa", defaultDimensions: { width: 7, depth: 3, unit: "FT" } });
  await upsertLibraryObject({ type: "LOUNGE", subtype: "LOUNGE_CHAIR", displayName: "Lounge Chair", defaultDimensions: { width: 3, depth: 3, unit: "FT" } });
  await upsertLibraryObject({ type: "LOUNGE", subtype: "COFFEE_TABLE", displayName: "Coffee Table", defaultDimensions: { width: 4, depth: 2, unit: "FT" } });
  await upsertLibraryObject({ type: "LOUNGE", subtype: "OTTOMAN", displayName: "Ottoman", defaultDimensions: { width: 3, depth: 3, unit: "FT" } });

  // FENCE
  await upsertLibraryObject({ type: "FENCE", subtype: "STANDARD_PANEL", displayName: "Standard Fence Panel", defaultDimensions: { width: 8, depth: 4, unit: "FT" } });
  await upsertLibraryObject({ type: "FENCE", subtype: "CROWD_BARRIER", displayName: "Crowd Barrier", defaultDimensions: { width: 6, depth: 2, unit: "FT" } });

  // SHAPE
  await upsertLibraryObject({ type: "SHAPE", subtype: "RECTANGLE", displayName: "Rectangle", defaultDimensions: { width: 10, depth: 10, unit: "FT" }, geometryPreset: { shape: "RECT" } });
  await upsertLibraryObject({ type: "SHAPE", subtype: "CIRCLE", displayName: "Circle", defaultDimensions: { width: 10, depth: 10, unit: "FT" }, geometryPreset: { shape: "OVAL" } });
  await upsertLibraryObject({ type: "SHAPE", subtype: "POLYGON", displayName: "Polygon", defaultDimensions: { width: 10, depth: 10, unit: "FT" }, geometryPreset: { shape: "POLYGON" } });

  // TEXT
  await upsertLibraryObject({ type: "TEXT", subtype: "LABEL", displayName: "Text Label", defaultDimensions: { width: 5, depth: 1, unit: "FT" } });

  // MEASUREMENT
  await upsertLibraryObject({ type: "MEASUREMENT", subtype: "RULER", displayName: "Ruler", defaultDimensions: { width: 10, depth: 0.5, unit: "FT" } });

  // ── Demo venue ───────────────────────────────────────────────────────────────
  const existingVenue = await prisma.venue.findFirst({
    where: { teamId: team.id, name: "Riverside Park" },
    select: { id: true },
  });
  if (!existingVenue) {
    await prisma.venue.create({
      data: {
        teamId: team.id,
        name: "Riverside Park",
        addressLine1: "100 Riverside Dr",
        city: "Austin",
        state: "TX",
        postalCode: "78701",
        country: "US",
        defaultBackgroundMode: "GRID",
        createdByUserId: adminUser.id,
      },
    });
  }

  console.log("✅ Seed complete");
  console.log(`   Team: ${team.slug} (${team.id})`);
  console.log(`   Admin: ${adminUser.email}`);
  console.log(`   Sales: ${salesUser.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
