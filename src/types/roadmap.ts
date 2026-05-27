export type RoadmapCategory = 'desenvolvimento' | 'jogos' | 'infra' | 'ia-dados';

export type ResourceType = 'free' | 'paid';

export type StepLevel = 'Iniciante' | 'Intermediário' | 'Avançado';

export interface Resource {
  title: string;
  url: string;
  type: ResourceType;
  platform: string;
}

export interface Technology {
  name: string;
  description: string;
  resources: Resource[];
}

export interface RoadmapStep {
  id: string;
  order: number;
  title: string;
  description: string;
  level: StepLevel;
  techs: Technology[];
}

export interface Roadmap {
  id: string;
  title: string;
  shortTitle: string;
  icon: string; // Lucide icon name
  description: string;
  longDescription: string;
  category: RoadmapCategory;
  color: string;
  estimatedTime: string;
  difficulty: StepLevel;
  steps: RoadmapStep[];
  tags: string[];
}

export interface RoadmapCategoryConfig {
  id: RoadmapCategory | 'todos';
  label: string;
  icon: string; // Lucide icon name
  color: string;
  description: string;
}
