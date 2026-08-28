export interface CommerceHistoryEntry {
  version: string;
  description: string;
}

export const commerceHistory: CommerceHistoryEntry[] = [
  { version: "v1.20", description: "Checkout extracted from monolith" },
  { version: "v1.28", description: "Checkout deployment separated" },
  { version: "v1.31", description: "Pricing moved to Product API" },
  { version: "v1.35", description: "Current production architecture" },
];

export const commerceFixtureMetadata = {
  displayVersion: "1.35",
  history: commerceHistory,
} as const;
