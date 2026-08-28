export type ArchitectureLevel = "system" | "hld" | "lld";

export type ArchitectureArea =
  | "frontend"
  | "backend"
  | "data"
  | "infrastructure"
  | "external";

export type ArchitectureElementKind =
  | "system"
  | "application"
  | "microfrontend"
  | "service"
  | "module"
  | "component"
  | "api"
  | "contract"
  | "datastore"
  | "queue"
  | "state"
  | "external-system"
  | "infrastructure";

export interface ArchitectureElement {
  id: string;
  name: string;
  kind: ArchitectureElementKind;
  area: ArchitectureArea;
  level: ArchitectureLevel;
  parentId?: string;
  description?: string;
  technology?: string;
  owner?: string;
  deploymentUnit?: string;
  metadata?: Record<string, unknown>;
}
