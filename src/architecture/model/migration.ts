export interface MigrationStep {
  id: string;
  order: number;
  title: string;
  description: string;
  affectedElementIds: string[];
}

export interface MigrationPlan {
  id: string;
  name: string;
  steps: MigrationStep[];
}
