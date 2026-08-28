import type { ArchitectureLevel } from "./element";

export type ArchitectureViewType = "application" | "infrastructure" | "deployment" | "data-flow";

export interface ArchitectureView {
  id: string;
  name: string;
  type: ArchitectureViewType;
  level: ArchitectureLevel;
  rootElementId?: string;
  elementIds: string[];
  relationIds: string[];
}
