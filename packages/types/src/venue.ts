export type VenuePoint = { x: number; y: number };

export type VenueBoundary = {
  points: VenuePoint[];
  unit: "FT" | "IN" | "M";
};

export type VenueObstacle = {
  id: string;
  label: string;
  points: VenuePoint[];
  unit: "FT" | "IN" | "M";
};

export type VenueEntrance = {
  id: string;
  label: string;
  point: VenuePoint;
  direction?: number;
};

export type VenueLoadingZone = {
  id: string;
  label: string;
  points: VenuePoint[];
};

export type VenueGeometry = {
  boundary?: VenueBoundary;
  obstacles?: VenueObstacle[];
  entrances?: VenueEntrance[];
  exits?: VenueEntrance[];
  loadingZones?: VenueLoadingZone[];
};

export type VenueFixture = {
  id: string;
  label: string;
  type: string;
  point: VenuePoint;
  notes?: string;
};

export type VenueFixtures = {
  items: VenueFixture[];
};

export type VenueUtility = {
  id: string;
  label: string;
  type: "POWER" | "WATER" | "LOADING" | "SERVICE" | "OTHER";
  point: VenuePoint;
  notes?: string;
};

export type VenueUtilities = {
  items: VenueUtility[];
};
