import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ChevronLeft, Play, RotateCcw, Star, Lock, ChevronDown, ChevronUp, X, Plus, Minus } from 'lucide-react';
import { gameTheme } from '../lib/gameTheme';
import { useGameState } from '../hooks/useGameState';

/* ── CSS Animations ─────────────────────────────────────────────────────── */
const ANIM = `
  @keyframes steveWalk {
    0%,100% { transform: translateY(0); }
    50%      { transform: translateY(-3px); }
  }
  @keyframes diamondFloat {
    0%,100% { transform: translateY(0) rotate(0deg); }
    50%      { transform: translateY(-3px) rotate(10deg); }
  }
  @keyframes blockPulse {
    0%,100% { box-shadow: inset 0 0 0 2px currentColor; }
    50%      { box-shadow: inset 0 0 0 3px currentColor, 0 0 12px currentColor; }
  }
  @keyframes winPop {
    0%   { opacity: 0; transform: scale(0.6) translateY(20px); }
    60%  { opacity: 1; transform: scale(1.08) translateY(-4px); }
    100% { transform: scale(1) translateY(0); }
  }
  @keyframes starPop {
    0%   { transform: scale(0) rotate(-30deg); }
    70%  { transform: scale(1.25) rotate(5deg); }
    100% { transform: scale(1) rotate(0deg); }
  }
  @keyframes collectFlash {
    0%   { opacity: 1; transform: scale(1); }
    50%  { opacity: 0.6; transform: scale(1.4); }
    100% { opacity: 0; transform: scale(0); }
  }
  @keyframes blockAdd {
    from { opacity: 0; transform: translateX(-10px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    20%     { transform: translateX(-6px); }
    40%     { transform: translateX(6px); }
    60%     { transform: translateX(-4px); }
    80%     { transform: translateX(4px); }
  }
`;

/* ── Types ──────────────────────────────────────────────────────────────── */
type Dir   = 'N' | 'E' | 'S' | 'W';
type Cell  = 'empty' | 'grass' | 'diamond' | 'wall';
type BType = 'move' | 'turnLeft' | 'turnRight' | 'collect' | 'repeat';

interface Pos { x: number; y: number; }

interface Block {
  id: string;
  type: BType;
  count?: number;       // para repeat
  children?: Block[];   // para repeat
}

interface ExecFrame {
  pos: Pos;
  dir: Dir;
  grid: Cell[][];
  activeId: string | null;
  collected: number;
  flash?: Pos;          // cell that just got collected
  bump?: boolean;       // steve hit a wall
}

interface Level {
  id: number;
  title: string;
  goal: string;
  grid: Cell[][];
  start: Pos;
  startDir: Dir;
  available: BType[];
  diamonds: number;
  hint: string;
}

/* ── Helpers ────────────────────────────────────────────────────────────── */
let _uid = 0;
const mkId = () => `b${++_uid}`;

const TURN_L: Record<Dir, Dir> = { N: 'W', W: 'S', S: 'E', E: 'N' };
const TURN_R: Record<Dir, Dir> = { N: 'E', E: 'S', S: 'W', W: 'N' };
const DX: Record<Dir, number>  = { E: 1, W: -1, N: 0, S: 0 };
const DY: Record<Dir, number>  = { E: 0, W: 0,  N: -1, S: 1 };
const ROT: Record<Dir, number> = { E: 0, S: 90, W: 180, N: 270 };

function advance(pos: Pos, dir: Dir, grid: Cell[][]): Pos | null {
  const nx = pos.x + DX[dir], ny = pos.y + DY[dir];
  if (ny < 0 || ny >= grid.length || nx < 0 || nx >= grid[0].length) return null;
  if (grid[ny][nx] === 'wall' || grid[ny][nx] === 'grass') return null;
  return { x: nx, y: ny };
}

/* ── Level Data ─────────────────────────────────────────────────────────── */
const G = 'grass' as Cell, E = 'empty' as Cell, D = 'diamond' as Cell;

const LEVELS: Level[] = [
  {
    id: 1,
    title: 'Primeiro Passo!',
    goal: 'Colete o Diamante!',
    grid: [
      [G,G,G,G,G,G,G,G],
      [G,G,G,G,G,G,G,G],
      [G,G,G,G,G,G,G,G],
      [E,E,E,D,G,G,G,G],
      [G,G,G,G,G,G,G,G],
      [G,G,G,G,G,G,G,G],
    ],
    start: { x: 0, y: 3 }, startDir: 'E',
    available: ['move', 'collect'],
    diamonds: 1,
    hint: 'Coloque 3 blocos "Mover" para chegar ao diamante, depois 1 bloco "Coletar"!',
  },
  {
    id: 2,
    title: 'Vire na Curva!',
    goal: 'Colete o Diamante no alto!',
    grid: [
      [G,G,G,G,G,G,G,G],
      [G,G,G,G,G,G,G,G],
      [G,G,D,G,G,G,G,G],
      [E,E,E,G,G,G,G,G],
      [G,G,G,G,G,G,G,G],
      [G,G,G,G,G,G,G,G],
    ],
    start: { x: 0, y: 3 }, startDir: 'E',
    available: ['move', 'turnLeft', 'collect'],
    diamonds: 1,
    hint: 'Mova 2 vezes, use "Virar Esquerda" para subir, mova 1 vez e Colete!',
  },
  {
    id: 3,
    title: 'Use a Repeticao!',
    goal: 'Colete os 4 Diamantes!',
    grid: [
      [G,G,G,G,G,G,G,G],
      [G,G,G,G,G,G,G,G],
      [G,G,G,G,G,G,G,G],
      [E,D,D,D,D,G,G,G],
      [G,G,G,G,G,G,G,G],
      [G,G,G,G,G,G,G,G],
    ],
    start: { x: 0, y: 3 }, startDir: 'E',
    available: ['move', 'collect', 'repeat'],
    diamonds: 4,
    hint: 'Use "Repetir 4 vezes" com "Mover" e "Coletar" dentro — muito mais rapido!',
  },
  {
    id: 4,
    title: 'Dois Caminhos!',
    goal: 'Colete os 2 Diamantes!',
    grid: [
      [G,G,G,G,G,G,G,G],
      [G,G,G,D,G,G,G,G],
      [G,G,G,E,G,G,G,G],
      [E,E,E,D,G,G,G,G],
      [G,G,G,G,G,G,G,G],
      [G,G,G,G,G,G,G,G],
    ],
    start: { x: 0, y: 3 }, startDir: 'E',
    available: ['move', 'turnLeft', 'collect'],
    diamonds: 2,
    hint: 'Mova 3 vezes, colete o 1 diamante, vire para cima e colete o 2!',
  },
  {
    id: 5,
    title: 'O Grande Desafio!',
    goal: 'Colete os 6 Diamantes!',
    grid: [
      [G,G,G,G,G,G,G,G],
      [G,G,G,G,G,G,G,G],
      [G,G,G,G,G,G,G,G],
      [E,D,D,D,D,D,D,G],
      [G,G,G,G,G,G,G,G],
      [G,G,G,G,G,G,G,G],
    ],
    start: { x: 0, y: 3 }, startDir: 'E',
    available: ['move', 'turnLeft', 'turnRight', 'collect', 'repeat'],
    diamonds: 6,
    hint: 'Use Repetir 6 vezes com Mover e Coletar — mostre o poder dos loops!',
  },
];

/* ── Execution Engine ───────────────────────────────────────────────────── */
function computeFrames(program: Block[], level: Level): ExecFrame[] {
  const frames: ExecFrame[] = [];
  let pos = { ...level.start };
  let dir = level.startDir;
  let grid = level.grid.map(r => [...r]);
  let collected = 0;

  function push(activeId: string | null, extras?: Partial<ExecFrame>) {
    frames.push({ pos: {...pos}, dir, grid: grid.map(r=>[...r]), activeId, collected, ...extras });
  }

  function execBlock(b: Block) {
    push(b.id);
    switch (b.type) {
      case 'move': {
        const nxt = advance(pos, dir, grid);
        if (nxt) { pos = nxt; push(b.id); }
        else       push(b.id, { bump: true });
        break;
      }
      case 'turnLeft':  dir = TURN_L[dir]; push(b.id); break;
      case 'turnRight': dir = TURN_R[dir]; push(b.id); break;
      case 'collect': {
        if (grid[pos.y][pos.x] === 'diamond') {
          const flashPos = {...pos};
          grid = grid.map((row, y) => row.map((c, x) => (x===pos.x && y===pos.y) ? 'empty' : c));
          collected++;
          push(b.id, { flash: flashPos });
        } else {
          push(b.id);
        }
        break;
      }
      case 'repeat': {
        const n = Math.max(1, b.count ?? 1);
        for (let i = 0; i < n; i++) {
          for (const child of (b.children ?? [])) execBlock(child);
        }
        push(b.id);
        break;
      }
    }
  }

  for (const b of program) execBlock(b);
  push(null);
  return frames;
}

/* ── Block config ───────────────────────────────────────────────────────── */
const BLOCK_CFG: Record<BType, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  move:      { label: 'Mover', color: '#3b82f6', bg: '#1e40af22',
    icon: <svg width="16" height="16" viewBox="0 0 16 16"><path d="M8 2L14 10H2Z" fill="#3b82f6"/></svg> },
  turnLeft:  { label: 'Virar Esquerda', color: '#22c55e', bg: '#14532d22',
    icon: <svg width="16" height="16" viewBox="0 0 16 16"><path d="M3 8 Q3 3 8 3 L8 1 L4 4 L8 7 L8 5 Q6 5 6 8 L3 8Z" fill="#22c55e"/><path d="M8 8L14 8L14 14L8 14Z" fill="#22c55e" opacity="0.5"/></svg> },
  turnRight: { label: 'Virar Direita', color: '#22c55e', bg: '#14532d22',
    icon: <svg width="16" height="16" viewBox="0 0 16 16"><path d="M13 8 Q13 3 8 3 L8 1 L12 4 L8 7 L8 5 Q10 5 10 8 L13 8Z" fill="#22c55e"/><path d="M8 8L2 8L2 14L8 14Z" fill="#22c55e" opacity="0.5"/></svg> },
  collect:   { label: 'Coletar', color: '#a855f7', bg: '#581c8722',
    icon: <svg width="16" height="16" viewBox="0 0 16 16"><rect x="5" y="1" width="6" height="6" fill="#a855f7" transform="rotate(45 8 4)"/></svg> },
  repeat:    { label: 'Repetir', color: '#f59e0b', bg: '#78350f22',
    icon: <svg width="16" height="16" viewBox="0 0 16 16"><path d="M2 8 Q2 3 8 3 L8 1 L12 4 L8 7 L8 5 Q5 5 5 8 L5 12 Q5 13 6 13 L13 13 M13 11 L15 13 L13 15" stroke="#f59e0b" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg> },
};

/* ── SVG Characters & Cells ─────────────────────────────────────────────── */
function SteveSprite({ dir, walking }: { dir: Dir; walking: boolean }) {
  return (
    <svg width="38" height="44" viewBox="0 0 38 44"
      style={{ transform: `rotate(${ROT[dir]}deg)`, transition: 'transform 0.2s', display:'block',
        animation: walking ? 'steveWalk 0.4s ease-in-out infinite' : 'none' }}>
      {/* Hat */}
      <rect x="10" y="2" width="18" height="5" fill="#C78B4A"/>
      <rect x="7"  y="7" width="24" height="2" fill="#C78B4A"/>
      {/* Face */}
      <rect x="8"  y="9"  width="22" height="16" fill="#C89B6E"/>
      {/* Eyes */}
      <rect x="12" y="13" width="5" height="5" fill="#2d1b0a"/>
      <rect x="21" y="13" width="5" height="5" fill="#2d1b0a"/>
      <rect x="13" y="14" width="2" height="2" fill="#fff" opacity="0.5"/>
      <rect x="22" y="14" width="2" height="2" fill="#fff" opacity="0.5"/>
      {/* Nose */}
      <rect x="18" y="17" width="3" height="2" fill="#B07840"/>
      {/* Mouth */}
      <rect x="12" y="21" width="14" height="3" fill="#8B5E3C"/>
      <rect x="14" y="22" width="2" height="2" fill="#C89B6E"/>
      <rect x="22" y="22" width="2" height="2" fill="#C89B6E"/>
      {/* Body */}
      <rect x="9"  y="25" width="20" height="12" fill="#1E90FF"/>
      <rect x="14" y="25" width="10" height="12" fill="#1563CC"/>
      {/* Arms */}
      <rect x="2"  y="25" width="7"  height="10" fill="#C89B6E"/>
      <rect x="29" y="25" width="7"  height="10" fill="#C89B6E"/>
      {/* Legs */}
      <rect x="9"  y="37" width="9"  height="7" fill="#2d2d8a"/>
      <rect x="20" y="37" width="9"  height="7" fill="#2d2d8a"/>
      {/* Boots */}
      <rect x="8"  y="42" width="10" height="2" fill="#1a1a1a"/>
      <rect x="20" y="42" width="10" height="2" fill="#1a1a1a"/>
      {/* Direction indicator (arrow) */}
      <polygon points="19,0 15,4 23,4" fill="#FFD700" opacity="0.9"/>
    </svg>
  );
}

function DiamondSprite({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28"
      style={{ animation: 'diamondFloat 2s ease-in-out infinite', display:'block' }}>
      <polygon points="14,2 24,10 14,26 4,10" fill="#38bdf8" stroke="#0ea5e9" strokeWidth="1.5"/>
      <polygon points="14,6 20,10 14,21 8,10"  fill="#7dd3fc" opacity="0.5"/>
      <polygon points="14,3 22,9 14,5"          fill="#fff" opacity="0.35"/>
      <line x1="4" y1="10" x2="24" y2="10" stroke="#0369a1" strokeWidth="0.8" opacity="0.5"/>
    </svg>
  );
}

function GrassCell() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" style={{ display:'block' }}>
      <rect width="48" height="48" fill="#5D9E40"/>
      <rect width="48" height="8"  fill="#6DB84A"/>
      {/* Grass texture details */}
      <rect x="4"  y="0" width="2" height="10" fill="#7CC455" opacity="0.6"/>
      <rect x="12" y="0" width="2" height="8"  fill="#7CC455" opacity="0.5"/>
      <rect x="22" y="0" width="2" height="11" fill="#7CC455" opacity="0.6"/>
      <rect x="32" y="0" width="2" height="9"  fill="#7CC455" opacity="0.5"/>
      <rect x="42" y="0" width="2" height="10" fill="#7CC455" opacity="0.6"/>
      {/* Pixel shadow */}
      <rect x="0" y="8" width="48" height="2" fill="#4A8030" opacity="0.5"/>
      {/* Dirt texture */}
      <rect x="6"  y="18" width="4"  height="4"  fill="#6B4226" opacity="0.2"/>
      <rect x="20" y="30" width="6"  height="4"  fill="#6B4226" opacity="0.2"/>
      <rect x="36" y="22" width="4"  height="6"  fill="#6B4226" opacity="0.2"/>
      <rect x="10" y="36" width="8"  height="4"  fill="#6B4226" opacity="0.15"/>
    </svg>
  );
}

function DirtCell() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" style={{ display:'block' }}>
      <rect width="48" height="48" fill="#8B6340"/>
      <rect x="4"  y="4"  width="10" height="10" fill="#7A5530" opacity="0.4"/>
      <rect x="20" y="16" width="8"  height="8"  fill="#9C7050" opacity="0.3"/>
      <rect x="34" y="6"  width="6"  height="14" fill="#7A5530" opacity="0.35"/>
      <rect x="8"  y="28" width="12" height="8"  fill="#9C7050" opacity="0.3"/>
      <rect x="28" y="32" width="8"  height="10" fill="#7A5530" opacity="0.35"/>
      {/* Grid lines pixel-style */}
      <line x1="0" y1="0" x2="0" y2="48" stroke="#6B4226" strokeWidth="1" opacity="0.4"/>
      <line x1="0" y1="0" x2="48" y2="0" stroke="#6B4226" strokeWidth="1" opacity="0.4"/>
    </svg>
  );
}

/* ── Block Chip ─────────────────────────────────────────────────────────── */
interface BlockChipProps {
  block: Block;
  active: boolean;
  depth: number;
  onRemove?: () => void;
  onAddChild?: (type: BType) => void;
  onRemoveChild?: (childId: string) => void;
  onCountChange?: (delta: number) => void;
  availableForChild?: BType[];
}

function BlockChip({ block, active, depth, onRemove, onAddChild, onRemoveChild, onCountChange, availableForChild }: BlockChipProps) {
  const cfg = BLOCK_CFG[block.type];
  const [open, setOpen] = useState(true);

  const base: React.CSSProperties = {
    display: 'flex', alignItems: 'center',
    gap: 8, padding: '7px 10px',
    background: active ? `${cfg.color}30` : cfg.bg,
    border: `2px solid ${active ? cfg.color : cfg.color + '66'}`,
    borderLeft: `5px solid ${cfg.color}`,
    marginLeft: depth * 16,
    animation: 'blockAdd 0.18s ease both',
    boxShadow: active ? `0 0 0 2px ${cfg.color}` : 'none',
    transition: 'background 0.15s, box-shadow 0.15s',
    position: 'relative',
    userSelect: 'none',
  };

  if (block.type === 'repeat') {
    return (
      <div style={{ marginLeft: depth * 16, animation: 'blockAdd 0.18s ease both' }}>
        {/* Repeat header */}
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 10px',
          background: active ? '#f59e0b33' : '#f59e0b15',
          border: `2px solid ${active ? '#f59e0b' : '#f59e0b66'}`,
          borderLeft: '5px solid #f59e0b',
          boxShadow: active ? '0 0 0 2px #f59e0b' : 'none',
          transition: 'all 0.15s',
        }}>
          {cfg.icon}
          <span style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b', fontFamily: "'Press Start 2P', monospace", flex: 1 }}>
            REPETIR
          </span>
          {/* Count controls */}
          <div style={{ display:'flex', alignItems:'center', gap:4 }}>
            <button onClick={() => onCountChange?.(-1)}
              style={{ width:20, height:20, background:'#f59e0b33', border:'1px solid #f59e0b66', color:'#f59e0b', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:900, lineHeight:1 }}>
              -
            </button>
            <span style={{ fontFamily:"'Press Start 2P', monospace", fontSize:11, color:'#f59e0b', minWidth:18, textAlign:'center' }}>
              {block.count ?? 1}
            </span>
            <button onClick={() => onCountChange?.(1)}
              style={{ width:20, height:20, background:'#f59e0b33', border:'1px solid #f59e0b66', color:'#f59e0b', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:900, lineHeight:1 }}>
              +
            </button>
          </div>
          <span style={{ fontSize:9, color:'#f59e0b', fontFamily:"'Press Start 2P', monospace" }}>x</span>
          <button onClick={() => setOpen(o=>!o)}
            style={{ background:'none', border:'none', cursor:'pointer', color:'#f59e0b', display:'flex', alignItems:'center' }}>
            {open ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
          </button>
          {onRemove && (
            <button onClick={onRemove}
              style={{ background:'none', border:'none', cursor:'pointer', color:'#f59e0b', display:'flex', alignItems:'center', marginLeft:4 }}>
              <X size={13}/>
            </button>
          )}
        </div>

        {/* Children area */}
        {open && (
          <div style={{ marginLeft:16, borderLeft:'3px solid #f59e0b55', paddingLeft:4, paddingTop:4, paddingBottom:4 }}>
            {(block.children ?? []).length === 0 && (
              <div style={{ padding:'8px 12px', fontSize:11, color:'#f59e0b88', fontStyle:'italic', borderLeft:'none' }}>
                Clique em um bloco abaixo para adicionar aqui...
              </div>
            )}
            {(block.children ?? []).map(child => (
              <div key={child.id} style={{ marginBottom: 4 }}>
                <BlockChip
                  block={child}
                  active={false}
                  depth={0}
                  onRemove={() => onRemoveChild?.(child.id)}
                />
              </div>
            ))}
            {/* Add to repeat */}
            {availableForChild && (
              <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginTop:6, marginLeft:4 }}>
                {availableForChild.filter(t => t !== 'repeat').map(t => {
                  const c = BLOCK_CFG[t];
                  return (
                    <button key={t} onClick={() => onAddChild?.(t)}
                      style={{ display:'flex', alignItems:'center', gap:4, padding:'4px 8px',
                        background: c.bg, border:`1.5px solid ${c.color}66`, color: c.color,
                        fontSize:9, fontWeight:700, cursor:'pointer', fontFamily:"'Press Start 2P', monospace" }}>
                      {c.icon} {c.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Closing bracket */}
        <div style={{ padding:'4px 10px', background:'#f59e0b10', borderLeft:'5px solid #f59e0b44', borderBottom:'2px solid #f59e0b44' }}>
          <span style={{ fontSize:9, color:'#f59e0b66', fontFamily:"'Press Start 2P', monospace" }}>FIM REPETIR</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display:'flex', alignItems:'center', gap:4, marginBottom:2 }}>
      <div style={{ ...base, flex:1 }}>
        {cfg.icon}
        <span style={{ fontSize:10, fontWeight:700, color: cfg.color, fontFamily:"'Press Start 2P', monospace", lineHeight:1.3 }}>
          {cfg.label}
        </span>
      </div>
      {onRemove && (
        <button onClick={onRemove}
          style={{ background:'none', border:`1.5px solid ${cfg.color}55`, cursor:'pointer', color:cfg.color, display:'flex', alignItems:'center', padding:4, flexShrink:0 }}>
          <X size={12}/>
        </button>
      )}
    </div>
  );
}

/* ── World Grid ─────────────────────────────────────────────────────────── */
function WorldGrid({ level, pos, dir, grid, running, flash }:
  { level: Level; pos: Pos; dir: Dir; grid: Cell[][]; running: boolean; flash?: Pos }) {

  const CELL = 48;

  return (
    <div style={{ position:'relative', border:'4px solid #3a2a1a', boxShadow:'0 0 0 2px #5D9E40, 4px 4px 0 #1a1a1a', display:'inline-block', background:'#8B6340' }}>
      {/* Grid cells */}
      <div style={{ display:'grid', gridTemplateColumns:`repeat(${level.grid[0].length}, ${CELL}px)` }}>
        {grid.map((row, y) => row.map((cell, x) => (
          <div key={`${x}-${y}`} style={{ width: CELL, height: CELL, position:'relative', overflow:'hidden' }}>
            {cell === 'grass' ? <GrassCell /> : <DirtCell />}

            {/* Diamond */}
            {cell === 'diamond' && (
              <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center',
                animation: flash && flash.x===x && flash.y===y ? 'collectFlash 0.4s ease forwards' : 'none' }}>
                <DiamondSprite size={30}/>
              </div>
            )}
          </div>
        )))}
      </div>

      {/* Steve */}
      <div style={{
        position: 'absolute',
        left: pos.x * CELL + CELL/2 - 19,
        top:  pos.y * CELL + CELL/2 - 22,
        zIndex: 10,
        transition: 'left 0.25s ease, top 0.25s ease',
      }}>
        <SteveSprite dir={dir} walking={running}/>
      </div>

      {/* Grid border lines */}
      <svg style={{ position:'absolute', inset:0, pointerEvents:'none' }}
        width={level.grid[0].length * CELL} height={level.grid.length * CELL}>
        {Array.from({length: level.grid[0].length+1}, (_,i) => (
          <line key={`v${i}`} x1={i*CELL} y1={0} x2={i*CELL} y2={level.grid.length*CELL}
            stroke="rgba(0,0,0,0.15)" strokeWidth="1"/>
        ))}
        {Array.from({length: level.grid.length+1}, (_,i) => (
          <line key={`h${i}`} x1={0} y1={i*CELL} x2={level.grid[0].length*CELL} y2={i*CELL}
            stroke="rgba(0,0,0,0.15)" strokeWidth="1"/>
        ))}
      </svg>
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────────────────────── */
interface Props { onBack: () => void; isDark?: boolean; }

export default function BlockCodePage({ onBack, isDark = true }: Props) {
  const { addCoins, addPoints } = useGameState();
  const [levelIdx, setLevelIdx]     = useState(0);
  const [program, setProgram]       = useState<Block[]>([]);
  const [running, setRunning]       = useState(false);
  const [won, setWon]               = useState(false);
  const [starsEarned, setStarsEarned] = useState(0);
  const [unlockedUp, setUnlockedUp] = useState(1); // levels unlocked
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [showHint, setShowHint]     = useState(false);
  const [shake, setShake]           = useState(false);

  const level = LEVELS[levelIdx];

  // Visual state (updated by animation frames)
  const [visPos, setVisPos]         = useState<Pos>(level.start);
  const [visDir, setVisDir]         = useState<Dir>(level.startDir);
  const [visGrid, setVisGrid]       = useState<Cell[][]>(level.grid);
  const [visFlash, setVisFlash]     = useState<Pos | undefined>(undefined);
  const [visCollected, setVisCollected] = useState(0);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);

  const animRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const runningRef = useRef(false);

  // Reset on level change
  useEffect(() => {
    setProgram([]);
    setWon(false);
    setStarsEarned(0);
    setShowHint(false);
    resetVisuals(level);
  }, [levelIdx]);

  function resetVisuals(lv: Level) {
    setVisPos(lv.start);
    setVisDir(lv.startDir);
    setVisGrid(lv.grid.map(r=>[...r]));
    setVisFlash(undefined);
    setVisCollected(0);
    setActiveBlockId(null);
  }

  function reset() {
    if (animRef.current) clearTimeout(animRef.current);
    runningRef.current = false;
    setRunning(false);
    setWon(false);
    setActiveBlockId(null);
    resetVisuals(level);
  }

  async function run() {
    if (running || program.length === 0) return;
    reset();
    await new Promise(r => setTimeout(r, 50)); // let reset apply
    setRunning(true);
    runningRef.current = true;

    const frames = computeFrames(program, level);
    let bumped = false;

    for (let i = 0; i < frames.length; i++) {
      if (!runningRef.current) break;
      const f = frames[i];
      setVisPos(f.pos);
      setVisDir(f.dir);
      setVisGrid(f.grid);
      setActiveBlockId(f.activeId);
      setVisCollected(f.collected);
      if (f.bump) { bumped = true; }
      if (f.flash) {
        setVisFlash(f.flash);
        await new Promise(r => { animRef.current = setTimeout(r, 100); });
        setVisFlash(undefined);
      }
      await new Promise(r => { animRef.current = setTimeout(r, 320); });
    }

    if (!runningRef.current) return;
    setRunning(false);
    runningRef.current = false;
    setActiveBlockId(null);

    const lastFrame = frames[frames.length - 1];
    if (lastFrame.collected >= level.diamonds) {
      const blocksUsed = countBlocks(program);
      const stars = blocksUsed <= level.diamonds + 2 ? 3 : blocksUsed <= level.diamonds + 4 ? 2 : 1;
      setStarsEarned(stars);
      setWon(true);
      if (!completedLevels.includes(level.id)) {
        setCompletedLevels(c => [...c, level.id]);
        setUnlockedUp(u => Math.max(u, levelIdx + 2));
        const coinsR = stars === 3 ? 18 : stars === 2 ? 12 : 8;
        const ptsR   = stars === 3 ? 12 : stars === 2 ? 8 : 5;
        addCoins(coinsR);
        addPoints(ptsR);
      }
    } else if (bumped) {
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  }

  function countBlocks(blocks: Block[]): number {
    return blocks.reduce((acc, b) => acc + 1 + (b.children ? countBlocks(b.children) : 0), 0);
  }

  // Program mutations
  function addBlock(type: BType) {
    setProgram(p => [...p, {
      id: mkId(), type,
      count: type === 'repeat' ? 3 : undefined,
      children: type === 'repeat' ? [] : undefined,
    }]);
  }

  function removeBlock(id: string) {
    setProgram(p => p.filter(b => b.id !== id));
  }

  function addChild(parentId: string, type: BType) {
    setProgram(p => p.map(b => b.id === parentId
      ? { ...b, children: [...(b.children??[]), { id: mkId(), type }] }
      : b
    ));
  }

  function removeChild(parentId: string, childId: string) {
    setProgram(p => p.map(b => b.id === parentId
      ? { ...b, children: (b.children??[]).filter(c => c.id !== childId) }
      : b
    ));
  }

  function changeCount(id: string, delta: number) {
    setProgram(p => p.map(b => b.id === id
      ? { ...b, count: Math.max(1, Math.min(9, (b.count ?? 1) + delta)) }
      : b
    ));
  }

  // Theme — bg/panel mantêm cores originais da página; border/text/sub do tema compartilhado
  const { border, text, sub } = gameTheme(isDark);
  const bg    = isDark ? '#0d1117' : '#f0f4ff';
  const panel = isDark ? '#161b22' : '#ffffff';

  return (
    <div style={{ minHeight:'100vh', background: bg, color: text, fontFamily:'system-ui,-apple-system,sans-serif' }}>
      <style>{ANIM}</style>

      {/* ── Top Bar ── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'12px 20px', borderBottom:`2px solid ${border}`,
        background: panel, flexWrap:'wrap', gap:12 }}>
        <button onClick={onBack}
          style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:`1.5px solid ${border}`,
            color:sub, cursor:'pointer', padding:'7px 14px', fontSize:11, fontWeight:700, fontFamily:"'Press Start 2P',monospace" }}>
          <ChevronLeft size={13}/> VOLTAR
        </button>

        <div style={{ textAlign:'center' }}>
          <div style={{ fontFamily:"'Press Start 2P',monospace", fontSize:9, color:'#5D9E40', marginBottom:4 }}>
            PROGRAMACAO EM BLOCOS — CK
          </div>
          <div style={{ fontFamily:"'Press Start 2P',monospace", fontSize:13, color:text }}>
            {level.title}
          </div>
        </div>

        {/* Level selector */}
        <div style={{ display:'flex', gap:6 }}>
          {LEVELS.map((lv, i) => {
            const unlocked = i < unlockedUp;
            const done = completedLevels.includes(lv.id);
            return (
              <button key={lv.id} onClick={() => unlocked && setLevelIdx(i)} disabled={!unlocked}
                style={{ width:36, height:36, border:`2px solid ${i===levelIdx ? '#5D9E40' : done ? '#5D9E40' : border}`,
                  background: i===levelIdx ? '#5D9E4030' : done ? '#5D9E4018' : 'transparent',
                  cursor: unlocked ? 'pointer' : 'not-allowed',
                  display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
                {unlocked
                  ? <span style={{ fontFamily:"'Press Start 2P',monospace", fontSize:9, color: i===levelIdx ? '#5D9E40' : done ? '#5D9E40' : sub }}>{lv.id}</span>
                  : <Lock size={12} color={sub}/>
                }
                {done && <div style={{ position:'absolute', top:-4, right:-4, width:8, height:8, borderRadius:'50%', background:'#5D9E40' }}/>}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div style={{ display:'flex', gap:0, flexWrap:'wrap', maxWidth:1100, margin:'0 auto', padding:'20px 16px' }}>

        {/* ── LEFT: World + Controls ── */}
        <div style={{ flex:'0 0 auto', display:'flex', flexDirection:'column', alignItems:'center', gap:16, marginRight:24 }}>
          {/* Goal */}
          <div style={{ padding:'10px 16px', background: '#5D9E4018', border:`2px solid #5D9E4055`,
            fontFamily:"'Press Start 2P',monospace", fontSize:10, color:'#5D9E40', textAlign:'center', width:'100%', boxSizing:'border-box' }}>
            {level.goal}
          </div>

          {/* Grid */}
          <div style={{ animation: shake ? 'shake 0.5s ease' : 'none' }}>
            <WorldGrid level={level} pos={visPos} dir={visDir} grid={visGrid} running={running} flash={visFlash}/>
          </div>

          {/* Collected counter */}
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <DiamondSprite size={20}/>
            <span style={{ fontFamily:"'Press Start 2P',monospace", fontSize:12, color:'#38bdf8' }}>
              {visCollected} / {level.diamonds}
            </span>
          </div>

          {/* Controls */}
          <div style={{ display:'flex', gap:10, width:'100%' }}>
            <button onClick={run} disabled={running || program.length === 0}
              style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                padding:'12px', background: running || program.length===0 ? (isDark?'#21262d':'#e5e7eb') : '#5D9E40',
                border:'none', color: running || program.length===0 ? sub : '#fff',
                fontFamily:"'Press Start 2P',monospace", fontSize:10, cursor: running || program.length===0 ? 'not-allowed':'pointer',
                boxShadow: running || program.length===0 ? 'none' : '3px 3px 0 #3a6e22',
                transition:'all .12s' }}>
              <Play size={14} fill="currentColor"/> EXECUTAR
            </button>
            <button onClick={reset}
              style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                padding:'12px 16px', background:'none', border:`2px solid ${border}`, color:sub,
                fontFamily:"'Press Start 2P',monospace", fontSize:10, cursor:'pointer' }}>
              <RotateCcw size={13}/> RESET
            </button>
          </div>

          {/* Hint */}
          <button onClick={() => setShowHint(h=>!h)}
            style={{ padding:'8px 14px', background:'none', border:`1.5px solid #fbbf2466`, color:'#fbbf24',
              fontFamily:"'Press Start 2P',monospace", fontSize:8, cursor:'pointer', width:'100%' }}>
            {showHint ? 'OCULTAR DICA' : 'VER DICA'}
          </button>
          {showHint && (
            <div style={{ padding:'10px 14px', background:'#fbbf2415', border:'2px solid #fbbf2440',
              fontSize:12, color: isDark ? '#fbbf24' : '#92400e', lineHeight:1.6, textAlign:'center' }}>
              {level.hint}
            </div>
          )}
        </div>

        {/* ── RIGHT: Program + Palette ── */}
        <div style={{ flex:'1 1 300px', display:'flex', flexDirection:'column', gap:16, minWidth:280 }}>

          {/* Program Area */}
          <div style={{ background:panel, border:`2px solid ${border}`, flex:1 }}>
            <div style={{ padding:'10px 14px', borderBottom:`2px solid ${border}`, background: isDark?'#21262d':'#f6f8fa' }}>
              <span style={{ fontFamily:"'Press Start 2P',monospace", fontSize:9, color:'#5D9E40' }}>
                SEU PROGRAMA ({countBlocks(program)} blocos)
              </span>
            </div>
            <div style={{ padding:12, minHeight:200, maxHeight:360, overflowY:'auto' }}>
              {program.length === 0 ? (
                <div style={{ textAlign:'center', padding:'32px 16px', color:sub, fontSize:12, lineHeight:1.6 }}>
                  Clique nos blocos abaixo para adicionar ao programa!
                </div>
              ) : (
                program.map(b => (
                  <div key={b.id} style={{ marginBottom:6 }}>
                    <BlockChip
                      block={b}
                      active={activeBlockId === b.id}
                      depth={0}
                      onRemove={() => removeBlock(b.id)}
                      onAddChild={type => addChild(b.id, type)}
                      onRemoveChild={childId => removeChild(b.id, childId)}
                      onCountChange={delta => changeCount(b.id, delta)}
                      availableForChild={level.available}
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Palette */}
          <div style={{ background:panel, border:`2px solid ${border}` }}>
            <div style={{ padding:'10px 14px', borderBottom:`2px solid ${border}`, background: isDark?'#21262d':'#f6f8fa' }}>
              <span style={{ fontFamily:"'Press Start 2P',monospace", fontSize:9, color:sub }}>
                BLOCOS DISPONIVEIS
              </span>
            </div>
            <div style={{ padding:12, display:'flex', flexWrap:'wrap', gap:8 }}>
              {level.available.map(type => {
                const cfg = BLOCK_CFG[type];
                return (
                  <button key={type} onClick={() => addBlock(type)}
                    style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 12px',
                      background: cfg.bg, border:`2px solid ${cfg.color}66`,
                      color: cfg.color, cursor:'pointer',
                      fontFamily:"'Press Start 2P',monospace", fontSize:9, fontWeight:700,
                      transition:'all .12s', flexShrink:0 }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = cfg.color; (e.currentTarget as HTMLElement).style.transform='translateY(-2px)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = cfg.color+'66'; (e.currentTarget as HTMLElement).style.transform='none'; }}>
                    {cfg.icon}
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:sub }}>
              <DiamondSprite size={16}/> Diamante
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:sub }}>
              <svg width="16" height="16" viewBox="0 0 16 16"><polygon points="8,1 12,5 8,1" fill="#FFD700"/><rect x="4" y="3" width="8" height="10" fill="#C89B6E"/></svg>
              Steve (virado para a seta)
            </div>
          </div>
        </div>
      </div>

      {/* ── Win Overlay ── */}
      {won && (
        <div style={{ position:'fixed', inset:0, zIndex:50, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(4px)',
          display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
          <div style={{ background: isDark?'#161b22':'#fff', border:'3px solid #5D9E40',
            boxShadow:'0 0 40px rgba(93,158,64,0.5), 6px 6px 0 #3a6e22',
            padding:'40px 48px', textAlign:'center', animation:'winPop 0.5s ease both', maxWidth:420 }}>
            {/* Stars */}
            <div style={{ display:'flex', justifyContent:'center', gap:12, marginBottom:20 }}>
              {[1,2,3].map(i => (
                <svg key={i} width="40" height="40" viewBox="0 0 24 24"
                  style={{ animation: i<=starsEarned ? `starPop 0.4s ${i*0.15}s ease both` : 'none',
                    opacity: i<=starsEarned ? 1 : 0.2, transform: i<=starsEarned ? 'scale(1)' : 'scale(0.8)' }}>
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                    fill="#FFD700" stroke="#D97706" strokeWidth="1"/>
                </svg>
              ))}
            </div>

            <div style={{ fontFamily:"'Press Start 2P',monospace", fontSize:16, color:'#5D9E40', marginBottom:10 }}>
              PARABENS!
            </div>
            <div style={{ fontFamily:"'Press Start 2P',monospace", fontSize:9, color:sub, marginBottom:24 }}>
              {level.title} Completo!
            </div>
            <div style={{ fontFamily:"'Press Start 2P',monospace", fontSize:10, color:'#FFD700', marginBottom:24 }}>
              {starsEarned === 3 ? 'Solucao Perfeita!' : starsEarned === 2 ? 'Muito Bom!' : 'Bom Trabalho!'}
            </div>

            <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
              <button onClick={reset}
                style={{ padding:'10px 20px', background:'none', border:`2px solid ${border}`,
                  color:sub, fontFamily:"'Press Start 2P',monospace", fontSize:9, cursor:'pointer' }}>
                JOGAR DE NOVO
              </button>
              {levelIdx < LEVELS.length - 1 ? (
                <button onClick={() => { setLevelIdx(i=>i+1); setWon(false); }}
                  style={{ padding:'10px 20px', background:'#5D9E40', border:'none', color:'#fff',
                    fontFamily:"'Press Start 2P',monospace", fontSize:9, cursor:'pointer',
                    boxShadow:'3px 3px 0 #3a6e22' }}>
                  PROXIMO NIVEL
                </button>
              ) : (
                <button onClick={onBack}
                  style={{ padding:'10px 20px', background:'#5D9E40', border:'none', color:'#fff',
                    fontFamily:"'Press Start 2P',monospace", fontSize:9, cursor:'pointer',
                    boxShadow:'3px 3px 0 #3a6e22' }}>
                  VOLTAR AO HUB
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
