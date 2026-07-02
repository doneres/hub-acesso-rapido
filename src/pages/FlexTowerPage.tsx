import React, { useState, useEffect, useRef, useCallback, useReducer } from 'react';
import {
  ChevronLeft, Heart, Trophy, RefreshCw, Lock,
  Crosshair, Zap, Target, Swords, X,
  Lightbulb, Play, CheckCircle2, AlertTriangle,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════ */
interface Pt { x: number; y: number }

interface TowerType {
  id: string; name: string;
  range: number; damage: number; aps: number;
  color: string; border: string; projColor: string;
  desc: string; aoe?: number; pierce?: boolean;
}

interface EnemyType {
  id: string; name: string;
  hp: number; speed: number;
  fill: string; stroke: string;
  reward: number; size: number;
}

interface SlotDef { id: string; x: number; y: number; r: number }

interface MapDef {
  id: string; name: string;
  waypoints: Pt[];
  slots: SlotDef[];
}

interface WaveEntry { type: string; count: number; interval: number }

interface LevelDef {
  num: number; mapId: string;
  title: string; story: string;
  objective: string; hint: string;
  towers: Array<{ id: string; type: string }>;
  waves: WaveEntry[][];
  initCss: string;
  tutorial?: boolean;
}

interface Enemy {
  uid: string; type: string;
  progress: number; x: number; y: number;
  hp: number; maxHp: number;
}

interface Projectile {
  uid: string; x: number; y: number;
  vx: number; vy: number;
  damage: number; color: string;
  targetUid: string; aoe?: number; pierce?: boolean;
  hit?: boolean;
}

interface Tower {
  id: string; type: string;
  x: number; y: number;
  cooldown: number; placed: boolean;
}

interface FloatText { uid: string; x: number; y: number; text: string; color: string; life: number }

type Phase = 'edit' | 'wave' | 'between' | 'victory' | 'defeat';

interface GS {
  enemies: Enemy[];
  projectiles: Projectile[];
  towers: Tower[];
  floatTexts: FloatText[];
  castleHp: number;
  gold: number;
  score: number;
  wave: number;
  phase: Phase;
  spawnQueue: { type: string; at: number }[];
  spawnTimer: number;
  betweenTimer: number;
}

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════════════ */
const BW = 780;
const BH = 470;
const CASTLE_HP = 20;
const PROJ_SPEED = 320;
const BETWEEN_DELAY = 3;
const BOARD_ID = 'ftd-board';

const STYLES = `
  @keyframes ftd-shake { 0%,100%{transform:translate(0)} 33%{transform:translate(-3px,0)} 66%{transform:translate(3px,0)} }
  @keyframes ftd-pop   { from{transform:scale(1.4);opacity:1} to{transform:scale(0);opacity:0} }
  @keyframes ftd-float { from{opacity:1;transform:translateY(0)} to{opacity:0;transform:translateY(-50px)} }
  @keyframes ftd-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(201,162,39,0.5)} 50%{box-shadow:0 0 0 8px rgba(201,162,39,0)} }
  @keyframes ftd-glow  { 0%,100%{opacity:.55} 50%{opacity:1} }
  @keyframes ftd-in    { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes ftd-march { 0%{transform:scaleX(1)} 50%{transform:scaleX(-1)} 100%{transform:scaleX(1)} }

  * { scrollbar-width:thin; scrollbar-color:rgba(201,162,39,.2) transparent; }
  ::-webkit-scrollbar { width:3px; }
  ::-webkit-scrollbar-thumb { background:rgba(201,162,39,.25); border-radius:2px; }
  ::-webkit-scrollbar-thumb:hover { background:rgba(201,162,39,.5); }

  .ftd-slot { animation: ftd-pulse 2.2s ease-in-out infinite; }
  .ftd-enemy { animation: ftd-march 0.7s steps(2) infinite; }
`;

/* ═══════════════════════════════════════════════════════════════
   TOWER TYPES
═══════════════════════════════════════════════════════════════ */
const TOWER_TYPES: Record<string, TowerType> = {
  archer: {
    id: 'archer', name: 'Arqueiro',
    range: 165, damage: 2, aps: 1.6,
    color: '#0f2744', border: '#4a9ed4', projColor: '#90cef4',
    desc: 'Longo alcance · Ataque rápido',
  },
  mage: {
    id: 'mage', name: 'Mago',
    range: 125, damage: 6, aps: 0.55, aoe: 55,
    color: '#26083d', border: '#9b59b6', projColor: '#d7bde2',
    desc: 'Dano em área · Orbe mágico',
  },
  ballista: {
    id: 'ballista', name: 'Balista',
    range: 230, damage: 9, aps: 0.3, pierce: true,
    color: '#3a1505', border: '#e67e22', projColor: '#f0a55a',
    desc: 'Perfura inimigos · Alcance máximo',
  },
  knight: {
    id: 'knight', name: 'Cavaleiro',
    range: 62, damage: 5, aps: 2.6,
    color: '#302a05', border: '#f1c40f', projColor: '#fdebd0',
    desc: 'Corpo-a-corpo · Ultra-rápido',
  },
};

/* ═══════════════════════════════════════════════════════════════
   ENEMY TYPES
═══════════════════════════════════════════════════════════════ */
const ENEMY_TYPES: Record<string, EnemyType> = {
  goblin: { id:'goblin', name:'G', hp:4,  speed:68, fill:'#145214', stroke:'#27ae60', reward:5,  size:22 },
  orc:    { id:'orc',    name:'O', hp:14, speed:40, fill:'#6b2b10', stroke:'#e74c3c', reward:12, size:28 },
  troll:  { id:'troll',  name:'T', hp:34, speed:22, fill:'#3d1260', stroke:'#8e44ad', reward:28, size:34 },
};

/* ═══════════════════════════════════════════════════════════════
   MAPS
═══════════════════════════════════════════════════════════════ */
const MAP1: MapDef = {
  id: 'map1', name: 'Floresta Sombria',
  waypoints: [
    {x:-10, y:240},
    {x:110,  y:240},
    {x:185,  y:145},
    {x:315,  y:115},
    {x:395,  y:195},
    {x:450,  y:325},
    {x:570,  y:355},
    {x:650,  y:245},
    {x:790,  y:240},
  ],
  slots: [
    { id:'tower-1', x:168, y:78,  r:72 },
    { id:'tower-2', x:352, y:62,  r:72 },
    { id:'tower-3', x:495, y:412, r:72 },
    { id:'tower-4', x:692, y:178, r:72 },
  ],
};

const MAP2: MapDef = {
  id: 'map2', name: 'Pântano das Sombras',
  waypoints: [
    {x:-10, y:120},
    {x:115,  y:120},
    {x:195,  y:220},
    {x:195,  y:345},
    {x:335,  y:345},
    {x:415,  y:240},
    {x:500,  y:140},
    {x:625,  y:140},
    {x:690,  y:245},
    {x:790,  y:240},
  ],
  slots: [
    { id:'tower-1', x:82,  y:195, r:72 },
    { id:'tower-2', x:145, y:390, r:72 },
    { id:'tower-3', x:378, y:415, r:72 },
    { id:'tower-4', x:558, y:72,  r:72 },
    { id:'tower-5', x:703, y:320, r:72 },
  ],
};

const MAPS: Record<string, MapDef> = { map1: MAP1, map2: MAP2 };

/* ═══════════════════════════════════════════════════════════════
   LEVELS
═══════════════════════════════════════════════════════════════ */
const LEVELS: LevelDef[] = [
  {
    num:1, mapId:'map1', tutorial:true,
    title:'A Primeira Defesa',
    story:'Goblins avançam pela Floresta Sombria! Precisamos posicionar nosso Arqueiro na primeira curva do caminho antes que cheguem ao castelo.',
    objective:'Use position: absolute com as propriedades top e left para posicionar o Arqueiro.',
    hint:'position: absolute + top e left definem coordenadas exatas dentro do container. O slot dourado mostra onde a torre deve ficar.',
    towers:[{id:'tower-1', type:'archer'}],
    waves:[[{type:'goblin', count:6, interval:1.8}]],
    initCss:`/* 🏰 FLEX TOWER DEFENSE — Nível 1                    */
/* Posicione o Arqueiro na primeira curva do mapa    */
/* O anel dourado mostra onde a torre deve ficar     */

#tower-1 {
  position: absolute;
  top: ??px;    /* substitua ?? pelo valor correto */
  left: ??px;   /* observe o anel dourado no mapa  */
}`,
  },
  {
    num:2, mapId:'map1',
    title:'O Lado Oposto',
    story:'Orcs aparecem! A segunda curva fica no canto superior-direito. Mas desta vez, posicione usando o canto de referência oposto.',
    objective:'Use bottom e right como referência de posicionamento (em vez de top e left).',
    hint:'bottom mede a distância da borda INFERIOR do container. right mede da borda DIREITA. Às vezes é mais fácil do que calcular top/left!',
    towers:[{id:'tower-2', type:'archer'}],
    waves:[
      [{type:'goblin', count:5, interval:1.5}],
      [{type:'orc', count:3, interval:2.2}],
    ],
    initCss:`/* Nível 2 — Use bottom e right desta vez!           */
/* A segunda curva está próxima ao topo do mapa      */

#tower-2 {
  position: absolute;
  bottom: ??px;  /* distância da borda de BAIXO */
  left: ??px;    /* ou use right: ??px           */
}`,
  },
  {
    num:3, mapId:'map1',
    title:'Dois Defensores',
    story:'A horda cresce! Precisamos de dois arqueiros cobrindo as duas primeiras curvas simultaneamente.',
    objective:'Use seletores de ID (#id) para posicionar dois elementos de forma independente.',
    hint:'Cada regra CSS com #id único afeta apenas aquele elemento. Use uma regra para #tower-1 e outra para #tower-2.',
    towers:[{id:'tower-1', type:'archer'}, {id:'tower-2', type:'mage'}],
    waves:[
      [{type:'goblin', count:8, interval:1.2}, {type:'orc', count:2, interval:3.0}],
      [{type:'orc', count:5, interval:1.8}],
    ],
    initCss:`/* Nível 3 — Seletores de ID para cada torre         */

#tower-1 {
  position: absolute;
  /* primeira curva */

}

#tower-2 {
  position: absolute;
  /* segunda curva */

}`,
  },
  {
    num:4, mapId:'map1',
    title:'A Balista do Sul',
    story:'Trolls surgem pelo pântano ao sul! A Balista tem alcance suficiente para cobrir aquela área — mas está no slot inferior.',
    objective:'Use bottom para posicionar usando a borda inferior como referência.',
    hint:'bottom: 0 encosta na borda inferior. Combine bottom com right ou left para posicionar no canto correto.',
    towers:[{id:'tower-3', type:'ballista'}],
    waves:[
      [{type:'troll', count:3, interval:3.5}],
      [{type:'orc', count:4, interval:2.0}, {type:'troll', count:2, interval:3.0}],
    ],
    initCss:`/* Nível 4 — Slot inferior do mapa                  */
/* A Balista precisa cobrir o caminho ao sul         */

#tower-3 {
  position: absolute;
  bottom: ??px;
  /* left ou right? observe o slot */

}`,
  },
  {
    num:5, mapId:'map1',
    title:'Rotação Tática',
    story:'A curva final é diagonal! A Balista cobre mais área se girarmos 45 graus em direção ao caminho inimigo.',
    objective:'Use transform: rotate() para girar um elemento.',
    hint:'transform: rotate(45deg) gira no sentido horário. Valores negativos giram no sentido anti-horário. Combine com position para posicionar E girar.',
    towers:[{id:'tower-4', type:'ballista'}],
    waves:[
      [{type:'orc', count:6, interval:1.7}],
      [{type:'troll', count:3, interval:2.8}],
    ],
    initCss:`/* Nível 5 — Posicione E rotacione a Balista         */

#tower-4 {
  position: absolute;
  top: ??px;
  left: ??px;
  transform: rotate(??deg);  /* gire em direção ao caminho */
}`,
  },
  {
    num:6, mapId:'map1',
    title:'Ajuste Fino',
    story:'O Mago está quase no ponto certo, mas precisa de um pequeno deslocamento sem alterar top/left. O translate() é perfeito para isso.',
    objective:'Use transform: translate(x, y) para deslocar sem mudar top/left.',
    hint:'translate(20px, -10px) move 20px à direita e 10px para cima, SEM alterar os valores de top e left. Útil para micro-ajustes.',
    towers:[{id:'tower-2', type:'mage'}],
    waves:[
      [{type:'orc', count:5, interval:1.9}],
      [{type:'troll', count:4, interval:2.5}],
    ],
    initCss:`/* Nível 6 — Ajuste com translate()                  */
/* Use top/left para aproximar, translate para afinar */

#tower-2 {
  position: absolute;
  top: ??px;
  left: ??px;
  transform: translate(??px, ??px);
}`,
  },
  {
    num:7, mapId:'map1',
    title:'Classe de Guerreiros',
    story:'Dois arqueiros chegam reforçar a defesa — mas têm a mesma classe CSS. Aprenda a diferenciá-los.',
    objective:'Use seletor de classe (.archer) e combine com :nth-child() ou #id para individualizar.',
    hint:'.archer seleciona TODOS os arqueiros. Para posicioná-los em lugares diferentes, combine: .archer:first-child { } e .archer:last-child { }, ou continue usando #id.',
    towers:[
      {id:'tower-1', type:'archer'},
      {id:'tower-3', type:'archer'},
    ],
    waves:[
      [{type:'goblin', count:10, interval:0.9}],
      [{type:'orc', count:6, interval:1.5}],
      [{type:'troll', count:3, interval:2.5}],
    ],
    initCss:`/* Nível 7 — Seletores de classe                     */
/* Ambas as torres têm class="tower archer"          */

.archer {
  position: absolute;
  /* isso posiciona TODOS os arqueiros no mesmo lugar! */
  /* como diferenciá-los? use #id ou :nth-child()     */
}

#tower-1 {
  /* sobrescreve apenas tower-1 */

}

#tower-3 {
  /* sobrescreve apenas tower-3 */

}`,
  },
  {
    num:8, mapId:'map1',
    title:'Defesa Completa',
    story:'A Horda do Crepúsculo avança em força total! Todos os quatro slots devem ser ocupados com as torres corretas.',
    objective:'Combine position, seletores de ID, rotate e translate para posicionar 4 torres.',
    hint:'Use tudo que aprendeu: #id, position: absolute, top, left, bottom, right, rotate(), translate().',
    towers:[
      {id:'tower-1', type:'archer'},
      {id:'tower-2', type:'mage'},
      {id:'tower-3', type:'ballista'},
      {id:'tower-4', type:'knight'},
    ],
    waves:[
      [{type:'goblin', count:10, interval:0.8}],
      [{type:'orc', count:8, interval:1.3}],
      [{type:'troll', count:5, interval:2.0}],
    ],
    initCss:`/* Nível 8 — Defesa total! 4 torres nos 4 slots      */

#tower-1 {
  position: absolute;

}

#tower-2 {
  position: absolute;

}

#tower-3 {
  position: absolute;

}

#tower-4 {
  position: absolute;

}`,
  },
  /* ── MAP 2 ── */
  {
    num:9, mapId:'map2',
    title:'Novo Território',
    story:'O Pântano das Sombras tem um traçado diferente — mais curvas, mais perigos. Comece com o Arqueiro na primeira curva.',
    objective:'Adapte seu conhecimento de posicionamento ao novo mapa com 5 slots.',
    hint:'O mapa mudou mas a lógica é a mesma. Observe os anéis dourados — eles marcam os novos slots.',
    towers:[{id:'tower-1', type:'archer'}],
    waves:[
      [{type:'goblin', count:8, interval:1.3}],
      [{type:'orc', count:4, interval:2.0}],
    ],
    initCss:`/* Nível 9 — Novo mapa, mesma lógica               */
/* Observe os anéis dourados para encontrar os slots */

#tower-1 {
  position: absolute;

}`,
  },
  {
    num:10, mapId:'map2',
    title:'Seletor de Atributo',
    story:'Tropas mistas! Três torres de tipos diferentes. Aprenda a selecioná-las pelo atributo data-type.',
    objective:'Use seletor de atributo [data-type="archer"] para selecionar torres pelo tipo.',
    hint:'[data-type="archer"] seleciona qualquer elemento onde data-type seja "archer". Combine com #id para posicionamento individual.',
    towers:[
      {id:'tower-1', type:'archer'},
      {id:'tower-2', type:'mage'},
      {id:'tower-4', type:'archer'},
    ],
    waves:[
      [{type:'goblin', count:10, interval:0.9}, {type:'orc', count:3, interval:2.5}],
      [{type:'orc', count:7, interval:1.4}],
      [{type:'troll', count:3, interval:2.8}],
    ],
    initCss:`/* Nível 10 — Seletores de atributo                 */

/* Seleciona todas as torres do tipo arqueiro        */
[data-type="archer"] {
  position: absolute;
  top: ??px;
  left: ??px;
  /* mas isso os coloca no mesmo lugar!              */
  /* use os IDs abaixo para individualizar           */
}

#tower-1 {
  /* ajuste fino do primeiro arqueiro */

}

#tower-4 {
  /* reposiciona o segundo arqueiro   */

}

#tower-2 {
  /* posicione o Mago separadamente   */
  position: absolute;

}`,
  },
  {
    num:11, mapId:'map2',
    title:'Transformações Combinadas',
    story:'Posição e rotação juntas! Certas curvas exigem que a torre aponte em direções não-ortogonais.',
    objective:'Combine translate() e rotate() em uma única declaração transform.',
    hint:'transform aceita múltiplas funções: transform: translate(10px, 5px) rotate(30deg). A ordem importa — rotate é aplicado DEPOIS do translate!',
    towers:[
      {id:'tower-2', type:'mage'},
      {id:'tower-3', type:'ballista'},
      {id:'tower-5', type:'knight'},
    ],
    waves:[
      [{type:'orc', count:8, interval:1.3}],
      [{type:'troll', count:5, interval:2.0}],
      [{type:'orc', count:6, interval:1.4}, {type:'troll', count:3, interval:2.5}],
    ],
    initCss:`/* Nível 11 — translate() + rotate() juntos          */

#tower-2 {
  position: absolute;

  transform: translate(??px, ??px) rotate(??deg);
}

#tower-3 {
  position: absolute;

}

#tower-5 {
  position: absolute;

}`,
  },
  {
    num:12, mapId:'map2',
    title:'HORDA FINAL',
    story:'O Senhor das Trevas ataca pessoalmente com sua horda completa! Cinco torres, cinco slots, sem dicas — use TUDO que aprendeu.',
    objective:'Combine todos os seletores e propriedades aprendidas para defender o castelo com 5 torres.',
    hint:'Sem dicas desta vez. Você aprendeu: position, top, left, bottom, right, #id, .class, [data-type], rotate(), translate(). Use com sabedoria!',
    towers:[
      {id:'tower-1', type:'archer'},
      {id:'tower-2', type:'mage'},
      {id:'tower-3', type:'ballista'},
      {id:'tower-4', type:'archer'},
      {id:'tower-5', type:'knight'},
    ],
    waves:[
      [{type:'goblin', count:14, interval:0.7}],
      [{type:'orc', count:10, interval:1.1}],
      [{type:'troll', count:7, interval:1.7}],
    ],
    initCss:`/* ⚔ HORDA FINAL ⚔                                   */
/* 5 torres · 5 slots · use tudo que aprendeu        */
/* position · top · left · bottom · right            */
/* #id · .class · [data-type]                        */
/* rotate() · translate()                            */

`,
  },
];

/* ═══════════════════════════════════════════════════════════════
   UTILITIES
═══════════════════════════════════════════════════════════════ */
const uid = () => Math.random().toString(36).slice(2, 8);

function dist(a: Pt, b: Pt) { return Math.sqrt((a.x-b.x)**2 + (a.y-b.y)**2); }

function pathLen(wps: Pt[]) {
  return wps.reduce((s, p, i) => i === 0 ? 0 : s + dist(p, wps[i-1]), 0);
}

function ptOnPath(wps: Pt[], t: number): Pt {
  if (t <= 0) return wps[0];
  if (t >= 1) return wps[wps.length - 1];
  const total = pathLen(wps);
  const target = t * total;
  let walked = 0;
  for (let i = 1; i < wps.length; i++) {
    const seg = dist(wps[i], wps[i-1]);
    if (walked + seg >= target) {
      const f = (target - walked) / seg;
      return { x: wps[i-1].x + (wps[i].x - wps[i-1].x) * f, y: wps[i-1].y + (wps[i].y - wps[i-1].y) * f };
    }
    walked += seg;
  }
  return wps[wps.length - 1];
}

// Catmull-Rom → SVG cubic bezier path
function waypointsToSvg(pts: Pt[]): string {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i-1)];
    const p1 = pts[i];
    const p2 = pts[i+1];
    const p3 = pts[Math.min(pts.length-1, i+2)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x} ${p2.y}`;
  }
  return d;
}

function scopeCSS(css: string, scopeId: string): string {
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
  return clean.replace(/([^{}@]+)\{/g, (_, sel) => {
    const scoped = sel.trim().split(',').map((s: string) => {
      const t = s.trim();
      return t ? `#${scopeId} ${t}` : '';
    }).filter(Boolean).join(', ');
    return scoped ? `${scoped} {` : '{';
  });
}

function buildSpawnQueue(entries: WaveEntry[]): { type: string; at: number }[] {
  const q: { type: string; at: number }[] = [];
  let t = 0;
  entries.forEach(e => {
    for (let i = 0; i < e.count; i++) { q.push({ type: e.type, at: t }); t += e.interval; }
  });
  return q;
}

function makeGS(lvl: LevelDef, scale: number, map: MapDef): GS {
  return {
    enemies: [], projectiles: [], towers: [], floatTexts: [],
    castleHp: CASTLE_HP, gold: 60, score: 0,
    wave: 0, phase: 'edit',
    spawnQueue: [], spawnTimer: 0, betweenTimer: 0,
  };
}

/* ═══════════════════════════════════════════════════════════════
   TOWER / ENEMY ICONS
═══════════════════════════════════════════════════════════════ */
function TowerIcon({ type, size = 22 }: { type: string; size?: number }) {
  const s = size;
  if (type === 'archer')   return <Crosshair size={s} color="#4a9ed4"/>;
  if (type === 'mage')     return <Zap size={s} color="#9b59b6"/>;
  if (type === 'ballista') return <Target size={s} color="#e67e22"/>;
  if (type === 'knight')   return <Swords size={s} color="#f1c40f"/>;
  return null;
}

function CastleSVG({ hp, maxHp }: { hp: number; maxHp: number }) {
  const pct = hp / maxHp;
  const c = pct > 0.5 ? '#27ae60' : pct > 0.25 ? '#f59e0b' : '#e74c3c';
  return (
    <svg width="70" height="90" viewBox="0 0 70 90" fill="none">
      {/* Base */}
      <rect x="5" y="50" width="60" height="36" rx="3" fill="#2d2015" stroke="#6b4f28" strokeWidth="2"/>
      {/* Gate */}
      <rect x="24" y="62" width="22" height="24" rx="2" fill="#0d0a06"/>
      {/* Tower left */}
      <rect x="2" y="28" width="18" height="36" fill="#3d2f18" stroke="#6b4f28" strokeWidth="1.5"/>
      <rect x="2" y="20" width="6" height="12" fill="#3d2f18" stroke="#6b4f28" strokeWidth="1.5"/>
      <rect x="14" y="20" width="6" height="12" fill="#3d2f18" stroke="#6b4f28" strokeWidth="1.5"/>
      {/* Tower right */}
      <rect x="50" y="28" width="18" height="36" fill="#3d2f18" stroke="#6b4f28" strokeWidth="1.5"/>
      <rect x="50" y="20" width="6" height="12" fill="#3d2f18" stroke="#6b4f28" strokeWidth="1.5"/>
      <rect x="62" y="20" width="6" height="12" fill="#3d2f18" stroke="#6b4f28" strokeWidth="1.5"/>
      {/* HP bar */}
      <rect x="5" y="4" width="60" height="8" rx="2" fill="#1a1208"/>
      <rect x="5" y="4" width={60 * pct} height="8" rx="2" fill={c}/>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
interface Props { onBack?: () => void; onBackToHub?: () => void; isDark?: boolean; onToggleTheme?: () => void }

export default function FlexTowerPage({ onBack, onBackToHub, isDark = true }: Props) {
  const [levelIdx, setLevelIdx] = useState(0);
  const [css, setCss] = useState(LEVELS[0].initCss);
  const [cssError, setCssError] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [showTutorial, setShowTutorial] = useState(LEVELS[0].tutorial ?? false);
  const [boardScale, setBoardScale] = useState(1);
  const [completed, setCompleted] = useState<number[]>(() => {
    try { return JSON.parse(localStorage.getItem('ftd2-done') || '[]'); } catch { return []; }
  });
  const [, tick] = useReducer(n => n + 1, 0); // force re-render
  const [mouseCoord, setMouseCoord] = useState<{ x: number; y: number } | null>(null);

  const boardWrapRef  = useRef<HTMLDivElement>(null);
  const boardRef      = useRef<HTMLDivElement>(null);
  const boardScaleRef = useRef(1);
  const rafRef        = useRef(0);
  const lastTRef      = useRef(0);
  const styleEl       = useRef<HTMLStyleElement | null>(null);
  const gsRef         = useRef<GS>(makeGS(LEVELS[0], 1, MAP1));
  const levelIdxRef   = useRef(0);
  const debounceRef   = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lvl = LEVELS[levelIdx];
  const map = MAPS[lvl.mapId];
  const svgPath = waypointsToSvg(map.waypoints);
  const totalPathLen = pathLen(map.waypoints);
  const gs = gsRef.current;

  /* ── BOARD SCALE ──────────────────────────────────────────── */
  useEffect(() => {
    const measure = () => {
      if (!boardWrapRef.current) return;
      const { width, height } = boardWrapRef.current.getBoundingClientRect();
      const s = Math.min((width - 16) / BW, (height - 16) / BH);
      const c = Math.max(0.35, Math.min(s, 1.1));
      boardScaleRef.current = c;
      setBoardScale(c);
    };
    measure();
    const obs = new ResizeObserver(measure);
    if (boardWrapRef.current) obs.observe(boardWrapRef.current);
    return () => obs.disconnect();
  }, []);

  /* ── RESET ON LEVEL CHANGE ────────────────────────────────── */
  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    levelIdxRef.current = levelIdx;
    gsRef.current = makeGS(LEVELS[levelIdx], boardScaleRef.current, MAPS[LEVELS[levelIdx].mapId]);
    setCss(LEVELS[levelIdx].initCss);
    setCssError('');
    setShowHint(false);
    setShowTutorial(LEVELS[levelIdx].tutorial ?? false);
    tick();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelIdx]);

  /* ── DEBOUNCED LIVE PREVIEW ──────────────────────────────── */
  useEffect(() => {
    if (gsRef.current.phase !== 'edit') return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { applyCSS(); }, 400);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [css]);

  /* ── CLEANUP STYLE ON UNMOUNT ─────────────────────────────── */
  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      styleEl.current?.remove();
    };
  }, []);

  /* ── APPLY CSS ────────────────────────────────────────────── */
  const applyCSS = useCallback(() => {
    setCssError('');
    try {
      if (!styleEl.current) {
        styleEl.current = document.createElement('style');
        document.head.appendChild(styleEl.current);
      }
      styleEl.current.textContent = scopeCSS(css, BOARD_ID);
    } catch (e) {
      setCssError('CSS inválido — verifique a sintaxe.');
      return;
    }
    // Measure after browser applies styles
    requestAnimationFrame(() => {
      const board = boardRef.current;
      if (!board) return;
      const boardRect = board.getBoundingClientRect();
      const scale = boardScaleRef.current;
      const currentLvl = LEVELS[levelIdxRef.current];
      const currentMap = MAPS[currentLvl.mapId];

      const newTowers: Tower[] = currentLvl.towers.map(t => {
        const el = board.querySelector(`[data-tower-id="${t.id}"]`) as HTMLElement | null;
        if (!el) return { id: t.id, type: t.type, x: -9999, y: -9999, cooldown: 0, placed: false };
        const r = el.getBoundingClientRect();
        const cx = (r.left + r.width / 2 - boardRect.left) / scale;
        const cy = (r.top + r.height / 2 - boardRect.top) / scale;
        const slot = currentMap.slots.find(s => s.id === t.id);
        const placed = slot ? dist({ x: cx, y: cy }, slot) < slot.r : false;
        return { id: t.id, type: t.type, x: cx, y: cy, cooldown: 0, placed };
      });

      gsRef.current.towers = newTowers;
      tick();
    });
  }, [css]);

  /* ── START WAVE ───────────────────────────────────────────── */
  const startWave = useCallback(() => {
    const g = gsRef.current;
    if (g.phase !== 'edit') return;

    const currentLvl = LEVELS[levelIdxRef.current];
    const waveIdx = g.wave;
    if (waveIdx >= currentLvl.waves.length) return;

    g.phase = 'wave';
    g.spawnQueue = buildSpawnQueue(currentLvl.waves[waveIdx]);
    g.spawnTimer = 0;
    lastTRef.current = performance.now();
    rafRef.current = requestAnimationFrame(gameLoop);
    tick();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── GAME LOOP ────────────────────────────────────────────── */
  const gameLoop = useCallback((now: number) => {
    const dt = Math.min((now - lastTRef.current) / 1000, 0.05);
    lastTRef.current = now;
    const g = gsRef.current;
    const currentLvl = LEVELS[levelIdxRef.current];
    const currentMap = MAPS[currentLvl.mapId];
    const totalLen = pathLen(currentMap.waypoints);

    if (g.phase === 'between') {
      g.betweenTimer += dt;
      if (g.betweenTimer >= BETWEEN_DELAY) {
        g.betweenTimer = 0;
        g.wave += 1;
        if (g.wave >= currentLvl.waves.length) {
          g.phase = 'victory';
          // Persist completion
          const newDone = Array.from(new Set([...completed, currentLvl.num]));
          setCompleted(newDone);
          localStorage.setItem('ftd2-done', JSON.stringify(newDone));
          tick();
          return;
        }
        g.phase = 'edit';
        g.spawnQueue = [];
        tick();
        return;
      }
      tick();
      rafRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    if (g.phase !== 'wave') return;

    /* Spawn */
    g.spawnTimer += dt;
    while (g.spawnQueue.length && g.spawnQueue[0].at <= g.spawnTimer) {
      const item = g.spawnQueue.shift()!;
      const start = currentMap.waypoints[0];
      g.enemies.push({
        uid: uid(), type: item.type,
        progress: 0, x: start.x, y: start.y,
        hp: ENEMY_TYPES[item.type].hp,
        maxHp: ENEMY_TYPES[item.type].hp,
      });
    }

    /* Move enemies */
    const toRemove = new Set<string>();
    g.enemies.forEach(e => {
      const speed = ENEMY_TYPES[e.type].speed;
      e.progress += (speed / totalLen) * dt;
      if (e.progress >= 1) {
        g.castleHp = Math.max(0, g.castleHp - 1);
        toRemove.add(e.uid);
        return;
      }
      const pos = ptOnPath(currentMap.waypoints, e.progress);
      e.x = pos.x; e.y = pos.y;
    });
    g.enemies = g.enemies.filter(e => !toRemove.has(e.uid));

    if (g.castleHp <= 0) {
      g.phase = 'defeat';
      cancelAnimationFrame(rafRef.current);
      tick();
      return;
    }

    /* Tower attacks */
    g.towers.forEach(tower => {
      if (!tower.placed) return;
      tower.cooldown = Math.max(0, tower.cooldown - dt);
      if (tower.cooldown > 0) return;
      const ttype = TOWER_TYPES[tower.type];
      // Target: furthest enemy along path within range
      let best: Enemy | null = null;
      g.enemies.forEach(e => {
        if (dist(tower, e) <= ttype.range) {
          if (!best || e.progress > best.progress) best = e;
        }
      });
      if (!best) return;
      tower.cooldown = 1 / ttype.aps;
      const target = best as Enemy;
      const dx = target.x - tower.x;
      const dy = target.y - tower.y;
      const d = Math.sqrt(dx*dx + dy*dy) || 1;
      g.projectiles.push({
        uid: uid(), x: tower.x, y: tower.y,
        vx: (dx/d) * PROJ_SPEED, vy: (dy/d) * PROJ_SPEED,
        damage: ttype.damage, color: ttype.projColor,
        targetUid: target.uid, aoe: ttype.aoe, pierce: ttype.pierce,
      });
    });

    /* Move projectiles */
    const projToRemove = new Set<string>();
    g.projectiles.forEach(p => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      // Check if out of bounds
      if (p.x < -20 || p.x > BW + 20 || p.y < -20 || p.y > BH + 20) {
        projToRemove.add(p.uid); return;
      }
      // Check collision with enemies
      const target = g.enemies.find(e => e.uid === p.targetUid);
      if (!target) { projToRemove.add(p.uid); return; }
      if (dist(p, target) < (ENEMY_TYPES[target.type].size / 2 + 5)) {
        if (p.aoe) {
          g.enemies.forEach(e => {
            if (dist(p, e) < p.aoe!) {
              e.hp -= p.damage;
              g.floatTexts.push({ uid:uid(), x:e.x, y:e.y-20, text:`-${p.damage}`, color:'#c084fc', life:0.8 });
              if (e.hp <= 0) {
                g.gold += ENEMY_TYPES[e.type].reward;
                g.score += ENEMY_TYPES[e.type].reward * 10;
                g.floatTexts.push({ uid:uid(), x:e.x, y:e.y-30, text:`+${ENEMY_TYPES[e.type].reward}`, color:'#fbbf24', life:1.0 });
              }
            }
          });
          g.enemies = g.enemies.filter(e => e.hp > 0);
        } else {
          target.hp -= p.damage;
          g.floatTexts.push({ uid:uid(), x:target.x, y:target.y-20, text:`-${p.damage}`, color:'#f87171', life:0.8 });
          if (target.hp <= 0) {
            g.gold += ENEMY_TYPES[target.type].reward;
            g.score += ENEMY_TYPES[target.type].reward * 10;
            g.floatTexts.push({ uid:uid(), x:target.x, y:target.y-32, text:`+${ENEMY_TYPES[target.type].reward}`, color:'#fbbf24', life:1.0 });
            g.enemies = g.enemies.filter(e => e.uid !== target.uid);
          }
          if (!p.pierce) projToRemove.add(p.uid);
        }
        if (!p.pierce || !p.aoe) projToRemove.add(p.uid);
      }
    });
    g.projectiles = g.projectiles.filter(p => !projToRemove.has(p.uid));

    /* Float texts */
    g.floatTexts.forEach(f => { f.life -= dt; f.y -= 25 * dt; });
    g.floatTexts = g.floatTexts.filter(f => f.life > 0);

    /* Check wave clear */
    if (g.spawnQueue.length === 0 && g.enemies.length === 0) {
      g.phase = 'between';
      g.betweenTimer = 0;
    }

    tick();
    rafRef.current = requestAnimationFrame(gameLoop);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completed]);

  /* ── HELPERS ──────────────────────────────────────────────── */
  const maxAccess = completed.length === 0 ? 0 : Math.max(...completed);
  const canAccessLevel = (n: number) => n <= maxAccess + 1;

  const resetLevel = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    styleEl.current && (styleEl.current.textContent = '');
    gsRef.current = makeGS(LEVELS[levelIdxRef.current], boardScaleRef.current, MAPS[LEVELS[levelIdxRef.current].mapId]);
    setCss(LEVELS[levelIdx].initCss);
    setCssError('');
    tick();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelIdx]);

  const placedCount = gs.towers.filter(t => t.placed).length;
  const neededCount = lvl.towers.length;

  /* ════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════ */
  return (
    <div style={{ height:'100vh', display:'flex', flexDirection:'column', background:'#0a0805', fontFamily:'system-ui,sans-serif', overflow:'hidden' }}>
      <style>{STYLES}</style>

      {/* ── HEADER ────────────────────────────────────────────── */}
      <header style={{ height:50, flexShrink:0, display:'flex', alignItems:'center', gap:12, padding:'0 16px', borderBottom:'1px solid rgba(201,162,39,0.15)', background:'#0d0a06' }}>
        <button onClick={onBack ?? onBackToHub}
          style={{ display:'flex', alignItems:'center', gap:5, background:'none', border:'none', cursor:'pointer', color:'#7a6a50', fontSize:12, fontWeight:600 }}
          onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color='#c9a227'}
          onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color='#7a6a50'}>
          <ChevronLeft size={15}/> Voltar
        </button>

        <span style={{ fontFamily:"'Press Start 2P',monospace", fontSize:8, color:'#c9a227', letterSpacing:'0.06em' }}>
          ⚔ FLEX TOWER DEFENSE
        </span>

        <div style={{ flex:1 }}/>

        {/* HP */}
        <div style={{ display:'flex', gap:3 }}>
          {Array.from({length:CASTLE_HP}).map((_,i)=>(
            <div key={i} style={{ width:8, height:8, borderRadius:1, background: i < gs.castleHp ? '#e74c3c' : '#2d1a1a' }}/>
          ))}
        </div>

        {/* Gold */}
        <div style={{ display:'flex', alignItems:'center', gap:5, padding:'4px 10px', background:'rgba(201,162,39,0.08)', border:'1px solid rgba(201,162,39,0.2)', borderRadius:3 }}>
          <Trophy size={11} color="#c9a227"/>
          <span style={{ fontFamily:"'Press Start 2P',monospace", fontSize:8, color:'#c9a227' }}>{gs.gold}</span>
        </div>

        {/* Score */}
        <div style={{ fontFamily:"'Press Start 2P',monospace", fontSize:7, color:'#7a6a50' }}>
          {gs.score.toString().padStart(5,'0')}
        </div>

        {/* Level indicator */}
        <div style={{ fontFamily:"'Press Start 2P',monospace", fontSize:7, color:'#c9a227', background:'rgba(201,162,39,0.08)', border:'1px solid rgba(201,162,39,0.2)', padding:'4px 8px', borderRadius:3 }}>
          NIV {levelIdx+1}/{LEVELS.length}
        </div>
      </header>

      {/* ── BODY ──────────────────────────────────────────────── */}
      <div style={{ flex:1, display:'flex', overflow:'hidden' }}>

        {/* LEFT: GAME BOARD ───────────────────────────────────── */}
        <div style={{ flex:'0 0 58%', display:'flex', flexDirection:'column', borderRight:'1px solid rgba(201,162,39,0.1)' }}>

          {/* Board wrapper */}
          <div ref={boardWrapRef} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', background:'#0d0a06', padding:8 }}>
            <div style={{ position:'relative', width:BW*boardScale, height:BH*boardScale, flexShrink:0 }}>
              <div
                ref={boardRef}
                id={BOARD_ID}
                onMouseMove={e => {
                  const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
                  const scale = boardScaleRef.current;
                  setMouseCoord({
                    x: Math.round((e.clientX - r.left) / scale),
                    y: Math.round((e.clientY - r.top) / scale),
                  });
                }}
                onMouseLeave={() => setMouseCoord(null)}
                style={{
                  position:'absolute', top:0, left:0,
                  width:BW, height:BH,
                  transform:`scale(${boardScale})`, transformOrigin:'top left',
                  background:'linear-gradient(160deg,#0d1a0a 0%,#0a1208 40%,#0c1509 100%)',
                  border:'2px solid rgba(201,162,39,0.25)',
                  overflow:'hidden',
                  cursor:'crosshair',
                }}
              >
                {/* SVG: path + entry + castle zone */}
                <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%' }} viewBox={`0 0 ${BW} ${BH}`}>
                  {/* Path shadow */}
                  <path d={svgPath} fill="none" stroke="#3d2810" strokeWidth="34" strokeLinecap="round" strokeLinejoin="round"/>
                  {/* Path surface */}
                  <path d={svgPath} fill="none" stroke="#5a3d1a" strokeWidth="28" strokeLinecap="round" strokeLinejoin="round"/>
                  {/* Path center line */}
                  <path d={svgPath} fill="none" stroke="#6b4a20" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="8 4" opacity={0.5}/>
                  {/* Entry arrow */}
                  <polygon points={`${map.waypoints[0].x+5},${map.waypoints[0].y} ${map.waypoints[0].x-10},${map.waypoints[0].y-8} ${map.waypoints[0].x-10},${map.waypoints[0].y+8}`} fill="#c9a227" opacity={0.7}/>
                  {/* Castle zone */}
                  <rect x={BW-70} y={map.waypoints[map.waypoints.length-1].y-50} width={70} height={100} fill="rgba(201,162,39,0.04)" stroke="rgba(201,162,39,0.2)" strokeWidth={1}/>
                </svg>

                {/* Decorative trees */}
                {[[60,40],[200,380],[420,30],[560,440],[700,50]].map(([x,y],i)=>(
                  <div key={i} style={{ position:'absolute', left:x-10, top:y-14, width:0, height:0, borderLeft:'10px solid transparent', borderRight:'10px solid transparent', borderBottom:'22px solid #1a3a10', opacity:0.6 }}/>
                ))}

                {/* Slot markers */}
                {map.slots.filter(s => lvl.towers.some(t => t.id === s.id)).map(s => {
                  const tower = gs.towers.find(t => t.id === s.id);
                  const placed = tower?.placed ?? false;
                  // CSS coords to center the 48x48 tower on this slot
                  const hintTop  = Math.round(s.y - 24);
                  const hintLeft = Math.round(s.x - 24);
                  return (
                    <React.Fragment key={s.id}>
                      <div className={!placed && gs.phase==='edit' ? 'ftd-slot' : ''}
                        style={{
                          position:'absolute',
                          left:s.x-28, top:s.y-28,
                          width:56, height:56,
                          border:`2px solid ${placed ? '#22c55e' : '#c9a227'}`,
                          borderRadius:'50%',
                          background: placed ? 'rgba(34,197,94,0.1)' : 'rgba(201,162,39,0.06)',
                          display:'flex', alignItems:'center', justifyContent:'center',
                          pointerEvents:'none',
                        }}>
                        {placed && <CheckCircle2 size={16} color="#22c55e"/>}
                      </div>
                      {/* Coordinate hint label below each slot */}
                      {!placed && gs.phase === 'edit' && (
                        <div style={{
                          position:'absolute',
                          left: s.x - 52, top: s.y + 32,
                          width: 104, textAlign:'center',
                          pointerEvents:'none',
                        }}>
                          <div style={{ display:'inline-flex', flexDirection:'column', alignItems:'flex-start', gap:1, background:'rgba(10,8,5,0.82)', border:'1px solid rgba(201,162,39,0.3)', borderRadius:3, padding:'3px 6px' }}>
                            <span style={{ fontFamily:"'Courier New',monospace", fontSize:9, color:'#c9a227' }}>top: {hintTop}px</span>
                            <span style={{ fontFamily:"'Courier New',monospace", fontSize:9, color:'#c9a227' }}>left: {hintLeft}px</span>
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}

                {/* Castle */}
                <div style={{ position:'absolute', right:0, top:map.waypoints[map.waypoints.length-1].y-55 }}>
                  <CastleSVG hp={gs.castleHp} maxHp={CASTLE_HP}/>
                </div>

                {/* Tower elements (positioned by student CSS) */}
                {lvl.towers.map(t => {
                  const tt = TOWER_TYPES[t.type];
                  const tower = gs.towers.find(tw => tw.id === t.id);
                  const placed = tower?.placed ?? false;
                  return (
                    <div
                      key={t.id}
                      id={t.id}
                      data-tower-id={t.id}
                      data-type={t.type}
                      className={`tower ${t.type}`}
                      style={{
                        /* top/left NOT set here — controlled entirely by student CSS */
                        position:'absolute',
                        width:48, height:48,
                        background:tt.color,
                        border:`2px solid ${placed ? tt.border : tt.border + '80'}`,
                        borderRadius:4,
                        display:'flex', alignItems:'center', justifyContent:'center',
                        boxShadow: placed ? `0 0 12px ${tt.border}66` : 'none',
                        zIndex:10,
                      }}
                    >
                      <TowerIcon type={t.type} size={22}/>
                      {placed && (
                        <div style={{ position:'absolute', bottom:-2, right:-2, width:10, height:10, background:'#22c55e', borderRadius:'50%', border:'1px solid #0a0805' }}/>
                      )}
                    </div>
                  );
                })}

                {/* Enemies */}
                {gs.enemies.map(e => {
                  const et = ENEMY_TYPES[e.type];
                  const hpPct = e.hp / e.maxHp;
                  const half = et.size / 2;
                  return (
                    <div key={e.uid} className="ftd-enemy" style={{
                      position:'absolute', left:e.x-half, top:e.y-half,
                      width:et.size, height:et.size,
                      background:et.fill,
                      border:`2px solid ${et.stroke}`,
                      borderRadius:'50%',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      zIndex:20,
                    }}>
                      <div style={{ position:'absolute', top:-5, left:0, width:'100%', height:3, background:'#1a1208' }}>
                        <div style={{ width:`${hpPct*100}%`, height:'100%', background: hpPct>0.5?'#22c55e':hpPct>0.25?'#f59e0b':'#e74c3c', transition:'width .1s' }}/>
                      </div>
                      <span style={{ fontFamily:"'Press Start 2P',monospace", fontSize:7, color:'#fff' }}>{et.name}</span>
                    </div>
                  );
                })}

                {/* Projectiles */}
                {gs.projectiles.map(p => (
                  <div key={p.uid} style={{
                    position:'absolute', left:p.x-4, top:p.y-4,
                    width:8, height:8, borderRadius:'50%',
                    background:p.color,
                    boxShadow:`0 0 6px ${p.color}`,
                    zIndex:15,
                  }}/>
                ))}

                {/* Float texts */}
                {gs.floatTexts.map(f => (
                  <div key={f.uid} style={{
                    position:'absolute', left:f.x, top:f.y,
                    fontFamily:"'Press Start 2P',monospace", fontSize:8,
                    color:f.color, textShadow:`0 0 4px ${f.color}`,
                    pointerEvents:'none', zIndex:30,
                    animation:`ftd-float ${f.life}s ease-out`,
                  }}>{f.text}</div>
                ))}

                {/* Mouse coordinate HUD */}
                {mouseCoord && gs.phase === 'edit' && (
                  <div style={{
                    position:'absolute', bottom:6, left:6,
                    background:'rgba(10,8,5,0.85)', border:'1px solid rgba(201,162,39,0.3)',
                    borderRadius:3, padding:'4px 8px',
                    fontFamily:"'Courier New',monospace", fontSize:10, color:'#c9a227',
                    pointerEvents:'none', zIndex:40, letterSpacing:'0.04em',
                  }}>
                    top: {mouseCoord.y}px · left: {mouseCoord.x}px
                  </div>
                )}

                {/* Victory overlay */}
                {gs.phase === 'victory' && (
                  <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.75)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:14, zIndex:50 }}>
                    <Trophy size={42} color="#c9a227"/>
                    <div style={{ fontFamily:"'Press Start 2P',monospace", fontSize:14, color:'#c9a227' }}>VITÓRIA!</div>
                    <div style={{ fontFamily:"'Press Start 2P',monospace", fontSize:8, color:'#7a6a50' }}>Fase {lvl.num} concluída</div>
                    {levelIdx < LEVELS.length - 1 && (
                      <button onClick={()=>setLevelIdx(i=>i+1)}
                        style={{ padding:'10px 20px', background:'#c9a227', border:'none', color:'#0a0805', fontFamily:"'Press Start 2P',monospace", fontSize:8, cursor:'pointer', borderRadius:3, marginTop:8 }}>
                        PRÓXIMA FASE
                      </button>
                    )}
                  </div>
                )}

                {/* Defeat overlay */}
                {gs.phase === 'defeat' && (
                  <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.8)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:14, zIndex:50 }}>
                    <div style={{ fontFamily:"'Press Start 2P',monospace", fontSize:14, color:'#e74c3c' }}>DERROTA</div>
                    <div style={{ fontFamily:"'Press Start 2P',monospace", fontSize:8, color:'#7a6a50' }}>O castelo foi destruído</div>
                    <button onClick={resetLevel}
                      style={{ padding:'10px 20px', background:'#e74c3c', border:'none', color:'#fff', fontFamily:"'Press Start 2P',monospace", fontSize:8, cursor:'pointer', borderRadius:3, marginTop:8 }}>
                      TENTAR NOVAMENTE
                    </button>
                  </div>
                )}

                {/* Between waves */}
                {gs.phase === 'between' && (
                  <div style={{ position:'absolute', top:16, left:'50%', transform:'translateX(-50%)', background:'rgba(0,0,0,0.7)', border:'1px solid rgba(201,162,39,0.4)', padding:'8px 16px', borderRadius:3, zIndex:40 }}>
                    <span style={{ fontFamily:"'Press Start 2P',monospace", fontSize:8, color:'#c9a227' }}>
                      ONDA {gs.wave+1}/{lvl.waves.length} CONCLUÍDA · Próxima em {Math.ceil(BETWEEN_DELAY - gs.betweenTimer)}s
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ height:42, flexShrink:0, display:'flex', alignItems:'center', gap:8, padding:'0 12px', borderTop:'1px solid rgba(201,162,39,0.1)', background:'#0d0a06' }}>
            {/* Wave info */}
            <span style={{ fontFamily:"'Press Start 2P',monospace", fontSize:7, color:'#7a6a50' }}>
              {gs.phase === 'wave' ? `ONDA ${gs.wave+1}/${lvl.waves.length}` :
               gs.phase === 'between' ? `ENTRE ONDAS...` :
               gs.phase === 'edit' && gs.wave > 0 ? `ONDA ${gs.wave+1}/${lvl.waves.length}` :
               `${lvl.waves.length} ONDA${lvl.waves.length>1?'S':''}`}
            </span>
            <div style={{ flex:1 }}/>
            {/* Level selector */}
            <div style={{ display:'flex', gap:3 }}>
              {LEVELS.map((l, i) => {
                const can = canAccessLevel(l.num);
                const done = completed.includes(l.num);
                return (
                  <button key={l.num} onClick={()=> can && setLevelIdx(i)}
                    style={{
                      width:22, height:22, borderRadius:2, border:'none',
                      cursor: can ? 'pointer' : 'not-allowed',
                      background: i===levelIdx ? '#c9a227' : done ? 'rgba(34,197,94,0.3)' : can ? 'rgba(201,162,39,0.12)' : 'rgba(255,255,255,0.04)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                    }}>
                    {!can ? <Lock size={9} color="#334155"/> : (
                      <span style={{ fontFamily:"'Press Start 2P',monospace", fontSize:6, color: i===levelIdx ? '#0a0805' : done ? '#22c55e' : '#7a6a50' }}>{l.num}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT: MISSION PANEL ────────────────────────────────── */}
        <div style={{ flex:'0 0 42%', display:'flex', flexDirection:'column', overflowY:'hidden' }}>

          {/* Level info (scrollable top section) */}
          <div style={{ flex:'0 0 auto', maxHeight:'35%', overflowY:'auto', padding:'14px 16px 10px', borderBottom:'1px solid rgba(201,162,39,0.1)' }}>
            {/* Title */}
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
              <span style={{ fontFamily:"'Press Start 2P',monospace", fontSize:7, color:'rgba(201,162,39,0.5)' }}>NIV {lvl.num}</span>
              <span style={{ fontFamily:"'Press Start 2P',monospace", fontSize:9, color:'#c9a227' }}>{lvl.title}</span>
            </div>
            {/* Story */}
            <p style={{ fontSize:12, color:'#9a8a6a', lineHeight:1.7, margin:'0 0 10px', fontStyle:'italic' }}>{lvl.story}</p>
            {/* Objective */}
            <div style={{ padding:'8px 10px', background:'rgba(201,162,39,0.06)', border:'1px solid rgba(201,162,39,0.2)', borderRadius:3, marginBottom:8 }}>
              <div style={{ fontFamily:"'Press Start 2P',monospace", fontSize:6, color:'#c9a227', marginBottom:5 }}>OBJETIVO</div>
              <div style={{ fontSize:12, color:'#c8b87a', lineHeight:1.6 }}>{lvl.objective}</div>
            </div>
            {/* Hint */}
            <button onClick={()=>setShowHint(h=>!h)}
              style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', cursor:'pointer', color:'#7a6a50', fontSize:11, padding:0 }}
              onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color='#c9a227'}
              onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color='#7a6a50'}>
              <Lightbulb size={13}/> {showHint ? 'Ocultar dica' : 'Ver dica'}
            </button>
            {showHint && (
              <div style={{ marginTop:8, padding:'8px 10px', background:'rgba(251,191,36,0.06)', border:'1px solid rgba(251,191,36,0.2)', borderRadius:3, fontSize:12, color:'#c8b87a', lineHeight:1.6, animation:'ftd-in .2s ease' }}>
                {lvl.hint}
              </div>
            )}
          </div>

          {/* Tower legend */}
          <div style={{ flexShrink:0, padding:'10px 16px', borderBottom:'1px solid rgba(201,162,39,0.1)' }}>
            <div style={{ fontFamily:"'Press Start 2P',monospace", fontSize:6, color:'#7a6a50', marginBottom:8 }}>TORRES DISPONÍVEIS</div>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {lvl.towers.map(t => {
                const tt = TOWER_TYPES[t.type];
                const tower = gs.towers.find(tw => tw.id === t.id);
                const placed = tower?.placed ?? false;
                return (
                  <div key={t.id} style={{
                    display:'flex', alignItems:'center', gap:6,
                    padding:'5px 8px', borderRadius:3,
                    background:`${tt.color}cc`,
                    border:`1px solid ${placed ? '#22c55e' : tt.border + '60'}`,
                  }}>
                    <TowerIcon type={t.type} size={13}/>
                    <div>
                      <div style={{ fontFamily:"'Press Start 2P',monospace", fontSize:6, color:tt.border }}>{tt.name}</div>
                      <div style={{ fontSize:9, color:'#7a6a50' }}>#{t.id}</div>
                    </div>
                    {placed && <CheckCircle2 size={11} color="#22c55e"/>}
                  </div>
                );
              })}
            </div>
            {/* Placement status */}
            {gs.phase === 'edit' && gs.towers.length > 0 && (
              <div style={{ marginTop:8, fontSize:11, color: placedCount === neededCount ? '#22c55e' : '#f59e0b' }}>
                {placedCount === neededCount
                  ? '✓ Todas as torres posicionadas'
                  : `${placedCount}/${neededCount} torres no slot correto`}
              </div>
            )}
          </div>

          {/* CSS Editor */}
          <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
            <div style={{ padding:'8px 16px 4px', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ fontFamily:"'Press Start 2P',monospace", fontSize:6, color:'#7a6a50' }}>
                style.css
              </div>
              <div style={{ display:'flex', gap:6 }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:'#e74c3c' }}/>
                <div style={{ width:8, height:8, borderRadius:'50%', background:'#f59e0b' }}/>
                <div style={{ width:8, height:8, borderRadius:'50%', background:'#22c55e' }}/>
              </div>
            </div>
            <div style={{ flex:1, position:'relative', overflow:'hidden' }}>
              <textarea
                value={css}
                onChange={e => setCss(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Tab') {
                    e.preventDefault();
                    const t = e.currentTarget;
                    const s = t.selectionStart, end = t.selectionEnd;
                    const v = t.value;
                    t.value = v.substring(0,s) + '  ' + v.substring(end);
                    t.selectionStart = t.selectionEnd = s + 2;
                    setCss(t.value);
                  }
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) applyCSS();
                }}
                spellCheck={false}
                disabled={gs.phase === 'wave' || gs.phase === 'between'}
                style={{
                  width:'100%', height:'100%', boxSizing:'border-box',
                  padding:'10px 12px',
                  background:'#060805',
                  color:'#c8c8a0',
                  fontFamily:"'Courier New',Consolas,monospace",
                  fontSize:12, lineHeight:1.65,
                  border:'none', outline:'none', resize:'none',
                  tabSize:2,
                  opacity: gs.phase === 'wave' || gs.phase === 'between' ? 0.5 : 1,
                }}
              />
            </div>

            {cssError && (
              <div style={{ padding:'6px 12px', background:'rgba(231,76,60,0.1)', borderTop:'1px solid rgba(231,76,60,0.3)', display:'flex', alignItems:'center', gap:6 }}>
                <AlertTriangle size={12} color="#e74c3c"/>
                <span style={{ fontSize:11, color:'#e74c3c' }}>{cssError}</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ flexShrink:0, padding:'10px 16px', borderTop:'1px solid rgba(201,162,39,0.1)', background:'#0d0a06', display:'flex', gap:8 }}>
            <button onClick={resetLevel}
              style={{ display:'flex', alignItems:'center', gap:5, padding:'8px 12px', background:'transparent', border:'1px solid rgba(255,255,255,0.1)', borderRadius:3, color:'#7a6a50', fontSize:11, cursor:'pointer' }}
              onMouseEnter={e=>(e.currentTarget as HTMLElement).style.borderColor='rgba(201,162,39,0.3)'}
              onMouseLeave={e=>(e.currentTarget as HTMLElement).style.borderColor='rgba(255,255,255,0.1)'}>
              <RefreshCw size={12}/> Reset
            </button>

            <button onClick={applyCSS}
              disabled={gs.phase === 'wave' || gs.phase === 'between'}
              style={{
                flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                padding:'9px', background:'rgba(201,162,39,0.12)',
                border:'1px solid rgba(201,162,39,0.4)', borderRadius:3,
                color:'#c9a227', fontFamily:"'Press Start 2P',monospace", fontSize:8,
                cursor: gs.phase === 'wave' || gs.phase === 'between' ? 'not-allowed' : 'pointer',
                opacity: gs.phase === 'wave' || gs.phase === 'between' ? 0.5 : 1,
              }}>
              APLICAR CSS <span style={{ fontSize:9, opacity:0.6 }}>⌘↵</span>
            </button>

            <button
              onClick={startWave}
              disabled={gs.phase !== 'edit' || gs.wave >= lvl.waves.length}
              style={{
                flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                padding:'9px', background: gs.phase === 'edit' ? 'rgba(231,76,60,0.15)' : 'rgba(255,255,255,0.04)',
                border:`1px solid ${gs.phase === 'edit' ? 'rgba(231,76,60,0.5)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius:3, color: gs.phase === 'edit' ? '#e74c3c' : '#4a4a4a',
                fontFamily:"'Press Start 2P',monospace", fontSize:8,
                cursor: gs.phase === 'edit' && gs.wave < lvl.waves.length ? 'pointer' : 'not-allowed',
              }}>
              <Play size={11}/>
              {gs.phase === 'victory' ? 'VITÓRIA!' :
               gs.phase === 'defeat'  ? 'DERROTA' :
               gs.phase === 'wave'    ? 'EM JOGO' :
               gs.phase === 'between' ? 'PAUSA...' :
               'DEFENDER!'}
            </button>
          </div>
        </div>
      </div>

      {/* ── TUTORIAL OVERLAY ────────────────────────────────────── */}
      {showTutorial && (
        <div style={{ position:'fixed', inset:0, zIndex:100, background:'rgba(0,0,0,0.9)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
          <div style={{ maxWidth:560, background:'#0d0a06', border:'2px solid rgba(201,162,39,0.4)', borderRadius:6, padding:28, animation:'ftd-in .3s ease' }}>
            <div style={{ fontFamily:"'Press Start 2P',monospace", fontSize:12, color:'#c9a227', marginBottom:16 }}>⚔ COMO JOGAR</div>
            <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:20 }}>
              {[
                ['1.', 'Observe os anéis dourados no mapa — eles marcam onde cada torre deve ser posicionada.'],
                ['2.', 'Escreva CSS no editor à direita para mover as torres até os anéis.'],
                ['3.', 'Clique em APLICAR CSS para ver as torres se moverem no mapa.'],
                ['4.', 'Quando as torres estiverem nos slots corretos, clique DEFENDER! para iniciar a onda.'],
                ['5.', 'As torres atacam automaticamente os inimigos no alcance. Não deixe nenhum chegar ao castelo!'],
              ].map(([n, t]) => (
                <div key={n as string} style={{ display:'flex', gap:12 }}>
                  <span style={{ fontFamily:"'Press Start 2P',monospace", fontSize:8, color:'#c9a227', flexShrink:0, paddingTop:2 }}>{n}</span>
                  <span style={{ fontSize:13, color:'#9a8a6a', lineHeight:1.6 }}>{t}</span>
                </div>
              ))}
            </div>
            <div style={{ padding:'10px 14px', background:'rgba(201,162,39,0.06)', border:'1px solid rgba(201,162,39,0.2)', borderRadius:3, marginBottom:20, fontSize:12, color:'#c8b87a', lineHeight:1.6 }}>
              <strong style={{ color:'#c9a227' }}>Exemplo:</strong> Para posicionar a torre no ponto (165px, 80px):<br/>
              <code style={{ fontFamily:"'Courier New',monospace", color:'#90cef4' }}>#tower-1 {'{'} position: absolute; top: 80px; left: 165px; {'}'}</code>
            </div>
            <button onClick={()=>setShowTutorial(false)}
              style={{ width:'100%', padding:'12px', background:'#c9a227', border:'none', color:'#0a0805', fontFamily:"'Press Start 2P',monospace", fontSize:9, cursor:'pointer', borderRadius:3 }}>
              ENTENDIDO — COMEÇAR!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
