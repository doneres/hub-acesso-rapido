export type Category =
  | 'todos'
  | 'favoritos'
  | 'jogos-design'
  | 'programacao'
  | 'educacao-logica'
  | 'pratica-desafios'
  | 'dados'
  | 'ia'
  | 'ferramentas'
  | 'frameworks'
  | 'apis-publicas';

export type DifficultyLevel = 'Iniciante' | 'Intermediário' | 'Avançado';

export interface ToolTooltip {
  desc: string;
  usage: string;
  when: string;
  level: DifficultyLevel;
}

export interface PinnedConfig {
  accentColor: string;
  gradientFrom: string;
  badgeText?: string;
}

export interface Tool {
  id: string;
  name: string;
  url: string;
  category: Exclude<Category, 'todos' | 'favoritos'>;
  iconUrl: string;
  iconBg: string;
  pinned?: PinnedConfig;
  tooltip: ToolTooltip;
}

export interface CategoryConfig {
  id: Category;
  label: string;
  emoji: string;
  activeColor: string;
}

export interface TooltipState {
  visible: boolean;
  tool: Tool | null;
  x: number;
  y: number;
}
