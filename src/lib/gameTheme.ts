/**
 * Tema base compartilhado entre todos os mini-games.
 * Cada página pode sobrescrever apenas o que precisar.
 */
export interface GameTheme {
  bg: string;
  panel: string;
  panel2: string;
  border: string;
  text: string;
  sub: string;
}

export function gameTheme(isDark: boolean): GameTheme {
  return isDark
    ? { bg: '#060a14', panel: '#0d1117', panel2: '#161b22', border: '#30363d', text: '#e6edf3', sub: '#8b949e' }
    : { bg: '#dde4ef', panel: '#ffffff',  panel2: '#f0f4ff', border: '#d0d7de', text: '#1c2128', sub: '#57606a' };
}
