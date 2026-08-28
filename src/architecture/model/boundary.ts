export type ArchitectureBoundaryType = "domain" | "team" | "deployment" | "security";

export interface ArchitectureBoundary {
  id: string;
  name: string;
  type: ArchitectureBoundaryType;
  elementIds: string[];
}
