export type ArchitectureContractType =
  | "rest"
  | "graphql"
  | "event"
  | "function"
  | "shared-library"
  | "snapshot";

export interface ArchitectureContract {
  id: string;
  name: string;
  type: ArchitectureContractType;
  providerId: string;
  consumerIds: string[];
  description?: string;
  version?: string;
}
