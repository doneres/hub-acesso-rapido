export type Category =
  | 'todos'
  | 'favoritos'
  | 'recentes'
  | 'populares'
  | 'novos'
  | 'jogos-design'
  | 'programacao'
  | 'educacao-logica'
  | 'pratica-desafios'
  | 'dados'
  | 'ia'
  | 'ferramentas'
  | 'frameworks'
  | 'apis-publicas'
  | 'devops'
  | 'design-prototipacao'
  | 'bancos-dados'
  | 'testes'
  | 'seguranca'
  | 'competicao-codigo'
  | 'hackathons'
  | 'noticias'
  | 'robotica';

export type DifficultyLevel = 'Iniciante' | 'Intermediário' | 'Avançado';

export type SortOption = 'default' | 'az' | 'za' | 'level-asc' | 'level-desc';

export type ViewMode = 'grid' | 'list';

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
  category: Exclude<Category, 'todos' | 'favoritos' | 'recentes' | 'populares' | 'novos'>;
  iconUrl: string;
  iconBg: string;
  isNew?: boolean;
  pinned?: PinnedConfig;
  tooltip: ToolTooltip;
}

export interface CategoryConfig {
  id: Category;
  label: string;
  emoji?: string; // mantido para compatibilidade; ícone SVG é usado em vez dele
  activeColor: string;
}

export interface TooltipState {
  visible: boolean;
  tool: Tool | null;
  x: number;
  y: number;
}
