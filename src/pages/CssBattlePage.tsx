import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft, Copy, Check, RefreshCw, Zap, Trophy, Clock,
  Lightbulb, Play, Swords, Home, Link, Gamepad2, Crown, Eye, Code2,
  Circle, Square, Palette, AlignCenter, MousePointer, User, LayoutGrid,
  RotateCw, Users, Star, X, TrendingUp, ChevronDown, ChevronUp,
  ChevronRight, Layout, Smile, UserMinus, Gamepad, type LucideIcon
} from 'lucide-react';

const CoinIcon = ({size=13}:{size?:number}) => (
  <span style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:size,height:size,background:'#f59e0b',borderRadius:'50%',fontSize:Math.round(size*0.55),fontWeight:900,color:'white',flexShrink:0,lineHeight:1,fontFamily:'monospace'}}>C</span>
);
import { useTheme } from '../hooks/useTheme';
import { useGameState } from '../hooks/useGameState';
import { db } from '../lib/firebase';
import { ref, set, update as dbUpdate, onValue, get } from 'firebase/database';

/* ── Types ─────────────────────────────────────────────────────────────── */

type Category = 'basico' | 'intermediario' | 'avancado' | 'pagina';
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
  htmlEditable?: boolean;
  starterHtml?: string;
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
    description: 'Crie um círculo vermelho de 100×100px usando CSS puro. Cor: #e74c3c (rgb 231,76,60).',
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
    description: 'Crie um quadrado azul de 100×100px com sombra ao redor. Cor de fundo: #3498db (rgb 52,152,219).',
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
    id: 2, title: 'Gradiente Colorido', category: 'intermediario', Icon: Palette, iconColor: '#f59e0b',
    difficulty: 'Fácil', points: 150,
    description: 'Crie um retângulo com gradiente linear do laranja ao vermelho. Cores: #f39c12 → #e74c3c, ângulo 135deg.',
    hints: [
      'Em vez de uma cor sólida, background aceita gradientes como valor.',
      'background: linear-gradient(ângulo, cor1, cor2). Use 135deg para diagonal.',
      'Solução: background: linear-gradient(135deg, #f39c12, #e74c3c);',
    ],
    htmlStructure: '<div class="card"></div>',
    targetHtml: '<div class="card"></div>',
    targetCss: `.card { width: 200px; height: 100px; background: linear-gradient(135deg, #f39c12, #e74c3c); border-radius: 12px; }`,
    starterCss: `.card {\n  width: 200px;\n  height: 100px;\n  border-radius: /* 12px */;\n  background: linear-gradient(/* ângulo */, /* cor1 */, /* cor2 */);\n}`,
  },
  {
    id: 3, title: 'Texto Centralizado', category: 'intermediario', Icon: AlignCenter, iconColor: '#8b5cf6',
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
    description: 'Estilize o botão: fundo verde, texto branco, sem borda padrão, cantos arredondados. Cor verde: #27ae60.',
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
    id: 5, title: 'Card de Perfil', category: 'intermediario', Icon: User, iconColor: '#6366f1',
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
    id: 6, title: 'Grid 2×2', category: 'intermediario', Icon: LayoutGrid, iconColor: '#14b8a6',
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
    id: 7, title: 'Spinner Animado', category: 'avancado', Icon: RotateCw, iconColor: '#f97316',
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
    id: 8, title: 'Row Espaçado', category: 'intermediario', Icon: AlignCenter, iconColor: '#667eea',
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
    id: 9, title: 'Nav Bar Flex', category: 'intermediario', Icon: Layout, iconColor: '#8b5cf6',
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
    id: 10, title: 'Coluna Flex', category: 'intermediario', Icon: TrendingUp, iconColor: '#22c55e',
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
    id: 11, title: 'Flex Wrap', category: 'intermediario', Icon: AlignCenter, iconColor: '#f59e0b',
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
    id: 12, title: 'Galeria de Fotos', category: 'intermediario', Icon: LayoutGrid, iconColor: '#14b8a6',
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
    id: 13, title: 'Layout Sidebar', category: 'intermediario', Icon: Layout, iconColor: '#6366f1',
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
    id: 14, title: 'Pulsar', category: 'avancado', Icon: Circle, iconColor: '#8b5cf6',
    difficulty: 'Médio', points: 250,
    description: 'Faça um círculo pulsar (crescer e encolher) continuamente com animação CSS. Cor do círculo: #667eea.',
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
    id: 15, title: 'Deslizar', category: 'avancado', Icon: ChevronRight, iconColor: '#22c55e',
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
    id: 16, title: 'Glassmorphism', category: 'avancado', Icon: Star, iconColor: '#f093fb',
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
    id: 17, title: 'Texto Gradiente', category: 'avancado', Icon: Palette, iconColor: '#f59e0b',
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
  /* ── Básico extra ────────────────────────────────────────────────── */
  {
    id: 21, title: 'Espaçamento Interno', category: 'basico', Icon: Square, iconColor: '#2c3e50',
    difficulty: 'Fácil', points: 80,
    description: 'Adicione padding de 24px dentro da caixa e defina fundo escuro. Cor: #2c3e50.',
    hints: [
      'Padding cria espaço entre o conteúdo e a borda. Aplica em todos os lados.',
      'padding: 24px aplica igual nos 4 lados. background-color: #2c3e50 define o fundo escuro.',
      'Solução: .caixa { padding: 24px; background-color: #2c3e50; border-radius: 10px; display: inline-block; }',
    ],
    htmlStructure: '<div class="caixa"><p class="txt">Olá, CSS!</p></div>',
    targetHtml: '<div class="caixa"><p class="txt">Olá, CSS!</p></div>',
    targetCss: `.caixa { padding: 24px; background-color: #2c3e50; border-radius: 10px; display: inline-block; } .txt { color: white; font-family: sans-serif; margin: 0; font-size: 18px; }`,
    starterCss: `.caixa {\n  padding: /* ? */;\n  background-color: /* use #2c3e50 */;\n  border-radius: 10px;\n  display: inline-block;\n}\n.txt {\n  color: white;\n  font-family: sans-serif;\n  margin: 0;\n  font-size: 18px;\n}`,
  },
  {
    id: 22, title: 'Meia Opacidade', category: 'basico', Icon: Circle, iconColor: '#9b59b6',
    difficulty: 'Fácil', points: 80,
    description: 'Deixe o elemento com 50% de opacidade. Cor de fundo: #9b59b6.',
    hints: [
      'A propriedade opacity aceita valores de 0 (invisível) a 1 (totalmente visível).',
      'opacity: 0.5 deixa o elemento com 50% de transparência.',
      'Solução: .bloco { background-color: #9b59b6; opacity: 0.5; width: 120px; height: 120px; border-radius: 12px; }',
    ],
    htmlStructure: '<div class="bloco"></div>',
    targetHtml: '<div class="bloco"></div>',
    targetCss: `.bloco { background-color: #9b59b6; opacity: 0.5; width: 120px; height: 120px; border-radius: 12px; }`,
    starterCss: `.bloco {\n  background-color: /* use #9b59b6 */;\n  opacity: /* ? */;\n  width: 120px;\n  height: 120px;\n  border-radius: 12px;\n}`,
  },
  {
    id: 23, title: 'Texto Itálico', category: 'basico', Icon: AlignCenter, iconColor: '#6366f1',
    difficulty: 'Fácil', points: 80,
    description: 'Deixe o texto em itálico e mude a cor para roxo. Cor: #6366f1.',
    hints: [
      'font-style: italic inclina o texto. color define a cor do texto.',
      'Use font-style: italic e color: #6366f1 no parágrafo.',
      'Solução: .texto { font-style: italic; color: #6366f1; font-size: 20px; font-family: sans-serif; }',
    ],
    htmlStructure: '<p class="texto">Aprendendo CSS!</p>',
    targetHtml: '<p class="texto">Aprendendo CSS!</p>',
    targetCss: `.texto { font-style: italic; color: #6366f1; font-size: 20px; font-family: sans-serif; margin: 0; }`,
    starterCss: `.texto {\n  font-style: /* ? */;\n  color: /* use #6366f1 */;\n  font-size: 20px;\n  font-family: sans-serif;\n  margin: 0;\n}`,
  },
  {
    id: 24, title: 'Borda Pontilhada', category: 'basico', Icon: Square, iconColor: '#f39c12',
    difficulty: 'Fácil', points: 80,
    description: 'Adicione uma borda pontilhada laranja de 3px. Cor: #f39c12.',
    hints: [
      'border-style pode ser: solid (sólida), dashed (tracejada) ou dotted (pontilhada).',
      'border: 3px dashed #f39c12 — 3px, tracejada, cor laranja.',
      'Solução: .caixa { border: 3px dashed #f39c12; width: 130px; height: 130px; border-radius: 8px; }',
    ],
    htmlStructure: '<div class="caixa"></div>',
    targetHtml: '<div class="caixa"></div>',
    targetCss: `.caixa { border: 3px dashed #f39c12; width: 130px; height: 130px; border-radius: 8px; background: transparent; }`,
    starterCss: `.caixa {\n  border: /* 3px dashed <cor> */;\n  width: 130px;\n  height: 130px;\n  border-radius: 8px;\n}`,
  },
  {
    id: 25, title: 'Sombra no Texto', category: 'basico', Icon: AlignCenter, iconColor: '#e74c3c',
    difficulty: 'Médio', points: 130,
    description: 'Adicione sombra escura ao título: text-shadow: 3px 3px 6px rgba(0,0,0,0.5).',
    hints: [
      'text-shadow aplica sombra diretamente nas letras, similar ao box-shadow para caixas.',
      'text-shadow: deslocX deslocY blur cor. Ex: 3px 3px 6px rgba(0,0,0,0.5).',
      'Solução: .titulo { text-shadow: 3px 3px 6px rgba(0,0,0,0.5); font-size: 28px; font-family: sans-serif; }',
    ],
    htmlStructure: '<h1 class="titulo">Sombra!</h1>',
    targetHtml: '<h1 class="titulo">Sombra!</h1>',
    targetCss: `.titulo { text-shadow: 3px 3px 6px rgba(0,0,0,0.5); font-size: 28px; font-family: sans-serif; font-weight: bold; margin: 0; }`,
    starterCss: `.titulo {\n  text-shadow: /* 3px 3px 6px rgba(0,0,0,0.5) */;\n  font-size: 28px;\n  font-family: sans-serif;\n  font-weight: bold;\n  margin: 0;\n}`,
  },

  /* ── Intermediário extra ──────────────────────────────────────────── */
  {
    id: 26, title: 'Posição Absoluta', category: 'intermediario', Icon: Layout, iconColor: '#e67e22',
    difficulty: 'Médio', points: 220,
    description: 'Posicione o ponto verde no canto inferior direito do container. Cor: #22c55e.',
    hints: [
      'Para posicionar um filho em relação ao pai, o pai precisa de position: relative.',
      'O filho recebe position: absolute e bottom/right para definir o canto.',
      'Solução: .container { position: relative; } .ponto { position: absolute; bottom: 10px; right: 10px; }',
    ],
    htmlStructure: '<div class="container">\n  <div class="ponto"></div>\n</div>',
    targetHtml: '<div class="container"><div class="ponto"></div></div>',
    targetCss: `.container { width: 180px; height: 180px; background: #1e293b; border-radius: 12px; position: relative; } .ponto { width: 22px; height: 22px; background: #22c55e; border-radius: 50%; position: absolute; bottom: 10px; right: 10px; }`,
    starterCss: `.container {\n  width: 180px;\n  height: 180px;\n  background: #1e293b;\n  border-radius: 12px;\n  position: /* ? */;\n}\n.ponto {\n  width: 22px;\n  height: 22px;\n  background: #22c55e;\n  border-radius: 50%;\n  position: /* ? */;\n  bottom: /* ? */;\n  right: /* ? */;\n}`,
  },
  {
    id: 27, title: 'Rotação', category: 'intermediario', Icon: RotateCw, iconColor: '#3498db',
    difficulty: 'Médio', points: 220,
    description: 'Gire o quadrado 45 graus usando transform. Cor: #3498db.',
    hints: [
      'transform permite rotacionar, escalar e mover elementos sem afetar o layout ao redor.',
      'transform: rotate(45deg) gira o elemento 45 graus no sentido horário.',
      'Solução: .caixa { transform: rotate(45deg); background: #3498db; width: 80px; height: 80px; }',
    ],
    htmlStructure: '<div class="caixa"></div>',
    targetHtml: '<div class="caixa"></div>',
    targetCss: `.caixa { width: 80px; height: 80px; background: #3498db; transform: rotate(45deg); }`,
    starterCss: `.caixa {\n  width: 80px;\n  height: 80px;\n  background: #3498db;\n  transform: /* rotate(?) */;\n}`,
  },
  {
    id: 28, title: 'Cortar Conteúdo', category: 'intermediario', Icon: Square, iconColor: '#16a34a',
    difficulty: 'Médio', points: 220,
    description: 'Corte o conteúdo que ultrapassa o container com overflow hidden.',
    hints: [
      'Por padrão, conteúdo maior que o container "transborda". overflow: hidden corta o excesso.',
      'Adicione overflow: hidden no .container para que o elemento filho seja cortado.',
      'Solução: .container { overflow: hidden; width: 160px; height: 100px; border-radius: 12px; }',
    ],
    htmlStructure: '<div class="container">\n  <div class="conteudo"></div>\n</div>',
    targetHtml: '<div class="container"><div class="conteudo"></div></div>',
    targetCss: `.container { width: 160px; height: 100px; background: #1e293b; border-radius: 12px; overflow: hidden; position: relative; } .conteudo { width: 220px; height: 220px; background: linear-gradient(135deg, #667eea, #f093fb); border-radius: 50%; }`,
    starterCss: `.container {\n  width: 160px;\n  height: 100px;\n  background: #1e293b;\n  border-radius: 12px;\n  overflow: /* ? */;\n  position: relative;\n}\n.conteudo {\n  width: 220px;\n  height: 220px;\n  background: linear-gradient(135deg, #667eea, #f093fb);\n  border-radius: 50%;\n}`,
  },
  {
    id: 29, title: 'Flex Grow', category: 'intermediario', Icon: TrendingUp, iconColor: '#f59e0b',
    difficulty: 'Médio', points: 250,
    description: 'Faça o item central ocupar todo o espaço restante do container flex.',
    hints: [
      'Em um container flex, flex-grow define quanto um item cresce em relação aos outros.',
      'flex: 1 (ou flex-grow: 1) faz o item ocupar todo o espaço disponível.',
      'Solução: .principal { flex: 1; background: #22c55e; border-radius: 8px; }',
    ],
    htmlStructure: '<div class="container">\n  <div class="lateral" style="background:#667eea"></div>\n  <div class="principal"></div>\n  <div class="lateral" style="background:#667eea"></div>\n</div>',
    targetHtml: '<div class="container"><div class="lateral" style="background:#667eea"></div><div class="principal"></div><div class="lateral" style="background:#667eea"></div></div>',
    targetCss: `.container { display: flex; gap: 8px; width: 280px; height: 80px; } .lateral { width: 50px; flex-shrink: 0; border-radius: 8px; } .principal { flex: 1; background: #22c55e; border-radius: 8px; }`,
    starterCss: `.container {\n  display: flex;\n  gap: 8px;\n  width: 280px;\n  height: 80px;\n}\n.lateral {\n  width: 50px;\n  flex-shrink: 0;\n  border-radius: 8px;\n}\n.principal {\n  flex: /* ? */;\n  background: #22c55e;\n  border-radius: 8px;\n}`,
  },
  {
    id: 30, title: 'Espaço entre Letras', category: 'intermediario', Icon: AlignCenter, iconColor: '#14b8a6',
    difficulty: 'Fácil', points: 180,
    description: 'Aumente o espaçamento entre as letras do título usando letter-spacing.',
    hints: [
      'letter-spacing controla o espaço entre cada caractere do texto.',
      'letter-spacing: 0.2em define o espaço proporcional ao tamanho da fonte.',
      'Solução: .titulo { letter-spacing: 0.2em; text-transform: uppercase; font-family: sans-serif; }',
    ],
    htmlStructure: '<h2 class="titulo">CSS BATTLE</h2>',
    targetHtml: '<h2 class="titulo">CSS BATTLE</h2>',
    targetCss: `.titulo { letter-spacing: 0.2em; text-transform: uppercase; font-family: sans-serif; font-weight: 700; font-size: 22px; margin: 0; color: #667eea; }`,
    starterCss: `.titulo {\n  letter-spacing: /* ? */;\n  text-transform: uppercase;\n  font-family: sans-serif;\n  font-weight: 700;\n  font-size: 22px;\n  margin: 0;\n  color: #667eea;\n}`,
  },

  /* ── Avançado extra ────────────────────────────────────────────────── */
  {
    id: 31, title: 'Triângulo CSS', category: 'avancado', Icon: TrendingUp, iconColor: '#ef4444',
    difficulty: 'Difícil', points: 350,
    description: 'Crie um triângulo usando clip-path: polygon. Cor: #ef4444.',
    hints: [
      'clip-path: polygon() recorta o elemento seguindo coordenadas de cada vértice.',
      'Um triângulo apontando para cima tem 3 pontos: polygon(50% 0%, 0% 100%, 100% 100%).',
      'Solução: .triangulo { clip-path: polygon(50% 0%, 0% 100%, 100% 100%); background: #ef4444; }',
    ],
    htmlStructure: '<div class="triangulo"></div>',
    targetHtml: '<div class="triangulo"></div>',
    targetCss: `.triangulo { width: 120px; height: 120px; background: #ef4444; clip-path: polygon(50% 0%, 0% 100%, 100% 100%); }`,
    starterCss: `.triangulo {\n  width: 120px;\n  height: 120px;\n  background: #ef4444;\n  clip-path: /* polygon(...) */;\n}`,
  },
  {
    id: 32, title: 'Neon Glow', category: 'avancado', Icon: Star, iconColor: '#00d4ff',
    difficulty: 'Difícil', points: 350,
    description: 'Crie efeito de brilho neon azul com box-shadow múltiplo. Cor: #00d4ff.',
    hints: [
      'box-shadow aceita múltiplas sombras separadas por vírgula, criando camadas de brilho.',
      'Empilhe sombras crescentes: 0 0 5px #00d4ff, 0 0 20px #00d4ff, 0 0 40px #00d4ff.',
      'Solução: .neon { box-shadow: 0 0 5px #00d4ff, 0 0 20px #00d4ff, 0 0 40px #00d4ff; border: 2px solid #00d4ff; }',
    ],
    htmlStructure: '<div class="neon"></div>',
    targetHtml: '<div class="neon"></div>',
    targetCss: `.neon { width: 100px; height: 100px; background: #050510; border: 2px solid #00d4ff; border-radius: 50%; box-shadow: 0 0 5px #00d4ff, 0 0 20px #00d4ff, 0 0 40px #00d4ff; }`,
    starterCss: `.neon {\n  width: 100px;\n  height: 100px;\n  background: #050510;\n  border: 2px solid #00d4ff;\n  border-radius: 50%;\n  box-shadow: /* múltiplas sombras neon */;\n}`,
  },
  {
    id: 33, title: 'Desfoque Gaussiano', category: 'avancado', Icon: Circle, iconColor: '#a855f7',
    difficulty: 'Médio', points: 280,
    description: 'Aplique desfoque gaussiano de 6px no elemento usando filter.',
    hints: [
      'filter: blur() aplica desfoque gaussiano no elemento inteiro.',
      'filter: blur(6px) — quanto maior o valor, maior o desfoque visual.',
      'Solução: .item { filter: blur(6px); }',
    ],
    htmlStructure: '<div class="item"></div>',
    targetHtml: '<div class="item"></div>',
    targetCss: `.item { width: 120px; height: 120px; background: linear-gradient(135deg, #a855f7, #ec4899); border-radius: 12px; filter: blur(6px); }`,
    starterCss: `.item {\n  width: 120px;\n  height: 120px;\n  background: linear-gradient(135deg, #a855f7, #ec4899);\n  border-radius: 12px;\n  filter: /* blur(?) */;\n}`,
  },
  {
    id: 34, title: 'Inclinação 3D', category: 'avancado', Icon: Layout, iconColor: '#f59e0b',
    difficulty: 'Difícil', points: 380,
    description: 'Incline o cartão em 3D usando perspective no pai e rotateX/Y no filho.',
    hints: [
      'Transform 3D precisa de perspective no elemento pai para criar profundidade visual.',
      'No pai: perspective: 600px. No filho: transform: rotateX(20deg) rotateY(-15deg).',
      'Solução: .cena { perspective: 600px; } .cartao { transform: rotateX(20deg) rotateY(-15deg); }',
    ],
    htmlStructure: '<div class="cena">\n  <div class="cartao"></div>\n</div>',
    targetHtml: '<div class="cena"><div class="cartao"></div></div>',
    targetCss: `.cena { width: 220px; height: 160px; perspective: 600px; display: flex; align-items: center; justify-content: center; } .cartao { width: 160px; height: 100px; background: linear-gradient(135deg, #f59e0b, #ef4444); border-radius: 12px; transform: rotateX(20deg) rotateY(-15deg); box-shadow: 0 20px 40px rgba(0,0,0,0.35); }`,
    starterCss: `.cena {\n  width: 220px;\n  height: 160px;\n  perspective: /* ? */;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n.cartao {\n  width: 160px;\n  height: 100px;\n  background: linear-gradient(135deg, #f59e0b, #ef4444);\n  border-radius: 12px;\n  transform: /* rotateX(...) rotateY(...) */;\n  box-shadow: 0 20px 40px rgba(0,0,0,0.35);\n}`,
  },

  /* ── Novos Básicos ────────────────────────────────────────────────── */
  {
    id: 18, title: 'Caixa Colorida', category: 'basico', Icon: Square, iconColor: '#3498db',
    difficulty: 'Fácil', points: 80,
    description: 'Pinte o fundo da caixa de azul e defina tamanho 150×150px. Cor exata: #3498db.',
    hints: [
      'A propriedade background-color define a cor de fundo de um elemento.',
      'Use background-color: #3498db para azul. Width e height definem largura e altura.',
      'Solução: .box { background-color: #3498db; width: 150px; height: 150px; }',
    ],
    htmlStructure: '<div class="box"></div>',
    targetHtml: '<div class="box"></div>',
    targetCss: `.box { background-color: #3498db; width: 150px; height: 150px; border-radius: 8px; }`,
    starterCss: `.box {\n  background-color: /* use #3498db */;\n  width: /* ? */;\n  height: /* ? */;\n  border-radius: 8px;\n}`,
  },
  {
    id: 19, title: 'Título Vermelho', category: 'basico', Icon: AlignCenter, iconColor: '#e74c3c',
    difficulty: 'Fácil', points: 80,
    description: 'Deixe o título vermelho e com font-size de 32px. Cor exata: #e74c3c.',
    hints: [
      'A propriedade color define a cor do texto. font-size define o tamanho.',
      'color: #e74c3c (vermelho). font-size: 32px. font-family: sans-serif para sem serifa.',
      'Solução: .titulo { color: #e74c3c; font-size: 32px; font-family: sans-serif; font-weight: bold; }',
    ],
    htmlStructure: '<h1 class="titulo">CSS é incrível!</h1>',
    targetHtml: '<h1 class="titulo">CSS é incrível!</h1>',
    targetCss: `.titulo { color: #e74c3c; font-size: 32px; font-family: sans-serif; font-weight: bold; margin: 0; }`,
    starterCss: `.titulo {\n  color: /* use #e74c3c */;\n  font-size: /* ? */;\n  font-family: sans-serif;\n  font-weight: bold;\n  margin: 0;\n}`,
  },
  {
    id: 20, title: 'Moldura Colorida', category: 'basico', Icon: Square, iconColor: '#27ae60',
    difficulty: 'Fácil', points: 80,
    description: 'Adicione uma borda sólida verde de 4px ao redor da caixa. Cor exata: #27ae60.',
    hints: [
      'A propriedade border aceita 3 valores: espessura, estilo e cor. Ex: 2px solid red.',
      'border: 4px solid #27ae60 — 4px de espessura, estilo sólido, cor verde.',
      'Solução: .caixa { border: 4px solid #27ae60; width: 120px; height: 120px; border-radius: 8px; }',
    ],
    htmlStructure: '<div class="caixa"></div>',
    targetHtml: '<div class="caixa"></div>',
    targetCss: `.caixa { border: 4px solid #27ae60; width: 120px; height: 120px; border-radius: 8px; background: transparent; }`,
    starterCss: `.caixa {\n  border: /* 4px solid <cor> */;\n  width: 120px;\n  height: 120px;\n  border-radius: 8px;\n}`,
  },

  /* ── Página Web ────────────────────────────────────────────────────── */
  {
    id: 35, title: 'Cartão de Apresentação', category: 'pagina', Icon: User, iconColor: '#667eea',
    difficulty: 'Fácil', points: 200,
    description: 'Crie um cartão de apresentação com: nome em h1, uma frase em p com uma palavra destacada em mark. Aplique CSS para adicionar fundo, padding e bordas arredondadas.',
    hints: [
      'Use div.cartao como container, h1 para o nome e p para a frase. A tag mark serve para realçar palavras.',
      'No CSS, dê fundo ao .cartao com background, padding interno e border-radius para arredondar.',
      'Exemplo de estrutura: <div class="cartao"><h1>Nome</h1><p>Olá, sou <mark>dev</mark>!</p></div>',
    ],
    htmlStructure: 'div.cartao + h1 + p com mark',
    htmlEditable: true,
    starterHtml: `<div class="cartao">\n  <h1>Seu Nome</h1>\n  <p>Olá! Sou <mark>estudante</mark> de programação.</p>\n</div>`,
    targetHtml: `<div class="cartao"><h1>Ana Silva</h1><p>Olá! Sou <mark>desenvolvedora</mark> web em formação.</p></div>`,
    targetCss: `.cartao { background: #f0f4ff; padding: 32px; border-radius: 16px; max-width: 340px; margin: 20px auto; box-shadow: 0 4px 16px rgba(0,0,0,0.1); } h1 { color: #667eea; font-size: 26px; margin: 0 0 12px; font-family: sans-serif; } p { color: #475569; font-size: 15px; line-height: 1.6; font-family: sans-serif; } mark { background: #fef08a; color: #92400e; padding: 1px 6px; border-radius: 4px; }`,
    starterCss: `.cartao {\n  /* adicione background, padding, border-radius */\n}\nh1 {\n  /* estilize o título */\n}\nmark {\n  /* estilize o destaque */\n}`,
  },
  {
    id: 36, title: 'Artigo com Destaques', category: 'pagina', Icon: AlignCenter, iconColor: '#f59e0b',
    difficulty: 'Fácil', points: 200,
    description: 'Crie um artigo com: título h1, subtítulo h2, parágrafo p e use mark para destacar um trecho. Estilize com fundo e uma borda lateral colorida no article.',
    hints: [
      'Use a tag article como container semântico, h1 para título, h2 para subtítulo e mark para o destaque.',
      'No CSS, aplique border-left no article para criar a borda lateral colorida. background e padding deixam mais visível.',
      'Exemplo: article { border-left: 5px solid #f59e0b; padding: 20px; background: #fffbeb; }',
    ],
    htmlStructure: 'article + h1 + h2 + p com mark',
    htmlEditable: true,
    starterHtml: `<article>\n  <h1>Título do Artigo</h1>\n  <h2>Subtítulo aqui</h2>\n  <p>Escreva o texto. Use <mark>mark</mark> para destacar.</p>\n</article>`,
    targetHtml: `<article><h1>CSS na Web</h1><h2>O que é e para que serve</h2><p>CSS é a linguagem que define o <mark>visual das páginas</mark> web, controlando cores, fontes e layouts.</p></article>`,
    targetCss: `body { font-family: Georgia, serif; } article { max-width: 540px; margin: 20px auto; padding: 24px 28px; background: #fffbeb; border-left: 5px solid #f59e0b; border-radius: 0 12px 12px 0; } h1 { color: #92400e; font-size: 22px; margin: 0 0 6px; } h2 { color: #b45309; font-size: 15px; font-weight: 600; margin: 0 0 14px; } p { color: #374151; line-height: 1.8; margin: 0; } mark { background: #fde68a; padding: 2px 4px; border-radius: 3px; }`,
    starterCss: `article {\n  /* border-left, padding, background */\n}\nh1 { /* cor e tamanho */ }\nh2 { /* cor e tamanho */ }\nmark { /* background e padding */ }`,
  },
  {
    id: 37, title: 'Lista de Tarefas', category: 'pagina', Icon: LayoutGrid, iconColor: '#22c55e',
    difficulty: 'Médio', points: 250,
    description: 'Crie uma lista de tarefas com: título h1, uma lista ul com pelo menos 3 itens li. No CSS: remova os marcadores padrão, adicione fundo e estilize cada item.',
    hints: [
      'Use ul para lista não ordenada e li para cada item. h1 é o título da lista.',
      'Para remover os bolinhas padrão: list-style: none; padding: 0 no ul. Cada li pode ter fundo e borda próprios.',
      'Exemplo: li { background: #f8fafc; border-left: 4px solid #22c55e; padding: 12px; border-radius: 6px; margin-bottom: 8px; }',
    ],
    htmlStructure: 'div.lista + h1 + ul > li×3',
    htmlEditable: true,
    starterHtml: `<div class="lista">\n  <h1>Minhas Tarefas</h1>\n  <ul>\n    <li>Tarefa 1</li>\n    <li>Tarefa 2</li>\n    <li>Tarefa 3</li>\n  </ul>\n</div>`,
    targetHtml: `<div class="lista"><h1>Minhas Tarefas</h1><ul><li>Estudar HTML</li><li>Praticar CSS</li><li>Criar uma página</li></ul></div>`,
    targetCss: `.lista { background: white; max-width: 360px; margin: 20px auto; padding: 24px 28px; border-radius: 14px; box-shadow: 0 2px 12px rgba(0,0,0,0.1); font-family: sans-serif; } h1 { font-size: 20px; color: #1e293b; margin: 0 0 16px; } ul { list-style: none; padding: 0; margin: 0; } li { padding: 12px 14px; margin-bottom: 8px; background: #f0fdf4; border-radius: 8px; border-left: 4px solid #22c55e; color: #15803d; font-size: 14px; font-weight: 500; }`,
    starterCss: `.lista {\n  /* container: background, padding, border-radius */\n}\nul {\n  list-style: none;\n  padding: 0;\n}\nli {\n  /* cada item: background, border-left, padding */\n}`,
  },
  {
    id: 38, title: 'Perfil com Foto', category: 'pagina', Icon: User, iconColor: '#8b5cf6',
    difficulty: 'Médio', points: 280,
    description: 'Crie um perfil com: foto circular usando img, nome em h1 e descrição em p. Centralize tudo e aplique border-radius 50% na imagem para ficar redonda.',
    hints: [
      'Use a tag img com src para a foto. Para uma imagem de exemplo, use: src="https://i.pravatar.cc/100"',
      'Para centralizar: text-align: center no container. Para deixar a foto redonda: img { border-radius: 50%; }',
      'Coloque h1 e p abaixo da img dentro de um div. O text-align: center no div centraliza tudo.',
    ],
    htmlStructure: 'div.perfil + img + h1 + p',
    htmlEditable: true,
    starterHtml: `<div class="perfil">\n  <img src="https://i.pravatar.cc/100" alt="Foto">\n  <h1>Seu Nome</h1>\n  <p>Sua descrição aqui.</p>\n</div>`,
    targetHtml: `<div class="perfil"><img src="https://i.pravatar.cc/100" alt="Avatar"><h1>Carlos Dev</h1><p>Desenvolvedor front-end apaixonado por CSS.</p></div>`,
    targetCss: `.perfil { text-align: center; max-width: 280px; margin: 30px auto; padding: 32px 20px; background: white; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.12); font-family: sans-serif; } img { width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 4px solid #8b5cf6; margin-bottom: 14px; } h1 { color: #1e293b; font-size: 20px; margin: 0 0 8px; } p { color: #64748b; font-size: 13px; line-height: 1.6; margin: 0; }`,
    starterCss: `.perfil {\n  text-align: center;\n  /* max-width, padding, background */\n}\nimg {\n  width: 100px;\n  height: 100px;\n  border-radius: /* ? */;\n  /* borda e espaçamento */\n}\nh1 { /* estilize o nome */ }\np { /* estilize a bio */ }`,
  },
  {
    id: 39, title: 'Página com Citação', category: 'pagina', Icon: AlignCenter, iconColor: '#ef4444',
    difficulty: 'Difícil', points: 320,
    description: 'Crie uma página com: título h1, parágrafo p com uma palavra em mark e uma citação usando blockquote. Estilize a blockquote com borda lateral e fundo diferente.',
    hints: [
      'Use a tag blockquote para citações. Ela é semanticamente correta para textos citados de outra fonte.',
      'Dê ao blockquote: border-left com cor, padding interno e um background diferente do restante da página.',
      'Exemplo: blockquote { border-left: 5px solid #667eea; padding: 16px; background: #f8fafc; border-radius: 0 8px 8px 0; }',
    ],
    htmlStructure: 'div + h1 + p com mark + blockquote',
    htmlEditable: true,
    starterHtml: `<div class="pagina">\n  <h1>Frase Favorita</h1>\n  <p>A <mark>prática</mark> leva à perfeição.</p>\n  <blockquote>\n    Escreva uma citação famosa aqui.\n  </blockquote>\n</div>`,
    targetHtml: `<div class="pagina"><h1>Frase Favorita</h1><p>A <mark>prática constante</mark> leva à perfeição.</p><blockquote>A simplicidade é o último grau da sofisticação. — Leonardo da Vinci</blockquote></div>`,
    targetCss: `.pagina { max-width: 500px; margin: 24px auto; padding: 28px; font-family: Georgia, serif; } h1 { color: #1e293b; font-size: 22px; margin: 0 0 14px; } p { color: #374151; line-height: 1.7; margin: 0 0 20px; } mark { background: #bbf7d0; color: #14532d; padding: 2px 5px; border-radius: 3px; } blockquote { margin: 0; padding: 16px 20px; background: #f8fafc; border-left: 5px solid #667eea; border-radius: 0 10px 10px 0; color: #475569; font-style: italic; font-size: 14px; line-height: 1.7; }`,
    starterCss: `.pagina {\n  max-width: 500px;\n  margin: 24px auto;\n  padding: 28px;\n}\nmark { /* background e padding */ }\nblockquote {\n  border-left: /* ? */;\n  padding: /* ? */;\n  background: /* ? */;\n}`,
  },

  /* ── Básico extra ──────────────────────────────────────────────────── */
  {
    id: 40, title: 'Sublinhado Colorido', category: 'basico', Icon: AlignCenter, iconColor: '#e74c3c',
    difficulty: 'Fácil', points: 80,
    description: 'Adicione sublinhado ao texto e mude a cor para vermelho #e74c3c.',
    hints: [
      'text-decoration adiciona decorações ao texto: underline (abaixo), overline (acima) ou line-through (tachado).',
      'text-decoration: underline; aplica o sublinhado. color: #e74c3c; muda a cor para vermelho.',
      'Solução: .texto { text-decoration: underline; color: #e74c3c; font-size: 22px; font-family: sans-serif; }',
    ],
    htmlStructure: '<h2 class="texto">Aprenda CSS!</h2>',
    targetHtml: '<h2 class="texto">Aprenda CSS!</h2>',
    targetCss: `.texto { text-decoration: underline; color: #e74c3c; font-size: 22px; font-family: sans-serif; font-weight: 700; }`,
    starterCss: `.texto {\n  font-size: 22px;\n  font-family: sans-serif;\n  text-decoration: /* ? */;\n  color: /* ? */;\n}`,
  },
  {
    id: 41, title: 'Sombra Interna', category: 'basico', Icon: Square, iconColor: '#8b5cf6',
    difficulty: 'Fácil', points: 120,
    description: 'Adicione uma sombra interna escura à caixa usando box-shadow com a palavra-chave inset.',
    hints: [
      'box-shadow normalmente projeta sombra para fora. Com inset no início, a sombra vai para dentro.',
      'box-shadow: inset 0 4px 12px rgba(0,0,0,0.35); — o inset cria o efeito de profundidade interno.',
      'Solução: .caixa { width: 150px; height: 100px; background: #8b5cf6; border-radius: 10px; box-shadow: inset 0 4px 12px rgba(0,0,0,0.35); }',
    ],
    htmlStructure: '<div class="caixa"></div>',
    targetHtml: '<div class="caixa"></div>',
    targetCss: `.caixa { width: 150px; height: 100px; background: #8b5cf6; border-radius: 10px; box-shadow: inset 0 4px 12px rgba(0,0,0,0.35); }`,
    starterCss: `.caixa {\n  width: 150px;\n  height: 100px;\n  background: #8b5cf6;\n  border-radius: 10px;\n  box-shadow: /* inset ... */;\n}`,
  },
  {
    id: 42, title: 'Tags Coloridas', category: 'basico', Icon: Square, iconColor: '#06b6d4',
    difficulty: 'Fácil', points: 100,
    description: 'Estilize os spans como pílulas: fundo ciano #06b6d4, texto branco, bordas completamente arredondadas.',
    hints: [
      'span é inline por padrão, mas com display: inline-block você pode aplicar padding e border-radius.',
      'border-radius: 999px cria cantos completamente arredondados em qualquer elemento.',
      'Solução: .tag { display: inline-block; background: #06b6d4; color: white; padding: 4px 14px; border-radius: 999px; margin: 4px; font-family: sans-serif; }',
    ],
    htmlStructure: '<span class="tag">HTML</span>\n<span class="tag">CSS</span>\n<span class="tag">JS</span>',
    targetHtml: '<span class="tag">HTML</span><span class="tag">CSS</span><span class="tag">JS</span>',
    targetCss: `.tag { display: inline-block; background: #06b6d4; color: white; padding: 4px 14px; border-radius: 999px; margin: 4px; font-size: 14px; font-family: sans-serif; font-weight: 600; }`,
    starterCss: `.tag {\n  display: /* inline-block */;\n  background: /* #06b6d4 */;\n  color: white;\n  padding: 4px 14px;\n  border-radius: /* ? */;\n  margin: 4px;\n  font-family: sans-serif;\n}`,
  },
  {
    id: 43, title: 'Fundo Semi-transparente', category: 'basico', Icon: Palette, iconColor: '#f59e0b',
    difficulty: 'Fácil', points: 110,
    description: 'Use rgba() para criar um fundo laranja semi-transparente. Use rgba(243,156,18,0.5).',
    hints: [
      'rgba() aceita 4 valores: vermelho, verde, azul (0-255) e alfa (0 a 1, onde 1 é opaco e 0 transparente).',
      'background: rgba(243, 156, 18, 0.5); — laranja com 50% de transparência.',
      'Solução: .caixa { width: 150px; height: 100px; background: rgba(243,156,18,0.5); border-radius: 10px; }',
    ],
    htmlStructure: '<div class="caixa"></div>',
    targetHtml: '<div class="caixa"></div>',
    targetCss: `.caixa { width: 150px; height: 100px; background: rgba(243,156,18,0.5); border-radius: 10px; }`,
    starterCss: `.caixa {\n  width: 150px;\n  height: 100px;\n  background: rgba(/* r,g,b,a */);\n  border-radius: 10px;\n}`,
  },
  {
    id: 44, title: 'Texto Maiúsculo', category: 'basico', Icon: AlignCenter, iconColor: '#667eea',
    difficulty: 'Fácil', points: 90,
    description: 'Transforme o texto em maiúsculo com CSS e adicione espaçamento entre letras de 0.1em.',
    hints: [
      'text-transform muda a capitalização do texto: uppercase (tudo maiúsculo), lowercase (tudo minúsculo).',
      'letter-spacing adiciona espaço entre cada caractere. Use valores em em para ser relativo ao tamanho da fonte.',
      'Solução: .titulo { text-transform: uppercase; letter-spacing: 0.1em; color: #667eea; font-size: 22px; }',
    ],
    htmlStructure: '<h2 class="titulo">css battle</h2>',
    targetHtml: '<h2 class="titulo">css battle</h2>',
    targetCss: `.titulo { text-transform: uppercase; letter-spacing: 0.1em; color: #667eea; font-size: 22px; font-family: sans-serif; font-weight: 700; }`,
    starterCss: `.titulo {\n  font-size: 22px;\n  font-family: sans-serif;\n  font-weight: 700;\n  text-transform: /* ? */;\n  letter-spacing: /* ? */;\n  color: #667eea;\n}`,
  },
  {
    id: 45, title: 'Centralizar com Margem', category: 'basico', Icon: AlignCenter, iconColor: '#22c55e',
    difficulty: 'Médio', points: 130,
    description: 'Centralize a caixa horizontalmente na página usando margin: 0 auto. A caixa tem largura 160px.',
    hints: [
      'margin: auto no eixo horizontal divide o espaço disponível igualmente nos dois lados.',
      'Para funcionar, o elemento precisa ter largura definida (width). margin: 0 auto define margens laterais automáticas.',
      'Solução: .caixa { width: 160px; height: 70px; background: #22c55e; margin: 0 auto; border-radius: 8px; }',
    ],
    htmlStructure: '<div style="width:100%"><div class="caixa"></div></div>',
    targetHtml: '<div style="width:100%"><div class="caixa"></div></div>',
    targetCss: `.caixa { width: 160px; height: 70px; background: #22c55e; margin: 0 auto; border-radius: 8px; }`,
    starterCss: `.caixa {\n  width: 160px;\n  height: 70px;\n  background: #22c55e;\n  border-radius: 8px;\n  margin: /* 0 auto */;\n}`,
  },
  {
    id: 46, title: 'Texto Tachado', category: 'basico', Icon: AlignCenter, iconColor: '#94a3b8',
    difficulty: 'Fácil', points: 90,
    description: 'Estilize o preço antigo com texto tachado e cor cinza, e o preço atual em verde.',
    hints: [
      'text-decoration aceita line-through para traçar uma linha no meio do texto.',
      'Combine text-decoration: line-through com color para deixar o preço antigo cinza apagado.',
      'Solução: .antigo { text-decoration: line-through; color: #94a3b8; } .preco { color: #22c55e; font-weight: 700; }',
    ],
    htmlStructure: '<p class="preco"><span class="antigo">R$100</span>  R$60</p>',
    targetHtml: '<p class="preco"><span class="antigo">R$100</span>  R$60</p>',
    targetCss: `.preco { font-family: sans-serif; font-size: 20px; color: #22c55e; font-weight: 700; } .antigo { text-decoration: line-through; color: #94a3b8; font-size: 14px; margin-right: 8px; }`,
    starterCss: `.preco {\n  font-family: sans-serif;\n  font-size: 20px;\n  font-weight: 700;\n  color: #22c55e;\n}\n.antigo {\n  text-decoration: /* line-through */;\n  color: /* cinza */;\n}`,
  },
  {
    id: 47, title: 'Bordas Assimétricas', category: 'basico', Icon: Square, iconColor: '#f59e0b',
    difficulty: 'Médio', points: 150,
    description: 'Crie uma forma com border-radius diferente em cada canto: 40% 10% 40% 10%.',
    hints: [
      'border-radius aceita até 4 valores separados por espaço: top-left, top-right, bottom-right, bottom-left.',
      'border-radius: 40% 10% 40% 10% — cantos opostos iguais criam formas orgânicas interessantes.',
      'Solução: .card { width: 130px; height: 130px; background: linear-gradient(135deg,#f59e0b,#ef4444); border-radius: 40% 10% 40% 10%; }',
    ],
    htmlStructure: '<div class="card"></div>',
    targetHtml: '<div class="card"></div>',
    targetCss: `.card { width: 130px; height: 130px; background: linear-gradient(135deg, #f59e0b, #ef4444); border-radius: 40% 10% 40% 10%; }`,
    starterCss: `.card {\n  width: 130px;\n  height: 130px;\n  background: linear-gradient(135deg, #f59e0b, #ef4444);\n  border-radius: /* 4 valores */;\n}`,
  },

  /* ── Intermediário extra ───────────────────────────────────────────── */
  {
    id: 48, title: 'Sobreposição Z-index', category: 'intermediario', Icon: LayoutGrid, iconColor: '#e74c3c',
    difficulty: 'Médio', points: 230,
    description: 'Faça .topo aparecer acima de .base usando position: absolute e z-index.',
    hints: [
      'z-index controla a ordem de empilhamento. Elemento com z-index maior fica na frente.',
      'Para z-index funcionar, o elemento precisa ter position diferente de static (use absolute, relative, etc.).',
      'Solução: .topo { position: absolute; z-index: 2; top: 20px; left: 30px; } — precisa do container com position: relative.',
    ],
    htmlStructure: '<div class="container">\n  <div class="base"></div>\n  <div class="topo"></div>\n</div>',
    targetHtml: '<div class="container"><div class="base"></div><div class="topo"></div></div>',
    targetCss: `.container { position: relative; width: 160px; height: 100px; } .base { position: absolute; width: 100px; height: 80px; background: #3498db; border-radius: 8px; top: 0; left: 0; z-index: 1; } .topo { position: absolute; width: 100px; height: 80px; background: #e74c3c; border-radius: 8px; top: 20px; left: 30px; z-index: 2; }`,
    starterCss: `.container { position: relative; width: 160px; height: 100px; }\n.base {\n  position: absolute;\n  width: 100px; height: 80px;\n  background: #3498db;\n  border-radius: 8px;\n  top: 0; left: 0;\n  z-index: /* ? */;\n}\n.topo {\n  position: absolute;\n  width: 100px; height: 80px;\n  background: #e74c3c;\n  border-radius: 8px;\n  top: 20px; left: 30px;\n  z-index: /* ? */;\n}`,
  },
  {
    id: 49, title: 'Aspect Ratio 16:9', category: 'intermediario', Icon: Layout, iconColor: '#1e293b',
    difficulty: 'Médio', points: 220,
    description: 'Crie um container com proporção de vídeo 16:9 usando a propriedade aspect-ratio.',
    hints: [
      'aspect-ratio define a relação entre largura e altura automaticamente. Ideal para manter proporções em telas diferentes.',
      'aspect-ratio: 16 / 9 — o navegador calcula a altura a partir da largura automaticamente.',
      'Solução: .video { width: 240px; aspect-ratio: 16 / 9; background: #2c3e50; border-radius: 10px; display: flex; align-items: center; justify-content: center; }',
    ],
    htmlStructure: '<div class="video"></div>',
    targetHtml: '<div class="video"></div>',
    targetCss: `.video { width: 240px; aspect-ratio: 16 / 9; background: #2c3e50; border-radius: 10px; display: flex; align-items: center; justify-content: center; }`,
    starterCss: `.video {\n  width: 240px;\n  aspect-ratio: /* 16 / 9 */;\n  background: #2c3e50;\n  border-radius: 10px;\n}`,
  },
  {
    id: 50, title: 'Gap no Flexbox', category: 'intermediario', Icon: LayoutGrid, iconColor: '#8b5cf6',
    difficulty: 'Médio', points: 200,
    description: 'Use a propriedade gap para adicionar 16px de espaçamento entre os itens do flex.',
    hints: [
      'gap funciona em containers flex e grid para adicionar espaço entre os itens sem precisar de margin em cada um.',
      'No container flex: display: flex; gap: 16px; — cria espaço uniforme entre todos os filhos.',
      'Solução: .row { display: flex; gap: 16px; align-items: center; } .item { width: 60px; height: 60px; background: #8b5cf6; border-radius: 8px; }',
    ],
    htmlStructure: '<div class="row">\n  <div class="item">A</div>\n  <div class="item">B</div>\n  <div class="item">C</div>\n</div>',
    targetHtml: '<div class="row"><div class="item" style="display:flex;align-items:center;justify-content:center;color:white;font-family:sans-serif;font-weight:700;font-size:18px;">A</div><div class="item" style="display:flex;align-items:center;justify-content:center;color:white;font-family:sans-serif;font-weight:700;font-size:18px;">B</div><div class="item" style="display:flex;align-items:center;justify-content:center;color:white;font-family:sans-serif;font-weight:700;font-size:18px;">C</div></div>',
    targetCss: `.row { display: flex; gap: 16px; align-items: center; } .item { width: 60px; height: 60px; background: #8b5cf6; border-radius: 8px; }`,
    starterCss: `.row {\n  display: /* flex */;\n  gap: /* ? */;\n  align-items: center;\n}\n.item {\n  width: 60px;\n  height: 60px;\n  background: /* #8b5cf6 */;\n  border-radius: 8px;\n}`,
  },
  {
    id: 51, title: 'Transição Suave', category: 'intermediario', Icon: RotateCw, iconColor: '#3498db',
    difficulty: 'Médio', points: 220,
    description: 'Adicione transição de 0.3s ao botão para que mudanças de estilo ocorram suavemente.',
    hints: [
      'transition define qual propriedade animar, quanto tempo dura e a função de timing.',
      'transition: background-color 0.3s ease — anima apenas o background em 0.3 segundos.',
      'Solução: .btn { transition: background-color 0.3s ease, transform 0.2s ease; background: #3498db; ... }',
    ],
    htmlStructure: '<button class="btn">Clique aqui!</button>',
    targetHtml: '<button class="btn">Clique aqui!</button>',
    targetCss: `.btn { background: #3498db; color: white; border: none; padding: 12px 28px; border-radius: 10px; font-size: 15px; cursor: pointer; transition: background-color 0.3s ease, transform 0.2s ease; font-family: sans-serif; font-weight: 600; }`,
    starterCss: `.btn {\n  background: /* #3498db */;\n  color: white;\n  border: none;\n  padding: 12px 28px;\n  border-radius: /* 10px */;\n  font-size: 15px;\n  cursor: pointer;\n  font-family: sans-serif;\n  transition: /* propriedade duração timing */;\n}`,
  },
  {
    id: 52, title: 'Grid 2×2 com Gap', category: 'intermediario', Icon: LayoutGrid, iconColor: '#ef4444',
    difficulty: 'Médio', points: 230,
    description: 'Crie um grid 2×2 com colunas iguais e 12px de espaçamento entre células.',
    hints: [
      'display: grid ativa o CSS Grid. grid-template-columns define quantas colunas e seus tamanhos.',
      'repeat(2, 1fr) cria 2 colunas com espaço igual. gap: 12px adiciona espaço entre linhas e colunas.',
      'Solução: .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; } .item { height: 60px; background: #ef4444; border-radius: 6px; }',
    ],
    htmlStructure: '<div class="grid">\n  <div class="item"></div>\n  <div class="item"></div>\n  <div class="item"></div>\n  <div class="item"></div>\n</div>',
    targetHtml: '<div class="grid"><div class="item"></div><div class="item"></div><div class="item"></div><div class="item"></div></div>',
    targetCss: `.grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; width: 200px; } .item { height: 60px; background: #ef4444; border-radius: 6px; }`,
    starterCss: `.grid {\n  width: 200px;\n  display: /* grid */;\n  grid-template-columns: /* repeat(2, 1fr) */;\n  gap: /* ? */;\n}\n.item {\n  height: 60px;\n  background: /* #ef4444 */;\n  border-radius: 6px;\n}`,
  },
  {
    id: 53, title: 'Max-width Responsivo', category: 'intermediario', Icon: Layout, iconColor: '#667eea',
    difficulty: 'Médio', points: 200,
    description: 'Limite a largura máxima do parágrafo a 280px e adicione a borda lateral azul.',
    hints: [
      'max-width define o limite máximo de largura. O elemento pode ser menor, mas nunca maior que esse valor.',
      'Combine max-width com margin: 0 auto para centralizar e border-left para o destaque visual.',
      'Solução: .texto { max-width: 280px; margin: 0 auto; padding: 16px; border-left: 4px solid #667eea; background: #f0f4ff; }',
    ],
    htmlStructure: '<p class="texto">Este parágrafo tem largura máxima definida por CSS.</p>',
    targetHtml: '<p class="texto">Este parágrafo tem largura máxima definida por CSS.</p>',
    targetCss: `.texto { max-width: 280px; margin: 0 auto; padding: 16px; border-left: 4px solid #667eea; background: #f0f4ff; border-radius: 0 8px 8px 0; font-family: sans-serif; color: #1e293b; font-size: 14px; line-height: 1.6; }`,
    starterCss: `.texto {\n  max-width: /* 280px */;\n  margin: 0 auto;\n  padding: 16px;\n  border-left: /* 4px solid cor */;\n  background: #f0f4ff;\n  border-radius: 0 8px 8px 0;\n  font-family: sans-serif;\n}`,
  },
  {
    id: 54, title: 'Sidebar com Flex-grow', category: 'intermediario', Icon: Layout, iconColor: '#1e293b',
    difficulty: 'Médio', points: 240,
    description: 'Crie um layout com sidebar fixa e conteúdo principal que ocupa o espaço restante com flex-grow.',
    hints: [
      'flex-grow define quanto um item flex cresce para preencher o espaço livre. Valor 1 = absorve tudo.',
      'A sidebar tem width fixa. O .main com flex-grow: 1 preenche automaticamente o restante do container.',
      'Solução: .container { display: flex; height: 120px; gap: 12px; } .main { flex-grow: 1; background: #f8fafc; }',
    ],
    htmlStructure: '<div class="container">\n  <div class="sidebar">Nav</div>\n  <div class="main">Conteúdo</div>\n</div>',
    targetHtml: '<div class="container"><div class="sidebar" style="display:flex;align-items:center;justify-content:center;color:white;font-family:sans-serif;">Nav</div><div class="main" style="display:flex;align-items:center;justify-content:center;font-family:sans-serif;color:#475569;">Conteúdo</div></div>',
    targetCss: `.container { display: flex; height: 120px; gap: 8px; width: 280px; } .sidebar { background: #1e293b; width: 70px; border-radius: 8px 0 0 8px; flex-shrink: 0; } .main { flex-grow: 1; background: #f8fafc; border-radius: 0 8px 8px 0; padding: 16px; }`,
    starterCss: `.container {\n  display: /* flex */;\n  height: 120px;\n  gap: 8px;\n  width: 280px;\n}\n.sidebar {\n  background: /* #1e293b */;\n  width: 70px;\n  border-radius: 8px 0 0 8px;\n  flex-shrink: 0;\n}\n.main {\n  flex-grow: /* ? */;\n  background: #f8fafc;\n  border-radius: 0 8px 8px 0;\n}`,
  },
  {
    id: 55, title: 'Objeto Ajustado (Object Fit)', category: 'intermediario', Icon: Square, iconColor: '#22c55e',
    difficulty: 'Médio', points: 220,
    description: 'Faça a imagem preencher seu container 200×130px sem distorcer, usando object-fit: cover.',
    hints: [
      'Por padrão, img se distorce para caber nos tamanhos definidos. object-fit: cover mantém a proporção e corta o excesso.',
      'object-fit: cover preenche o espaço completamente. object-fit: contain mantém tudo visível mas pode deixar espaço.',
      'Solução: .foto { width: 200px; height: 130px; object-fit: cover; border-radius: 12px; display: block; }',
    ],
    htmlStructure: '<img class="foto" src="https://picsum.photos/seed/css/400/200" alt="foto">',
    targetHtml: '<img class="foto" src="https://picsum.photos/seed/css/400/200" alt="foto">',
    targetCss: `.foto { width: 200px; height: 130px; object-fit: cover; border-radius: 12px; display: block; }`,
    starterCss: `.foto {\n  width: 200px;\n  height: 130px;\n  object-fit: /* cover */;\n  border-radius: /* 12px */;\n  display: block;\n}`,
  },

  /* ── Avançado extra ────────────────────────────────────────────────── */
  {
    id: 56, title: 'Variáveis CSS', category: 'avancado', Icon: Code2, iconColor: '#667eea',
    difficulty: 'Difícil', points: 320,
    description: 'Use custom properties (variáveis CSS) com :root { --cor } e aplique com var(--cor).',
    hints: [
      'Variáveis CSS são declaradas com -- no :root e referenciadas com var(). Facilitam manutenção e consistência.',
      ':root { --primary: #667eea; } — declaração. No elemento: background: var(--primary); — uso.',
      'Solução: :root { --primary: #667eea; --radius: 12px; } .card { background: var(--primary); border-radius: var(--radius); }',
    ],
    htmlStructure: '<div class="card"><div class="titulo">Variáveis</div><div class="body">CSS moderno!</div></div>',
    targetHtml: '<div class="card"><div class="titulo">Variáveis</div><div class="body">CSS moderno!</div></div>',
    targetCss: `:root { --primary: #667eea; --radius: 12px; --pad: 20px; } .card { background: var(--primary); border-radius: var(--radius); padding: var(--pad); width: 180px; } .titulo { color: white; font-weight: 700; font-size: 17px; font-family: sans-serif; } .body { color: rgba(255,255,255,0.8); font-family: sans-serif; margin-top: 8px; font-size: 13px; }`,
    starterCss: `:root {\n  --primary: /* #667eea */;\n  --radius: /* 12px */;\n}\n.card {\n  background: var(--primary);\n  border-radius: var(--radius);\n  padding: 20px;\n  width: 180px;\n}\n.titulo { color: white; font-weight: 700; font-family: sans-serif; }\n.body { color: rgba(255,255,255,0.8); font-family: sans-serif; margin-top: 8px; }`,
  },
  {
    id: 57, title: 'Gradiente Cônico', category: 'avancado', Icon: Circle, iconColor: '#e74c3c',
    difficulty: 'Difícil', points: 350,
    description: 'Crie um gráfico de pizza com conic-gradient: vermelho 0%-30%, azul 30%-70%, verde 70%-100%.',
    hints: [
      'conic-gradient() cria gradiente em arco ao redor de um ponto central, ideal para gráficos de pizza.',
      'background: conic-gradient(cor1 0% X%, cor2 X% Y%, cor3 Y% 100%) — cada fatia tem início e fim em %.',
      'Solução: .grafico { background: conic-gradient(#e74c3c 0% 30%, #3498db 30% 70%, #2ecc71 70% 100%); border-radius: 50%; width: 140px; height: 140px; }',
    ],
    htmlStructure: '<div class="grafico"></div>',
    targetHtml: '<div class="grafico"></div>',
    targetCss: `.grafico { width: 140px; height: 140px; background: conic-gradient(#e74c3c 0% 30%, #3498db 30% 70%, #2ecc71 70% 100%); border-radius: 50%; }`,
    starterCss: `.grafico {\n  width: 140px;\n  height: 140px;\n  border-radius: 50%;\n  background: conic-gradient(\n    /* cor1 */ 0% /* % */,\n    /* cor2 */ /* % */ /* % */,\n    /* cor3 */ /* % */ 100%\n  );\n}`,
  },
  {
    id: 58, title: 'Mix Blend Mode', category: 'avancado', Icon: Palette, iconColor: '#3498db',
    difficulty: 'Difícil', points: 360,
    description: 'Sobreponha dois círculos coloridos com mix-blend-mode: multiply para misturar as cores.',
    hints: [
      'mix-blend-mode define como o pixel do elemento se mistura com o pixel do elemento abaixo.',
      'multiply escurece a interseção multiplicando os valores de cor. Requer background claro no container pai.',
      'Solução: .b { mix-blend-mode: multiply; } — aplique no círculo de cima para ver a mistura.',
    ],
    htmlStructure: '<div class="scene">\n  <div class="circle a"></div>\n  <div class="circle b"></div>\n</div>',
    targetHtml: '<div class="scene"><div class="circle a"></div><div class="circle b"></div></div>',
    targetCss: `.scene { position: relative; width: 160px; height: 110px; background: white; border-radius: 8px; } .circle { position: absolute; width: 90px; height: 90px; border-radius: 50%; top: 10px; } .a { background: #e74c3c; left: 10px; } .b { background: #3498db; left: 50px; mix-blend-mode: multiply; }`,
    starterCss: `.scene { position: relative; width: 160px; height: 110px; background: white; border-radius: 8px; }\n.circle { position: absolute; width: 90px; height: 90px; border-radius: 50%; top: 10px; }\n.a { background: #e74c3c; left: 10px; }\n.b { background: #3498db; left: 50px; mix-blend-mode: /* ? */; }`,
  },
  {
    id: 59, title: 'Filtros Combinados', category: 'avancado', Icon: Star, iconColor: '#a855f7',
    difficulty: 'Difícil', points: 340,
    description: 'Aplique brightness(1.3) e saturate(1.6) juntos no mesmo elemento usando filter.',
    hints: [
      'filter aceita múltiplas funções separadas por espaço, todas aplicadas em sequência ao elemento.',
      'brightness(1.3) aumenta o brilho 30%. saturate(1.6) aumenta a saturação de cores 60%.',
      'Solução: .imagem { filter: brightness(1.3) saturate(1.6); }',
    ],
    htmlStructure: '<div class="imagem"></div>',
    targetHtml: '<div class="imagem"></div>',
    targetCss: `.imagem { width: 170px; height: 110px; background: linear-gradient(135deg, #e74c3c, #f39c12); border-radius: 10px; filter: brightness(1.3) saturate(1.6); }`,
    starterCss: `.imagem {\n  width: 170px;\n  height: 110px;\n  background: linear-gradient(135deg, #e74c3c, #f39c12);\n  border-radius: 10px;\n  filter: /* brightness() saturate() */;\n}`,
  },
  {
    id: 60, title: 'Clip-path Hexágono', category: 'avancado', Icon: Circle, iconColor: '#8b5cf6',
    difficulty: 'Difícil', points: 370,
    description: 'Crie um hexágono usando clip-path: polygon() com 6 pontos.',
    hints: [
      'clip-path: polygon() define os pontos do polígono em coordenadas x y. Cada ponto é separado por vírgula.',
      'Um hexágono regular tem 6 pontos: 50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%.',
      'Solução: .forma { clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); }',
    ],
    htmlStructure: '<div class="forma"></div>',
    targetHtml: '<div class="forma"></div>',
    targetCss: `.forma { width: 120px; height: 120px; background: #8b5cf6; clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); }`,
    starterCss: `.forma {\n  width: 120px;\n  height: 120px;\n  background: #8b5cf6;\n  clip-path: polygon(/* 6 pontos */);\n}`,
  },
  {
    id: 61, title: 'Grid de Layout', category: 'avancado', Icon: LayoutGrid, iconColor: '#1e293b',
    difficulty: 'Difícil', points: 390,
    description: 'Crie um layout de página com grid-template-areas: header, sidebar+conteúdo, footer.',
    hints: [
      'grid-template-areas usa strings com nomes para definir o layout. Cada string é uma linha, cada nome uma área.',
      'Defina as áreas no container e use grid-area: nome; em cada filho para posicioná-los.',
      'Solução: grid-template-areas: "header header" "sidebar content" "footer footer" — 2 colunas, 3 linhas.',
    ],
    htmlStructure: '<div class="layout"><div class="header">Topo</div><div class="sidebar">Nav</div><div class="content">Principal</div><div class="footer">Rodapé</div></div>',
    targetHtml: '<div class="layout"><div class="header">Topo</div><div class="sidebar">Nav</div><div class="content">Principal</div><div class="footer">Rodapé</div></div>',
    targetCss: `.layout { display: grid; grid-template-areas: "header header" "sidebar content" "footer footer"; grid-template-columns: 70px 1fr; grid-template-rows: 36px 80px 30px; gap: 4px; width: 260px; font-family: sans-serif; font-size: 12px; } .header { grid-area: header; background: #1e293b; color: white; display: flex; align-items: center; justify-content: center; border-radius: 4px; } .sidebar { grid-area: sidebar; background: #334155; color: white; display: flex; align-items: center; justify-content: center; border-radius: 4px; } .content { grid-area: content; background: #f1f5f9; display: flex; align-items: center; justify-content: center; border-radius: 4px; color: #475569; } .footer { grid-area: footer; background: #94a3b8; display: flex; align-items: center; justify-content: center; border-radius: 4px; color: white; }`,
    starterCss: `.layout {\n  display: grid;\n  grid-template-areas:\n    "header header"\n    "sidebar content"\n    "footer footer";\n  grid-template-columns: 70px 1fr;\n  grid-template-rows: 36px 80px 30px;\n  gap: 4px;\n  width: 260px;\n  font-family: sans-serif;\n  font-size: 12px;\n}\n.header   { grid-area: header;  background: #1e293b; color: white; display: flex; align-items: center; justify-content: center; border-radius: 4px; }\n.sidebar  { grid-area: sidebar; background: #334155; color: white; display: flex; align-items: center; justify-content: center; border-radius: 4px; }\n.content  { grid-area: content; background: #f1f5f9; display: flex; align-items: center; justify-content: center; border-radius: 4px; }\n.footer   { grid-area: footer;  background: #94a3b8; color: white; display: flex; align-items: center; justify-content: center; border-radius: 4px; }`,
  },

  /* ── Página Web extra ──────────────────────────────────────────────── */
  {
    id: 62, title: 'Formulário de Contato', category: 'pagina', Icon: User, iconColor: '#22c55e',
    difficulty: 'Médio', points: 260,
    description: 'Crie um formulário com: label + input para nome, label + input para e-mail e um button de enviar. Estilize com CSS.',
    hints: [
      'form é o container semântico. label + input para cada campo. button type="submit" para enviar.',
      'Estilize os inputs com width: 100%, padding, border e border-radius. button com background colorido.',
      'Estrutura: <form><label>Nome</label><input type="text"><label>Email</label><input type="email"><button>Enviar</button></form>',
    ],
    htmlStructure: 'form + label + input×2 + button',
    htmlEditable: true,
    starterHtml: `<!-- Crie o formulário aqui -->\n<!-- Use: <form>, <label>, <input type="text">, <input type="email">, <button> -->`,
    targetHtml: `<form class="form"><label>Nome</label><input type="text" placeholder="Seu nome"><label>E-mail</label><input type="email" placeholder="seu@email.com"><button type="submit">Enviar</button></form>`,
    targetCss: `.form { display: flex; flex-direction: column; gap: 10px; max-width: 300px; padding: 24px; background: white; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); font-family: sans-serif; } label { font-size: 13px; font-weight: 600; color: #374151; } input { padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; outline: none; width: 100%; box-sizing: border-box; } button { padding: 11px; background: #22c55e; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }`,
    starterCss: `.form {\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n  max-width: 300px;\n  padding: 24px;\n  /* background e border-radius */\n}\nlabel { font-size: 13px; font-weight: 600; font-family: sans-serif; }\ninput {\n  padding: 10px 12px;\n  border: 1px solid #e2e8f0;\n  border-radius: 8px;\n  width: 100%;\n  box-sizing: border-box;\n}\nbutton {\n  padding: 11px;\n  /* background, cor, border-none */\n  border-radius: 8px;\n  cursor: pointer;\n}`,
  },
  {
    id: 63, title: 'Tabela de Dados', category: 'pagina', Icon: LayoutGrid, iconColor: '#3498db',
    difficulty: 'Médio', points: 270,
    description: 'Crie uma tabela com cabeçalho (th) e pelo menos 3 linhas de dados (td). Estilize com fundo alternado.',
    hints: [
      'table > thead > tr > th para o cabeçalho. table > tbody > tr > td para os dados.',
      'border-collapse: collapse remove o espaço duplo entre bordas. tr:nth-child(even) cria linhas alternadas.',
      'Estrutura: <table><thead><tr><th>Nome</th><th>Nota</th></tr></thead><tbody><tr><td>Ana</td><td>95</td></tr>...</tbody></table>',
    ],
    htmlStructure: 'table + thead/th + tbody/tr/td×3',
    htmlEditable: true,
    starterHtml: `<!-- Crie a tabela aqui -->\n<!-- Estrutura: <table><thead><tr><th>...</th></tr></thead><tbody><tr><td>...</td></tr></tbody></table> -->`,
    targetHtml: `<table><thead><tr><th>Nome</th><th>Matéria</th><th>Nota</th></tr></thead><tbody><tr><td>Ana</td><td>CSS</td><td>95</td></tr><tr><td>Carlos</td><td>HTML</td><td>88</td></tr><tr><td>Julia</td><td>JS</td><td>91</td></tr></tbody></table>`,
    targetCss: `table { border-collapse: collapse; width: 280px; font-family: sans-serif; font-size: 14px; } th { background: #1e293b; color: white; padding: 10px 14px; text-align: left; } td { padding: 9px 14px; border-bottom: 1px solid #e2e8f0; color: #374151; } tr:nth-child(even) td { background: #f8fafc; } tr:nth-child(odd) td { background: white; }`,
    starterCss: `table {\n  border-collapse: collapse;\n  width: 280px;\n  font-family: sans-serif;\n}\nth {\n  background: /* cor escura */;\n  color: /* ? */;\n  padding: 10px 14px;\n  text-align: left;\n}\ntd {\n  padding: 9px 14px;\n  border-bottom: 1px solid #e2e8f0;\n}\ntr:nth-child(even) td { background: /* cor alternada */; }`,
  },
  {
    id: 64, title: 'Menu de Navegação', category: 'pagina', Icon: AlignCenter, iconColor: '#667eea',
    difficulty: 'Médio', points: 280,
    description: 'Crie um menu horizontal com nav > ul > li > a. Use flex para deixar os itens lado a lado e estilize os links.',
    hints: [
      'nav contém a navegação. ul > li > a é a estrutura semântica. list-style: none remove as bolinhas.',
      'Para horizontal: display: flex no ul. Para estilizar os links: a { text-decoration: none; padding: ...; }',
      'Estrutura: <nav><ul><li><a href="#">Home</a></li><li><a href="#">Sobre</a></li>...</ul></nav>',
    ],
    htmlStructure: 'nav > ul > li×4 > a',
    htmlEditable: true,
    starterHtml: `<!-- Crie o menu de navegação aqui -->\n<!-- Use: <nav>, <ul>, <li>, <a href="#"> -->`,
    targetHtml: `<nav><ul><li><a href="#">Home</a></li><li><a href="#">Sobre</a></li><li><a href="#">Projetos</a></li><li><a href="#">Contato</a></li></ul></nav>`,
    targetCss: `nav { background: #1e293b; padding: 0 16px; border-radius: 10px; } ul { display: flex; list-style: none; padding: 0; margin: 0; gap: 4px; } a { display: block; color: #94a3b8; text-decoration: none; padding: 12px 16px; font-family: sans-serif; font-size: 14px; border-radius: 6px; } li:first-child a { color: white; background: #667eea; }`,
    starterCss: `nav {\n  background: /* cor de fundo */;\n  padding: 0 16px;\n  border-radius: 10px;\n}\nul {\n  display: /* flex */;\n  list-style: none;\n  padding: 0;\n  margin: 0;\n  gap: 4px;\n}\na {\n  display: block;\n  color: /* ? */;\n  text-decoration: none;\n  padding: 12px 16px;\n  font-family: sans-serif;\n  font-size: 14px;\n}`,
  },
  {
    id: 65, title: 'Layout com Header e Footer', category: 'pagina', Icon: Layout, iconColor: '#8b5cf6',
    difficulty: 'Difícil', points: 300,
    description: 'Crie uma página com header, main (conteúdo) e footer, cada um com fundo e estilo diferentes.',
    hints: [
      'header, main, footer são tags semânticas HTML5. Cada uma pode ter seu próprio background e padding.',
      'Use display: flex + flex-direction: column na página para empilhar as seções.',
      'Exemplo: <header>Título</header><main><p>Conteúdo</p></main><footer>Rodapé</footer>',
    ],
    htmlStructure: 'header + main + footer',
    htmlEditable: true,
    starterHtml: `<!-- Crie o layout da página aqui -->\n<!-- Use: <div class="pagina">, <header>, <main>, <footer> com seus conteúdos -->`,
    targetHtml: `<div class="pagina"><header><h1>Meu Site</h1></header><main><p>Bem-vindo ao meu site!</p></main><footer><p>© 2025 Meu Site</p></footer></div>`,
    targetCss: `.pagina { width: 300px; font-family: sans-serif; border-radius: 12px; overflow: hidden; } header { background: #667eea; color: white; padding: 20px 24px; } header h1 { margin: 0; font-size: 20px; } main { background: #f8fafc; padding: 20px 24px; min-height: 80px; } main p { color: #374151; margin: 0; font-size: 14px; line-height: 1.6; } footer { background: #1e293b; color: #94a3b8; padding: 12px 24px; font-size: 12px; text-align: center; } footer p { margin: 0; }`,
    starterCss: `.pagina {\n  width: 300px;\n  font-family: sans-serif;\n  border-radius: 12px;\n  overflow: hidden;\n}\nheader {\n  background: /* cor do header */;\n  padding: 20px 24px;\n}\nmain {\n  background: #f8fafc;\n  padding: 20px 24px;\n}\nfooter {\n  background: /* cor escura */;\n  padding: 12px 24px;\n  text-align: center;\n}`,
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
    case 18:
      add('background-color azul (#3498db)', colorNear(gs('.box','background-color'),52,152,219), 50);
      add('width >= 100px', px(gs('.box','width'))>=100, 25);
      add('height >= 100px', px(gs('.box','height'))>=100, 25);
      break;
    case 19:
      add('cor vermelha (#e74c3c)', colorNear(gs('.titulo','color'),231,76,60), 50);
      add('font-size >= 24px', px(gs('.titulo','font-size'))>=24, 30);
      add('font-weight bold', gs('.titulo','font-weight')==='700'||gs('.titulo','font-weight')==='bold', 20);
      break;
    case 20:
      add('borda verde (#27ae60)', colorNear(gs('.caixa','border-top-color'),39,174,96), 50);
      add('border-style solid', gs('.caixa','border-top-style')==='solid', 30);
      add('border-width >= 2px', px(gs('.caixa','border-top-width'))>=2, 20);
      break;
    case 21:
      add('padding > 10px', px(gs('.caixa','padding-top'))>10, 40);
      add('background escuro #2c3e50', colorNear(gs('.caixa','background-color'),44,62,80), 40);
      add('texto visível', gs('.txt','color')!=='', 20);
      break;
    case 22:
      add('opacity <= 0.7', parseFloat(gs('.bloco','opacity')||'1')<=0.7, 60);
      add('background roxo', colorNear(gs('.bloco','background-color'),155,89,182), 30);
      add('opacity > 0', parseFloat(gs('.bloco','opacity')||'1')>0, 10);
      break;
    case 23:
      add('font-style: italic', gs('.texto','font-style')==='italic', 50);
      add('cor roxa #6366f1', colorNear(gs('.texto','color'),99,102,241), 30);
      add('font-size >= 14px', px(gs('.texto','font-size'))>=14, 20);
      break;
    case 24:
      add('border-style: dashed', gs('.caixa','border-top-style')==='dashed', 45);
      add('cor laranja #f39c12', colorNear(gs('.caixa','border-top-color'),243,156,18), 35);
      add('border-width >= 2px', px(gs('.caixa','border-top-width'))>=2, 20);
      break;
    case 25:
      add('text-shadow aplicado', gs('.titulo','text-shadow')!=='none', 70);
      add('font-size >= 20px', px(gs('.titulo','font-size'))>=20, 30);
      break;
    case 26:
      add('position: relative no container', gs('.container','position')==='relative', 30);
      add('position: absolute no ponto', gs('.ponto','position')==='absolute', 50);
      add('.ponto com cor verde', colorNear(gs('.ponto','background-color'),34,197,94), 20);
      break;
    case 27:
      add('transform aplicado', gs('.caixa','transform')!=='none', 60);
      add('background azul #3498db', colorNear(gs('.caixa','background-color'),52,152,219), 20);
      add('width >= 40px', px(gs('.caixa','width'))>=40, 20);
      break;
    case 28:
      add('overflow: hidden', gs('.container','overflow')==='hidden', 70);
      add('border-radius > 0', px(gs('.container','border-radius'))>0, 30);
      break;
    case 29:
      add('display: flex no container', hasFlex(gs('.container','display')), 30);
      add('flex-grow > 0 no .principal', parseFloat(gs('.principal','flex-grow')||'0')>0, 50);
      add('background verde no .principal', colorNear(gs('.principal','background-color'),34,197,94), 20);
      break;
    case 30:
      add('letter-spacing > 1px', px(gs('.titulo','letter-spacing'))>1, 60);
      add('color #667eea', colorNear(gs('.titulo','color'),102,126,234), 25);
      add('text-transform uppercase', gs('.titulo','text-transform')==='uppercase', 15);
      break;
    case 31:
      add('clip-path aplicado', gs('.triangulo','clip-path')!=='none', 70);
      add('background vermelho', colorNear(gs('.triangulo','background-color'),239,68,68), 30);
      break;
    case 32:
      add('box-shadow com brilho', gs('.neon','box-shadow')!=='none', 50);
      add('border-radius circular', px(gs('.neon','border-radius'))>=40, 25);
      add('borda aplicada', gs('.neon','border-top-style')!=='none', 25);
      break;
    case 33:
      add('filter: blur aplicado', gs('.item','filter').includes('blur'), 70);
      add('background com gradiente', gs('.item','background-image').includes('gradient'), 30);
      break;
    case 34:
      add('perspective no .cena', gs('.cena','perspective')!==''&&gs('.cena','perspective')!=='none', 35);
      add('transform 3D no .cartao', gs('.cartao','transform')!=='none', 45);
      add('background com gradiente', gs('.cartao','background-image').includes('gradient'), 20);
      break;
    case 35: {
      const hasAnyBg = Array.from(doc.querySelectorAll('*')).some(el=>{
        const bg = win.getComputedStyle(el).backgroundColor;
        return bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent';
      });
      add('tem h1 com nome', !!doc.querySelector('h1')?.textContent?.trim(), 30);
      add('tem parágrafo p', !!doc.querySelector('p'), 25);
      add('tem destaque mark', !!doc.querySelector('mark'), 25);
      add('fundo colorido (CSS)', hasAnyBg, 20);
      break;
    }
    case 36: {
      const hasAnyBg36 = Array.from(doc.querySelectorAll('*')).some(el=>{
        const bg = win.getComputedStyle(el).backgroundColor;
        return bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent';
      });
      add('tem h1 (título)', !!doc.querySelector('h1'), 20);
      add('tem h2 (subtítulo)', !!doc.querySelector('h2'), 20);
      add('tem parágrafo p', !!doc.querySelector('p'), 20);
      add('tem destaque mark', !!doc.querySelector('mark'), 20);
      add('CSS aplicado', hasAnyBg36, 20);
      break;
    }
    case 37: {
      const liCount = doc.querySelectorAll('li').length;
      const ul = doc.querySelector('ul,ol');
      const li = doc.querySelector('li');
      add('tem h1', !!doc.querySelector('h1'), 20);
      add('tem lista ul ou ol', !!ul, 20);
      add('pelo menos 3 itens li', liCount >= 3, 30);
      add('list-style removido', !!(li && win.getComputedStyle(li).listStyleType === 'none'), 15);
      add('CSS no li (fundo ou borda)', !!(li && (win.getComputedStyle(li).backgroundColor !== 'rgba(0, 0, 0, 0)' || win.getComputedStyle(li).borderLeftStyle !== 'none')), 15);
      break;
    }
    case 38: {
      const img = doc.querySelector('img');
      add('tem img (foto)', !!img, 30);
      add('tem h1 (nome)', !!doc.querySelector('h1'), 25);
      add('tem p (descrição)', !!doc.querySelector('p'), 20);
      add('img com border-radius (circular)', !!(img && px(win.getComputedStyle(img).borderRadius) >= 40), 15);
      add('container centralizado', Array.from(doc.querySelectorAll('*')).some(el=>win.getComputedStyle(el).textAlign==='center'), 10);
      break;
    }
    case 39: {
      const bq = doc.querySelector('blockquote');
      add('tem h1', !!doc.querySelector('h1'), 20);
      add('tem mark', !!doc.querySelector('mark'), 20);
      add('tem blockquote', !!bq, 30);
      add('blockquote com borda lateral', !!(bq && px(win.getComputedStyle(bq).borderLeftWidth) > 0), 20);
      add('blockquote com fundo', !!(bq && win.getComputedStyle(bq).backgroundColor !== 'rgba(0, 0, 0, 0)'), 10);
      break;
    }
    /* ── Extra Básico ─────────────────────────────────── */
    case 40:
      add('text-decoration: underline', gs('.texto','text-decoration-line')==='underline'||gs('.texto','text-decoration').includes('underline'), 50);
      add('cor vermelha', colorNear(gs('.texto','color'),231,76,60), 30);
      add('font-size >= 16px', px(gs('.texto','font-size'))>=16, 20);
      break;
    case 41:
      add('box-shadow inset', gs('.caixa','box-shadow').includes('inset'), 60);
      add('background roxo', colorNear(gs('.caixa','background-color'),139,92,246), 25);
      add('border-radius > 0', px(gs('.caixa','border-radius'))>0, 15);
      break;
    case 42:
      add('display inline-block', gs('.tag','display')==='inline-block', 35);
      add('border-radius > 40', px(gs('.tag','border-radius'))>40, 25);
      add('background ciano', colorNear(gs('.tag','background-color'),6,182,212,60), 25);
      add('cor branca no texto', colorNear(gs('.tag','color'),255,255,255,30), 15);
      break;
    case 43:
      add('fundo com rgba (transparente)', gs('.caixa','background-color').startsWith('rgba'), 60);
      add('cor laranja', colorNear(gs('.caixa','background-color'),243,156,18,60), 25);
      add('border-radius > 0', px(gs('.caixa','border-radius'))>0, 15);
      break;
    case 44:
      add('text-transform: uppercase', gs('.titulo','text-transform')==='uppercase', 55);
      add('letter-spacing > 0', px(gs('.titulo','letter-spacing'))>0, 25);
      add('cor #667eea', colorNear(gs('.titulo','color'),102,126,234), 20);
      break;
    case 45: {
      const ml = px(gs('.caixa','margin-left'));
      const mr = px(gs('.caixa','margin-right'));
      add('centralizado (margens iguais)', ml > 0 && Math.abs(ml-mr) < 10, 50);
      add('background verde', colorNear(gs('.caixa','background-color'),34,197,94), 30);
      add('width >= 120px', px(gs('.caixa','width'))>=120, 20);
      break;
    }
    case 46:
      add('text-decoration: line-through', gs('.antigo','text-decoration-line')==='line-through'||gs('.antigo','text-decoration').includes('line-through'), 55);
      add('cor cinza no antigo', colorNear(gs('.antigo','color'),148,163,184,60), 25);
      add('cor verde no preço', colorNear(gs('.preco','color'),34,197,94,60), 20);
      break;
    case 47: {
      const tl = px(gs('.card','border-top-left-radius'));
      const tr2 = px(gs('.card','border-top-right-radius'));
      add('border-radius assimétrico', tl !== tr2, 45);
      add('background com gradiente', gs('.card','background-image').includes('gradient'), 35);
      add('tamanho >= 80px', px(gs('.card','width'))>=80, 20);
      break;
    }
    /* ── Extra Intermediário ──────────────────────────── */
    case 48:
      add('position absolute no .topo', gs('.topo','position')==='absolute', 30);
      add('z-index >= 2 no .topo', parseInt(gs('.topo','z-index')||'0')>=2, 40);
      add('background vermelho no .topo', colorNear(gs('.topo','background-color'),231,76,60), 30);
      break;
    case 49:
      add('aspect-ratio definido', gs('.video','aspect-ratio')!==''&&gs('.video','aspect-ratio')!=='auto', 55);
      add('background escuro', colorNear(gs('.video','background-color'),44,62,80,60), 25);
      add('width >= 180px', px(gs('.video','width'))>=180, 20);
      break;
    case 50:
      add('display flex no .row', hasFlex(gs('.row','display')), 30);
      add('gap > 10px', px(gs('.row','gap'))>10, 40);
      add('background no .item', colorNear(gs('.item','background-color'),139,92,246), 30);
      break;
    case 51:
      add('transition definida', gs('.btn','transition-duration')!==''&&gs('.btn','transition-duration')!=='0s', 55);
      add('background azul', colorNear(gs('.btn','background-color'),52,152,219), 25);
      add('border-radius > 0', px(gs('.btn','border-radius'))>0, 20);
      break;
    case 52:
      add('display grid', gs('.grid','display')==='grid', 30);
      add('gap > 8px', px(gs('.grid','gap'))>8, 30);
      add('2 colunas', gs('.grid','grid-template-columns').split(' ').filter(Boolean).length>=2, 25);
      add('background vermelho no .item', colorNear(gs('.item','background-color'),239,68,68,60), 15);
      break;
    case 53:
      add('max-width <= 340px', px(gs('.texto','max-width'))<=340&&px(gs('.texto','max-width'))>0, 35);
      add('background azul claro', colorNear(gs('.texto','background-color'),240,244,255,80), 25);
      add('border-left aplicada', px(gs('.texto','border-left-width'))>0, 25);
      add('padding > 8px', px(gs('.texto','padding-left'))>8, 15);
      break;
    case 54:
      add('display flex no .container', hasFlex(gs('.container','display')), 25);
      add('flex-grow > 0 no .main', parseFloat(gs('.main','flex-grow')||'0')>0, 45);
      add('background escuro no .sidebar', colorNear(gs('.sidebar','background-color'),30,41,59,60), 30);
      break;
    case 55:
      add('object-fit: cover', gs('.foto','object-fit')==='cover', 55);
      add('width >= 160px', px(gs('.foto','width'))>=160, 25);
      add('border-radius > 0', px(gs('.foto','border-radius'))>0, 20);
      break;
    /* ── Extra Avançado ───────────────────────────────── */
    case 56:
      add('background roxo no .card', colorNear(gs('.card','background-color'),102,126,234,50), 45);
      add('border-radius > 8px', px(gs('.card','border-radius'))>8, 30);
      add('padding aplicado', px(gs('.card','padding-top'))>0, 25);
      break;
    case 57:
      add('conic-gradient aplicado', gs('.grafico','background-image').includes('conic-gradient'), 65);
      add('border-radius >= 50%', px(gs('.grafico','border-radius'))>=40, 25);
      add('tamanho >= 100px', px(gs('.grafico','width'))>=100, 10);
      break;
    case 58:
      add('mix-blend-mode aplicado', gs('.b','mix-blend-mode')!==''&&gs('.b','mix-blend-mode')!=='normal', 60);
      add('position absolute nos círculos', gs('.a','position')==='absolute', 20);
      add('background vermelho no .a', colorNear(gs('.a','background-color'),231,76,60), 20);
      break;
    case 59:
      add('filter com brightness', gs('.imagem','filter').includes('brightness'), 35);
      add('filter com saturate', gs('.imagem','filter').includes('saturate'), 35);
      add('background com gradiente', gs('.imagem','background-image').includes('gradient'), 30);
      break;
    case 60:
      add('clip-path polygon aplicado', gs('.forma','clip-path').includes('polygon'), 65);
      add('background roxo', colorNear(gs('.forma','background-color'),139,92,246), 25);
      add('tamanho >= 80px', px(gs('.forma','width'))>=80, 10);
      break;
    case 61:
      add('display grid', gs('.layout','display')==='grid', 25);
      add('grid-area no .header', gs('.header','grid-area')!==''&&gs('.header','grid-area')!=='auto', 30);
      add('background escuro no .header', colorNear(gs('.header','background-color'),30,41,59,60), 25);
      add('grid-area no .sidebar', gs('.sidebar','grid-area')!==''&&gs('.sidebar','grid-area')!=='auto', 20);
      break;
    /* ── Extra Página Web ─────────────────────────────── */
    case 62: {
      const inputs = doc.querySelectorAll('input');
      add('tem form', !!doc.querySelector('form'), 20);
      add('tem label', !!doc.querySelector('label'), 20);
      add('tem 2+ inputs', inputs.length >= 2, 30);
      add('tem button', !!doc.querySelector('button'), 20);
      add('CSS aplicado (fundo/borda)', Array.from(doc.querySelectorAll('*')).some(el=>{ const bg=win.getComputedStyle(el).backgroundColor; return bg&&bg!=='rgba(0, 0, 0, 0)'; }), 10);
      break;
    }
    case 63: {
      const ths = doc.querySelectorAll('th');
      const tds = doc.querySelectorAll('td');
      add('tem table', !!doc.querySelector('table'), 20);
      add('tem th (cabeçalho)', ths.length >= 2, 25);
      add('tem td (dados) >= 3', tds.length >= 3, 30);
      add('CSS em th (fundo)', !!(ths[0] && win.getComputedStyle(ths[0]).backgroundColor !== 'rgba(0, 0, 0, 0)'), 25);
      break;
    }
    case 64: {
      const lis = doc.querySelectorAll('li');
      const as = doc.querySelectorAll('a');
      add('tem nav', !!doc.querySelector('nav'), 20);
      add('tem ul', !!doc.querySelector('ul'), 20);
      add('3+ itens li', lis.length >= 3, 25);
      add('tem links a', as.length >= 3, 20);
      add('display flex no ul (horizontal)', !!(doc.querySelector('ul') && hasFlex(win.getComputedStyle(doc.querySelector('ul')!).display)), 15);
      break;
    }
    case 65: {
      add('tem header', !!doc.querySelector('header'), 20);
      add('tem main', !!doc.querySelector('main'), 20);
      add('tem footer', !!doc.querySelector('footer'), 20);
      add('header com fundo', !!(doc.querySelector('header') && win.getComputedStyle(doc.querySelector('header')!).backgroundColor !== 'rgba(0, 0, 0, 0)'), 20);
      add('footer com fundo', !!(doc.querySelector('footer') && win.getComputedStyle(doc.querySelector('footer')!).backgroundColor !== 'rgba(0, 0, 0, 0)'), 20);
      break;
    }
  }
  const total  = details.reduce((s,d)=>s+d.weight,0);
  const earned = details.reduce((s,d)=>s+(d.passed?d.weight:0),0);
  return { score: total>0 ? Math.round((earned/total)*100) : 0, details };
}

/* ── Property Guide ─────────────────────────────────────────────────────── */

const PROPERTY_GUIDE: Record<number,string> = {
  0:  'border-radius — arredonda cantos de um elemento. Aceita valores em px ou %. Use 50% para criar formas circulares.',
  1:  'box-shadow — projeta sombra ao redor do elemento. Os valores definem: deslocamento-X, deslocamento-Y, blur e cor.',
  2:  'background com linear-gradient() — o background aceita gradientes. linear-gradient() cria transição entre duas ou mais cores em uma direção.',
  3:  'display: flex — ativa Flexbox. justify-content distribui espaço no eixo principal; align-items alinha no eixo cruzado.',
  4:  'background-color, color, border, border-radius — propriedades visuais básicas. border: none remove bordas padrão de botões.',
  5:  'flex-direction: column — muda o eixo principal do flex para vertical, empilhando os itens. align-items: center centraliza horizontalmente.',
  6:  'display: grid com grid-template-columns — organiza elementos em colunas. Cada valor define o tamanho de uma coluna.',
  7:  '@keyframes e animation — @keyframes define os estados da animação. A propriedade animation aplica esse efeito com duração e repetição.',
  8:  'display: flex com justify-content — Flexbox organiza itens em linha. justify-content controla como o espaço é distribuído.',
  9:  'justify-content: space-between — empurra itens para as extremidades, distribuindo o espaço restante entre eles.',
  10: 'flex-direction: column — por padrão flex organiza em linha. column muda para empilhamento vertical.',
  11: 'flex-wrap: wrap — por padrão, flex comprime tudo em uma linha. wrap permite quebrar para a próxima linha.',
  12: 'grid-template-columns: repeat() — cria colunas iguais de forma concisa. repeat(3, 1fr) divide o espaço em 3 colunas iguais.',
  13: 'grid-template-columns com valores mistos — grid aceita colunas com tamanhos fixos (px) e proporcionais (fr) juntos.',
  14: 'transform: scale() em animation — animações de escala usam transform: scale(). @keyframes alterna entre dois tamanhos.',
  15: 'animation-direction: alternate — faz a animação ir e voltar automaticamente, sem precisar inverter os estados.',
  16: 'backdrop-filter: blur() — aplica filtros no conteúdo atrás do elemento. Requer background semi-transparente.',
  17: 'background-clip: text — faz o gradiente aparecer apenas nas áreas do texto. Requer -webkit-text-fill-color: transparent.',
  18: 'background-color — define a cor de fundo sólida. Aceita hex (#rrggbb), rgb() ou nomes de cor.',
  19: 'color e font-size — color define a cor do texto. font-size controla o tamanho das letras em px ou outras unidades.',
  20: 'border — define borda com três valores: espessura, estilo (solid/dashed/dotted) e cor.',
  21: 'padding — cria espaço interno entre o conteúdo e a borda do elemento. Diferente de margin, que cria espaço externo.',
  22: 'opacity — controla a transparência do elemento inteiro. Vai de 0 (invisível) a 1 (totalmente opaco).',
  23: 'font-style: italic — inclina o texto visualmente. Não altera o layout ao redor.',
  24: 'border-style — define o padrão visual da borda: solid (linha contínua), dashed (tracejada), dotted (pontilhada).',
  25: 'text-shadow — adiciona sombra nas letras com: deslocamento-X, deslocamento-Y, blur e cor.',
  26: 'position: absolute — remove o elemento do fluxo e o posiciona em relação ao ancestral com position: relative.',
  27: 'transform: rotate() — gira o elemento visualmente sem afetar o espaço ao redor. O valor é em graus (deg).',
  28: 'overflow — controla o que acontece com conteúdo que ultrapassa o container. hidden corta o excesso visualmente.',
  29: 'flex-grow — define quanto um item flex cresce para preencher o espaço disponível. Valor 1 absorve todo o espaço livre.',
  30: 'letter-spacing — controla o espaçamento entre cada caractere. Aceita valores em px ou em.',
  31: 'clip-path: polygon() — recorta o elemento em uma forma geométrica. polygon() aceita pontos x y separados por vírgulas.',
  32: 'box-shadow múltiplo — múltiplas sombras separadas por vírgula criam camadas de brilho ao redor do elemento.',
  33: 'filter: blur() — aplica desfoque gaussiano no elemento. O valor em px define a intensidade.',
  34: 'perspective e rotateX/Y — perspective cria profundidade 3D no elemento pai. rotateX/Y gira em torno dos eixos.',
  35: 'Neste desafio você escreve HTML e CSS. Use h1 para o título, p para o texto, mark para destaque. No CSS, background colore o container, padding cria espaço interno, border-radius arredonda.',
  36: 'Escreva HTML e CSS. article é uma tag semântica para conteúdo independente. h1 = título principal, h2 = subtítulo. border-left cria uma borda lateral em qualquer elemento.',
  37: 'Escreva HTML e CSS. ul (unordered list) cria uma lista. li são os itens. list-style: none remove os marcadores padrão (bolinhas). Cada li pode ter seu próprio estilo visual.',
  38: 'Escreva HTML e CSS. img exibe imagens — use src para definir a URL. border-radius: 50% torna qualquer elemento quadrado em círculo. object-fit: cover preenche sem distorcer.',
  39: 'Escreva HTML e CSS. blockquote é a tag semântica para citações. border-left cria uma barra lateral colorida. font-style: italic inclina o texto da citação.',
  40: 'text-decoration — adiciona decorações visuais ao texto: underline (abaixo), overline (acima), line-through (tachado). Não afeta o layout ao redor.',
  41: 'box-shadow com inset — a palavra-chave inset no início inverte a sombra para dentro do elemento, criando efeito de profundidade.',
  42: 'display: inline-block — combina o comportamento inline (fica na mesma linha que outros elementos) com a capacidade de ter width, height e padding como block.',
  43: 'rgba() — permite definir cores com canal de transparência alfa. rgba(r,g,b,a) onde a vai de 0 (transparente) a 1 (opaco).',
  44: 'text-transform — altera a capitalização do texto via CSS sem mudar o HTML. uppercase = TUDO MAIÚSCULO, lowercase = tudo minúsculo, capitalize = Primeira Letra.',
  45: 'margin: auto — quando aplicado horizontalmente em um elemento com width definido, divide o espaço disponível igualmente nos dois lados, centralizando o elemento.',
  46: 'text-decoration: line-through — traça uma linha no meio do texto. Muito usado para mostrar preços originais riscados.',
  47: 'border-radius com 4 valores — cada canto pode ter raio diferente: top-left, top-right, bottom-right, bottom-left. Valores diferentes criam formas orgânicas.',
  48: 'z-index — controla a ordem de empilhamento de elementos posicionados (position diferente de static). Maior z-index = aparece na frente.',
  49: 'aspect-ratio — mantém a proporção entre largura e altura automaticamente. aspect-ratio: 16/9 = proporção de vídeo widescreen.',
  50: 'gap — define o espaçamento entre itens em flex e grid de forma unificada, sem precisar de margin em cada filho.',
  51: 'transition — anima mudanças de propriedades CSS suavemente. Aceita: propriedade, duração, timing-function e delay.',
  52: 'display: grid com repeat() e gap — repeat(n, tamanho) cria n colunas iguais. gap adiciona espaço entre todas as células uniformemente.',
  53: 'max-width — limita a largura máxima. O elemento pode ser menor, mas nunca maior. Útil para textos que não devem ficar muito largos em telas grandes.',
  54: 'flex-grow — define quanto um item flex cresce em relação aos outros para preencher o espaço disponível. flex-grow: 1 absorve todo o espaço livre.',
  55: 'object-fit — controla como imagens e vídeos se ajustam ao seu container. cover preenche completamente (cortando o excesso). contain cabe todo o conteúdo (pode deixar espaço).',
  56: 'Variáveis CSS (custom properties) — declaradas com -- no :root e usadas com var(). Facilitam manutenção: mude uma vez, reflete em todo o projeto.',
  57: 'conic-gradient() — gradiente em forma de cone ao redor de um ponto. Cada fatia é definida com inicio% e fim%. Ideal para gráficos de pizza.',
  58: 'mix-blend-mode — define como o elemento se mistura visualmente com o elemento abaixo. multiply escurece a interseção, screen clareia, overlay combina ambos.',
  59: 'filter com múltiplas funções — brightness(), saturate(), contrast(), blur() etc. podem ser encadeados separados por espaço, todos aplicados em sequência.',
  60: 'clip-path: polygon() — recorta o elemento em uma forma personalizada. Os pontos são pares x y em % ou px. 3 pontos = triângulo, 6 = hexágono.',
  61: 'grid-template-areas — define o layout usando strings com nomes. Cada string é uma linha; cada nome, uma área. O filho usa grid-area: nome; para se posicionar.',
  62: 'Formulário HTML: form é o container, label identifica cada campo, input recebe dados, button submete. Sempre associe label ao input para acessibilidade.',
  63: 'Tabela HTML: table > thead > tr > th para cabeçalho; table > tbody > tr > td para dados. border-collapse: collapse remove bordas duplas.',
  64: 'Navegação semântica: nav contém navegação. ul > li > a é a estrutura correta. list-style: none remove bolinhas. display: flex no ul deixa os itens horizontais.',
  65: 'Tags semânticas HTML5: header (cabeçalho), main (conteúdo principal), footer (rodapé) dão significado à estrutura. Cada uma pode ter seu próprio estilo.',
};

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
function getChallengeTime(ch: Challenge): number {
  const base: Record<Challenge['difficulty'],number> = {'Fácil':120,'Médio':180,'Difícil':240};
  return base[ch.difficulty] + (ch.category === 'pagina' ? 60 : 0);
}
function _sh(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (h * 33 ^ s.charCodeAt(i)) >>> 0;
  return h.toString(36);
}
function buildObfuscatedDoc(html: string, css: string, seed: string): string {
  const all = new Set<string>();
  css.replace(/\.([a-zA-Z_][a-zA-Z0-9_-]*)/g, (_, c) => { all.add(c); return ''; });
  html.replace(/class="([^"]*)"/g, (_, cs) => { cs.split(/\s+/).forEach((c:string)=>c&&all.add(c)); return ''; });
  const map = new Map<string,string>();
  all.forEach(c => map.set(c, `_${_sh(seed+c)}`));
  const oCss = css.replace(/\.([a-zA-Z_][a-zA-Z0-9_-]*)/g, (_,c) => `.${map.get(c)??c}`);
  const oHtml = html.replace(/class="([^"]*)"/g, (_,cs) =>
    `class="${cs.split(/\s+/).map((c:string)=>c?(map.get(c)??c):'').join(' ').trim()}"`);
  return buildDoc(oHtml, oCss + ' body *{user-select:none!important;pointer-events:none!important;}');
}
function earnCoinsForScore(score: number, difficulty: Challenge['difficulty']): number {
  const base = difficulty === 'Fácil' ? 10 : difficulty === 'Médio' ? 18 : 28;
  if (score >= 80) return base;
  if (score >= 60) return Math.floor(base * 0.5);
  if (score >= 40) return Math.floor(base * 0.25);
  return 0;
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
const CAT_LABEL:  Record<CategoryFilter,string> = { todos:'Todos', basico:'Básico', intermediario:'Intermediário', avancado:'Avançado', pagina:'Página Web' };
const CAT_COLOR:  Record<CategoryFilter,string> = { todos:'#667eea', basico:'#3b82f6', intermediario:'#8b5cf6', avancado:'#ef4444', pagina:'#06b6d4' };
const HINT_COSTS: [number,number,number] = [0, 10, 20];
const TEMP_COINS_KEY = 'cssbattle_temp_coins';

/* ── Component ───────────────────────────────────────────────────────────── */

const CssBattlePage: React.FC<{ onBackToHub: () => void; initialJoinCode?: string }> = ({ onBackToHub, initialJoinCode }) => {
  const { isDark } = useTheme();
  const { currentUser, spendCoins, addCoins } = useGameState();
  const [tempCoins, setTempCoins] = useState<number>(()=>{
    const s = localStorage.getItem(TEMP_COINS_KEY);
    return s ? Math.max(0, parseInt(s,10)) : 50;
  });
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [devToolsOpen, setDevToolsOpen] = useState(false);
  const obfSeedRef = useRef(genId());
  const hasEditedRef = useRef(false);

  /* view */
  const [view, setView]   = useState<PageView>('menu');
  const [mode, setMode]   = useState<GameMode>('create');

  /* form */
  const [playerName, setPlayerName]         = useState('');
  const [joinCodeInput, setJoinCodeInput]   = useState('');
  const [maxPlayers, setMaxPlayers]         = useState<2|3|4>(2);
  const [totalRoundsSetup, setTotalRoundsSetup] = useState<1|3|5|7|10>(3);
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
  const [playerHtml, setPlayerHtml]     = useState('');
  const [timeLeft, setTimeLeft]         = useState(180);
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
  const [showTutorial, setShowTutorial]     = useState(()=>localStorage.getItem('cssbattle_tutorial_dismissed')!=='1');

  /* rejoin */
  const [pendingRejoin, setPendingRejoin]   = useState<{roomCode:string, pid:string, playerName:string}|null>(null);

  /* kick voting */
  const [kickVotes, setKickVotes]           = useState<Record<string, Record<string,boolean>>>({});

  /* emoji reactions */
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [floatingEmojis, setFloatingEmojis]   = useState<{id:string, emoji:string, name:string, x:number}[]>([]);
  const emojiCooldownEnd  = useRef(0);
  const spamCount         = useRef(0);
  const spamWindowStart   = useRef(0);
  const [cooldownLeft, setCooldownLeft]       = useState(0);

  /* score reveal animation */
  const [scoreReveal, setScoreReveal] = useState<{show:boolean, value:number, final:number}>({show:false,value:0,final:0});

  /* opponent finished stamps */
  interface OpponentStamp { uid:string; name:string; score:number; }
  const [opponentStamps, setOpponentStamps] = useState<OpponentStamp[]>([]);
  const prevSubmittedRef = useRef<Set<string>>(new Set());

  /* mini-game */
  interface MemCard { uid:number; symbol:string; flipped:boolean; matched:boolean; }
  const [showMiniGame, setShowMiniGame]   = useState(false);
  const [memCards, setMemCards]           = useState<MemCard[]>([]);
  const [memMoves, setMemMoves]           = useState(0);
  const [memComplete, setMemComplete]     = useState(false);
  const memCheckRef  = useRef(false);
  const lastFlipRef  = useRef<number|null>(null);

  /* submission timing */
  const [timeTaken, setTimeTaken]           = useState(0);
  const battleStartRef = useRef<number>(0);

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
      if (previewRef.current) {
        const ch = CHALLENGES[challengeIdx];
        const html = ch.htmlEditable ? playerHtml : ch.targetHtml;
        previewRef.current.srcdoc = buildDoc(html, playerCode);
      }
    }, 250);
    return ()=>clearTimeout(t);
  }, [playerCode, playerHtml, challengeIdx]);

  useEffect(()=>{
    if (targetRef.current && view==='battle') {
      const ch = CHALLENGES[challengeIdx];
      targetRef.current.srcdoc = buildObfuscatedDoc(ch.targetHtml, ch.targetCss, obfSeedRef.current);
    }
  }, [challengeIdx, view]);

  /* ── Auto-fill via link de convite ── */
  useEffect(()=>{
    if (initialJoinCode && initialJoinCode.length === 4) {
      setMode('join');
      setJoinCodeInput(initialJoinCode);
      setView('setup');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Cleanup ── */
  useEffect(()=>()=>{
    unsubRef.current?.();
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  /* ── Check rejoin session ── */
  useEffect(()=>{
    const stored = localStorage.getItem('cssbattle_session');
    if (!stored) return;
    try {
      const s = JSON.parse(stored) as {roomCode:string, pid:string, playerName:string};
      get(ref(db,`rooms/${s.roomCode}`)).then(snap=>{
        if (snap.exists()) {
          const d = snap.val();
          if (d.status !== 'finished') setPendingRejoin(s);
          else localStorage.removeItem('cssbattle_session');
        } else {
          localStorage.removeItem('cssbattle_session');
        }
      }).catch(()=>{});
    } catch { localStorage.removeItem('cssbattle_session'); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Emoji cooldown tick ── */
  useEffect(()=>{
    const iv = setInterval(()=>{
      const remaining = Math.max(0, Math.ceil((emojiCooldownEnd.current - Date.now()) / 1000));
      setCooldownLeft(remaining);
    }, 500);
    return ()=>clearInterval(iv);
  }, []);

  /* ── Memory game ── */
  const MEM_SYMBOLS = ['flex','grid','margin','padding','color','border','transform','animation'];
  const initMemory = () => {
    const pairs = [...MEM_SYMBOLS, ...MEM_SYMBOLS];
    const shuffled = pairs.sort(()=>Math.random()-0.5);
    setMemCards(shuffled.map((s,i)=>({uid:i, symbol:s, flipped:false, matched:false})));
    setMemMoves(0);
    setMemComplete(false);
    memCheckRef.current = false;
    lastFlipRef.current = null;
  };
  const flipMemCard = (uid: number) => {
    if (memCheckRef.current) return;
    setMemCards(prev => {
      const card = prev.find(c=>c.uid===uid);
      if (!card || card.flipped || card.matched) return prev;
      const updated = prev.map(c=>c.uid===uid ? {...c, flipped:true} : c);
      if (lastFlipRef.current === null) {
        lastFlipRef.current = uid;
        return updated;
      }
      const lastUid = lastFlipRef.current;
      lastFlipRef.current = null;
      setMemMoves(m=>m+1);
      memCheckRef.current = true;
      const lastCard = prev.find(c=>c.uid===lastUid)!;
      if (lastCard.symbol === card.symbol) {
        const matched = updated.map(c=>c.uid===lastUid||c.uid===uid ? {...c,matched:true} : c);
        memCheckRef.current = false;
        setTimeout(()=>{ if (matched.every(c=>c.matched)) setMemComplete(true); }, 100);
        return matched;
      }
      setTimeout(()=>{
        setMemCards(cs=>cs.map(c=>c.uid===lastUid||c.uid===uid ? {...c,flipped:false} : c));
        memCheckRef.current = false;
      }, 900);
      return updated;
    });
  };

  /* ── Timer ── */
  useEffect(()=>{
    if (view!=='battle') return;
    battleStartRef.current = Date.now();
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

  /* ── DevTools detection ── */
  useEffect(()=>{
    if (view !== 'battle') { setDevToolsOpen(false); return; }
    const check = () => {
      const wD = window.outerWidth - window.innerWidth;
      const hD = window.outerHeight - window.innerHeight;
      setDevToolsOpen(wD > 250 || hD > 250);
    };
    const iv = setInterval(check, 1000);
    return () => clearInterval(iv);
  }, [view]);

  /* ── Submit ── */
  const handleSubmit = useCallback(()=>{
    if (submittedRef.current) return;
    submittedRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeout(()=>{
      if (!previewRef.current) return;

      /* Zero imediato se nenhuma alteração foi feita */
      if (!hasEditedRef.current) {
        const noEditDetails: ScoreDetail[] = [{label:'Nenhuma alteração no código!', passed:false, weight:100}];
        setPlayerScore(0); setScoreDetails(noEditDetails); setSubmitted(true);
        setTimeTaken(Math.floor((Date.now() - battleStartRef.current) / 1000));
        setScoreReveal({show:true, value:0, final:0});
        const noEditResult: RoundResult = { challengeIdx, score:0, details:noEditDetails };
        setRoundResults(prev => [...prev, noEditResult]);
        if (mode!=='solo' && roomCode) {
          roundScoresRef.current[currentRound] = 0;
          const totalScore = Object.values(roundScoresRef.current).reduce((a,b)=>a+b,0);
          dbUpdate(ref(db,`rooms/${roomCode}/players/${playerId.current}`), {
            [`scores/${currentRound}`]: 0, totalScore, submittedAt: Date.now(),
          });
        }
        return;
      }

      const { score, details } = calcScore(challengeIdx, previewRef.current);
      setPlayerScore(score);
      setScoreDetails(details);
      setSubmitted(true);
      setTimeTaken(Math.floor((Date.now() - battleStartRef.current) / 1000));

      /* award coins */
      const earned = earnCoinsForScore(score, CHALLENGES[challengeIdx].difficulty);
      if (earned > 0) {
        if (currentUser) { addCoins(earned); }
        else { setTempCoins(prev => { const n = prev+earned; localStorage.setItem(TEMP_COINS_KEY, String(n)); return n; }); }
        setCoinsEarned(earned);
        setTimeout(() => setCoinsEarned(0), 3200);
      }

      /* score reveal animation */
      setScoreReveal({show:true, value:0, final:score});
      const startTs = performance.now();
      const dur = 1800;
      const tick = (now: number) => {
        const elapsed = now - startTs;
        const t = Math.min(elapsed / dur, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        setScoreReveal(prev => ({...prev, value: Math.round(eased * score)}));
        if (t < 1) requestAnimationFrame(tick);
        else setTimeout(() => setScoreReveal(prev => ({...prev, show:false})), 1400);
      };
      requestAnimationFrame(tick);

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
    const nextCh = CHALLENGES[nextIdx];
    setCurrentRound(nextRound);
    setChallengeIdx(nextIdx);
    setPlayerCode(nextCh.starterCss);
    setPlayerHtml(nextCh.starterHtml ?? '');
    setPlayerScore(-1); setScoreDetails([]); setSubmitted(false);
    setHintLevel(0); setHintMsg(''); setShowHints(false);
    setTimeLeft(getChallengeTime(nextCh));
    submittedRef.current = false;
    hasEditedRef.current = false;
  }, [currentRound, totalRounds, challengeIndices]);

  /* ── Firebase subscribe ── */
  const subscribeRoom = useCallback((code: string)=>{
    unsubRef.current?.();
    const roomRef = ref(db,`rooms/${code}`);
    const seenReactionsRef = { current: new Set<string>() };
    const unsub = onValue(roomRef, snap=>{
      const data = snap.val();
      if (!data) return;

      const players: Record<string,PlayerData> = data.players || {};
      setAllPlayers(players);
      setRoomMaxPlayers(data.maxPlayers ?? 2);

      /* kick votes */
      const votes: Record<string,Record<string,boolean>> = data.kickVotes || {};
      setKickVotes(votes);
      const playerCount = Object.keys(players).length;
      Object.entries(votes).forEach(([targetId, voters])=>{
        const voteCount = Object.keys(voters).length;
        if (playerCount >= 2 && voteCount >= Math.ceil(playerCount / 2)) {
          if (data.hostId === playerId.current) {
            const upd: Record<string,null> = {};
            upd[`players/${targetId}`] = null;
            upd[`kickVotes/${targetId}`] = null;
            dbUpdate(roomRef, upd).catch(()=>{});
          }
        }
      });

      /* emoji reactions */
      const reactions: Record<string,{emoji:string, name:string, ts:number}> = data.reactions || {};
      const now = Date.now();
      Object.entries(reactions).forEach(([id, r])=>{
        if (seenReactionsRef.current.has(id)) return;
        if (now - r.ts > 6000) return;
        seenReactionsRef.current.add(id);
        const x = Math.random() * 70 + 15;
        setFloatingEmojis(prev=>[...prev, {id, emoji:r.emoji, name:r.name, x}]);
        setTimeout(()=>setFloatingEmojis(prev=>prev.filter(f=>f.id!==id)), 3500);
      });

      /* opponent finished stamps */
      const indices: number[] = data.challengeIndices ?? [data.challengeIndex ?? 0];
      const cRound: number    = data.currentRound ?? 0;
      const cTotal: number    = data.totalRounds  ?? 1;
      const cIdx   = indices[cRound] ?? 0;

      Object.entries(players).forEach(([id, p])=>{
        if (id === playerId.current) return;
        const key = `${id}-${cRound}`;
        const sc = (p.scores as Record<string,number>|undefined)?.[String(cRound)] ?? -1;
        if (sc >= 0 && !prevSubmittedRef.current.has(key)) {
          prevSubmittedRef.current.add(key);
          const stampId = genId();
          setOpponentStamps(prev=>[...prev, {uid:stampId, name:p.name, score:sc}]);
          setTimeout(()=>setOpponentStamps(prev=>prev.filter(s=>s.uid!==stampId)), 3800);
        }
      });

      if (data.status==='playing') {
        setChallengeIndices(indices);
        setTotalRounds(cTotal);

        if (prevRoundRef.current !== cRound && prevRoundRef.current >= 0) {
          /* round avançou → mostra transição e reseta */
          setRoundTransition(true);
          setTimeout(()=>{
            const nCh = CHALLENGES[cIdx];
            setCurrentRound(cRound);
            setChallengeIdx(cIdx);
            setPlayerCode(nCh.starterCss);
            setPlayerHtml(nCh.starterHtml ?? '');
            setPlayerScore(-1); setScoreDetails([]); setSubmitted(false);
            setHintLevel(0); setHintMsg(''); setShowHints(false);
            submittedRef.current = false;
            hasEditedRef.current = false;
            const elapsed = data.startedAt ? Math.floor((Date.now()-data.startedAt)/1000) : 0;
            setTimeLeft(Math.max(0, getChallengeTime(CHALLENGES[cIdx]) - elapsed));
            setRoundTransition(false);
          }, 3000);
        } else if (prevRoundRef.current < 0) {
          /* primeira entrada */
          const nCh = CHALLENGES[cIdx];
          setCurrentRound(cRound);
          setChallengeIdx(cIdx);
          const elapsed = data.startedAt ? Math.floor((Date.now()-data.startedAt)/1000) : 0;
          setPlayerCode(nCh.starterCss);
          setPlayerHtml(nCh.starterHtml ?? '');
          setTimeLeft(Math.max(0, getChallengeTime(CHALLENGES[cIdx]) - elapsed));
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
      localStorage.setItem('cssbattle_session', JSON.stringify({roomCode:code, pid:playerId.current, playerName:playerName.trim()}));
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
      const snap = await get(ref(db,`rooms/${code}`));
      if (!snap.exists()){ setError('Sala não encontrada. Confira o código.'); setLoading(false); return; }

      const room = snap.val();
      if (room.status==='finished'){ setError('Esta sala já terminou.'); setLoading(false); return; }
      if (room.status==='playing'){  setError('A partida já começou.'); setLoading(false); return; }

      const count = Object.keys(room.players||{}).length;
      if (count>=(room.maxPlayers??2)){ setError(`Sala cheia (máx. ${room.maxPlayers??2} jogadores).`); setLoading(false); return; }

      await dbUpdate(ref(db,`rooms/${code}/players/${playerId.current}`), {
        name: playerName.trim(), totalScore: 0, submittedAt: 0,
      });

      setRoomCode(code); setIsHost(false);
      prevRoundRef.current = -1;
      roundScoresRef.current = {};
      localStorage.setItem('cssbattle_session', JSON.stringify({roomCode:code, pid:playerId.current, playerName:playerName.trim()}));
      subscribeRoom(code); setView('lobby');
    } catch(err: any) {
      console.error('[CSS Battle] joinRoom:', err);
      setError(`Erro ao entrar na sala: ${err?.code ?? err?.message ?? 'verifique a conexão.'}`);
    }
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
    const startCh = CHALLENGES[idx];
    setChallengeIdx(idx);
    setPlayerCode(startCh.starterCss);
    setPlayerHtml(startCh.starterHtml ?? '');
    setTimeLeft(getChallengeTime(startCh));
    setPlayerScore(-1); setScoreDetails([]); setSubmitted(false);
    setRoundResults([]);
    setHintLevel(0); setHintMsg(''); setShowHints(false);
    hasEditedRef.current = false;
    setView('battle');
  };

  /* ── Rejoin room ── */
  const rejoinRoom = async ()=>{
    if (!pendingRejoin) return;
    setLoading(true); setError('');
    try {
      const snap = await get(ref(db,`rooms/${pendingRejoin.roomCode}`));
      if (!snap.exists()){ localStorage.removeItem('cssbattle_session'); setPendingRejoin(null); setError('Sala não existe mais.'); setLoading(false); return; }
      const data = snap.val();
      if (data.status==='finished'){ localStorage.removeItem('cssbattle_session'); setPendingRejoin(null); setError('Esta partida já terminou.'); setLoading(false); return; }
      playerId.current = pendingRejoin.pid;
      setPlayerName(pendingRejoin.playerName);
      await dbUpdate(ref(db,`rooms/${pendingRejoin.roomCode}/players/${pendingRejoin.pid}`), { name: pendingRejoin.playerName, reconnectedAt: Date.now() });
      setRoomCode(pendingRejoin.roomCode);
      setIsHost(data.hostId === pendingRejoin.pid);
      prevRoundRef.current = -1;
      roundScoresRef.current = {};
      subscribeRoom(pendingRejoin.roomCode);
      setView(data.status === 'playing' ? 'battle' : 'lobby');
    } catch { setError('Erro ao reconectar. Tente entrar manualmente.'); }
    setLoading(false);
  };

  /* ── Vote kick ── */
  const voteKick = async (targetId: string)=>{
    if (!roomCode || targetId === playerId.current) return;
    await dbUpdate(ref(db,`rooms/${roomCode}/kickVotes/${targetId}`), { [playerId.current]: true }).catch(()=>{});
  };

  /* ── Send emoji reaction ── */
  const EMOJI_LIST = ['😂','🔥','👏','💀','😱','🤯','💪','👀','🎉','😭','⚡','🏆'];
  const sendReaction = (emoji: string)=>{
    if (!roomCode) return;
    const now = Date.now();
    if (now < emojiCooldownEnd.current) return;
    const windowMs = 10000;
    if (now - spamWindowStart.current > windowMs) {
      spamCount.current = 0;
      spamWindowStart.current = now;
    }
    spamCount.current += 1;
    if (spamCount.current >= 5) {
      emojiCooldownEnd.current = now + 20000;
      spamCount.current = 0;
      setCooldownLeft(20);
      return;
    }
    emojiCooldownEnd.current = now + 2000;
    setCooldownLeft(2);
    const rid = genId();
    set(ref(db,`rooms/${roomCode}/reactions/${rid}`), { emoji, name: playerName||'?', ts: now })
      .then(()=>setTimeout(()=>dbUpdate(ref(db,`rooms/${roomCode}/reactions`),{[rid]:null}).catch(()=>{}), 5000))
      .catch(()=>{});
    setShowEmojiPicker(false);
  };

  /* ── Temp coins (visitantes) ── */
  const spendTempCoins = (amount: number): boolean => {
    if (tempCoins < amount) return false;
    setTempCoins(prev => { const n = prev - amount; localStorage.setItem(TEMP_COINS_KEY, String(n)); return n; });
    return true;
  };

  /* ── Hint unlock ── */
  const unlockHint = (level: 1|2|3)=>{
    if (hintLevel >= level) return;
    const cost = HINT_COSTS[level-1];
    if (cost > 0) {
      const ok = currentUser ? spendCoins(cost) : spendTempCoins(cost);
      if (!ok){ setHintMsg(`Moedas insuficientes — esta dica custa ${cost} moedas.`); return; }
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

  const copyCode = ()=>{
    const link = `${window.location.origin}${window.location.pathname}?sala=${roomCode}#cssbattle`;
    navigator.clipboard.writeText(link).then(()=>{ setCopiedCode(true); setTimeout(()=>setCopiedCode(false),2000); });
  };
  const fmtTime  = (s: number)=>`${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  const challenge  = CHALLENGES[challengeIdx] ?? CHALLENGES[0];
  const myEntry    = allPlayers[playerId.current];
  const opponents  = Object.entries(allPlayers).filter(([id])=>id!==playerId.current);
  const challengeMaxTime = CHALLENGES[challengeIdx] ? getChallengeTime(CHALLENGES[challengeIdx]) : 180;
  const timerPct   = (timeLeft/challengeMaxTime)*100;
  const timerColor = timeLeft>120 ? '#22c55e' : timeLeft>60 ? '#f59e0b' : '#ef4444';
  const catChallenges = catFilter==='todos' ? CHALLENGES : CHALLENGES.filter(c=>c.category===catFilter);
  const categories: CategoryFilter[] = ['todos','basico','intermediario','avancado','pagina'];

  /* ══════════════════════════════════════════════════════════
      MENU
  ══════════════════════════════════════════════════════════ */
  if (view==='menu') return (
    <div style={{minHeight:'100vh',background:bg,color:text}}>
      <div style={{maxWidth:1000,margin:'0 auto',padding:'0 16px 40px'}}>

        {/* Top nav */}
        <div style={{padding:'20px 0 0'}}>
          <button onClick={onBackToHub} style={{background:'none',border:`1px solid ${border}`,color:dim,padding:'8px 16px',borderRadius:8,cursor:'pointer',display:'flex',alignItems:'center',gap:7,fontSize:14}}>
            <ArrowLeft size={16}/> Hub
          </button>
        </div>

        {/* Hero */}
        <div style={{textAlign:'center',padding:'40px 0 36px',position:'relative'}}>
          <div style={{display:'flex',justifyContent:'center',marginBottom:18}}>
            <div style={{width:88,height:88,background:'linear-gradient(135deg,#667eea,#f093fb)',borderRadius:24,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 12px 40px rgba(102,126,234,0.35)'}}>
              <Swords size={44} color="white"/>
            </div>
          </div>
          <h1 style={{fontFamily:"'Press Start 2P',monospace",fontSize:clamp(20,28),margin:'0 0 14px',background:'linear-gradient(135deg,#667eea,#f093fb)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',lineHeight:1.4}}>
            CSS BATTLE
          </h1>
          <p style={{color:dim,fontSize:16,margin:'0 auto',maxWidth:520,lineHeight:1.8}}>
            Recrie layouts CSS contra colegas em tempo real. Pontuação automática, dicas com moedas e múltiplas rodadas.
          </p>
        </div>

        {/* Rejoin banner */}
        {pendingRejoin && (
          <div style={{background:isDark?'rgba(34,197,94,0.08)':'rgba(34,197,94,0.06)',border:'1px solid rgba(34,197,94,0.3)',borderRadius:14,padding:'14px 18px',marginBottom:18,display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
            <div style={{width:36,height:36,background:'rgba(34,197,94,0.15)',borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <RotateCw size={17} color="#22c55e"/>
            </div>
            <div style={{flex:1,minWidth:120}}>
              <div style={{fontSize:14,fontWeight:700,color:text}}>Você estava em uma sala!</div>
              <div style={{fontSize:12,color:dim,marginTop:2}}>Sala: <span style={{fontFamily:'monospace',fontWeight:700,color:'#22c55e'}}>{pendingRejoin.roomCode}</span> · {pendingRejoin.playerName}</div>
            </div>
            <div style={{display:'flex',gap:8}}>
              <button onClick={rejoinRoom} disabled={loading}
                style={{background:'linear-gradient(135deg,#22c55e,#16a34a)',color:'white',border:'none',borderRadius:8,padding:'8px 16px',fontSize:13,fontWeight:700,cursor:'pointer'}}>
                {loading?'Reconectando...':'Entrar de volta'}
              </button>
              <button onClick={()=>{ setPendingRejoin(null); localStorage.removeItem('cssbattle_session'); }}
                style={{background:'none',border:`1px solid ${border}`,color:dim,borderRadius:8,padding:'8px 12px',fontSize:12,cursor:'pointer'}}>
                Ignorar
              </button>
            </div>
          </div>
        )}

        {/* Tutorial modal overlay */}
        {showTutorial && (
          <div style={{position:'fixed',inset:0,zIndex:200,background:'rgba(0,0,0,0.7)',display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>{ setShowTutorial(false); localStorage.setItem('cssbattle_tutorial_dismissed','1'); }}>
            <div style={{background:card,border:`1px solid ${border}`,borderRadius:20,padding:'32px 28px',width:'100%',maxWidth:620,position:'relative',boxShadow:'0 24px 60px rgba(0,0,0,0.4)'}} onClick={e=>e.stopPropagation()}>
              <button onClick={()=>{ setShowTutorial(false); localStorage.setItem('cssbattle_tutorial_dismissed','1'); }}
                style={{position:'absolute',top:16,right:16,background:'none',border:`1px solid ${border}`,color:dim,cursor:'pointer',padding:6,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:8}}>
                <X size={16}/>
              </button>
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:22}}>
                <div style={{width:40,height:40,background:'rgba(102,126,234,0.15)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <Eye size={20} color="#667eea"/>
                </div>
                <div>
                  <div style={{fontSize:17,fontWeight:700,color:text}}>Como funciona o CSS Battle?</div>
                  <div style={{fontSize:13,color:dim,marginTop:2}}>Leia antes de comecar sua primeira partida</div>
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:12,marginBottom:24}}>
                {([
                  {Icon:Home,    color:'#667eea', title:'Criar Sala',      desc:'Voce vira o host. Define nivel, rodadas e capacidade maxima. Compartilhe o codigo de 4 letras com os colegas.'},
                  {Icon:Link,    color:'#3b82f6', title:'Entrar em Sala',  desc:'Alguem ja criou uma sala? Digite o codigo de 4 letras que o host compartilhou e entre diretamente.'},
                  {Icon:Gamepad2,color:'#22c55e', title:'Praticar Solo',   desc:'Treine no seu proprio ritmo sem adversarios. Dicas disponiveis (com custo de moedas) para aprender.'},
                  {Icon:Zap,     color:'#f59e0b', title:'A Batalha',       desc:'Cada rodada exibe um layout-alvo. Voce escreve CSS para replica-lo. Quanto mais criterios bater, maior a pontuacao!'},
                ] as {Icon:LucideIcon, color:string, title:string, desc:string}[]).map(item=>(
                  <div key={item.title} style={{background:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.03)',borderRadius:12,padding:'14px 16px',border:`1px solid ${isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.06)'}`}}>
                    <div style={{width:32,height:32,background:`${item.color}18`,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:10,border:`1px solid ${item.color}28`}}>
                      <item.Icon size={16} color={item.color}/>
                    </div>
                    <div style={{fontSize:14,fontWeight:700,color:text,marginBottom:5}}>{item.title}</div>
                    <div style={{fontSize:13,color:dim,lineHeight:1.7}}>{item.desc}</div>
                  </div>
                ))}
              </div>
              <button onClick={()=>{ setShowTutorial(false); localStorage.setItem('cssbattle_tutorial_dismissed','1'); }}
                style={{width:'100%',background:'linear-gradient(135deg,#667eea,#764ba2)',color:'white',border:'none',borderRadius:12,padding:'13px',fontSize:15,fontWeight:700,cursor:'pointer'}}>
                Entendido, vamos comecar!
              </button>
            </div>
          </div>
        )}

        {/* Mode cards */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:16,marginBottom:48}}>
          {([
            {m:'create' as GameMode, Icon:Home,     color:'#667eea', title:'Criar Sala',    desc:'Defina categoria, rodadas e convide colegas.'},
            {m:'join'   as GameMode, Icon:Link,     color:'#3b82f6', title:'Entrar em Sala', desc:'Digite o código de 4 letras para entrar.'},
            {m:'solo'   as GameMode, Icon:Gamepad2, color:'#22c55e', title:'Praticar Solo', desc:'Treine no seu ritmo com dicas disponíveis.'},
          ]).map(({m,Icon:Ic,color,title,desc})=>(
            <button key={m} onClick={()=>{ setMode(m); setView('setup'); setError(''); }}
              style={{background:card,border:`1px solid ${border}`,borderRadius:18,padding:'28px 24px',cursor:'pointer',textAlign:'left',transition:'transform 0.15s,box-shadow 0.15s'}}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow=`0 14px 36px ${color}30`;}}
              onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='';}}>
              <div style={{width:52,height:52,background:`${color}18`,borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16,border:`1px solid ${color}30`}}>
                <Ic size={26} color={color}/>
              </div>
              <div style={{fontSize:17,fontWeight:700,color:text,marginBottom:7}}>{title}</div>
              <div style={{fontSize:14,color:dim,lineHeight:1.7}}>{desc}</div>
            </button>
          ))}
        </div>

        {/* Category filter */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16,flexWrap:'wrap',gap:10}}>
          <h2 style={{fontSize:13,fontWeight:700,color:dim,letterSpacing:'0.1em',textTransform:'uppercase',margin:0}}>Desafios disponíveis</h2>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            {categories.map(cat=>{
              const active = catFilter===cat;
              const cc = CAT_COLOR[cat];
              return (
                <button key={cat} onClick={()=>setCatFilter(cat)}
                  style={{padding:'7px 14px',borderRadius:999,border:`1px solid ${active?cc:border}`,background:active?`${cc}18`:'transparent',color:active?cc:dim,fontSize:13,fontWeight:active?700:400,cursor:'pointer'}}>
                  {CAT_LABEL[cat]} <span style={{opacity:0.6}}>{cat==='todos'?CHALLENGES.length:CHALLENGES.filter(c=>c.category===cat).length}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Challenge grid */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(230px,1fr))',gap:10}}>
          {catChallenges.map(ch=>{
            const Ic=ch.Icon;
            return (
              <div key={ch.id} style={{background:card,border:`1px solid ${border}`,borderRadius:14,padding:'15px 17px',display:'flex',alignItems:'center',gap:13}}>
                <div style={{width:42,height:42,background:`${ch.iconColor}18`,borderRadius:11,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,border:`1px solid ${ch.iconColor}28`}}>
                  <Ic size={20} color={ch.iconColor}/>
                </div>
                <div style={{minWidth:0}}>
                  <div style={{fontSize:14,fontWeight:600,color:text,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{ch.title}</div>
                  <div style={{display:'flex',alignItems:'center',gap:6,marginTop:4}}>
                    <span style={{fontSize:12,color:DIFF_COLOR[ch.difficulty]}}>{ch.difficulty}</span>
                    <span style={{fontSize:12,color:dim}}>· {ch.points}pts</span>
                    <span style={{fontSize:12,color:CAT_COLOR[ch.category],background:`${CAT_COLOR[ch.category]}14`,padding:'2px 8px',borderRadius:999}}>{CAT_LABEL[ch.category]}</span>
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

          <div style={{marginBottom:18}}>
            <label style={{fontSize:14,color:dim,display:'block',marginBottom:8,fontWeight:500}}>Seu nome</label>
            <input value={playerName} onChange={e=>setPlayerName(e.target.value)} placeholder="Ex: Maria Silva" maxLength={24} style={{...inputStyle,fontSize:15,padding:'14px 16px'}}/>
          </div>

          {mode==='join' && (
            <div style={{marginBottom:18}}>
              <label style={{fontSize:14,color:dim,display:'block',marginBottom:8,fontWeight:500}}>Código da sala</label>
              <input value={joinCodeInput} onChange={e=>setJoinCodeInput(e.target.value.toUpperCase().slice(0,4))}
                placeholder="XXXX" maxLength={4}
                style={{...inputStyle,fontSize:34,letterSpacing:'0.4em',fontFamily:'monospace',textAlign:'center',textTransform:'uppercase',padding:'18px 14px'}}/>
            </div>
          )}

          {mode !== 'join' && (
            <>
              {/* Categoria */}
              <div style={{marginBottom:18}}>
                <label style={{fontSize:14,color:dim,display:'block',marginBottom:10,fontWeight:500}}>Categoria dos desafios</label>
                <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                  {categories.map(cat=>{
                    const active = categorySetup===cat;
                    const cc = CAT_COLOR[cat];
                    return (
                      <button key={cat} onClick={()=>setCategorySetup(cat)}
                        style={{padding:'8px 16px',borderRadius:10,border:`2px solid ${active?cc:border}`,background:active?`${cc}18`:'transparent',color:active?cc:dim,fontSize:14,fontWeight:active?700:500,cursor:'pointer',transition:'all 0.12s'}}>
                        {CAT_LABEL[cat]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rodadas */}
              <div style={{marginBottom:18}}>
                <label style={{fontSize:14,color:dim,display:'block',marginBottom:10,fontWeight:500}}>Número de rodadas</label>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr 1fr',gap:10}}>
                  {([1,3,5,7,10] as (1|3|5|7|10)[]).map(n=>{
                    const active = totalRoundsSetup===n;
                    return (
                      <button key={n} onClick={()=>setTotalRoundsSetup(n)}
                        style={{padding:'16px 10px',borderRadius:12,border:`2px solid ${active?'#667eea':border}`,background:active?'rgba(102,126,234,0.12)':'transparent',cursor:'pointer',color:active?'#667eea':dim,fontWeight:700,fontSize:26,display:'flex',flexDirection:'column',alignItems:'center',gap:5,transition:'all 0.12s',boxShadow:active?'0 0 0 4px rgba(102,126,234,0.12)':'none'}}>
                        {n}
                        <span style={{fontSize:12,fontWeight:500,color:active?'#667eea':dim}}>{n===1?'Rápido':n===3?'Normal':'Longo'}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Jogadores (só no create) */}
              {mode==='create' && (
                <div style={{marginBottom:18}}>
                  <label style={{fontSize:14,color:dim,display:'block',marginBottom:10,fontWeight:500}}>Máximo de jogadores</label>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
                    {([2,3,4] as (2|3|4)[]).map(n=>{
                      const active = maxPlayers===n;
                      return (
                        <button key={n} onClick={()=>setMaxPlayers(n)}
                          style={{padding:'16px 10px',borderRadius:12,border:`2px solid ${active?'#667eea':border}`,background:active?'rgba(102,126,234,0.12)':'transparent',cursor:'pointer',color:active?'#667eea':dim,fontWeight:700,fontSize:26,display:'flex',flexDirection:'column',alignItems:'center',gap:5,transition:'all 0.12s',boxShadow:active?'0 0 0 4px rgba(102,126,234,0.12)':'none'}}>
                          {n}
                          <span style={{fontSize:12,fontWeight:500,color:active?'#667eea':dim}}>{n===2?'Duo':n===3?'Trio':'Squad'}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {error && <div style={{color:'#ef4444',fontSize:13,marginBottom:14,padding:'10px 14px',background:'rgba(239,68,68,0.1)',borderRadius:8}}>{error}</div>}

          <button onClick={mode==='create'?createRoom:mode==='join'?joinRoom:startSolo} disabled={loading}
            style={{width:'100%',background:'linear-gradient(135deg,#667eea,#764ba2)',color:'white',border:'none',borderRadius:12,padding:'16px',fontSize:16,fontWeight:700,cursor:loading?'not-allowed':'pointer',opacity:loading?0.7:1,display:'flex',alignItems:'center',justifyContent:'center',gap:9}}>
            <Play size={18}/>
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
            {copiedCode?<><Check size={14}/> Link copiado!</>:<><Copy size={14}/> Copiar link de convite</>}
          </button>

          <div style={{marginBottom:20}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
              <span style={{fontSize:11,color:dim,textTransform:'uppercase',letterSpacing:'0.08em'}}>Jogadores</span>
              <span style={{fontSize:12,fontWeight:700,color:joined>=max?'#22c55e':dim}}>{joined}/{max}</span>
            </div>
            {Object.entries(allPlayers).map(([id,p])=>{
              const isSelf = id===playerId.current;
              const myVoteCount = kickVotes[id] ? Object.keys(kickVotes[id]).length : 0;
              const alreadyVoted = kickVotes[id]?.[playerId.current] ?? false;
              return (
                <div key={id} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',background:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.03)',borderRadius:10,marginBottom:6}}>
                  <div style={{width:8,height:8,borderRadius:'50%',background:'#22c55e',flexShrink:0}}/>
                  <span style={{fontSize:13,fontWeight:600,color:text,flex:1}}>{p.name}</span>
                  {isSelf && <span style={{fontSize:10,color:'#667eea',background:'rgba(102,126,234,0.12)',padding:'2px 8px',borderRadius:999}}>você</span>}
                  {!isSelf && (
                    <button onClick={()=>voteKick(id)} disabled={alreadyVoted}
                      title={alreadyVoted?'Voce ja votou':'Votar para remover'}
                      style={{background:alreadyVoted?'rgba(239,68,68,0.08)':'none',border:`1px solid ${alreadyVoted?'rgba(239,68,68,0.3)':border}`,color:alreadyVoted?'#ef4444':dim,borderRadius:6,padding:'4px 9px',cursor:alreadyVoted?'default':'pointer',fontSize:11,display:'flex',alignItems:'center',gap:4}}>
                      <UserMinus size={11}/> {myVoteCount>0?`${myVoteCount} voto${myVoteCount>1?'s':''}`:alreadyVoted?'votado':'remover'}
                    </button>
                  )}
                </div>
              );
            })}
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
      <div onContextMenu={e=>e.preventDefault()} style={{height:'100vh',display:'flex',flexDirection:'column',background:bg,overflow:'hidden',position:'relative'}}>

        {/* Coin earned toast */}
        {coinsEarned > 0 && (
          <div style={{position:'fixed',bottom:90,right:24,zIndex:300,background:'linear-gradient(135deg,#f59e0b,#d97706)',color:'white',padding:'10px 18px',borderRadius:12,fontSize:13,fontWeight:700,display:'flex',alignItems:'center',gap:8,boxShadow:'0 4px 20px rgba(245,158,11,0.4)',animation:'floatUp 0.4s ease-out',pointerEvents:'none'}}>
            <CoinIcon size={16}/> +{coinsEarned} moedas ganhas!
          </div>
        )}

        {/* DevTools warning */}
        {devToolsOpen && (
          <div style={{position:'fixed',inset:0,zIndex:280,background:'rgba(0,0,0,0.7)',display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(4px)'}}>
            <div style={{background:card,border:`1px solid ${border}`,borderRadius:16,padding:'32px 40px',textAlign:'center',maxWidth:360}}>
              <div style={{fontSize:32,marginBottom:12}}>🔒</div>
              <div style={{fontSize:16,fontWeight:700,color:text,marginBottom:8}}>Inspecionar detectado</div>
              <div style={{fontSize:13,color:dim,lineHeight:1.6}}>Feche o painel de desenvolvedor para continuar o desafio.</div>
            </div>
          </div>
        )}

        {/* Floating emoji reactions */}
        {floatingEmojis.map(f=>(
          <div key={f.id} style={{position:'absolute',left:`${f.x}%`,bottom:70,zIndex:90,display:'flex',flexDirection:'column',alignItems:'center',gap:2,animation:'floatUp 3.5s ease-out forwards',pointerEvents:'none'}}>
            <div style={{fontSize:32,lineHeight:1}}>{f.emoji}</div>
            <div style={{fontSize:10,color:'white',background:'rgba(0,0,0,0.55)',padding:'2px 6px',borderRadius:999,maxWidth:80,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{f.name}</div>
          </div>
        ))}

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
              const alreadyVotedKick = kickVotes[id]?.[playerId.current] ?? false;
              const kickCount = kickVotes[id] ? Object.keys(kickVotes[id]).length : 0;
              return (
                <div key={id} style={{display:'flex',alignItems:'center',gap:3,padding:'3px 6px',background:'rgba(102,126,234,0.08)',borderRadius:6,border:'1px solid rgba(102,126,234,0.2)'}}>
                  <div style={{width:5,height:5,borderRadius:'50%',background:s>=0?'#667eea':'#94a3b8'}}/>
                  <span style={{fontSize:10,color:'#667eea',fontWeight:600}}>{p.name}</span>
                  {s>=0 ? <span style={{fontSize:10,color:'#667eea',fontWeight:700}}>{s}%</span>
                        : <span style={{fontSize:9,color:dim}}>jogando</span>}
                  <button onClick={()=>voteKick(id)} disabled={alreadyVotedKick}
                    title={alreadyVotedKick?'Ja votou':'Votar para remover'}
                    style={{background:'none',border:'none',cursor:alreadyVotedKick?'default':'pointer',padding:'0 2px',display:'flex',alignItems:'center',gap:2,color:alreadyVotedKick?'#ef4444':dim,opacity:alreadyVotedKick?1:0.6}}>
                    <UserMinus size={9}/>{kickCount>0?<span style={{fontSize:9}}>{kickCount}</span>:null}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Emoji button */}
          {mode !== 'solo' && (
            <button onClick={()=>setShowEmojiPicker(v=>!v)}
              style={{background:showEmojiPicker?'rgba(102,126,234,0.15)':'none',border:`1px solid ${showEmojiPicker?'rgba(102,126,234,0.4)':border}`,borderRadius:6,padding:'4px 8px',cursor:'pointer',display:'flex',alignItems:'center',color:showEmojiPicker?'#667eea':dim}}>
              <Smile size={14}/>
            </button>
          )}

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
              {PROPERTY_GUIDE[challengeIdx] && (
                <div style={{background:isDark?'rgba(102,126,234,0.08)':'rgba(102,126,234,0.06)',border:`1px solid rgba(102,126,234,0.18)`,borderRadius:8,padding:'8px 10px',marginBottom:8}}>
                  <div style={{fontSize:10,color:'#667eea',letterSpacing:'0.08em',fontWeight:700,marginBottom:4,display:'flex',alignItems:'center',gap:4}}><Lightbulb size={10} color="#667eea"/> PROPRIEDADE CSS</div>
                  <p style={{fontSize:11,color:isDark?'#a5b4fc':'#4f46e5',margin:0,lineHeight:1.6}}>{PROPERTY_GUIDE[challengeIdx]}</p>
                </div>
              )}
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
                          Dica {level} — {cost===0 ? 'grátis' : <>{cost} moedas <CoinIcon size={11}/></>}
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
          <div style={{width:'40%',minWidth:220,display:'flex',flexDirection:'column',borderRight:`1px solid ${border}`,minHeight:0}}>
            {challenge.htmlEditable ? (
              <>
                {/* HTML editor */}
                <div style={{padding:'7px 14px',fontSize:11,color:'#94a3b8',background:'#1e1e2e',borderBottom:'2px solid #06b6d4',flexShrink:0,letterSpacing:'0.06em',display:'flex',alignItems:'center',gap:7,fontWeight:600}}>
                  <Code2 size={12} color="#06b6d4"/> <span style={{color:'#a5f3fc'}}>HTML</span>
                  <span style={{marginLeft:'auto',fontSize:9,color:'#64748b',background:'rgba(6,182,212,0.08)',padding:'2px 6px',borderRadius:4,fontWeight:500}}>escreva as tags</span>
                </div>
                <textarea value={playerHtml} onChange={e=>{ if(!submitted){ hasEditedRef.current=true; setPlayerHtml(e.target.value); } }}
                  disabled={submitted} spellCheck={false} autoCorrect="off" autoCapitalize="off"
                  style={{flex:'0 0 40%',minHeight:0,background:'#0d1b2a',color:'#a5f3fc',fontFamily:'monospace',fontSize:12,padding:12,border:'none',outline:'none',resize:'none',lineHeight:1.65,opacity:submitted?0.6:1,borderBottom:'1px solid rgba(6,182,212,0.15)'}}/>
                {/* CSS editor */}
                <div style={{padding:'7px 14px',fontSize:11,color:'#94a3b8',background:'#1e1e2e',borderBottom:'2px solid #667eea',flexShrink:0,letterSpacing:'0.06em',display:'flex',alignItems:'center',gap:7,fontWeight:600}}>
                  <Palette size={12} color="#667eea"/> <span style={{color:'#c7d2fe'}}>CSS</span>
                  <span style={{marginLeft:'auto',fontSize:9,color:'#64748b',background:'rgba(102,126,234,0.08)',padding:'2px 6px',borderRadius:4,fontWeight:500}}>estilize com CSS</span>
                  {submitted && <span style={{color:'#22c55e',display:'flex',alignItems:'center',gap:3,fontWeight:700}}><Check size={10}/> Enviado</span>}
                </div>
                <textarea value={playerCode} onChange={e=>{ if(!submitted){ hasEditedRef.current=true; setPlayerCode(e.target.value); } }}
                  onKeyDown={handleTab} disabled={submitted} spellCheck={false} autoCorrect="off" autoCapitalize="off"
                  style={{flex:1,minHeight:0,background:'#1e1e2e',color:'#cdd6f4',fontFamily:'monospace',fontSize:12,padding:12,border:'none',outline:'none',resize:'none',lineHeight:1.65,opacity:submitted?0.6:1}}/>
              </>
            ) : (
              <>
                <div style={{padding:'8px 14px',fontSize:12,color:'#94a3b8',background:'#1e1e2e',borderBottom:'2px solid #667eea',flexShrink:0,letterSpacing:'0.06em',display:'flex',alignItems:'center',gap:7,fontWeight:600}}>
                  <Code2 size={13} color="#667eea"/> <span style={{color:'#c7d2fe'}}>EDITOR CSS</span>
                  {submitted && <span style={{color:'#22c55e',marginLeft:'auto',display:'flex',alignItems:'center',gap:4,fontWeight:700}}><Check size={12}/> Enviado</span>}
                </div>
                <textarea value={playerCode} onChange={e=>{ if(!submitted){ hasEditedRef.current=true; setPlayerCode(e.target.value); } }}
                  onKeyDown={handleTab} disabled={submitted} spellCheck={false} autoCorrect="off" autoCapitalize="off"
                  style={{flex:1,minHeight:0,background:'#1e1e2e',color:'#cdd6f4',fontFamily:'monospace',fontSize:13,padding:14,border:'none',outline:'none',resize:'none',lineHeight:1.7,opacity:submitted?0.6:1}}/>
              </>
            )}
          </div>

          {/* Student preview */}
          <div style={{flex:1,display:'flex',flexDirection:'column',borderRight:`1px solid ${border}`,minHeight:0,minWidth:0}}>
            <div style={{padding:'8px 14px',fontSize:12,color:text,background:card,borderBottom:`2px solid #3b82f6`,flexShrink:0,letterSpacing:'0.06em',display:'flex',alignItems:'center',gap:7,fontWeight:600}}>
              <Eye size={13} color="#3b82f6"/> <span>SEU PREVIEW</span>
              {!submitted
                ? <span style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:4,fontSize:10,color:'#22c55e',background:'rgba(34,197,94,0.12)',padding:'2px 8px',borderRadius:999,fontWeight:600}}>● AO VIVO</span>
                : playerScore>=0 && <span style={{marginLeft:'auto',fontWeight:800,fontSize:15,color:playerScore>=80?'#22c55e':playerScore>=50?'#f59e0b':'#ef4444'}}>{playerScore}%</span>
              }
            </div>
            <div style={{flex:1,position:'relative',minHeight:0}}>
              <iframe ref={previewRef} title="preview" style={{position:'absolute',inset:0,width:'100%',height:'100%',border:'none'}}/>
              {/* score reveal overlay */}
              {scoreReveal.show && (
                <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.82)',zIndex:10}}>
                  <div style={{fontSize:72,fontWeight:900,lineHeight:1,color:scoreReveal.final>=80?'#22c55e':scoreReveal.final>=50?'#f59e0b':'#ef4444',animation:'scoreRevealPop 0.4s ease-out'}}>
                    {scoreReveal.value}%
                  </div>
                  <div style={{marginTop:12,fontSize:13,color:'#94a3b8',fontWeight:600,letterSpacing:'0.1em'}}>
                    {scoreReveal.final>=80?'EXCELENTE!':scoreReveal.final>=60?'BOM TRABALHO!':scoreReveal.final>=40?'CONTINUE PRATICANDO':'TENTE NOVAMENTE'}
                  </div>
                  {scoreReveal.final>=80 && (
                    <div style={{position:'absolute',inset:0,pointerEvents:'none',overflow:'hidden'}}>
                      {Array.from({length:12}).map((_,i)=>(
                        <div key={i} style={{position:'absolute',top:'-10%',left:`${(i+1)*8-4}%`,width:8,height:8,borderRadius:'50%',background:['#22c55e','#3b82f6','#f59e0b','#ef4444','#8b5cf6'][i%5],animation:`confettiFall ${1.2+Math.random()*0.8}s ${Math.random()*0.5}s ease-in forwards`}}/>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Target */}
          <div style={{flex:1,display:'flex',flexDirection:'column',minHeight:0,minWidth:0}}>
            <div style={{padding:'8px 14px',fontSize:12,color:text,background:card,borderBottom:`2px solid ${challenge.iconColor}`,flexShrink:0,letterSpacing:'0.06em',display:'flex',alignItems:'center',gap:7,fontWeight:600}}>
              <ChIcon size={13} color={challenge.iconColor}/>
              <span style={{color:challenge.iconColor,fontWeight:700}}>ALVO</span>
              <span style={{color:dim,fontWeight:500}}>— {challenge.title}</span>
            </div>
            <div style={{flex:1,position:'relative',minHeight:0}}>
              <iframe ref={targetRef} title="target" style={{position:'absolute',inset:0,width:'100%',height:'100%',border:'none'}}/>
            </div>
          </div>
        </div>

        {/* Opponent finished stamps */}
        <div style={{position:'fixed',bottom:80,right:20,display:'flex',flexDirection:'column',gap:8,zIndex:120,pointerEvents:'none'}}>
          {opponentStamps.map(stamp=>(
            <div key={stamp.uid} style={{display:'flex',alignItems:'center',gap:10,background:card,border:`1px solid rgba(34,197,94,0.4)`,borderLeft:'4px solid #22c55e',borderRadius:12,padding:'10px 16px',boxShadow:'0 4px 20px rgba(0,0,0,0.3)',animation:'stampIn 0.5s cubic-bezier(0.34,1.56,0.64,1)',minWidth:200}}>
              <div style={{width:32,height:32,borderRadius:'50%',background:'rgba(34,197,94,0.15)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <Check size={16} color="#22c55e" strokeWidth={3}/>
              </div>
              <div>
                <div style={{fontWeight:700,fontSize:13,color:text}}>{stamp.name}</div>
                <div style={{fontSize:11,color:'#22c55e',fontWeight:600}}>Terminou! {stamp.score}%</div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{padding:'8px 14px',borderTop:`1px solid ${border}`,background:card,display:'flex',alignItems:'center',gap:10,flexShrink:0,flexWrap:'wrap',minHeight:52,position:'relative'}}>

          {/* Emoji picker popup */}
          {showEmojiPicker && (
            <div style={{position:'absolute',bottom:60,left:14,background:card,border:`1px solid ${border}`,borderRadius:12,padding:'10px',display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:6,zIndex:50,boxShadow:'0 8px 32px rgba(0,0,0,0.3)'}}>
              {EMOJI_LIST.map(e=>(
                <button key={e} onClick={()=>sendReaction(e)} disabled={cooldownLeft>0}
                  style={{fontSize:22,background:'none',border:'none',cursor:cooldownLeft>0?'not-allowed':'pointer',borderRadius:6,padding:'4px',opacity:cooldownLeft>0?0.4:1,transition:'transform 0.1s'}}
                  onMouseEnter={el=>{ if(cooldownLeft===0) el.currentTarget.style.transform='scale(1.25)'; }}
                  onMouseLeave={el=>{ el.currentTarget.style.transform=''; }}>
                  {e}
                </button>
              ))}
              {cooldownLeft>0 && (
                <div style={{gridColumn:'1/-1',textAlign:'center',fontSize:11,color:'#ef4444',marginTop:2}}>
                  {cooldownLeft >= 10 ? `⏳ Penalidade anti-spam: ${cooldownLeft}s` : `Aguarde ${cooldownLeft}s`}
                </div>
              )}
            </div>
          )}

          {!submitted ? (
            <>
              <button onClick={()=>{ setShowInstr(true); setShowHints(true); }}
                style={{display:'flex',alignItems:'center',gap:5,background:'none',border:`1px solid ${border}`,color:dim,borderRadius:7,padding:'7px 12px',cursor:'pointer',fontSize:12}}>
                <Lightbulb size={13}/> Dicas · <CoinIcon size={11}/> {currentUser ? currentUser.coins : tempCoins}
              </button>
              <button onClick={handleSubmit}
                style={{background:'linear-gradient(135deg,#22c55e,#16a34a)',color:'white',border:'none',borderRadius:8,padding:'9px 20px',fontSize:13,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',gap:7}}>
                <Zap size={13}/> Enviar Resposta
              </button>
            </>
          ) : (
            <div style={{display:'flex',alignItems:'center',gap:10,flexShrink:0,flexWrap:'wrap'}}>
              {/* stat: score */}
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',background:playerScore>=80?'rgba(34,197,94,0.10)':playerScore>=50?'rgba(245,158,11,0.10)':'rgba(239,68,68,0.10)',borderRadius:10,padding:'5px 14px',border:`1px solid ${playerScore>=80?'rgba(34,197,94,0.25)':playerScore>=50?'rgba(245,158,11,0.25)':'rgba(239,68,68,0.25)'}`}}>
                <span style={{fontSize:9,color:dim,fontWeight:600,letterSpacing:'0.08em',textTransform:'uppercase'}}>Acerto</span>
                <span style={{fontSize:20,fontWeight:900,color:playerScore>=80?'#22c55e':playerScore>=50?'#f59e0b':'#ef4444',lineHeight:1.1}}>{playerScore}%</span>
              </div>
              {/* stat: time taken */}
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',background:'rgba(102,126,234,0.08)',borderRadius:10,padding:'5px 14px',border:'1px solid rgba(102,126,234,0.2)'}}>
                <span style={{fontSize:9,color:dim,fontWeight:600,letterSpacing:'0.08em',textTransform:'uppercase'}}>Seu tempo</span>
                <span style={{fontSize:16,fontWeight:800,color:'#667eea',lineHeight:1.2}}>{timeTaken<60?`${timeTaken}s`:`${Math.floor(timeTaken/60)}m ${timeTaken%60}s`}</span>
              </div>
              {/* stat: remaining */}
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',background:'rgba(148,163,184,0.08)',borderRadius:10,padding:'5px 14px',border:'1px solid rgba(148,163,184,0.2)'}}>
                <span style={{fontSize:9,color:dim,fontWeight:600,letterSpacing:'0.08em',textTransform:'uppercase'}}>Sobrou</span>
                <span style={{fontSize:16,fontWeight:800,color:timeLeft>90?'#22c55e':timeLeft>30?'#f59e0b':'#94a3b8',lineHeight:1.2}}>{timeLeft<60?`${timeLeft}s`:`${Math.floor(timeLeft/60)}m ${timeLeft%60}s`}</span>
              </div>
              {mode!=='solo' && (
                <button onClick={()=>{ if(!showMiniGame){initMemory();} setShowMiniGame(v=>!v); }}
                  style={{display:'flex',alignItems:'center',gap:5,background:'rgba(139,92,246,0.12)',border:'1px solid rgba(139,92,246,0.3)',color:'#8b5cf6',borderRadius:8,padding:'6px 12px',cursor:'pointer',fontSize:12,fontWeight:600,flexShrink:0}}>
                  <Gamepad size={13}/> {showMiniGame ? 'Fechar' : 'Jogar'}
                </button>
              )}
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
      {/* Mini-game overlay */}
      {showMiniGame && (
        <div style={{position:'fixed',inset:0,zIndex:150,background:'rgba(0,0,0,0.75)',display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
          <div style={{background:card,border:`1px solid ${border}`,borderRadius:20,padding:'24px 20px',width:'100%',maxWidth:480,boxShadow:'0 20px 60px rgba(0,0,0,0.5)'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
              <div>
                <div style={{fontSize:16,fontWeight:700,color:text}}>Jogo da Memoria</div>
                <div style={{fontSize:11,color:dim,marginTop:2}}>Encontre os pares de propriedades CSS · {memMoves} movimentos</div>
              </div>
              <div style={{display:'flex',gap:8}}>
                <button onClick={initMemory} style={{background:'rgba(102,126,234,0.1)',border:'1px solid rgba(102,126,234,0.25)',color:'#667eea',borderRadius:8,padding:'5px 10px',cursor:'pointer',fontSize:11,fontWeight:600,display:'flex',alignItems:'center',gap:4}}>
                  <RefreshCw size={11}/> Reiniciar
                </button>
                <button onClick={()=>setShowMiniGame(false)} style={{background:'none',border:`1px solid ${border}`,color:dim,borderRadius:8,padding:'5px 10px',cursor:'pointer',fontSize:11}}>
                  Fechar
                </button>
              </div>
            </div>

            {memComplete ? (
              <div style={{textAlign:'center',padding:'32px 0'}}>
                <Trophy size={40} color="#f59e0b" style={{margin:'0 auto 12px'}}/>
                <div style={{fontSize:18,fontWeight:800,color:text,marginBottom:6}}>Parabens!</div>
                <div style={{fontSize:13,color:dim}}>Completou em {memMoves} movimentos</div>
                <button onClick={initMemory} style={{marginTop:16,background:'linear-gradient(135deg,#667eea,#764ba2)',color:'white',border:'none',borderRadius:10,padding:'10px 24px',cursor:'pointer',fontSize:13,fontWeight:700}}>
                  Jogar novamente
                </button>
              </div>
            ) : (
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
                {memCards.map(card=>(
                  <button key={card.uid} onClick={()=>flipMemCard(card.uid)}
                    style={{aspectRatio:'1',border:`2px solid ${card.matched?'#22c55e':card.flipped?'#667eea':border}`,borderRadius:12,cursor:card.matched||card.flipped?'default':'pointer',background:card.matched?'rgba(34,197,94,0.1)':card.flipped?'rgba(102,126,234,0.12)':isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.04)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:card.flipped||card.matched?9:0,fontWeight:700,color:card.matched?'#22c55e':'#667eea',fontFamily:'monospace',transition:'all 0.2s',padding:4,wordBreak:'break-word',lineHeight:1.2,letterSpacing:'-0.02em',textAlign:'center',overflow:'hidden'}}>
                    {(card.flipped||card.matched) ? card.symbol : (
                      <div style={{width:18,height:18,borderRadius:4,background:isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.08)'}}/>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
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
