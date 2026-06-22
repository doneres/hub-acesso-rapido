import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft, Copy, Check, RefreshCw, Zap, Trophy, Clock,
  Lightbulb, Play, Swords, Home, Link, Gamepad2, Crown, Eye, Code2,
  Circle, Square, Palette, AlignCenter, MousePointer, User, LayoutGrid,
  RotateCw, Users, Star, X, TrendingUp, ChevronDown, ChevronUp,
  ChevronRight, Layout, type LucideIcon
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useGameState } from '../hooks/useGameState';
import { db } from '../lib/firebase';
import { ref, set, update as dbUpdate, onValue, get, runTransaction } from 'firebase/database';

/* ── Types ─────────────────────────────────────────────────────────────── */

type Category = 'basico' | 'flexbox' | 'grid' | 'animacao' | 'efeitos';
type CategoryFilter = Category | 'todos';
type PageView = 'menu' | 'setup' | 'lobby' | 'battle' | 'results';
type GameMode = 'create' | 'join' | 'solo';

interface Challenge {
  id: number;
  title: string;
  category: Category;
  Icon: LucideIcon;
  iconColor: string;
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
  points: number;
  description: string;
  hints: [string, string, string];
  htmlStructure: string;
  targetHtml: string;
  targetCss: string;
  starterCss: string;
}

interface PlayerData {
  name: string;
  scores: Record<string, number>;
  totalScore: number;
  submittedAt: number;
}

interface ScoreDetail { label: string; passed: boolean; weight: number; }
interface RoundResult { challengeIdx: number; score: number; details: ScoreDetail[]; }

/* ── Challenges ─────────────────────────────────────────────────────────── */

const CHALLENGES: Challenge[] = [
  /* ── Básico ─────────────────────────────────────────────────────── */
  {
    id: 0, title: 'Círculo Vermelho', category: 'basico', Icon: Circle, iconColor: '#ef4444',
    difficulty: 'Fácil', points: 100,
    description: 'Crie um círculo vermelho de 100×100px usando CSS puro.',
    hints: [
      'Todo círculo em CSS começa como um quadrado. Pense no que arredonda completamente os cantos de um elemento.',
      'border-radius: 50% transforma qualquer quadrado em círculo perfeito. Use background-color para a cor vermelha.',
      'Solução: background-color: #e74c3c (ou "red"); border-radius: 50%;',
    ],
    htmlStructure: '<div class="shape"></div>',
    targetHtml: '<div class="shape"></div>',
    targetCss: `.shape { width: 100px; height: 100px; background-color: #e74c3c; border-radius: 50%; }`,
    starterCss: `.shape {\n  width: 100px;\n  height: 100px;\n  background-color: /* ? */;\n  border-radius: /* ? */;\n}`,
  },
  {
    id: 1, title: 'Quadrado com Sombra', category: 'basico', Icon: Square, iconColor: '#3b82f6',
    difficulty: 'Fácil', points: 150,
    description: 'Crie um quadrado azul de 100×100px com sombra ao redor.',
    hints: [
      'Existe uma propriedade CSS específica para adicionar sombra à caixa de um elemento.',
      'box-shadow aceita 4 valores: deslocamento-X, deslocamento-Y, desfoque e cor. Ex: 6px 6px 15px rgba(0,0,0,0.4)',
      'Solução: background-color: #3498db; box-shadow: 6px 6px 15px rgba(0,0,0,0.4);',
    ],
    htmlStructure: '<div class="box"></div>',
    targetHtml: '<div class="box"></div>',
    targetCss: `.box { width: 100px; height: 100px; background-color: #3498db; box-shadow: 6px 6px 15px rgba(0,0,0,0.4); }`,
    starterCss: `.box {\n  width: 100px;\n  height: 100px;\n  background-color: /* ? */;\n  box-shadow: /* ? */;\n}`,
  },
  {
    id: 2, title: 'Gradiente Colorido', category: 'basico', Icon: Palette, iconColor: '#f59e0b',
    difficulty: 'Fácil', points: 150,
    description: 'Crie um retângulo com gradiente linear do laranja ao vermelho.',
    hints: [
      'Em vez de uma cor sólida, background aceita gradientes como valor.',
      'background: linear-gradient(ângulo, cor1, cor2). Use 135deg para diagonal.',
      'Solução: background: linear-gradient(135deg, #f39c12, #e74c3c);',
    ],
    htmlStructure: '<div class="card"></div>',
    targetHtml: '<div class="card"></div>',
    targetCss: `.card { width: 200px; height: 100px; background: linear-gradient(135deg, #f39c12, #e74c3c); border-radius: 12px; }`,
    starterCss: `.card {\n  width: 200px;\n  height: 100px;\n  border-radius: 12px;\n  background: linear-gradient(/* ângulo */, /* cor1 */, /* cor2 */);\n}`,
  },
  {
    id: 3, title: 'Texto Centralizado', category: 'basico', Icon: AlignCenter, iconColor: '#8b5cf6',
    difficulty: 'Médio', points: 200,
    description: 'Centralize o texto "CSS Battle!" dentro de uma caixa escura, horizontal e verticalmente.',
    hints: [
      'Flexbox é a maneira moderna de centralizar conteúdo. Adicione display: flex no elemento pai (.box).',
      'Com display: flex, use justify-content: center (horizontal) e align-items: center (vertical).',
      'Solução: .box { display: flex; justify-content: center; align-items: center; } .text { color: white; }',
    ],
    htmlStructure: '<div class="box">\n  <span class="text">CSS Battle!</span>\n</div>',
    targetHtml: '<div class="box"><span class="text">CSS Battle!</span></div>',
    targetCss: `.box { width: 200px; height: 100px; background: #2c3e50; display: flex; justify-content: center; align-items: center; border-radius: 8px; } .text { color: white; font-size: 18px; font-weight: bold; font-family: sans-serif; }`,
    starterCss: `.box {\n  width: 200px;\n  height: 100px;\n  background: #2c3e50;\n  border-radius: 8px;\n  display: /* ? */;\n  justify-content: /* ? */;\n  align-items: /* ? */;\n}\n.text {\n  color: /* ? */;\n  font-size: 18px;\n  font-weight: bold;\n  font-family: sans-serif;\n}`,
  },
  {
    id: 4, title: 'Botão Estilizado', category: 'basico', Icon: MousePointer, iconColor: '#22c55e',
    difficulty: 'Médio', points: 200,
    description: 'Estilize o botão: fundo verde, texto branco, sem borda padrão, cantos arredondados.',
    hints: [
      'Botões HTML têm estilos padrão do navegador. Você precisa sobrescrever a borda e definir background e color.',
      'border: none remove a borda padrão. background-color define a cor de fundo. cursor: pointer muda o cursor.',
      'Solução: background-color: #27ae60; color: white; border: none; border-radius: 8px; cursor: pointer; padding: 14px 28px;',
    ],
    htmlStructure: '<button class="btn">Clique aqui!</button>',
    targetHtml: '<button class="btn">Clique aqui!</button>',
    targetCss: `.btn { background-color: #27ae60; color: white; border: none; padding: 14px 28px; border-radius: 8px; font-size: 16px; cursor: pointer; font-weight: bold; font-family: sans-serif; }`,
    starterCss: `.btn {\n  background-color: /* ? */;\n  color: /* ? */;\n  border: /* ? */;\n  padding: 14px 28px;\n  border-radius: /* ? */;\n  font-size: 16px;\n  font-family: sans-serif;\n  cursor: pointer;\n}`,
  },
  {
    id: 5, title: 'Card de Perfil', category: 'basico', Icon: User, iconColor: '#6366f1',
    difficulty: 'Médio', points: 250,
    description: 'Monte um card com avatar circular (texto "JS") e nome "JavaScript" abaixo.',
    hints: [
      'Para empilhar elementos verticalmente e centralizados, use Flexbox com direção de coluna no .card.',
      'No .card: display: flex; flex-direction: column; align-items: center. No .avatar: border-radius: 50%.',
      'Solução: .card { display: flex; flex-direction: column; align-items: center; gap: 12px; } .avatar { border-radius: 50%; }',
    ],
    htmlStructure: '<div class="card">\n  <div class="avatar">JS</div>\n  <p class="name">JavaScript</p>\n</div>',
    targetHtml: '<div class="card"><div class="avatar">JS</div><p class="name">JavaScript</p></div>',
    targetCss: `.card { width: 140px; padding: 24px 16px; background: #1a1a2e; border-radius: 16px; display: flex; flex-direction: column; align-items: center; gap: 12px; } .avatar { width: 60px; height: 60px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px; font-family: sans-serif; } .name { color: white; font-weight: bold; margin: 0; font-family: sans-serif; }`,
    starterCss: `.card {\n  width: 140px;\n  padding: 24px 16px;\n  background: #1a1a2e;\n  border-radius: 16px;\n  display: flex;\n  flex-direction: /* ? */;\n  align-items: /* ? */;\n  gap: 12px;\n}\n.avatar {\n  width: 60px;\n  height: 60px;\n  background: linear-gradient(135deg, #667eea, #764ba2);\n  border-radius: /* ? */;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  color: white;\n  font-size: 18px;\n  font-family: sans-serif;\n}\n.name {\n  color: /* ? */;\n  font-weight: bold;\n  margin: 0;\n  font-family: sans-serif;\n}`,
  },
  {
    id: 6, title: 'Grid 2×2', category: 'basico', Icon: LayoutGrid, iconColor: '#14b8a6',
    difficulty: 'Difícil', points: 300,
    description: 'Organize as 4 células coloridas em uma grade 2×2 usando CSS Grid.',
    hints: [
      'CSS Grid organiza elementos em linhas e colunas simultaneamente. Use display: grid no elemento pai.',
      'grid-template-columns: 1fr 1fr cria 2 colunas de tamanho igual. O gap define o espaçamento entre as células.',
      'Solução: .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }',
    ],
    htmlStructure: '<div class="grid">\n  <div class="cell" style="background:#e74c3c"></div>\n  <div class="cell" style="background:#3498db"></div>\n  <div class="cell" style="background:#2ecc71"></div>\n  <div class="cell" style="background:#f39c12"></div>\n</div>',
    targetHtml: '<div class="grid"><div class="cell" style="background:#e74c3c"></div><div class="cell" style="background:#3498db"></div><div class="cell" style="background:#2ecc71"></div><div class="cell" style="background:#f39c12"></div></div>',
    targetCss: `.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; width: 180px; } .cell { height: 80px; border-radius: 8px; }`,
    starterCss: `.grid {\n  width: 180px;\n  display: /* ? */;\n  grid-template-columns: /* ? */;\n  gap: 8px;\n}\n.cell {\n  height: 80px;\n  border-radius: 8px;\n}`,
  },
  {
    id: 7, title: 'Spinner Animado', category: 'basico', Icon: RotateCw, iconColor: '#f97316',
    difficulty: 'Difícil', points: 300,
    description: 'Crie um spinner circular girando continuamente com animação CSS.',
    hints: [
      'Animações CSS usam @keyframes para descrever o movimento e animation para aplicá-lo.',
      '@keyframes spin { to { transform: rotate(360deg); } } — aplique com animation: spin 1s linear infinite.',
      'Solução: .spinner { border-radius: 50%; animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }',
    ],
    htmlStructure: '<div class="spinner"></div>',
    targetHtml: '<div class="spinner"></div>',
    targetCss: `.spinner { width: 60px; height: 60px; border: 6px solid rgba(52,152,219,0.2); border-top-color: #3498db; border-radius: 50%; animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`,
    starterCss: `.spinner {\n  width: 60px;\n  height: 60px;\n  border: 6px solid rgba(52, 152, 219, 0.2);\n  border-top-color: #3498db;\n  border-radius: 50%;\n  animation: /* ? */;\n}\n@keyframes spin {\n  to { transform: /* ? */; }\n}`,
  },

  /* ── Flexbox ─────────────────────────────────────────────────────── */
  {
    id: 8, title: 'Row Espaçado', category: 'flexbox', Icon: AlignCenter, iconColor: '#667eea',
    difficulty: 'Fácil', points: 150,
    description: 'Organize 3 caixas coloridas em linha com espaço igual entre elas usando Flexbox.',
    hints: [
      'Para organizar itens em linha, use display: flex no elemento pai (.row).',
      'Depois de display: flex, use justify-content para controlar o espaçamento. "space-between" distribui igualmente.',
      'Solução: .row { display: flex; justify-content: space-between; align-items: center; }',
    ],
    htmlStructure: '<div class="row">\n  <div class="box" style="background:#e74c3c"></div>\n  <div class="box" style="background:#3498db"></div>\n  <div class="box" style="background:#2ecc71"></div>\n</div>',
    targetHtml: '<div class="row"><div class="box" style="background:#e74c3c"></div><div class="box" style="background:#3498db"></div><div class="box" style="background:#2ecc71"></div></div>',
    targetCss: `.row { display: flex; justify-content: space-between; align-items: center; width: 260px; } .box { width: 60px; height: 60px; border-radius: 8px; }`,
    starterCss: `.row {\n  width: 260px;\n  display: /* ? */;\n  justify-content: /* ? */;\n  align-items: /* ? */;\n}\n.box {\n  width: 60px;\n  height: 60px;\n  border-radius: 8px;\n}`,
  },
  {
    id: 9, title: 'Nav Bar Flex', category: 'flexbox', Icon: Layout, iconColor: '#8b5cf6',
    difficulty: 'Médio', points: 200,
    description: 'Crie uma barra de navegação com logo à esquerda e links à direita usando Flexbox.',
    hints: [
      'Para colocar dois grupos de elementos em extremidades opostas, Flexbox com justify-content é a solução.',
      'No .nav: display: flex; justify-content: space-between; align-items: center. No .links: display: flex; gap: 16px.',
      'Solução: .nav { display: flex; justify-content: space-between; align-items: center; } .links { display: flex; gap: 16px; }',
    ],
    htmlStructure: '<nav class="nav">\n  <span class="logo">CSSBattle</span>\n  <div class="links">\n    <a class="link">Home</a>\n    <a class="link">Sobre</a>\n    <a class="link">Contato</a>\n  </div>\n</nav>',
    targetHtml: '<nav class="nav"><span class="logo">CSSBattle</span><div class="links"><a class="link">Home</a><a class="link">Sobre</a><a class="link">Contato</a></div></nav>',
    targetCss: `.nav { width: 320px; background: #1a1a2e; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; border-radius: 10px; box-sizing: border-box; } .logo { color: #667eea; font-weight: bold; font-family: sans-serif; font-size: 15px; } .links { display: flex; gap: 16px; } .link { color: white; font-family: sans-serif; font-size: 13px; text-decoration: none; }`,
    starterCss: `.nav {\n  width: 320px;\n  background: #1a1a2e;\n  padding: 16px 20px;\n  border-radius: 10px;\n  box-sizing: border-box;\n  display: /* ? */;\n  justify-content: /* ? */;\n  align-items: /* ? */;\n}\n.logo { color: #667eea; font-weight: bold; font-family: sans-serif; font-size: 15px; }\n.links {\n  display: /* ? */;\n  gap: 16px;\n}\n.link { color: white; font-family: sans-serif; font-size: 13px; text-decoration: none; }`,
  },
  {
    id: 10, title: 'Coluna Flex', category: 'flexbox', Icon: TrendingUp, iconColor: '#22c55e',
    difficulty: 'Médio', points: 200,
    description: 'Empilhe 3 barras coloridas verticalmente e centralizadas usando Flexbox.',
    hints: [
      'Flexbox tem dois eixos. Por padrão organiza em linha, mas pode ser configurado para coluna.',
      'flex-direction: column muda o eixo principal para vertical. align-items: center centraliza horizontalmente.',
      'Solução: .col { display: flex; flex-direction: column; align-items: center; gap: 10px; }',
    ],
    htmlStructure: '<div class="col">\n  <div class="item" style="background:#e74c3c"></div>\n  <div class="item" style="background:#3498db"></div>\n  <div class="item" style="background:#2ecc71"></div>\n</div>',
    targetHtml: '<div class="col"><div class="item" style="background:#e74c3c"></div><div class="item" style="background:#3498db"></div><div class="item" style="background:#2ecc71"></div></div>',
    targetCss: `.col { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 20px; background: #1e293b; border-radius: 12px; } .item { width: 120px; height: 40px; border-radius: 6px; }`,
    starterCss: `.col {\n  padding: 20px;\n  background: #1e293b;\n  border-radius: 12px;\n  display: /* ? */;\n  flex-direction: /* ? */;\n  align-items: /* ? */;\n  gap: 10px;\n}\n.item {\n  width: 120px;\n  height: 40px;\n  border-radius: 6px;\n}`,
  },
  {
    id: 11, title: 'Flex Wrap', category: 'flexbox', Icon: AlignCenter, iconColor: '#f59e0b',
    difficulty: 'Médio', points: 200,
    description: 'Faça as tags quebrarem para a próxima linha automaticamente quando não couberem.',
    hints: [
      'Por padrão, flex comprime os itens para caberem em uma linha. Existe uma propriedade para mudar esse comportamento.',
      'flex-wrap: wrap permite que os itens quebrem para a próxima linha. Combine com gap para espaçamento.',
      'Solução: .container { display: flex; flex-wrap: wrap; gap: 8px; max-width: 200px; }',
    ],
    htmlStructure: '<div class="container">\n  <span class="tag">HTML</span>\n  <span class="tag">CSS</span>\n  <span class="tag">JavaScript</span>\n  <span class="tag">React</span>\n  <span class="tag">TypeScript</span>\n</div>',
    targetHtml: '<div class="container"><span class="tag">HTML</span><span class="tag">CSS</span><span class="tag">JavaScript</span><span class="tag">React</span><span class="tag">TypeScript</span></div>',
    targetCss: `.container { display: flex; flex-wrap: wrap; gap: 8px; max-width: 200px; } .tag { background: rgba(102,126,234,0.15); color: #667eea; padding: 6px 12px; border-radius: 999px; font-family: sans-serif; font-size: 13px; border: 1px solid rgba(102,126,234,0.3); white-space: nowrap; }`,
    starterCss: `.container {\n  max-width: 200px;\n  display: /* ? */;\n  flex-wrap: /* ? */;\n  gap: 8px;\n}\n.tag {\n  background: rgba(102,126,234,0.15);\n  color: #667eea;\n  padding: 6px 12px;\n  border-radius: 999px;\n  font-family: sans-serif;\n  font-size: 13px;\n  border: 1px solid rgba(102,126,234,0.3);\n  white-space: nowrap;\n}`,
  },

  /* ── Grid ─────────────────────────────────────────────────────────── */
  {
    id: 12, title: 'Galeria de Fotos', category: 'grid', Icon: LayoutGrid, iconColor: '#14b8a6',
    difficulty: 'Médio', points: 250,
    description: 'Organize 6 fotos em uma grade de 3 colunas usando CSS Grid.',
    hints: [
      'Para criar múltiplas colunas de mesmo tamanho, CSS Grid com repeat() é a ferramenta ideal.',
      'grid-template-columns: repeat(3, 1fr) cria 3 colunas iguais. O gap adiciona espaçamento entre as fotos.',
      'Solução: .gallery { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }',
    ],
    htmlStructure: '<div class="gallery">\n  <div class="photo"></div>\n  <!-- 6 fotos no total -->\n</div>',
    targetHtml: '<div class="gallery"><div class="photo"></div><div class="photo"></div><div class="photo"></div><div class="photo"></div><div class="photo"></div><div class="photo"></div></div>',
    targetCss: `.gallery { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; padding: 10px; background: #1e293b; border-radius: 12px; } .photo { height: 80px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 6px; }`,
    starterCss: `.gallery {\n  padding: 10px;\n  background: #1e293b;\n  border-radius: 12px;\n  display: /* ? */;\n  grid-template-columns: /* ? */;\n  gap: 8px;\n}\n.photo {\n  height: 80px;\n  background: linear-gradient(135deg, #667eea, #764ba2);\n  border-radius: 6px;\n}`,
  },
  {
    id: 13, title: 'Layout Sidebar', category: 'grid', Icon: Layout, iconColor: '#6366f1',
    difficulty: 'Difícil', points: 300,
    description: 'Crie um layout com sidebar fixa de 160px e conteúdo principal ocupando o restante.',
    hints: [
      'Grid permite definir colunas com tamanhos mistos: fixos e proporcionais.',
      'grid-template-columns: 160px 1fr — 160px fixo para sidebar, e 1fr (uma fração) para o conteúdo.',
      'Solução: .layout { display: grid; grid-template-columns: 160px 1fr; gap: 12px; width: 380px; height: 220px; }',
    ],
    htmlStructure: '<div class="layout">\n  <aside class="sidebar"></aside>\n  <main class="content"></main>\n</div>',
    targetHtml: '<div class="layout"><aside class="sidebar"></aside><main class="content"></main></div>',
    targetCss: `.layout { display: grid; grid-template-columns: 160px 1fr; gap: 12px; width: 380px; height: 220px; } .sidebar { background: #1e293b; border-radius: 8px; } .content { background: #0f172a; border-radius: 8px; }`,
    starterCss: `.layout {\n  width: 380px;\n  height: 220px;\n  display: /* ? */;\n  grid-template-columns: /* ? */;\n  gap: 12px;\n}\n.sidebar {\n  background: #1e293b;\n  border-radius: 8px;\n}\n.content {\n  background: #0f172a;\n  border-radius: 8px;\n}`,
  },

  /* ── Animação ─────────────────────────────────────────────────────── */
  {
    id: 14, title: 'Pulsar', category: 'animacao', Icon: Circle, iconColor: '#8b5cf6',
    difficulty: 'Médio', points: 250,
    description: 'Faça um círculo pulsar (crescer e encolher) continuamente com animação CSS.',
    hints: [
      'Animações de escala usam transform: scale(). Crie @keyframes alternando entre dois tamanhos.',
      '@keyframes pulsar { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.4); } } — aplique com animation: pulsar 1s infinite.',
      'Solução: .pulse { animation: pulsar 1s ease-in-out infinite; } @keyframes pulsar { 0%,100%{transform:scale(1)} 50%{transform:scale(1.4)} }',
    ],
    htmlStructure: '<div class="pulse"></div>',
    targetHtml: '<div class="pulse"></div>',
    targetCss: `.pulse { width: 80px; height: 80px; background: #667eea; border-radius: 50%; animation: pulsar 1s ease-in-out infinite; } @keyframes pulsar { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.4); } }`,
    starterCss: `.pulse {\n  width: 80px;\n  height: 80px;\n  background: #667eea;\n  border-radius: 50%;\n  animation: /* ? */;\n}\n@keyframes pulsar {\n  /* defina os estados da animação */\n}`,
  },
  {
    id: 15, title: 'Deslizar', category: 'animacao', Icon: ChevronRight, iconColor: '#22c55e',
    difficulty: 'Difícil', points: 300,
    description: 'Anime uma caixa deslizando para esquerda e direita de forma contínua.',
    hints: [
      'Para animar posição sem afetar o layout, use transform: translateX(). Crie @keyframes com dois extremos.',
      '@keyframes deslizar { from { transform: translateX(-60px); } to { transform: translateX(60px); } } — use alternate para vai e volta.',
      'Solução: .slide { animation: deslizar 1.5s ease-in-out infinite alternate; } @keyframes deslizar { from{translateX(-60px)} to{translateX(60px)} }',
    ],
    htmlStructure: '<div class="slide"></div>',
    targetHtml: '<div class="slide"></div>',
    targetCss: `.slide { width: 100px; height: 60px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 10px; animation: deslizar 1.5s ease-in-out infinite alternate; } @keyframes deslizar { from { transform: translateX(-60px); } to { transform: translateX(60px); } }`,
    starterCss: `.slide {\n  width: 100px;\n  height: 60px;\n  background: linear-gradient(135deg, #667eea, #764ba2);\n  border-radius: 10px;\n  animation: /* ? */;\n}\n@keyframes deslizar {\n  from { transform: /* ? */; }\n  to   { transform: /* ? */; }\n}`,
  },

  /* ── Efeitos ──────────────────────────────────────────────────────── */
  {
    id: 16, title: 'Glassmorphism', category: 'efeitos', Icon: Star, iconColor: '#f093fb',
    difficulty: 'Difícil', points: 350,
    description: 'Crie um card com efeito de vidro fosco (glassmorphism) sobre um fundo gradiente.',
    hints: [
      'Glassmorphism combina fundo semi-transparente com desfoque do que está atrás do elemento.',
      'backdrop-filter: blur(10px) desfoca o fundo. Use background: rgba(255,255,255,0.15) para a transparência.',
      'Solução: .card { background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.25); }',
    ],
    htmlStructure: '<div class="scene">\n  <div class="card">\n    <h2 class="title">Glass UI</h2>\n    <p class="text">Efeito vidro fosco</p>\n  </div>\n</div>',
    targetHtml: '<div class="scene"><div class="card"><h2 class="title">Glass UI</h2><p class="text">Efeito vidro fosco</p></div></div>',
    targetCss: `.scene { width: 280px; height: 180px; background: linear-gradient(135deg, #667eea, #f093fb); border-radius: 16px; display: flex; align-items: center; justify-content: center; } .card { background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.25); border-radius: 12px; padding: 20px 28px; text-align: center; } .title { color: white; font-family: sans-serif; margin: 0 0 4px; font-size: 18px; } .text { color: rgba(255,255,255,0.8); font-family: sans-serif; margin: 0; font-size: 13px; }`,
    starterCss: `.scene { width: 280px; height: 180px; background: linear-gradient(135deg, #667eea, #f093fb); border-radius: 16px; display: flex; align-items: center; justify-content: center; }\n.card {\n  border-radius: 12px;\n  padding: 20px 28px;\n  text-align: center;\n  background: /* rgba com opacidade baixa */;\n  backdrop-filter: /* ? */;\n  border: /* ? */;\n}\n.title { color: white; font-family: sans-serif; margin: 0 0 4px; font-size: 18px; }\n.text { color: rgba(255,255,255,0.8); font-family: sans-serif; margin: 0; font-size: 13px; }`,
  },
  {
    id: 17, title: 'Texto Gradiente', category: 'efeitos', Icon: Palette, iconColor: '#f59e0b',
    difficulty: 'Difícil', points: 350,
    description: 'Aplique um gradiente colorido diretamente no texto usando CSS.',
    hints: [
      'É possível "recortar" o background de um elemento na forma do texto, revelando o gradiente apenas nas letras.',
      'Use background: linear-gradient(...), depois background-clip: text e -webkit-text-fill-color: transparent.',
      'Solução: .title { background: linear-gradient(135deg, #667eea, #f093fb, #f5576c); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }',
    ],
    htmlStructure: '<h1 class="title">CSS Magic!</h1>',
    targetHtml: '<h1 class="title">CSS Magic!</h1>',
    targetCss: `.title { font-family: sans-serif; font-size: 32px; font-weight: 900; margin: 0; background: linear-gradient(135deg, #667eea, #f093fb, #f5576c); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }`,
    starterCss: `.title {\n  font-family: sans-serif;\n  font-size: 32px;\n  font-weight: 900;\n  margin: 0;\n  background: linear-gradient(/* ? */);\n  -webkit-background-clip: /* ? */;\n  -webkit-text-fill-color: /* ? */;\n  background-clip: /* ? */;\n}`,
  },
];

/* ── Scoring ─────────────────────────────────────────────────────────────── */

function parseRgb(s: string): [number,number,number]|null {
  const m = s.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/);
  return m ? [+m[1],+m[2],+m[3]] : null;
}
function colorNear(a: string, r: number, g: number, b: number, t = 45): boolean {
  const v = parseRgb(a); if (!v) return false;
  return Math.abs(v[0]-r)<=t && Math.abs(v[1]-g)<=t && Math.abs(v[2]-b)<=t;
}
function px(v: string): number { return parseFloat(v) || 0; }
function hasFlex(v: string) { return v === 'flex' || v === 'inline-flex'; }

function calcScore(cid: number, iframe: HTMLIFrameElement): { score: number; details: ScoreDetail[] } {
  const doc = iframe.contentDocument; const win = iframe.contentWindow;
  if (!doc || !win) return { score: 0, details: [] };
  const gs = (sel: string, prop: string) => {
    const el = doc.querySelector(sel);
    return el ? win.getComputedStyle(el).getPropertyValue(prop).trim() : '';
  };
  const details: ScoreDetail[] = [];
  const add = (label: string, pass: boolean, weight: number) => details.push({ label, passed: pass, weight });

  switch (cid) {
    case 0:
      add('border-radius circular', px(gs('.shape','border-radius'))>=40, 35);
      add('cor vermelha', colorNear(gs('.shape','background-color'),231,76,60), 35);
      add('width >= 60px', px(gs('.shape','width'))>=60, 15);
      add('height >= 60px', px(gs('.shape','height'))>=60, 15);
      break;
    case 1:
      add('cor azul', colorNear(gs('.box','background-color'),52,152,219), 40);
      add('box-shadow aplicado', gs('.box','box-shadow')!=='none', 30);
      add('width >= 60px', px(gs('.box','width'))>=60, 15);
      add('height >= 60px', px(gs('.box','height'))>=60, 15);
      break;
    case 2: {
      const bi = gs('.card','background-image');
      add('linear-gradient aplicado', bi.includes('gradient'), 50);
      add('border-radius > 0', px(gs('.card','border-radius'))>0, 25);
      add('width >= 150px', px(gs('.card','width'))>=150, 25);
      break;
    }
    case 3:
      add('display: flex no .box', hasFlex(gs('.box','display')), 30);
      add('justify-content: center', gs('.box','justify-content')==='center', 20);
      add('align-items: center', gs('.box','align-items')==='center', 20);
      add('texto branco', colorNear(gs('.text','color'),255,255,255,30), 30);
      break;
    case 4:
      add('background verde', colorNear(gs('.btn','background-color'),39,174,96), 30);
      add('texto branco', colorNear(gs('.btn','color'),255,255,255,30), 20);
      add('border: none', gs('.btn','border-top-style')==='none', 20);
      add('border-radius > 0', px(gs('.btn','border-radius'))>0, 15);
      add('padding aplicado', px(gs('.btn','padding-top'))>=5, 15);
      break;
    case 5:
      add('.card display: flex', hasFlex(gs('.card','display')), 25);
      add('.card flex-direction: column', gs('.card','flex-direction')==='column', 25);
      add('.avatar border-radius: 50%', px(gs('.avatar','border-radius'))>=25, 25);
      add('.avatar com gradiente', gs('.avatar','background-image').includes('gradient'), 25);
      break;
    case 6:
      add('display: grid', gs('.grid','display')==='grid', 40);
      add('2 colunas', gs('.grid','grid-template-columns').trim().split(/\s+/).length>=2, 30);
      add('.cell height >= 50px', px(gs('.cell','height'))>=50, 30);
      break;
    case 7:
      add('border-radius: 50%', px(gs('.spinner','border-radius'))>=25, 25);
      add('border definido', gs('.spinner','border-top-style')!=='none', 25);
      add('animation ativa', gs('.spinner','animation-name')!=='none', 50);
      break;
    case 8:
      add('display: flex no .row', hasFlex(gs('.row','display')), 40);
      add('justify-content: space-between', gs('.row','justify-content')==='space-between', 40);
      add('.box com cor', gs('.box','background-color')!=='rgba(0, 0, 0, 0)', 20);
      break;
    case 9:
      add('display: flex no .nav', hasFlex(gs('.nav','display')), 30);
      add('justify-content: space-between', gs('.nav','justify-content')==='space-between', 25);
      add('align-items: center', gs('.nav','align-items')==='center', 20);
      add('.links display: flex', hasFlex(gs('.links','display')), 25);
      break;
    case 10:
      add('display: flex no .col', hasFlex(gs('.col','display')), 30);
      add('flex-direction: column', gs('.col','flex-direction')==='column', 40);
      add('align-items: center', gs('.col','align-items')==='center', 30);
      break;
    case 11:
      add('display: flex no .container', hasFlex(gs('.container','display')), 35);
      add('flex-wrap: wrap', gs('.container','flex-wrap')==='wrap', 40);
      add('gap > 0', px(gs('.container','gap'))>0 || px(gs('.container','column-gap'))>0, 25);
      break;
    case 12:
      add('display: grid', gs('.gallery','display')==='grid', 40);
      add('3 colunas', gs('.gallery','grid-template-columns').trim().split(/\s+/).length>=3, 35);
      add('gap > 0', px(gs('.gallery','gap'))>0 || px(gs('.gallery','column-gap'))>0, 25);
      break;
    case 13:
      add('display: grid no .layout', gs('.layout','display')==='grid', 40);
      add('2 colunas diferentes', gs('.layout','grid-template-columns').trim().split(/\s+/).length>=2, 35);
      add('.sidebar com background', gs('.sidebar','background-color')!=='rgba(0, 0, 0, 0)', 25);
      break;
    case 14:
      add('border-radius: 50%', px(gs('.pulse','border-radius'))>=35, 25);
      add('animation ativa', gs('.pulse','animation-name')!=='none', 45);
      add('animation infinite', gs('.pulse','animation-iteration-count')==='infinite', 30);
      break;
    case 15:
      add('animation ativa', gs('.slide','animation-name')!=='none', 50);
      add('animation: alternate', gs('.slide','animation-direction').includes('alternate'), 30);
      add('border-radius > 0', px(gs('.slide','border-radius'))>0, 20);
      break;
    case 16:
      add('backdrop-filter: blur', gs('.card','backdrop-filter').includes('blur'), 45);
      add('background semi-transparente (rgba)', gs('.card','background-color').includes('rgba'), 35);
      add('border-radius > 0', px(gs('.card','border-radius'))>0, 20);
      break;
    case 17:
      add('background com gradiente', gs('.title','background-image').includes('gradient'), 40);
      add('background-clip: text', gs('.title','background-clip')==='text', 35);
      add('texto transparente', gs('.title','-webkit-text-fill-color').includes('0, 0, 0, 0') || gs('.title','-webkit-text-fill-color')==='transparent', 25);
      break;
  }
  const total  = details.reduce((s,d)=>s+d.weight,0);
  const earned = details.reduce((s,d)=>s+(d.passed?d.weight:0),0);
  return { score: total>0 ? Math.round((earned/total)*100) : 0, details };
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function genId()   { return Math.random().toString(36).slice(2,10); }
function genCode() {
  const ch = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({length:4},()=>ch[Math.floor(Math.random()*ch.length)]).join('');
}
function buildDoc(html: string, css: string) {
  const safeCss = css.replace(/<\//g, '<\\/');
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>*{box-sizing:border-box;}body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f0f0f0;}${safeCss}</style></head><body>${html}</body></html>`;
}
function pickChallenges(cat: CategoryFilter, count: number): number[] {
  const pool = cat === 'todos' ? CHALLENGES.map(c=>c.id)
    : CHALLENGES.filter(c=>c.category===cat).map(c=>c.id);
  if (pool.length === 0) return CHALLENGES.slice(0,count).map(c=>c.id);
  const shuffled = [...pool].sort(()=>Math.random()-0.5);
  const result: number[] = [];
  for (let i=0; i<count; i++) result.push(shuffled[i % shuffled.length]);
  return result;
}

const DIFF_COLOR: Record<string,string> = { Fácil:'#22c55e', Médio:'#f59e0b', Difícil:'#ef4444' };
const CAT_LABEL:  Record<CategoryFilter,string> = { todos:'Todos', basico:'Básico', flexbox:'Flexbox', grid:'Grid', animacao:'Animações', efeitos:'Efeitos' };
const CAT_COLOR:  Record<CategoryFilter,string> = { todos:'#667eea', basico:'#3b82f6', flexbox:'#8b5cf6', grid:'#14b8a6', animacao:'#f97316', efeitos:'#f093fb' };
const BATTLE_DURATION = 180;
const HINT_COSTS: [number,number,number] = [0, 10, 20];

/* ── Component ───────────────────────────────────────────────────────────── */

const CssBattlePage: React.FC<{ onBackToHub: () => void }> = ({ onBackToHub }) => {
  const { isDark } = useTheme();
  const { currentUser, spendCoins } = useGameState();

  /* view */
  const [view, setView]   = useState<PageView>('menu');
  const [mode, setMode]   = useState<GameMode>('create');

  /* form */
  const [playerName, setPlayerName]         = useState('');
  const [joinCodeInput, setJoinCodeInput]   = useState('');
  const [maxPlayers, setMaxPlayers]         = useState<2|3|4>(2);
  const [totalRoundsSetup, setTotalRoundsSetup] = useState<1|3|5>(3);
  const [categorySetup, setCategorySetup]   = useState<CategoryFilter>('todos');
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  /* game */
  const [roomCode, setRoomCode]         = useState('');
  const [isHost, setIsHost]             = useState(false);
  const [challengeIdx, setChallengeIdx] = useState(0);
  const [challengeIndices, setChallengeIndices] = useState<number[]>([0]);
  const [currentRound, setCurrentRound] = useState(0);
  const [totalRounds, setTotalRounds]   = useState(1);
  const [roomMaxPlayers, setRoomMaxPlayers] = useState(2);
  const [allPlayers, setAllPlayers]     = useState<Record<string,PlayerData>>({});
  const [playerCode, setPlayerCode]     = useState('');
  const [timeLeft, setTimeLeft]         = useState(BATTLE_DURATION);
  const [playerScore, setPlayerScore]   = useState(-1);
  const [scoreDetails, setScoreDetails] = useState<ScoreDetail[]>([]);
  const [submitted, setSubmitted]       = useState(false);
  const [roundResults, setRoundResults] = useState<RoundResult[]>([]);

  /* UI extras */
  const [showInstr, setShowInstr]           = useState(false);
  const [showHints, setShowHints]           = useState(false);
  const [hintLevel, setHintLevel]           = useState(0);
  const [hintMsg, setHintMsg]               = useState('');
  const [catFilter, setCatFilter]           = useState<CategoryFilter>('todos');
  const [roundTransition, setRoundTransition] = useState(false);

  /* refs */
  const previewRef    = useRef<HTMLIFrameElement>(null);
  const targetRef     = useRef<HTMLIFrameElement>(null);
  const playerId      = useRef(genId());
  const unsubRef      = useRef<(()=>void)|null>(null);
  const timerRef      = useRef<ReturnType<typeof setInterval>|null>(null);
  const submittedRef  = useRef(false);
  const prevRoundRef  = useRef<number>(-1);
  const roundScoresRef = useRef<Record<number,number>>({});

  /* theme */
  const bg      = isDark ? '#0f1117' : '#f8fafc';
  const card    = isDark ? '#1a1d2e' : '#ffffff';
  const border  = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.10)';
  const text    = isDark ? '#e2e8f0' : '#1e293b';
  const dim     = isDark ? '#64748b' : '#94a3b8';
  const inputBg = isDark ? '#0f1117' : '#f8fafc';

  const inputStyle: React.CSSProperties = {
    width:'100%', background:inputBg, border:`1px solid ${border}`,
    color:text, borderRadius:10, padding:'12px 14px', fontSize:14,
    outline:'none', boxSizing:'border-box',
  };

  /* ── Preview ── */
  useEffect(()=>{
    const t = setTimeout(()=>{
      if (previewRef.current)
        previewRef.current.srcdoc = buildDoc(CHALLENGES[challengeIdx].targetHtml, playerCode);
    }, 250);
    return ()=>clearTimeout(t);
  }, [playerCode, challengeIdx]);

  useEffect(()=>{
    if (targetRef.current && view==='battle') {
      const ch = CHALLENGES[challengeIdx];
      targetRef.current.srcdoc = buildDoc(ch.targetHtml, ch.targetCss);
    }
  }, [challengeIdx, view]);

  /* ── Cleanup ── */
  useEffect(()=>()=>{
    unsubRef.current?.();
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  /* ── Timer ── */
  useEffect(()=>{
    if (view!=='battle') return;
    submittedRef.current = false;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(()=>{
      setTimeLeft(prev=>{
        if (prev<=1){ clearInterval(timerRef.current!); handleSubmit(); return 0; }
        return prev-1;
      });
    }, 1000);
    return ()=>{ if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, currentRound]);

  /* ── Submit ── */
  const handleSubmit = useCallback(()=>{
    if (submittedRef.current) return;
    submittedRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeout(()=>{
      if (!previewRef.current) return;
      const { score, details } = calcScore(challengeIdx, previewRef.current);
      setPlayerScore(score);
      setScoreDetails(details);
      setSubmitted(true);

      const newResult: RoundResult = { challengeIdx, score, details };
      setRoundResults(prev => { const next = [...prev, newResult]; return next; });

      if (mode!=='solo' && roomCode) {
        roundScoresRef.current[currentRound] = score;
        const totalScore = Object.values(roundScoresRef.current).reduce((a,b)=>a+b,0);
        dbUpdate(ref(db,`rooms/${roomCode}/players/${playerId.current}`), {
          [`scores/${currentRound}`]: score,
          totalScore,
          submittedAt: Date.now(),
        });
      }
    }, 400);
  }, [challengeIdx, mode, roomCode, currentRound]);

  /* ── Advance solo round ── */
  const advanceSoloRound = useCallback(()=>{
    const nextRound = currentRound + 1;
    if (nextRound >= totalRounds) { setView('results'); return; }
    const nextIdx = challengeIndices[nextRound];
    setCurrentRound(nextRound);
    setChallengeIdx(nextIdx);
    setPlayerCode(CHALLENGES[nextIdx].starterCss);
    setPlayerScore(-1); setScoreDetails([]); setSubmitted(false);
    setHintLevel(0); setHintMsg(''); setShowHints(false);
    setTimeLeft(BATTLE_DURATION);
    submittedRef.current = false;
  }, [currentRound, totalRounds, challengeIndices]);

  /* ── Firebase subscribe ── */
  const subscribeRoom = useCallback((code: string)=>{
    unsubRef.current?.();
    const roomRef = ref(db,`rooms/${code}`);
    const unsub = onValue(roomRef, snap=>{
      const data = snap.val();
      if (!data) return;

      const players: Record<string,PlayerData> = data.players || {};
      setAllPlayers(players);
      setRoomMaxPlayers(data.maxPlayers ?? 2);

      const indices: number[] = data.challengeIndices ?? [data.challengeIndex ?? 0];
      const cRound: number    = data.currentRound ?? 0;
      const cTotal: number    = data.totalRounds  ?? 1;
      const cIdx   = indices[cRound] ?? 0;

      if (data.status==='playing') {
        setChallengeIndices(indices);
        setTotalRounds(cTotal);

        if (prevRoundRef.current !== cRound && prevRoundRef.current >= 0) {
          /* round avançou → mostra transição e reseta */
          setRoundTransition(true);
          setTimeout(()=>{
            setCurrentRound(cRound);
            setChallengeIdx(cIdx);
            setPlayerCode(CHALLENGES[cIdx].starterCss);
            setPlayerScore(-1); setScoreDetails([]); setSubmitted(false);
            setHintLevel(0); setHintMsg(''); setShowHints(false);
            submittedRef.current = false;
            const elapsed = data.startedAt ? Math.floor((Date.now()-data.startedAt)/1000) : 0;
            setTimeLeft(Math.max(0, BATTLE_DURATION - elapsed));
            setRoundTransition(false);
          }, 3000);
        } else if (prevRoundRef.current < 0) {
          /* primeira entrada */
          setCurrentRound(cRound);
          setChallengeIdx(cIdx);
          const elapsed = data.startedAt ? Math.floor((Date.now()-data.startedAt)/1000) : 0;
          setPlayerCode(CHALLENGES[cIdx].starterCss);
          setTimeLeft(Math.max(0, BATTLE_DURATION - elapsed));
          setPlayerScore(-1); setScoreDetails([]); setSubmitted(false);
          setView('battle');
        }
        prevRoundRef.current = cRound;
      }

      if (data.status==='finished') {
        if (timerRef.current) clearInterval(timerRef.current);
        setView('results');
      }

      /* host avança rodada quando todos enviaram */
      const vals = Object.values(players) as PlayerData[];
      const count = vals.length;
      if (data.hostId===playerId.current && count>=2 && data.status==='playing') {
        const allDone = vals.every(p=>(p.scores?.[String(cRound)] ?? -1) >= 0);
        if (allDone) {
          const nextRound = cRound + 1;
          if (nextRound >= cTotal) {
            dbUpdate(roomRef, { status:'finished' }).catch(()=>{});
          } else {
            dbUpdate(roomRef, { currentRound: nextRound, startedAt: Date.now() }).catch(()=>{});
          }
        }
      }
    });
    unsubRef.current = unsub;
  }, []);

  /* ── Create room ── */
  const createRoom = async ()=>{
    if (!playerName.trim()){ setError('Digite seu nome.'); return; }
    setLoading(true); setError('');
    const code = genCode();
    const indices = pickChallenges(categorySetup, totalRoundsSetup);
    try {
      await set(ref(db,`rooms/${code}`),{
        challengeIndices: indices,
        challengeIndex: indices[0],
        currentRound: 0,
        totalRounds: totalRoundsSetup,
        category: categorySetup,
        maxPlayers, status:'waiting',
        hostId: playerId.current, createdAt: Date.now(),
        players:{ [playerId.current]:{ name:playerName.trim(), scores:{}, totalScore:0, submittedAt:0 } }
      });
      setRoomCode(code); setIsHost(true);
      prevRoundRef.current = -1;
      roundScoresRef.current = {};
      subscribeRoom(code); setView('lobby');
    } catch { setError('Erro ao criar sala. Verifique a conexão.'); }
    setLoading(false);
  };

  /* ── Join room ── */
  const joinRoom = async ()=>{
    if (!playerName.trim()){ setError('Digite seu nome.'); return; }
    const code = joinCodeInput.trim().toUpperCase();
    if (code.length!==4){ setError('Código deve ter 4 caracteres.'); return; }
    setLoading(true); setError('');
    try {
      /* get() primeiro para carregar o room no cache local — sem isso o
         runTransaction recebe data=null na primeira chamada e aborta */
      const snap = await get(ref(db,`rooms/${code}`));
      if (!snap.exists()){ setError('Sala não encontrada.'); setLoading(false); return; }

      let rejectionReason = '';
      const { committed } = await runTransaction(ref(db,`rooms/${code}`), (data)=>{
        if (!data){ rejectionReason='Sala não encontrada.'; return; }
        if (data.status==='finished'){ rejectionReason='Esta sala já terminou.'; return; }
        if (data.status==='playing'){  rejectionReason='A partida já começou.'; return; }
        const count = Object.keys(data.players||{}).length;
        if (count>=(data.maxPlayers??2)){ rejectionReason=`Sala cheia (máx. ${data.maxPlayers??2}).`; return; }
        return { ...data, players:{ ...data.players, [playerId.current]:{ name:playerName.trim(), scores:{}, totalScore:0, submittedAt:0 } } };
      });
      if (!committed){ setError(rejectionReason||'Não foi possível entrar na sala.'); setLoading(false); return; }
      setRoomCode(code); setIsHost(false);
      prevRoundRef.current = -1;
      roundScoresRef.current = {};
      subscribeRoom(code); setView('lobby');
    } catch { setError('Erro ao entrar na sala.'); }
    setLoading(false);
  };

  /* ── Host start ── */
  const hostStart = async ()=>{
    if (!roomCode) return;
    try {
      const snap = await get(ref(db,`rooms/${roomCode}`));
      const data = snap.val();
      if (!data) return;
      if (Object.keys(data.players||{}).length < 2){ setError('Aguarde ao menos 2 jogadores.'); return; }
      await dbUpdate(ref(db,`rooms/${roomCode}`), { status:'playing', startedAt: Date.now() });
      prevRoundRef.current = 0;
      setView('battle');
    } catch { setError('Erro ao iniciar a batalha.'); }
  };

  /* ── Solo start ── */
  const startSolo = ()=>{
    if (!playerName.trim()){ setError('Digite seu nome.'); return; }
    const indices = pickChallenges(categorySetup, totalRoundsSetup);
    setChallengeIndices(indices);
    setTotalRounds(totalRoundsSetup);
    setCurrentRound(0);
    roundScoresRef.current = {};
    const idx = indices[0];
    setChallengeIdx(idx);
    setPlayerCode(CHALLENGES[idx].starterCss);
    setTimeLeft(BATTLE_DURATION);
    setPlayerScore(-1); setScoreDetails([]); setSubmitted(false);
    setRoundResults([]);
    setHintLevel(0); setHintMsg(''); setShowHints(false);
    setView('battle');
  };

  /* ── Hint unlock ── */
  const unlockHint = (level: 1|2|3)=>{
    if (hintLevel >= level) return;
    const cost = HINT_COSTS[level-1];
    if (cost > 0) {
      if (!currentUser){ setHintMsg('Faça login no Desafios para usar dicas com moedas.'); return; }
      if (!spendCoins(cost)){ setHintMsg(`Moedas insuficientes. Esta dica custa 🪙 ${cost}.`); return; }
    }
    setHintLevel(level);
    setHintMsg('');
  };

  /* ── Tab key ── */
  const handleTab = (e: React.KeyboardEvent<HTMLTextAreaElement>)=>{
    if (e.key!=='Tab') return;
    e.preventDefault();
    const ta=e.currentTarget, s=ta.selectionStart;
    const v=ta.value.substring(0,s)+'  '+ta.value.substring(ta.selectionEnd);
    setPlayerCode(v);
    setTimeout(()=>{ ta.selectionStart=ta.selectionEnd=s+2; },0);
  };

  const copyCode = ()=>{ navigator.clipboard.writeText(roomCode).then(()=>{ setCopiedCode(true); setTimeout(()=>setCopiedCode(false),2000); }); };
  const fmtTime  = (s: number)=>`${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  const challenge  = CHALLENGES[challengeIdx] ?? CHALLENGES[0];
  const myEntry    = allPlayers[playerId.current];
  const opponents  = Object.entries(allPlayers).filter(([id])=>id!==playerId.current);
  const timerPct   = (timeLeft/BATTLE_DURATION)*100;
  const timerColor = timeLeft>120 ? '#22c55e' : timeLeft>60 ? '#f59e0b' : '#ef4444';
  const catChallenges = catFilter==='todos' ? CHALLENGES : CHALLENGES.filter(c=>c.category===catFilter);
  const categories: CategoryFilter[] = ['todos','basico','flexbox','grid','animacao','efeitos'];

  /* ══════════════════════════════════════════════════════════
      MENU
  ══════════════════════════════════════════════════════════ */
  if (view==='menu') return (
    <div style={{minHeight:'100vh',background:bg,color:text}}>
      <div style={{maxWidth:1000,margin:'0 auto',padding:'0 16px 40px'}}>

        {/* Top nav */}
        <div style={{padding:'20px 0 0'}}>
          <button onClick={onBackToHub} style={{background:'none',border:`1px solid ${border}`,color:dim,padding:'6px 12px',borderRadius:8,cursor:'pointer',display:'flex',alignItems:'center',gap:6,fontSize:13}}>
            <ArrowLeft size={14}/> Hub
          </button>
        </div>

        {/* Hero */}
        <div style={{textAlign:'center',padding:'40px 0 36px',position:'relative'}}>
          <div style={{display:'flex',justifyContent:'center',marginBottom:18}}>
            <div style={{width:80,height:80,background:'linear-gradient(135deg,#667eea,#f093fb)',borderRadius:22,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 12px 40px rgba(102,126,234,0.35)'}}>
              <Swords size={40} color="white"/>
            </div>
          </div>
          <h1 style={{fontFamily:"'Press Start 2P',monospace",fontSize:clamp(20,28),margin:'0 0 14px',background:'linear-gradient(135deg,#667eea,#f093fb)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',lineHeight:1.4}}>
            CSS BATTLE
          </h1>
          <p style={{color:dim,fontSize:15,margin:'0 auto',maxWidth:520,lineHeight:1.7}}>
            Recrie layouts CSS contra colegas em tempo real. Pontuação automática, dicas com moedas e múltiplas rodadas.
          </p>
        </div>

        {/* Mode cards */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:14,marginBottom:44}}>
          {([
            {m:'create' as GameMode, Icon:Home,     color:'#667eea', title:'Criar Sala',    desc:'Defina categoria, rodadas e convide colegas.'},
            {m:'join'   as GameMode, Icon:Link,     color:'#3b82f6', title:'Entrar em Sala', desc:'Digite o código de 4 letras para entrar.'},
            {m:'solo'   as GameMode, Icon:Gamepad2, color:'#22c55e', title:'Praticar Solo', desc:'Treine no seu ritmo com dicas disponíveis.'},
          ]).map(({m,Icon:Ic,color,title,desc})=>(
            <button key={m} onClick={()=>{ setMode(m); setView('setup'); setError(''); }}
              style={{background:card,border:`1px solid ${border}`,borderRadius:16,padding:'24px 20px',cursor:'pointer',textAlign:'left',transition:'transform 0.15s,box-shadow 0.15s'}}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow=`0 12px 32px ${color}28`;}}
              onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='';}}>
              <div style={{width:44,height:44,background:`${color}18`,borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:14,border:`1px solid ${color}30`}}>
                <Ic size={22} color={color}/>
              </div>
              <div style={{fontSize:15,fontWeight:700,color:text,marginBottom:5}}>{title}</div>
              <div style={{fontSize:12,color:dim,lineHeight:1.65}}>{desc}</div>
            </button>
          ))}
        </div>

        {/* Category filter */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14,flexWrap:'wrap',gap:8}}>
          <h2 style={{fontSize:12,fontWeight:700,color:dim,letterSpacing:'0.1em',textTransform:'uppercase',margin:0}}>Desafios disponíveis</h2>
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            {categories.map(cat=>{
              const active = catFilter===cat;
              const cc = CAT_COLOR[cat];
              return (
                <button key={cat} onClick={()=>setCatFilter(cat)}
                  style={{padding:'5px 12px',borderRadius:999,border:`1px solid ${active?cc:border}`,background:active?`${cc}18`:'transparent',color:active?cc:dim,fontSize:12,fontWeight:active?700:400,cursor:'pointer'}}>
                  {CAT_LABEL[cat]} <span style={{opacity:0.6}}>{cat==='todos'?CHALLENGES.length:CHALLENGES.filter(c=>c.category===cat).length}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Challenge grid */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(210px,1fr))',gap:8}}>
          {catChallenges.map(ch=>{
            const Ic=ch.Icon;
            return (
              <div key={ch.id} style={{background:card,border:`1px solid ${border}`,borderRadius:12,padding:'13px 15px',display:'flex',alignItems:'center',gap:11}}>
                <div style={{width:36,height:36,background:`${ch.iconColor}18`,borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,border:`1px solid ${ch.iconColor}28`}}>
                  <Ic size={16} color={ch.iconColor}/>
                </div>
                <div style={{minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:600,color:text,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{ch.title}</div>
                  <div style={{display:'flex',alignItems:'center',gap:6,marginTop:2}}>
                    <span style={{fontSize:10,color:DIFF_COLOR[ch.difficulty]}}>{ch.difficulty}</span>
                    <span style={{fontSize:10,color:dim}}>· {ch.points}pts</span>
                    <span style={{fontSize:10,color:CAT_COLOR[ch.category],background:`${CAT_COLOR[ch.category]}14`,padding:'1px 6px',borderRadius:999}}>{CAT_LABEL[ch.category]}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  /* ══════════════════════════════════════════════════════════
      SETUP
  ══════════════════════════════════════════════════════════ */
  if (view==='setup') {
    const ModeIcon = mode==='create' ? Home : mode==='join' ? Link : Gamepad2;
    const modeLabel = mode==='create' ? 'Criar Sala' : mode==='join' ? 'Entrar em Sala' : 'Praticar Solo';
    return (
      <div style={{minHeight:'100vh',background:bg,color:text,display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
        <div style={{background:card,border:`1px solid ${border}`,borderRadius:20,padding:'36px 32px',width:'100%',maxWidth:480}}>
          <button onClick={()=>setView('menu')} style={{background:'none',border:'none',color:dim,cursor:'pointer',display:'flex',alignItems:'center',gap:6,fontSize:13,marginBottom:22,padding:0}}>
            <ArrowLeft size={14}/> Voltar
          </button>

          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:22}}>
            <div style={{width:44,height:44,background:'rgba(102,126,234,0.12)',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center'}}>
              <ModeIcon size={22} color="#667eea"/>
            </div>
            <h2 style={{fontSize:17,fontWeight:700,margin:0,color:text}}>{modeLabel}</h2>
          </div>

          <div style={{marginBottom:14}}>
            <label style={{fontSize:12,color:dim,display:'block',marginBottom:6}}>Seu nome</label>
            <input value={playerName} onChange={e=>setPlayerName(e.target.value)} placeholder="Ex: Maria Silva" maxLength={24} style={inputStyle}/>
          </div>

          {mode==='join' && (
            <div style={{marginBottom:14}}>
              <label style={{fontSize:12,color:dim,display:'block',marginBottom:6}}>Código da sala</label>
              <input value={joinCodeInput} onChange={e=>setJoinCodeInput(e.target.value.toUpperCase().slice(0,4))}
                placeholder="XXXX" maxLength={4}
                style={{...inputStyle,fontSize:28,letterSpacing:'0.3em',fontFamily:'monospace',textAlign:'center',textTransform:'uppercase'}}/>
            </div>
          )}

          {mode !== 'join' && (
            <>
              {/* Categoria */}
              <div style={{marginBottom:14}}>
                <label style={{fontSize:12,color:dim,display:'block',marginBottom:8}}>Categoria dos desafios</label>
                <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                  {categories.map(cat=>{
                    const active = categorySetup===cat;
                    const cc = CAT_COLOR[cat];
                    return (
                      <button key={cat} onClick={()=>setCategorySetup(cat)}
                        style={{padding:'6px 12px',borderRadius:8,border:`1px solid ${active?cc:border}`,background:active?`${cc}18`:'transparent',color:active?cc:dim,fontSize:12,fontWeight:active?700:400,cursor:'pointer'}}>
                        {CAT_LABEL[cat]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rodadas */}
              <div style={{marginBottom:14}}>
                <label style={{fontSize:12,color:dim,display:'block',marginBottom:8}}>Número de rodadas</label>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
                  {([1,3,5] as (1|3|5)[]).map(n=>(
                    <button key={n} onClick={()=>setTotalRoundsSetup(n)}
                      style={{padding:'10px',borderRadius:10,border:`2px solid ${totalRoundsSetup===n?'#667eea':border}`,background:totalRoundsSetup===n?'rgba(102,126,234,0.12)':'transparent',cursor:'pointer',color:totalRoundsSetup===n?'#667eea':dim,fontWeight:700,fontSize:15,display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
                      {n}
                      <span style={{fontSize:10,fontWeight:400}}>{n===1?'Rápido':n===3?'Normal':'Longo'}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Jogadores (só no create) */}
              {mode==='create' && (
                <div style={{marginBottom:14}}>
                  <label style={{fontSize:12,color:dim,display:'block',marginBottom:8}}>Máximo de jogadores</label>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
                    {([2,3,4] as (2|3|4)[]).map(n=>(
                      <button key={n} onClick={()=>setMaxPlayers(n)}
                        style={{padding:'10px',borderRadius:10,border:`2px solid ${maxPlayers===n?'#667eea':border}`,background:maxPlayers===n?'rgba(102,126,234,0.12)':'transparent',cursor:'pointer',color:maxPlayers===n?'#667eea':dim,fontWeight:700,fontSize:15,display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
                        {n}
                        <span style={{fontSize:10,fontWeight:400}}>{n===2?'Duo':n===3?'Trio':'Squad'}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {error && <div style={{color:'#ef4444',fontSize:12,marginBottom:12,padding:'8px 12px',background:'rgba(239,68,68,0.1)',borderRadius:8}}>{error}</div>}

          <button onClick={mode==='create'?createRoom:mode==='join'?joinRoom:startSolo} disabled={loading}
            style={{width:'100%',background:'linear-gradient(135deg,#667eea,#764ba2)',color:'white',border:'none',borderRadius:10,padding:'14px',fontSize:14,fontWeight:700,cursor:loading?'not-allowed':'pointer',opacity:loading?0.7:1,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
            <Play size={16}/>
            {loading?'Aguarde...' : mode==='create'?'Criar Sala' : mode==='join'?'Entrar' : `Iniciar (${totalRoundsSetup} ${totalRoundsSetup===1?'rodada':'rodadas'})`}
          </button>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════
      LOBBY
  ══════════════════════════════════════════════════════════ */
  if (view==='lobby') {
    const joined = Object.values(allPlayers).length;
    const max    = roomMaxPlayers;
    const canStart = isHost && joined>=2;
    return (
      <div style={{minHeight:'100vh',background:bg,color:text,display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
        <div style={{background:card,border:`1px solid ${border}`,borderRadius:20,padding:'36px 32px',width:'100%',maxWidth:460}}>

          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
            <div style={{width:44,height:44,background:'rgba(102,126,234,0.12)',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center'}}>
              <Users size={22} color="#667eea"/>
            </div>
            <div>
              <h2 style={{fontSize:16,fontWeight:700,margin:'0 0 2px',color:text}}>Sala criada</h2>
              <p style={{fontSize:12,color:dim,margin:0}}>Aguardando jogadores</p>
            </div>
          </div>

          {/* Config summary */}
          <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
            <span style={{fontSize:11,padding:'4px 10px',borderRadius:999,background:'rgba(102,126,234,0.1)',color:'#667eea',border:'1px solid rgba(102,126,234,0.2)'}}>
              {CAT_LABEL[categorySetup]}
            </span>
            <span style={{fontSize:11,padding:'4px 10px',borderRadius:999,background:'rgba(102,126,234,0.1)',color:'#667eea',border:'1px solid rgba(102,126,234,0.2)'}}>
              {totalRoundsSetup} {totalRoundsSetup===1?'rodada':'rodadas'}
            </span>
          </div>

          <div style={{background:inputBg,border:`1px dashed ${border}`,borderRadius:14,padding:'20px',marginBottom:16,textAlign:'center'}}>
            <div style={{fontSize:10,color:dim,marginBottom:6,letterSpacing:'0.12em',textTransform:'uppercase'}}>Código da sala</div>
            <div style={{fontFamily:'monospace',fontSize:46,fontWeight:900,letterSpacing:'0.22em',color:text}}>{roomCode}</div>
            <div style={{fontSize:11,color:dim,marginTop:4}}>Compartilhe com seus colegas</div>
          </div>

          <button onClick={copyCode}
            style={{display:'flex',alignItems:'center',gap:8,width:'100%',justifyContent:'center',marginBottom:20,background:copiedCode?'rgba(34,197,94,0.1)':'rgba(102,126,234,0.08)',border:`1px solid ${copiedCode?'rgba(34,197,94,0.3)':'rgba(102,126,234,0.25)'}`,color:copiedCode?'#22c55e':'#667eea',borderRadius:8,padding:'10px',cursor:'pointer',fontSize:13,fontWeight:600}}>
            {copiedCode?<><Check size={14}/> Copiado!</>:<><Copy size={14}/> Copiar código</>}
          </button>

          <div style={{marginBottom:20}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
              <span style={{fontSize:11,color:dim,textTransform:'uppercase',letterSpacing:'0.08em'}}>Jogadores</span>
              <span style={{fontSize:12,fontWeight:700,color:joined>=max?'#22c55e':dim}}>{joined}/{max}</span>
            </div>
            {Object.entries(allPlayers).map(([id,p])=>(
              <div key={id} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',background:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.03)',borderRadius:10,marginBottom:6}}>
                <div style={{width:8,height:8,borderRadius:'50%',background:'#22c55e',flexShrink:0}}/>
                <span style={{fontSize:13,fontWeight:600,color:text,flex:1}}>{p.name}</span>
                {id===playerId.current && <span style={{fontSize:10,color:'#667eea',background:'rgba(102,126,234,0.12)',padding:'2px 8px',borderRadius:999}}>você</span>}
              </div>
            ))}
            {Array.from({length:Math.max(0,max-joined)}).map((_,i)=>(
              <div key={`empty-${i}`} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',border:`1px dashed ${border}`,borderRadius:10,marginBottom:6}}>
                <div style={{width:8,height:8,borderRadius:'50%',background:border,flexShrink:0}}/>
                <span style={{fontSize:12,color:dim,fontStyle:'italic'}}>Aguardando...</span>
              </div>
            ))}
          </div>

          {error && <div style={{color:'#ef4444',fontSize:12,marginBottom:12,padding:'8px 12px',background:'rgba(239,68,68,0.1)',borderRadius:8}}>{error}</div>}

          {isHost ? (
            <button onClick={hostStart} disabled={!canStart}
              style={{width:'100%',background:canStart?'linear-gradient(135deg,#22c55e,#16a34a)':'rgba(100,116,139,0.2)',color:canStart?'white':dim,border:'none',borderRadius:10,padding:'14px',fontSize:14,fontWeight:700,cursor:canStart?'pointer':'not-allowed',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
              <Play size={16}/> {canStart?'Iniciar Batalha':`Aguardando (${joined}/${max})`}
            </button>
          ) : (
            <div style={{textAlign:'center',padding:'12px',fontSize:13,color:dim,background:isDark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.03)',borderRadius:10}}>
              <Clock size={14} style={{display:'inline',verticalAlign:'middle',marginRight:6}}/>
              Aguardando o host iniciar...
            </div>
          )}
          <button onClick={()=>{ unsubRef.current?.(); setView('menu'); }}
            style={{marginTop:14,width:'100%',background:'none',border:'none',color:dim,cursor:'pointer',fontSize:12}}>
            Sair da sala
          </button>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════
      BATTLE
  ══════════════════════════════════════════════════════════ */
  if (view==='battle') {
    const ChIcon = challenge.Icon;
    const isLastRound  = currentRound >= totalRounds - 1;
    const moreRounds   = mode==='solo' && submitted && !isLastRound;
    const myRoundScore = (myEntry?.scores?.[String(currentRound)] ?? -1);

    return (
      <div style={{height:'100vh',display:'flex',flexDirection:'column',background:bg,overflow:'hidden',position:'relative'}}>

        {/* Round transition overlay */}
        {roundTransition && (
          <div style={{position:'absolute',inset:0,zIndex:100,background:'rgba(0,0,0,0.88)',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:12}}>
            <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:11,color:'#667eea',letterSpacing:'0.1em'}}>PRÓXIMA RODADA</div>
            <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:32,color:'white'}}>{currentRound+1} / {totalRounds}</div>
            <div style={{color:'#64748b',fontSize:13,marginTop:8}}>Prepare-se...</div>
          </div>
        )}

        {/* Timer bar */}
        <div style={{height:4,background:isDark?'#1e293b':'#e2e8f0',flexShrink:0,position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',left:0,top:0,bottom:0,width:`${timerPct}%`,background:timerColor,transition:'width 1s linear,background 0.5s'}}/>
        </div>

        {/* Header */}
        <div style={{display:'flex',alignItems:'center',padding:'0 12px',height:52,background:card,borderBottom:`1px solid ${border}`,gap:8,flexShrink:0}}>
          <button onClick={onBackToHub} style={{background:'none',border:`1px solid ${border}`,color:dim,padding:'4px 10px',borderRadius:6,cursor:'pointer',fontSize:11,display:'flex',alignItems:'center',gap:4,flexShrink:0}}>
            <ArrowLeft size={11}/> Hub
          </button>

          {/* Round badge */}
          {totalRounds > 1 && (
            <div style={{display:'flex',alignItems:'center',gap:4,padding:'3px 10px',background:'rgba(102,126,234,0.12)',borderRadius:6,border:'1px solid rgba(102,126,234,0.25)',flexShrink:0}}>
              <span style={{fontSize:10,fontWeight:700,color:'#667eea',fontFamily:"'Press Start 2P',monospace"}}>R{currentRound+1}/{totalRounds}</span>
            </div>
          )}

          {/* Challenge info */}
          <div style={{display:'flex',alignItems:'center',gap:7,flex:1,minWidth:0}}>
            <div style={{width:24,height:24,background:`${challenge.iconColor}20`,borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <ChIcon size={12} color={challenge.iconColor}/>
            </div>
            <span style={{fontSize:12,fontWeight:700,color:text,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{challenge.title}</span>
            <span style={{fontSize:9,color:DIFF_COLOR[challenge.difficulty],background:`${DIFF_COLOR[challenge.difficulty]}18`,padding:'2px 7px',borderRadius:999,flexShrink:0}}>{challenge.difficulty}</span>
          </div>

          {/* Instruction toggle */}
          <button onClick={()=>setShowInstr(v=>!v)}
            style={{display:'flex',alignItems:'center',gap:4,background:showInstr?'rgba(102,126,234,0.12)':'none',border:`1px solid ${showInstr?'rgba(102,126,234,0.4)':border}`,color:showInstr?'#667eea':dim,borderRadius:6,padding:'4px 9px',cursor:'pointer',fontSize:10,fontWeight:600,flexShrink:0}}>
            <Eye size={11}/> {showInstr?<ChevronUp size={10}/>:<ChevronDown size={10}/>}
          </button>

          {/* Players */}
          <div style={{display:'flex',gap:5,alignItems:'center',flexShrink:0}}>
            <div style={{display:'flex',alignItems:'center',gap:4,padding:'3px 8px',background:'rgba(34,197,94,0.08)',borderRadius:6,border:'1px solid rgba(34,197,94,0.25)'}}>
              <div style={{width:5,height:5,borderRadius:'50%',background:'#22c55e'}}/>
              <span style={{fontSize:10,color:'#22c55e',fontWeight:600}}>{playerName||'Você'}</span>
              {submitted && <span style={{fontSize:10,color:'#22c55e',fontWeight:700}}>{playerScore}%</span>}
            </div>
            {opponents.map(([id,p])=>{
              const s = p.scores?.[String(currentRound)] ?? -1;
              return (
                <div key={id} style={{display:'flex',alignItems:'center',gap:4,padding:'3px 8px',background:'rgba(102,126,234,0.08)',borderRadius:6,border:'1px solid rgba(102,126,234,0.2)'}}>
                  <div style={{width:5,height:5,borderRadius:'50%',background:s>=0?'#667eea':'#94a3b8'}}/>
                  <span style={{fontSize:10,color:'#667eea',fontWeight:600}}>{p.name}</span>
                  {s>=0 ? <span style={{fontSize:10,color:'#667eea',fontWeight:700}}>{s}%</span>
                        : <span style={{fontSize:9,color:dim}}>jogando</span>}
                </div>
              );
            })}
          </div>

          {/* Timer */}
          <div style={{fontFamily:'monospace',fontSize:20,fontWeight:800,minWidth:58,textAlign:'right',flexShrink:0,color:timerColor}}>
            {fmtTime(timeLeft)}
          </div>
        </div>

        {/* Instructions panel */}
        {showInstr && (
          <div style={{flexShrink:0,background:isDark?'#0d1117':'#f0f4ff',borderBottom:`1px solid ${border}`,padding:'12px 14px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,maxHeight:170,overflowY:'auto'}}>
            <div>
              <div style={{fontSize:10,color:dim,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:5,display:'flex',alignItems:'center',gap:4}}><Eye size={10}/> Objetivo</div>
              <p style={{fontSize:12,color:text,margin:'0 0 8px',lineHeight:1.6}}>{challenge.description}</p>
              <div style={{fontSize:10,color:dim,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:5,display:'flex',alignItems:'center',gap:4}}><Code2 size={10}/> HTML disponível</div>
              <pre style={{fontSize:11,color:'#667eea',margin:0,background:isDark?'rgba(102,126,234,0.08)':'rgba(102,126,234,0.06)',padding:'7px',borderRadius:6,overflowX:'auto',lineHeight:1.5}}>
                {challenge.htmlStructure}
              </pre>
            </div>
            <div>
              <div style={{fontSize:10,color:dim,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:8,display:'flex',alignItems:'center',gap:4}}>
                <Lightbulb size={10}/> Dicas disponíveis
              </div>
              {([0,1,2] as (0|1|2)[]).map(i=>{
                const level = (i+1) as 1|2|3;
                const cost  = HINT_COSTS[i];
                const revealed = hintLevel >= level;
                return (
                  <div key={i} style={{marginBottom:6,padding:'8px 10px',borderRadius:8,background:revealed?'rgba(34,197,94,0.06)':isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.03)',border:`1px solid ${revealed?'rgba(34,197,94,0.2)':border}`}}>
                    {revealed ? (
                      <p style={{margin:0,fontSize:11,color:text,lineHeight:1.5}}><span style={{color:'#22c55e',fontWeight:700}}>Dica {level}: </span>{challenge.hints[i]}</p>
                    ) : (
                      <button onClick={()=>unlockHint(level)} style={{background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:6,padding:0,width:'100%'}}>
                        <Lightbulb size={11} color={cost===0?'#22c55e':'#f59e0b'}/>
                        <span style={{fontSize:11,color:cost===0?'#22c55e':'#f59e0b',fontWeight:600}}>
                          Dica {level} — {cost===0 ? 'grátis' : `🪙 ${cost} moedas`}
                        </span>
                      </button>
                    )}
                  </div>
                );
              })}
              {hintMsg && <p style={{fontSize:11,color:'#ef4444',margin:'4px 0 0'}}>{hintMsg}</p>}
            </div>
          </div>
        )}

        {/* Three panels */}
        <div style={{flex:1,display:'flex',minHeight:0,overflow:'hidden'}}>
          {/* Editor */}
          <div style={{width:'38%',minWidth:180,display:'flex',flexDirection:'column',borderRight:`1px solid ${border}`,minHeight:0}}>
            <div style={{padding:'5px 12px',fontSize:10,color:dim,background:'#1e1e2e',borderBottom:'1px solid rgba(255,255,255,0.05)',flexShrink:0,letterSpacing:'0.08em',display:'flex',alignItems:'center',gap:6}}>
              <Code2 size={10}/> EDITOR CSS
              {submitted && <span style={{color:'#22c55e',marginLeft:'auto',display:'flex',alignItems:'center',gap:3}}><Check size={10}/> enviado</span>}
            </div>
            <textarea value={playerCode} onChange={e=>{ if(!submitted) setPlayerCode(e.target.value); }}
              onKeyDown={handleTab} disabled={submitted} spellCheck={false} autoCorrect="off" autoCapitalize="off"
              style={{flex:1,minHeight:0,background:'#1e1e2e',color:'#cdd6f4',fontFamily:'monospace',fontSize:13,padding:14,border:'none',outline:'none',resize:'none',lineHeight:1.7,opacity:submitted?0.6:1}}/>
          </div>

          {/* Student preview */}
          <div style={{flex:1,display:'flex',flexDirection:'column',borderRight:`1px solid ${border}`,minHeight:0,minWidth:0}}>
            <div style={{padding:'5px 12px',fontSize:10,color:dim,background:card,borderBottom:`1px solid ${border}`,flexShrink:0,letterSpacing:'0.08em',display:'flex',alignItems:'center',gap:6}}>
              <Eye size={10}/> SEU PREVIEW
              <span style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:3,fontSize:9,color:'#22c55e',background:'rgba(34,197,94,0.10)',padding:'1px 6px',borderRadius:999}}>● AO VIVO</span>
              {submitted && playerScore>=0 && (
                <span style={{color:playerScore>=80?'#22c55e':playerScore>=50?'#f59e0b':'#ef4444',fontWeight:700,fontSize:13}}>{playerScore}%</span>
              )}
            </div>
            <div style={{flex:1,position:'relative',minHeight:0}}>
              <iframe ref={previewRef} title="preview" style={{position:'absolute',inset:0,width:'100%',height:'100%',border:'none'}}/>
            </div>
          </div>

          {/* Target */}
          <div style={{flex:1,display:'flex',flexDirection:'column',minHeight:0,minWidth:0}}>
            <div style={{padding:'5px 12px',fontSize:10,color:dim,background:card,borderBottom:`1px solid ${border}`,flexShrink:0,letterSpacing:'0.08em',display:'flex',alignItems:'center',gap:6}}>
              <ChIcon size={10} color={challenge.iconColor}/>
              <span style={{color:challenge.iconColor}}>ALVO — {challenge.title}</span>
            </div>
            <div style={{flex:1,position:'relative',minHeight:0}}>
              <iframe ref={targetRef} title="target" style={{position:'absolute',inset:0,width:'100%',height:'100%',border:'none'}}/>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{padding:'8px 14px',borderTop:`1px solid ${border}`,background:card,display:'flex',alignItems:'center',gap:10,flexShrink:0,flexWrap:'wrap',minHeight:52}}>
          {!submitted ? (
            <>
              <button onClick={()=>{ setShowInstr(true); setShowHints(true); }}
                style={{display:'flex',alignItems:'center',gap:5,background:'none',border:`1px solid ${border}`,color:dim,borderRadius:7,padding:'7px 12px',cursor:'pointer',fontSize:12}}>
                <Lightbulb size={13}/> Dicas{currentUser ? ` · 🪙${currentUser.coins}` : ''}
              </button>
              <button onClick={handleSubmit}
                style={{background:'linear-gradient(135deg,#22c55e,#16a34a)',color:'white',border:'none',borderRadius:8,padding:'9px 20px',fontSize:13,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',gap:7}}>
                <Zap size={13}/> Enviar Resposta
              </button>
            </>
          ) : (
            <div style={{display:'flex',alignItems:'center',gap:9,flexShrink:0}}>
              <Check size={13} color="#22c55e"/>
              <span style={{fontSize:12,color:'#22c55e',fontWeight:700}}>Enviado</span>
              <span style={{fontSize:22,fontWeight:900,color:playerScore>=80?'#22c55e':playerScore>=50?'#f59e0b':'#ef4444'}}>{playerScore}%</span>
            </div>
          )}

          {submitted && scoreDetails.length>0 && (
            <div style={{display:'flex',gap:4,flexWrap:'wrap',flex:1,justifyContent:'center'}}>
              {scoreDetails.map((d,i)=>(
                <span key={i} style={{fontSize:10,padding:'2px 7px',borderRadius:999,background:d.passed?'rgba(34,197,94,0.09)':'rgba(239,68,68,0.09)',color:d.passed?'#22c55e':'#ef4444',display:'flex',alignItems:'center',gap:2}}>
                  {d.passed?<Check size={8}/>:<X size={8}/>} {d.label}
                </span>
              ))}
            </div>
          )}

          {moreRounds && (
            <button onClick={advanceSoloRound}
              style={{background:'linear-gradient(135deg,#667eea,#764ba2)',color:'white',border:'none',borderRadius:8,padding:'9px 16px',cursor:'pointer',fontSize:12,fontWeight:700,display:'flex',alignItems:'center',gap:6,flexShrink:0}}>
              Rodada {currentRound+2}/{totalRounds} <ChevronRight size={13}/>
            </button>
          )}

          {mode==='solo' && submitted && isLastRound && (
            <button onClick={()=>setView('results')}
              style={{background:'rgba(102,126,234,0.1)',color:'#667eea',border:'1px solid rgba(102,126,234,0.3)',borderRadius:8,padding:'7px 14px',cursor:'pointer',fontSize:12,fontWeight:600,flexShrink:0}}>
              Ver resultado →
            </button>
          )}
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════
      RESULTS
  ══════════════════════════════════════════════════════════ */
  if (view==='results') {
    const isMulti = mode!=='solo' && Object.keys(allPlayers).length>=2;
    const sorted  = Object.entries(allPlayers).sort(([,a],[,b])=>(b.totalScore??0)-(a.totalScore??0));
    const topScore = sorted[0]?.[1]?.totalScore ?? 0;

    let headline=''; let headColor='#667eea';
    if (isMulti) {
      if (sorted.filter(([,p])=>p.totalScore===topScore).length>1) { headline='Empate!'; headColor='#f59e0b'; }
      else if (sorted[0]?.[0]===playerId.current)                  { headline='Você venceu!'; headColor='#22c55e'; }
      else { headline=`${sorted[0]?.[1]?.name} venceu!`; headColor='#ef4444'; }
    } else {
      const avg = roundResults.length ? Math.round(roundResults.reduce((a,r)=>a+r.score,0)/roundResults.length) : playerScore;
      headline = avg>=90?'Perfeito!':avg>=70?'Muito bem!':avg>=50?'Continue praticando!':'Tente novamente!';
      headColor= avg>=70?'#22c55e':avg>=50?'#f59e0b':'#ef4444';
    }

    const soloAvg = roundResults.length ? Math.round(roundResults.reduce((a,r)=>a+r.score,0)/roundResults.length) : playerScore;
    const ResultIcon = soloAvg>=90?Crown:soloAvg>=70?Trophy:soloAvg>=50?TrendingUp:Star;

    return (
      <div style={{minHeight:'100vh',background:bg,color:text,display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
        <div style={{background:card,border:`1px solid ${border}`,borderRadius:20,padding:'36px 32px',width:'100%',maxWidth:560,textAlign:'center'}}>

          <div style={{display:'flex',justifyContent:'center',marginBottom:14}}>
            <div style={{width:64,height:64,background:`${headColor}18`,borderRadius:18,display:'flex',alignItems:'center',justifyContent:'center'}}>
              <ResultIcon size={32} color={headColor}/>
            </div>
          </div>
          <h2 style={{fontSize:22,fontWeight:700,color:headColor,margin:'0 0 6px'}}>{headline}</h2>
          <p style={{fontSize:12,color:dim,margin:'0 0 24px'}}>
            {totalRounds > 1 ? `${totalRounds} rodadas · ${CAT_LABEL[categorySetup]}` : `Desafio: ${challenge.title}`}
          </p>

          {/* Multiplayer scores */}
          {isMulti && (
            <div style={{display:'grid',gridTemplateColumns:`repeat(${Math.min(sorted.length,3)},1fr)`,gap:10,marginBottom:22}}>
              {sorted.map(([id,p],i)=>(
                <div key={id} style={{background:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.04)',borderRadius:14,padding:'16px 8px',border:i===0?`2px solid ${headColor}28`:'none'}}>
                  {i===0&&<div style={{display:'flex',justifyContent:'center',marginBottom:4}}><Crown size={13} color={headColor}/></div>}
                  <div style={{fontSize:10,color:dim,marginBottom:4}}>{p.name}{id===playerId.current?' (você)':''}</div>
                  <div style={{fontSize:34,fontWeight:900,color:headColor}}>{p.totalScore??0}<span style={{fontSize:14,fontWeight:400}}>pts</span></div>
                  {totalRounds>1 && (
                    <div style={{display:'flex',justifyContent:'center',gap:4,flexWrap:'wrap',marginTop:6}}>
                      {Array.from({length:totalRounds}).map((_,ri)=>{
                        const s = p.scores?.[String(ri)] ?? -1;
                        return <span key={ri} style={{fontSize:10,padding:'1px 6px',borderRadius:4,background:s>=70?'rgba(34,197,94,0.12)':s>=50?'rgba(245,158,11,0.12)':'rgba(239,68,68,0.12)',color:s>=70?'#22c55e':s>=50?'#f59e0b':'#ef4444'}}>{s>=0?`${s}%`:'—'}</span>;
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Solo rounds breakdown */}
          {!isMulti && roundResults.length>0 && (
            <div style={{marginBottom:22}}>
              {roundResults.map((r,i)=>{
                const ch = CHALLENGES[r.challengeIdx];
                const Ic = ch?.Icon ?? Circle;
                return (
                  <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 12px',borderRadius:10,background:isDark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.03)',marginBottom:6,textAlign:'left'}}>
                    <div style={{width:30,height:30,background:`${ch?.iconColor||'#667eea'}18`,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      <Ic size={14} color={ch?.iconColor||'#667eea'}/>
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12,fontWeight:600,color:text}}>Rodada {i+1}: {ch?.title}</div>
                      <div style={{fontSize:10,color:dim,marginTop:1}}>{r.details.filter(d=>d.passed).length}/{r.details.length} critérios</div>
                    </div>
                    <div style={{fontSize:24,fontWeight:900,color:r.score>=70?'#22c55e':r.score>=50?'#f59e0b':'#ef4444',flexShrink:0}}>{r.score}%</div>
                  </div>
                );
              })}
              <div style={{padding:'10px 12px',borderRadius:10,background:`${headColor}10`,border:`1px solid ${headColor}20`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span style={{fontSize:13,fontWeight:600,color:text}}>Média geral</span>
                <span style={{fontSize:26,fontWeight:900,color:headColor}}>{soloAvg}%</span>
              </div>
            </div>
          )}

          {/* Last round score details (solo 1 rodada) */}
          {!isMulti && roundResults.length===1 && roundResults[0].details.length>0 && (
            <div style={{textAlign:'left',marginBottom:22}}>
              <div style={{fontSize:10,color:dim,marginBottom:8,textTransform:'uppercase',letterSpacing:'0.08em'}}>Critérios</div>
              {roundResults[0].details.map((d,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:8,fontSize:12,padding:'7px 10px',borderRadius:8,background:d.passed?'rgba(34,197,94,0.07)':'rgba(239,68,68,0.07)',marginBottom:4}}>
                  {d.passed?<Check size={11} color="#22c55e"/>:<X size={11} color="#ef4444"/>}
                  <span style={{flex:1,color:text}}>{d.label}</span>
                  <span style={{fontSize:10,color:dim}}>×{d.weight}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{display:'flex',gap:10}}>
            <button onClick={()=>{ unsubRef.current?.(); setAllPlayers({}); setRoomCode(''); setRoundResults([]); prevRoundRef.current=-1; roundScoresRef.current={}; setView('menu'); }}
              style={{flex:1,background:'linear-gradient(135deg,#667eea,#764ba2)',color:'white',border:'none',borderRadius:10,padding:'12px',fontSize:13,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
              <RefreshCw size={13}/> Jogar novamente
            </button>
            <button onClick={onBackToHub}
              style={{flex:1,background:'none',border:`1px solid ${border}`,color:dim,borderRadius:10,padding:'12px',fontSize:13,cursor:'pointer'}}>
              Voltar ao Hub
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

function clamp(min: number, max: number): number {
  if (typeof window === 'undefined') return max;
  const w = window.innerWidth;
  return Math.min(max, Math.max(min, Math.round(min + (w - 320) / (1200 - 320) * (max - min))));
}

export default CssBattlePage;
