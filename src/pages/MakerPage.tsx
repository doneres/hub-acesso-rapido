import React, { useState } from 'react';
import {
  ArrowLeft, Cpu, ExternalLink, PlayCircle, Wrench,
  Layers, Zap, Box, Wifi, Code2, Globe, Settings, Package,
  ChevronRight, Hammer, Lightbulb, Ruler,
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useTheme } from '../hooks/useTheme';

/* ── Tipos ──────────────────────────────────────────────────────────────── */
type Platform = 'Todos' | 'Arduino' | 'Raspberry Pi' | 'micro:bit' | 'ESP32' | '3D Print';
type Difficulty = 'Fácil' | 'Médio' | 'Difícil';

interface MakerProject {
  id: string; title: string;
  platform: Exclude<Platform, 'Todos'>;
  difficulty: Difficulty; duration: string;
  description: string; materials: string[];
  skills: string[]; tutorialUrl: string; imageUrl: string;
}
interface Channel { name: string; url: string; lang: 'PT-BR' | 'EN'; desc: string; focus: string; }
interface OnlineTool { name: string; url: string; desc: string; icon: React.ElementType; color: string; }

/* ── Config plataformas ─────────────────────────────────────────────────── */
const PC: Record<string, { hex: string; icon: React.ElementType }> = {
  'Arduino':      { hex: '#00979D', icon: Cpu   },
  'Raspberry Pi': { hex: '#C51A4A', icon: Wifi  },
  'micro:bit':    { hex: '#1E88E5', icon: Zap   },
  'ESP32':        { hex: '#7B2D8B', icon: Globe },
  '3D Print':     { hex: '#E65100', icon: Box   },
};
const DC: Record<Difficulty, { hex: string; level: number; label: string }> = {
  'Fácil':   { hex: '#22c55e', level: 1, label: 'Iniciante'     },
  'Médio':   { hex: '#f59e0b', level: 2, label: 'Intermediário' },
  'Difícil': { hex: '#ef4444', level: 3, label: 'Avançado'      },
};
const PLATFORMS: Platform[] = ['Todos', 'Arduino', 'Raspberry Pi', 'micro:bit', 'ESP32', '3D Print'];
const STRIPE = 'repeating-linear-gradient(-45deg,#FFD600 0,#FFD600 14px,#2B2622 14px,#2B2622 28px)';

/* ── Dados ──────────────────────────────────────────────────────────────── */
const PROJECTS: MakerProject[] = [
  { id:'semaforo-arduino', title:'Semáforo Inteligente', platform:'Arduino', difficulty:'Fácil', duration:'1–2h',
    description:'Construa um semáforo funcional com LEDs RGB e Arduino UNO. Aprenda lógica de temporização e controle de saídas digitais — projeto perfeito para quem está começando.',
    materials:['Arduino UNO','LED vermelho, amarelo e verde','Resistores 220Ω','Protoboard','Jumpers'],
    skills:['Saídas digitais','delay()','Controle de LEDs'],
    tutorialUrl:'https://www.instructables.com/Arduino-Traffic-Light-Controller/',
    imageUrl:'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&q=80&fit=crop' },
  { id:'estacao-meteorologica', title:'Estação Meteorológica', platform:'Arduino', difficulty:'Médio', duration:'3–4h',
    description:'Monitore temperatura e umidade em tempo real com sensor DHT11 e exiba os dados em um display LCD. Aprenda a ler sensores e usar bibliotecas externas.',
    materials:['Arduino UNO','Sensor DHT11','Display LCD 16x2','Módulo I2C','Protoboard'],
    skills:['Sensores','Bibliotecas','Display LCD','Protocolo I2C'],
    tutorialUrl:'https://www.instructables.com/Arduino-Weather-Station-Part-1/',
    imageUrl:'https://images.unsplash.com/photo-1581093458791-9e5e14f0b5b2?w=600&q=80&fit=crop' },
  { id:'robo-seguidor', title:'Robô Seguidor de Linha', platform:'Arduino', difficulty:'Médio', duration:'4–6h',
    description:'Monte um robô que segue uma linha preta no chão usando sensores infravermelhos. Um clássico de robótica que ensina controle de motores e lógica de decisão.',
    materials:['Arduino UNO','2× Motor DC + chassi','Módulo L298N','Sensores IR','Bateria 9V'],
    skills:['Controle de motores','Sensores IR','Lógica de decisão','PWM'],
    tutorialUrl:'https://www.instructables.com/Line-Follower-Robot-Using-Arduino/',
    imageUrl:'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&q=80&fit=crop' },
  { id:'irrigacao-automatica', title:'Irrigação Automática de Plantas', platform:'Arduino', difficulty:'Médio', duration:'3–4h',
    description:"Sistema inteligente que rega suas plantas automaticamente quando o solo está seco. Sensor de umidade de solo + mini bomba d'água controlada por relé.",
    materials:['Arduino UNO','Sensor umidade de solo','Mini bomba 5V','Relé 5V','Mangueira'],
    skills:['Leitura analógica','Relé','Automação','Sensores'],
    tutorialUrl:'https://www.instructables.com/Arduino-Plant-Watering-System/',
    imageUrl:'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80&fit=crop' },
  { id:'piano-arduino', title:'Piano com Sensores de Toque', platform:'Arduino', difficulty:'Fácil', duration:'2h',
    description:'Construa um piano de 8 notas com folhas de alumínio como teclas e um buzzer piezoeléctrico. Criatividade, eletrônica e código numa só experiência.',
    materials:['Arduino UNO','Buzzer piezoeléctrico','Folha de alumínio','Resistores 1MΩ','Cabos'],
    skills:['tone()','Entradas analógicas','Arrays','Capacitância'],
    tutorialUrl:'https://www.instructables.com/Touche-for-Arduino-Advanced-Touch-Sensing/',
    imageUrl:'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=600&q=80&fit=crop' },
  { id:'snake-microbit', title:'Jogo Snake no micro:bit', platform:'micro:bit', difficulty:'Fácil', duration:'1h',
    description:'Programe o clássico jogo da cobrinha na matriz de LEDs 5×5 do micro:bit usando o MakeCode. Aprenda laços, condicionais e uso dos acelerômetros.',
    materials:['micro:bit v2','Cabo USB','Computador'],
    skills:['MakeCode','Matrizes de LED','Lógica de jogo','Acelerômetro'],
    tutorialUrl:'https://microbit.org/projects/make-it-code-it/snake/',
    imageUrl:'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=600&q=80&fit=crop' },
  { id:'termometro-microbit', title:'Termômetro com micro:bit', platform:'micro:bit', difficulty:'Fácil', duration:'30min',
    description:'Use o sensor de temperatura embutido do micro:bit para criar um termômetro que exibe alertas na matriz de LEDs quando está quente ou frio.',
    materials:['micro:bit v2','Cabo USB'],
    skills:['Sensor de temperatura','MakeCode','Condicionais','LED matrix'],
    tutorialUrl:'https://makecode.microbit.org/projects/temperature',
    imageUrl:'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80&fit=crop' },
  { id:'camera-seguranca-rpi', title:'Câmera de Segurança com IA', platform:'Raspberry Pi', difficulty:'Difícil', duration:'6–8h',
    description:'Monte uma câmera de segurança com detecção de movimento usando OpenCV e Raspberry Pi. Receba alertas por e-mail quando movimento for detectado.',
    materials:['Raspberry Pi 4','Câmera Pi ou USB','Cartão microSD 32GB','Fonte 5V 3A'],
    skills:['Python','OpenCV','Linux','Redes','API e-mail'],
    tutorialUrl:'https://www.hackster.io/mjrobot/real-time-face-recognition-an-end-to-end-project-a10826',
    imageUrl:'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&q=80&fit=crop' },
  { id:'media-center-rpi', title:'Smart TV com Raspberry Pi', platform:'Raspberry Pi', difficulty:'Médio', duration:'2–3h',
    description:'Transforme uma TV velha em Smart TV completa com Kodi. Acesse Netflix, YouTube e streaming — tudo com um Raspberry Pi e um controle remoto.',
    materials:['Raspberry Pi 4 (2GB)','Cartão microSD 32GB','Cabo HDMI','Teclado/Mouse ou controle USB'],
    skills:['Linux','Kodi','Configuração de sistema','Redes'],
    tutorialUrl:'https://www.raspberrypi.com/tutorials/turn-your-raspberry-pi-into-a-kodi-tv-box/',
    imageUrl:'https://images.unsplash.com/photo-1593359677879-a4bb92f829e1?w=600&q=80&fit=crop' },
  { id:'smart-home-esp32', title:'Casa Inteligente com ESP32', platform:'ESP32', difficulty:'Difícil', duration:'5–8h',
    description:'Controle luzes, ventilador e tomadas pelo celular via Wi-Fi usando o ESP32. Crie um servidor web embarcado e aprenda IoT de verdade.',
    materials:['ESP32 DevKit','Módulo relé 4 canais','Sensor DHT22','LED stripe 12V','Fonte chaveada'],
    skills:['Wi-Fi','Servidor HTTP','HTML/CSS básico','MQTT','JSON'],
    tutorialUrl:'https://randomnerdtutorials.com/esp32-web-server-arduino-ide/',
    imageUrl:'https://images.unsplash.com/photo-1558002038-1055907df827?w=600&q=80&fit=crop' },
  { id:'case-3d-arduino', title:'Case 3D para Arduino', platform:'3D Print', difficulty:'Fácil', duration:'2–3h',
    description:'Projete e imprima uma case personalizada para seu Arduino usando o Tinkercad. Aprenda modelagem 3D básica e configure a impressora para o melhor resultado.',
    materials:['Impressora 3D','Filamento PLA','Arduino UNO (para medir)','Paquímetro'],
    skills:['Tinkercad','Modelagem 3D','Configuração impressora','Fatiamento'],
    tutorialUrl:'https://www.tinkercad.com/things/hmK1dkXjzPD',
    imageUrl:'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=600&q=80&fit=crop' },
  { id:'porta-canetas-3d', title:'Porta-Canetas Customizado', platform:'3D Print', difficulty:'Fácil', duration:'1–2h',
    description:'Crie seu primeiro objeto 3D funcional: um porta-canetas com seu nome ou uma forma criativa. Aprenda as ferramentas básicas de modelagem 3D.',
    materials:['Impressora 3D','Filamento PLA colorido','Faca de acabamento'],
    skills:['Tinkercad ou Fusion 360','Extrusão','Formas básicas','Fatiamento Cura'],
    tutorialUrl:'https://www.instructables.com/Custom-3D-Printed-Pen-Holder/',
    imageUrl:'https://images.unsplash.com/photo-1599666505285-9af5e66d0ed7?w=600&q=80&fit=crop' },
];

const CHANNELS: Channel[] = [
  { name:'Brincando com Ideias', url:'https://www.youtube.com/@BrincandocomIdeias', lang:'PT-BR', desc:'Arduino, ESP32 e IoT para iniciantes com linguagem simples', focus:'Arduino · ESP32 · IoT' },
  { name:'FilipeFlop',           url:'https://www.youtube.com/@filipeflop',         lang:'PT-BR', desc:'Tutoriais de Arduino, Raspberry Pi e eletrônica em PT-BR',  focus:'Arduino · Raspberry Pi · Eletrônica' },
  { name:'RoboCore',             url:'https://www.youtube.com/@RoboCore',           lang:'PT-BR', desc:'Robótica educacional, Arduino e projetos maker para escolas', focus:'Robótica · Arduino · Educação' },
  { name:'Dronebot Workshop',    url:'https://www.youtube.com/@dronebotworkshop',   lang:'EN',    desc:'Projetos detalhados com Arduino, RPi, sensores e robótica',  focus:'Arduino · Robótica · Sensores' },
  { name:'Paul McWhorter',       url:'https://www.youtube.com/@paulmcwhorter',      lang:'EN',    desc:'Curso completo de Arduino e Raspberry Pi do zero, passo a passo', focus:'Arduino · Raspberry Pi · Python' },
  { name:'Hackster.io',          url:'https://www.youtube.com/@HacksterProjects',   lang:'EN',    desc:'Projetos IoT, wearables e hardware da maior comunidade maker', focus:'IoT · ESP32 · Wearables' },
];

const ONLINE_TOOLS: OnlineTool[] = [
  { name:'Tinkercad',   url:'https://www.tinkercad.com/',         desc:'Simule circuitos e modele objetos 3D no browser', icon:Cpu,    color:'#F16529' },
  { name:'MakeCode',    url:'https://makecode.microbit.org/',      desc:'Programação visual e Python para o micro:bit',    icon:Code2,  color:'#0075BF' },
  { name:'Wokwi',       url:'https://wokwi.com/',                 desc:'Simulador online de Arduino e ESP32 em tempo real',icon:Zap,    color:'#1abc9c' },
  { name:'Fritzing',    url:'https://fritzing.org/',               desc:'Desenhe esquemas de circuitos e PCBs',            icon:Layers, color:'#be3030' },
  { name:'Arduino IDE', url:'https://www.arduino.cc/en/software', desc:'IDE oficial para programar placas Arduino',       icon:Box,    color:'#00979D' },
  { name:'PlatformIO',  url:'https://platformio.org/',            desc:'Ambiente profissional de desenvolvimento embarcado',icon:Globe,  color:'#FF7F00' },
];

/* ── Paleta Maker ───────────────────────────────────────────────────────── */
const M = {
  kraft:     '#F4ECD8',
  paper:     '#E8D9BF',
  tan:       '#C9A66B',
  ink:       '#2B2622',
  rust:      '#D2691E',
  blueprint: '#2C5F7C',
  circuit:   '#3E8E5A',
};

/* textura SVG noise para kraft */
const NOISE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.78' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.055'/%3E%3C/svg%3E")`;

/* grade blueprint */
const BLUEPRINT_GRID = (alpha = 0.13) =>
  `linear-gradient(rgba(44,95,124,${alpha}) 1px, transparent 1px), linear-gradient(90deg, rgba(44,95,124,${alpha}) 1px, transparent 1px)`;

/* placeholder para imagens que falham: kraft + grid blueprint + mira */
const IMG_FALLBACK = "data:image/svg+xml," + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <rect width="600" height="400" fill="#EDE0C4"/>
    <defs><pattern id="g" width="30" height="30" patternUnits="userSpaceOnUse">
      <path d="M30 0H0V30" fill="none" stroke="#2C5F7C" stroke-width="0.8" opacity="0.3"/>
    </pattern></defs>
    <rect width="600" height="400" fill="url(#g)"/>
    <g transform="translate(300,180)" opacity="0.45">
      <circle r="52" fill="none" stroke="#C9A66B" stroke-width="2.5"/>
      <circle r="7" fill="#C9A66B"/>
      <line y1="-52" y2="-18" stroke="#C9A66B" stroke-width="2.5"/>
      <line y1="18" y2="52" stroke="#C9A66B" stroke-width="2.5"/>
      <line x1="-52" x2="-18" stroke="#C9A66B" stroke-width="2.5"/>
      <line x1="18" x2="52" stroke="#C9A66B" stroke-width="2.5"/>
    </g>
    <text x="300" y="260" text-anchor="middle" font-family="monospace" font-size="13" fill="#5C4A36" opacity="0.65">// IMAGEM INDISPONÍVEL</text>
  </svg>`
);

const MAKER_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Black+Ops+One&family=Fredoka:wght@600&family=Bungee&display=swap');
  @keyframes gear    { to { transform: rotate(360deg);  } }
  @keyframes gear-r  { to { transform: rotate(-360deg); } }
  @keyframes stripe-go { from { background-position: 0 0; } to { background-position: 64px 0; } }
  @keyframes fade-up { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes pulse-dot { 0%,100% { opacity:1; } 50% { opacity:.25; } }
  @keyframes led { 0%,100% { opacity:1; } 60% { opacity:.3; } }
  @media (prefers-reduced-motion:reduce) {
    *,*::before,*::after { animation-duration:.01ms !important; animation-iteration-count:1 !important; }
  }
`;

/* ── Micro-componentes maker ────────────────────────────────────────────── */

function Screw({ color = '#7A6247', size = 13 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="5.5" stroke={color} strokeWidth="1.5" fill={color + '22'} />
      <line x1="4.5" y1="4.5" x2="9.5" y2="9.5" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <line x1="9.5" y1="4.5" x2="4.5" y2="9.5" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function WashiTape({ color, angle = -1.5, w = 60 }: { color: string; angle?: number; w?: number }) {
  return (
    <div aria-hidden="true" style={{
      position: 'absolute', top: -11, left: '50%',
      transform: `translateX(-50%) rotate(${angle}deg)`,
      width: w, height: 20, background: color, opacity: 0.72, zIndex: 2,
      backgroundImage: 'repeating-linear-gradient(90deg,transparent 0,transparent 9px,rgba(255,255,255,0.18) 9px,rgba(255,255,255,0.18) 10px)',
    }} />
  );
}

function CircuitTrace({ color = M.circuit, opacity = 0.12 }: { color?: string; opacity?: number }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 180 110"
      style={{ position:'absolute', bottom:0, right:0, width:108, height:66, opacity, pointerEvents:'none' }}>
      <path d="M10,55 H55 V15 H110 V55 H165" stroke={color} strokeWidth="1.5" fill="none" />
      <path d="M55,55 V90 H130" stroke={color} strokeWidth="1.5" fill="none" />
      <circle cx="55" cy="55" r="3.5" fill={color} />
      <circle cx="110" cy="55" r="3.5" fill={color} />
      <circle cx="55" cy="15" r="2.5"  fill={color} />
      <rect x="155" y="46" width="10" height="16" rx="1" stroke={color} strokeWidth="1.5" fill="none" />
    </svg>
  );
}

function Stamp({ text, color = M.rust, rotate = -6 }: { text: string; color?: string; rotate?: number }) {
  return (
    <div aria-hidden="true" style={{
      display:'inline-block', padding:'2px 7px',
      border:`2.5px solid ${color}`, color,
      fontFamily:"'Courier New',monospace", fontSize:9, fontWeight:900,
      letterSpacing:'0.2em', textTransform:'uppercase',
      transform:`rotate(${rotate}deg)`, opacity:0.68, userSelect:'none',
    }}>
      {text}
    </div>
  );
}

/* ── Project Card — 3 variantes alternadas ──────────────────────────────── */
const ProjectCard: React.FC<{ project: MakerProject; idx: number; isDark: boolean }> = ({ project, idx, isDark }) => {
  const [open, setOpen] = useState(false);
  const pc = PC[project.platform];
  const dc = DC[project.difficulty];
  const Icon = pc.icon;
  const v = idx % 3; // 0=kraft 1=blueprint 2=circuito

  const tapeMap: Record<string, string> = {
    'Arduino':'#00979D88','Raspberry Pi':'#C51A4A88',
    'micro:bit':'#1E88E588','ESP32':'#7B2D8B88','3D Print':'#E6510088',
  };
  const stamps: Record<Difficulty, string> = { 'Fácil':'DIY','Médio':'v1.0','Difícil':'PRO' };

  const bg = isDark
    ? ['#2D2218','#141E28','#182318'][v]
    : ['#FEFCF5','#EEF4FA','#F0FAF3'][v];

  const border = [
    `1.5px dashed ${M.tan}80`,
    `1.5px solid ${M.blueprint}50`,
    `1.5px solid ${M.circuit}50`,
  ][v];

  const sh   = isDark ? '4px 4px 0 rgba(0,0,0,0.45)' : '4px 4px 0 rgba(43,38,34,0.14)';
  const shHv = isDark ? '9px 10px 0 rgba(0,0,0,0.55)' : '9px 10px 0 rgba(43,38,34,0.22)';

  return (
    <article
      className="relative flex flex-col group"
      style={{ background:bg, border, overflow:'visible', boxShadow:sh, marginTop:14,
        animation:`fade-up 0.35s ease both`, animationDelay:`${idx*50}ms`,
        transition:'transform .18s ease, box-shadow .18s ease' }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform='translate(-3px,-5px) rotate(-0.4deg)'; el.style.boxShadow=shHv; }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform=''; el.style.boxShadow=sh; }}
    >
      <WashiTape color={tapeMap[project.platform] ?? `${M.rust}88`} angle={idx%2===0?-2:2} w={64} />

      {/* Parafusos nos cantos */}
      <div style={{ position:'absolute', top:10, left:10, zIndex:3 }}>
        <Screw color={isDark?'#9E8260':'#7A6247'} />
      </div>
      <div style={{ position:'absolute', top:10, right:10, zIndex:3 }}>
        <Screw color={isDark?'#9E8260':'#7A6247'} />
      </div>

      {/* Blueprint grid overlay (variante 1) */}
      {v===1 && (
        <div aria-hidden="true" style={{
          position:'absolute', inset:0, pointerEvents:'none', zIndex:0,
          backgroundImage: BLUEPRINT_GRID(0.08), backgroundSize:'22px 22px',
        }} />
      )}

      {/* Circuit trace (variante 2) */}
      {v===2 && <CircuitTrace opacity={isDark?0.22:0.11} />}

      {/* Imagem */}
      <div className="relative overflow-hidden shrink-0" style={{ height:160, zIndex:1 }}>
        <img src={project.imageUrl} alt={project.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
          onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = IMG_FALLBACK; }} />
        <div className="absolute inset-0" style={{ background:'linear-gradient(to top,rgba(0,0,0,0.72) 0%,rgba(0,0,0,0.08) 55%)' }} />

        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-black text-white"
          style={{ background:pc.hex, boxShadow:'2px 2px 0 rgba(0,0,0,0.3)', fontFamily:'monospace' }}>
          <Icon className="w-3 h-3" aria-hidden="true" />
          {project.platform}
        </div>

        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-white"
          style={{ background:'rgba(0,0,0,0.6)', border:'1px solid rgba(255,255,255,0.15)' }}>
          <Wrench className="w-3 h-3" aria-hidden="true" />
          {project.duration}
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1" role="img" aria-label={`Dificuldade: ${dc.label}`}>
              {[1,2,3].map(i=>(
                <div key={i} className="w-4 h-2"
                  style={{ background: i<=dc.level ? dc.hex : 'rgba(255,255,255,0.2)' }} />
              ))}
            </div>
            <span className="text-[10px] font-black text-white">{dc.label}</span>
          </div>
          <Stamp text={stamps[project.difficulty]} color="#FFD600" rotate={idx%2===0?-5:4} />
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 flex flex-col p-5" style={{ position:'relative', zIndex:1 }}>
        <span className="text-[9px] font-black uppercase tracking-[0.22em] mb-3 inline-block"
          style={{ color:pc.hex, fontFamily:'monospace', borderBottom:`2px solid ${pc.hex}`, paddingBottom:1 }}>
          {project.platform}
        </span>

        <h3 className="text-base font-black leading-snug mb-2"
          style={{ color: isDark ? M.paper : M.ink, fontFamily:"'Courier New',monospace" }}>
          {project.title}
        </h3>

        <p className="text-xs leading-relaxed flex-1 mb-4"
          style={{ color: isDark?'#C9B99A':'#5C4A36' }}>
          {project.description}
        </p>

        <button onClick={()=>setOpen(v=>!v)}
          className="flex items-center gap-1 text-[11px] font-black mb-3 text-left"
          style={{ color:pc.hex, fontFamily:'monospace' }}>
          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${open?'rotate-90':''}`} />
          {open ? '// ocultar detalhes' : '// materiais & habilidades'}
        </button>

        {open && (
          <div className="mb-4 space-y-3">
            <div style={{
              padding:'10px 12px',
              background: isDark ? `${M.blueprint}22` : `${M.blueprint}0C`,
              border:`1px solid ${M.blueprint}45`,
              backgroundImage:`linear-gradient(${M.blueprint}08 1px,transparent 1px)`,
              backgroundSize:'100% 20px',
            }}>
              <p className="text-[9px] font-black uppercase tracking-[0.15em] mb-2"
                style={{ color:M.blueprint, fontFamily:'monospace' }}>// materiais</p>
              <div className="flex flex-wrap gap-1">
                {project.materials.map(m=>(
                  <span key={m} className="flex items-center gap-1 text-[10px] px-2 py-0.5 font-semibold"
                    style={{ background:`${pc.hex}12`, color:pc.hex, border:`1px dashed ${pc.hex}55` }}>
                    <Package className="w-2.5 h-2.5 shrink-0" aria-hidden="true" />{m}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.15em] mb-2"
                style={{ color:M.circuit, fontFamily:'monospace' }}>// habilidades</p>
              <div className="flex flex-wrap gap-1">
                {project.skills.map(s=>(
                  <span key={s} className="text-[10px] px-2 py-0.5 font-semibold"
                    style={{ background:isDark?`${M.circuit}22`:`${M.circuit}12`, color:M.circuit, border:`1px solid ${M.circuit}35` }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        <a href={project.tutorialUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2.5 text-white text-sm font-black"
          style={{ background:M.rust, fontFamily:"'Courier New',monospace", letterSpacing:'0.06em',
            boxShadow:'3px 3px 0 rgba(0,0,0,0.28)', transition:'transform .1s,box-shadow .1s' }}
          onMouseEnter={e=>{ const el=e.currentTarget as HTMLElement; el.style.transform='translate(-1px,-2px)'; el.style.boxShadow='5px 5px 0 rgba(0,0,0,0.32)'; }}
          onMouseLeave={e=>{ const el=e.currentTarget as HTMLElement; el.style.transform=''; el.style.boxShadow='3px 3px 0 rgba(0,0,0,0.28)'; }}
        >
          <Hammer className="w-4 h-4" aria-hidden="true" />
          MONTAR PROJETO
          <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
        </a>
      </div>
    </article>
  );
};

/* ── Channel Card — ficha blueprint com vocabulário maker ───────────────── */
const TAPE_BLUES = ['#2C5F7C88','#3E8E5A88','#2C5F7C70'];
const ChannelCard: React.FC<{ ch: Channel; isDark: boolean; idx: number }> = ({ ch, isDark, idx }) => {
  const sh    = isDark?'3px 3px 0 rgba(0,0,0,0.4)':'3px 3px 0 rgba(44,95,124,0.18)';
  const shHov = isDark?'7px 7px 0 rgba(0,0,0,0.5)':'7px 7px 0 rgba(44,95,124,0.28)';
  return (
    <a href={ch.url} target="_blank" rel="noopener noreferrer"
      className="group relative flex gap-4 p-4"
      style={{
        background: isDark?'#0D1820':'#F0F6FA',
        border:`1.5px dashed ${M.blueprint}55`, borderLeft:`4px solid ${M.blueprint}`,
        boxShadow: sh, marginTop:12, overflow:'visible',
        transition:'transform .18s,box-shadow .18s',
      }}
      onMouseEnter={e=>{ const el=e.currentTarget as HTMLElement; el.style.transform='translate(-2px,-4px)'; el.style.boxShadow=shHov; }}
      onMouseLeave={e=>{ const el=e.currentTarget as HTMLElement; el.style.transform=''; el.style.boxShadow=sh; }}
    >
      {/* Fita crepe blueprint */}
      <WashiTape color={TAPE_BLUES[idx%3]} angle={idx%2===0?-1.5:1.5} w={52} />
      {/* Parafuso canto */}
      <div style={{ position:'absolute', top:9, right:9 }}><Screw color={isDark?'#4A7A96':'#2C5F7C'} size={11} /></div>

      {/* LED indicator */}
      <div className="shrink-0 flex items-start pt-1">
        <div style={{ width:10, height:10, borderRadius:'50%', background:'#ef4444',
          boxShadow:'0 0 6px #ef4444', animation:'led 2s ease-in-out infinite' }} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-sm font-black truncate"
            style={{ color:isDark?M.paper:M.ink, fontFamily:"'Courier New',monospace" }}>
            {ch.name}
          </span>
          <span className={`text-[9px] font-black px-2 py-0.5 shrink-0 uppercase tracking-wider ${
            ch.lang==='PT-BR'
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
          }`}>
            {ch.lang}
          </span>
        </div>
        <p className="text-xs leading-snug mb-2" style={{ color:isDark?'#8BAFC4':'#3A5A70' }}>
          {ch.desc}
        </p>
        <p className="text-[10px] font-black uppercase tracking-[0.12em]"
          style={{ color:M.blueprint, fontFamily:'monospace' }}>
          {ch.focus}
        </p>
      </div>

      <ExternalLink className="w-4 h-4 shrink-0 self-center opacity-30 group-hover:opacity-80 transition-opacity"
        style={{ color:M.blueprint }} />
    </a>
  );
};

/* ── Tool Card — estilo "gaveta de componentes" ─────────────────────────── */
const ToolCard: React.FC<{ tool: OnlineTool }> = ({ tool }) => {
  const Icon = tool.icon;
  return (
    <a href={tool.url} target="_blank" rel="noopener noreferrer"
      className="group flex items-center gap-4 p-4 transition-all"
      style={{
        background:'rgba(255,255,255,0.04)', border:`1px solid ${tool.color}35`,
        borderLeft:`4px solid ${tool.color}`,
        boxShadow:`3px 3px 0 rgba(0,0,0,0.35)`,
        transition:'transform .18s,box-shadow .18s',
      }}
      onMouseEnter={e=>{ const el=e.currentTarget as HTMLElement; el.style.transform='translate(-2px,-3px)'; el.style.boxShadow=`6px 6px 0 rgba(0,0,0,0.45), 0 0 14px ${tool.color}30`; }}
      onMouseLeave={e=>{ const el=e.currentTarget as HTMLElement; el.style.transform=''; el.style.boxShadow='3px 3px 0 rgba(0,0,0,0.35)'; }}
    >
      <div className="w-12 h-12 flex items-center justify-center shrink-0"
        style={{ background:`${tool.color}18`, border:`1px solid ${tool.color}40` }}>
        <Icon className="w-6 h-6" style={{ color:tool.color }} aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-black mb-0.5" style={{ color:'#E8D9BF', fontFamily:"'Courier New',monospace" }}>
          {tool.name}
        </div>
        <div className="text-xs leading-snug" style={{ color:'#8A7A6A' }}>{tool.desc}</div>
      </div>
      <ExternalLink className="w-4 h-4 shrink-0 opacity-25 group-hover:opacity-70 transition-opacity"
        style={{ color:tool.color }} />
    </a>
  );
};

/* ── Divisor tipo rebite/parafuso entre seções ──────────────────────────── */
function RivetStrip({ from, to, rivColor = '#C9A66B' }: { from: string; to: string; rivColor?: string }) {
  return (
    <div style={{
      height: 26,
      backgroundImage: [
        `radial-gradient(circle, ${rivColor}90 4px, ${rivColor}20 4px, transparent 7px)`,
        `linear-gradient(to bottom, ${from}, ${to})`,
      ].join(', '),
      backgroundSize: '36px 26px, 100% 100%',
      backgroundPosition: '18px center, 0 0',
    }} />
  );
}

/* ── Cabeçalho de seção ─────────────────────────────────────────────────── */
function SectionHead({ icon: Icon, label, sub, color, light = false }: {
  icon: React.ElementType; label: string; sub: string; color: string; light?: boolean;
}) {
  return (
    <div className="flex items-start gap-4 mb-8">
      <div className="flex items-center justify-center w-10 h-10 shrink-0 text-white"
        style={{ background:color, boxShadow:`3px 3px 0 ${color}60` }}>
        <Icon className="w-5 h-5" aria-hidden="true" />
      </div>
      <div>
        <h2 className="text-lg font-black leading-tight"
          style={{ color: light?M.paper:M.ink, fontFamily:"'Courier New',monospace", letterSpacing:'0.04em' }}>
          {label}
        </h2>
        <p className="text-[10px] font-black uppercase tracking-[0.22em] mt-0.5"
          style={{ color: light?`${M.paper}70`:`${M.tan}`, fontFamily:'monospace' }}>
          {sub}
        </p>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PÁGINA
════════════════════════════════════════════════════════════════════════ */
interface MakerPageProps { onBackToHub: () => void; onOpenRoadmaps: () => void; }

const MakerPage: React.FC<MakerPageProps> = ({ onBackToHub, onOpenRoadmaps }) => {
  const { isDark, toggleTheme } = useTheme();
  const [platform, setPlatform] = useState<Platform>('Todos');

  const filtered = platform==='Todos' ? PROJECTS : PROJECTS.filter(p=>p.platform===platform);

  const pageBg      = isDark ? '#1A1208' : M.kraft;
  const pageBgImage = isDark ? 'none' : NOISE;

  return (
    <div className="min-h-screen flex flex-col" style={{ background:pageBg, backgroundImage:pageBgImage }}>
      <style>{MAKER_CSS}</style>

      {/* Faixa zebra — topo */}
      <div style={{ height:10, backgroundImage:STRIPE, animation:'stripe-go 1.2s linear infinite' }} />

      <Header isDark={isDark} onToggleTheme={toggleTheme} onOpenRoadmaps={onOpenRoadmaps} />

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ background:'#111008' }}>

        {/* Engrenagens decorativas */}
        <Settings aria-hidden="true" className="absolute pointer-events-none text-yellow-400"
          style={{ width:260, height:260, top:-60, right:-60, opacity:.06, animation:'gear 25s linear infinite' }} />
        <Settings aria-hidden="true" className="absolute pointer-events-none text-orange-500"
          style={{ width:160, height:160, bottom:-40, left:-40, opacity:.05, animation:'gear-r 18s linear infinite' }} />
        <Settings aria-hidden="true" className="absolute pointer-events-none text-yellow-300"
          style={{ width:100, height:100, top:'30%', left:'42%', opacity:.035, animation:'gear 14s linear infinite' }} />

        {/* Traços de circuito no hero */}
        <svg aria-hidden="true" viewBox="0 0 400 200" style={{ position:'absolute', bottom:0, left:0, width:320, height:160, opacity:.07, pointerEvents:'none' }}>
          <path d="M0,120 H80 V60 H160 V120 H240 V40 H320" stroke={M.circuit} strokeWidth="2" fill="none"/>
          <path d="M80,60 V180" stroke={M.circuit} strokeWidth="2" fill="none"/>
          <circle cx="80"  cy="60"  r="5" fill={M.circuit}/>
          <circle cx="160" cy="120" r="5" fill={M.circuit}/>
          <circle cx="240" cy="120" r="5" fill={M.circuit}/>
          <rect x="310" y="32" width="16" height="24" rx="2" stroke={M.circuit} strokeWidth="2" fill="none"/>
        </svg>

        {/* Faixa zebra — base do hero */}
        <div className="absolute bottom-0 left-0 right-0 h-2 opacity-30"
          style={{ backgroundImage:STRIPE }} />

        <div className="relative z-10 max-w-[1200px] mx-auto px-4 md:px-8 py-12 md:py-20">

          {/* Voltar */}
          <button onClick={onBackToHub}
            className="flex items-center gap-2 mb-10 text-sm font-bold text-white/60 hover:text-yellow-400 transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Voltar ao Hub
          </button>

          {/* Flex: conteúdo + ilustração */}
          <div className="flex items-center gap-8 lg:gap-16">

            {/* Coluna de texto */}
            <div className="flex-1 min-w-0">

              {/* Badge */}
              <div className="inline-flex items-center gap-2.5 mb-6 px-4 py-2"
                style={{ border:'1px solid rgba(255,215,0,0.3)', background:'rgba(255,215,0,0.06)' }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:'#FFD600',
                  animation:'pulse-dot 1.8s ease-in-out infinite' }} />
                <span className="text-xs font-black uppercase tracking-[0.3em] text-yellow-400"
                  style={{ fontFamily:'monospace' }}>
                  Cultura Maker
                </span>
              </div>

              {/* Título multi-fonte — cada palavra tem material diferente */}
              <h1 aria-label="Construa. Crie. Inove." className="mb-5" style={{ lineHeight:1.05 }}>
                {/* CONSTRUA — estêncil metálico */}
                <span aria-hidden="true" style={{
                  display:'inline-block',
                  fontFamily:"'Black Ops One', Impact, monospace",
                  fontSize:'clamp(2rem,5.5vw,4.4rem)',
                  color:'#A8B8C8',
                  transform:'rotate(-1.5deg)',
                  textShadow:'2px 2px 0 rgba(0,0,0,0.45)',
                  letterSpacing:'0.01em',
                  marginRight:'0.2em',
                }}>CONSTRUA.</span>
                {' '}
                {/* CRIE — massinha arredondada */}
                <span aria-hidden="true" style={{
                  display:'inline-block',
                  fontFamily:"'Fredoka', Verdana, sans-serif",
                  fontWeight:600,
                  fontSize:'clamp(2rem,5.5vw,4.4rem)',
                  color:'#00979D',
                  transform:'rotate(2.5deg)',
                  letterSpacing:'0.01em',
                }}>CRIE.</span>
                <br />
                {/* INOVE — blocado tipo Lego com marca-texto fita crepe */}
                <span aria-hidden="true" style={{
                  display:'inline-block',
                  fontFamily:"'Bungee', Impact, monospace",
                  fontSize:'clamp(2rem,5.5vw,4.4rem)',
                  color:'#FFD600',
                  transform:'rotate(-0.8deg)',
                  position:'relative',
                  letterSpacing:'0.02em',
                }}>
                  <span aria-hidden="true" style={{
                    position:'absolute', bottom:'10%', left:'-2%', right:'-2%', height:'38%',
                    background:'rgba(210,105,30,0.42)', transform:'rotate(-1.2deg) skewX(-3deg)', zIndex:0,
                  }} />
                  <span style={{ position:'relative', zIndex:1 }}>INOVE.</span>
                </span>
              </h1>

              <p className="text-sm md:text-base max-w-lg mb-10 leading-relaxed"
                style={{ color:'rgba(255,255,255,0.72)' }}>
                Projetos reais com Arduino, Raspberry Pi, micro:bit, ESP32 e impressão 3D.
                Aprenda construindo — tutoriais, materiais e tudo que você precisa.
              </p>

              {/* Stats — contraste melhorado */}
              <div className="flex flex-wrap gap-6">
                {[
                  { n:PROJECTS.length,     l:'Projetos'    },
                  { n:5,                   l:'Plataformas' },
                  { n:CHANNELS.length,     l:'Canais'      },
                  { n:ONLINE_TOOLS.length, l:'Ferramentas' },
                ].map(s=>(
                  <div key={s.l} style={{ borderLeft:`2px solid rgba(255,214,0,0.35)`, paddingLeft:14 }}>
                    <div className="text-3xl font-black leading-none" style={{ color:'#FFD600', fontFamily:'monospace' }}>{s.n}</div>
                    <div className="text-[11px] font-bold uppercase tracking-[0.2em] mt-1"
                      style={{ color:'rgba(255,255,255,0.58)', fontFamily:'monospace' }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ilustração blueprint — oculta no mobile */}
            <div className="hidden lg:block shrink-0 w-[380px]" aria-hidden="true"
              style={{ opacity:0.22 }}>
              <svg viewBox="0 0 380 280" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%' }}>
                {/* Grid blueprint */}
                <defs>
                  <pattern id="bpg" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M20 0H0V20" stroke="#2C5F7C" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="380" height="280" fill="url(#bpg)" opacity="0.7"/>
                {/* Placa principal */}
                <rect x="70" y="30" width="220" height="180" rx="4" stroke="#2C5F7C" strokeWidth="2"/>
                {/* Pinos esquerdos */}
                {[0,1,2,3,4,5].map(i=>(
                  <rect key={`lp${i}`} x="55" y={50+i*20} width="15" height="10" rx="1" stroke="#2C5F7C" strokeWidth="1.5"/>
                ))}
                {/* Pinos direitos */}
                {[0,1,2,3,4,5,6,7].map(i=>(
                  <rect key={`rp${i}`} x="290" y={46+i*18} width="15" height="10" rx="1" stroke="#2C5F7C" strokeWidth="1.5"/>
                ))}
                {/* Chip principal */}
                <rect x="135" y="75" width="100" height="90" rx="3" stroke="#3E8E5A" strokeWidth="2"/>
                {[0,1,2,3].map(i=>(
                  <line key={`ct${i}`} x1={145+i*22} y1="75" x2={145+i*22} y2="60" stroke="#3E8E5A" strokeWidth="1.5"/>
                ))}
                {[0,1,2,3].map(i=>(
                  <line key={`cb${i}`} x1={145+i*22} y1="165" x2={145+i*22} y2="180" stroke="#3E8E5A" strokeWidth="1.5"/>
                ))}
                <text x="185" y="124" textAnchor="middle" fontFamily="monospace" fontSize="10" fill="#3E8E5A">ATmega</text>
                <text x="185" y="138" textAnchor="middle" fontFamily="monospace" fontSize="10" fill="#3E8E5A">328P</text>
                {/* Cristal */}
                <rect x="83" y="90" width="34" height="14" rx="2" stroke="#C9A66B" strokeWidth="1.5"/>
                <text x="100" y="101" textAnchor="middle" fontFamily="monospace" fontSize="8" fill="#C9A66B">16MHz</text>
                {/* USB */}
                <rect x="70" y="172" width="36" height="22" rx="2" stroke="#C9A66B" strokeWidth="2"/>
                <text x="88" y="186" textAnchor="middle" fontFamily="monospace" fontSize="8" fill="#C9A66B">USB</text>
                {/* LEDs */}
                <circle cx="265" cy="52" r="6" stroke="#FFD600" strokeWidth="1.5"/>
                <circle cx="284" cy="52" r="6" stroke="#22c55e" strokeWidth="1.5"/>
                {/* Traços */}
                <path d="M70 95H55" stroke="#2C5F7C" strokeWidth="1" strokeDasharray="4 2"/>
                <path d="M290 64H305" stroke="#2C5F7C" strokeWidth="1" strokeDasharray="4 2"/>
                <path d="M145 60V44H240V60" stroke="#3E8E5A" strokeWidth="1" strokeDasharray="3 2"/>
                {/* Linha de cota */}
                <line x1="70" y1="228" x2="290" y2="228" stroke="#2C5F7C" strokeWidth="0.8" strokeDasharray="5 3" opacity="0.7"/>
                <line x1="70" y1="222" x2="70" y2="234" stroke="#2C5F7C" strokeWidth="1" opacity="0.7"/>
                <line x1="290" y1="222" x2="290" y2="234" stroke="#2C5F7C" strokeWidth="1" opacity="0.7"/>
                <text x="180" y="246" textAnchor="middle" fontFamily="monospace" fontSize="9" fill="#2C5F7C" opacity="0.8">68.6mm × 53.3mm</text>
                <text x="180" y="264" textAnchor="middle" fontFamily="monospace" fontSize="8" fill="#2C5F7C" opacity="0.6">ARDUINO UNO R3 — v1.0</text>
              </svg>
            </div>

          </div>
        </div>
      </div>

      {/* ── FILTRO DE PLATAFORMAS — fundo kraft mais escuro ─────────────── */}
      <div style={{ background: isDark?'#231810':'#EDE0C4', backgroundImage: isDark?'none':NOISE,
        borderBottom:`2px dashed ${M.tan}60`, padding:'24px 0 20px' }}>
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] mb-3"
            style={{ color:M.tan, fontFamily:'monospace' }}>
            // filtrar por plataforma
          </p>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map(pl=>{
              const active = platform===pl;
              const conf   = pl!=='Todos' ? PC[pl] : null;
              const Icon   = conf ? conf.icon : Wrench;
              const count  = pl==='Todos' ? PROJECTS.length : PROJECTS.filter(p=>p.platform===pl).length;
              const accentColor = conf?.hex ?? M.rust;

              return (
                <button key={pl} onClick={()=>setPlatform(pl)}
                  className="flex items-center gap-2 px-3.5 py-2 text-sm font-black transition-all"
                  style={{
                    background: active ? accentColor : (isDark?'#2D2218':'#FAF3E6'),
                    color: active ? '#fff' : (isDark?M.paper:M.ink),
                    border: active ? `2px solid ${accentColor}` : `2px dashed ${M.tan}80`,
                    boxShadow: active ? `3px 3px 0 ${accentColor}60` : `2px 2px 0 ${M.tan}40`,
                    fontFamily:'monospace',
                  }}>
                  <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                  {pl}
                  <span className="text-[10px] font-black px-1.5 py-0.5"
                    style={{ background: active?'rgba(255,255,255,0.25)':isDark?'#3D2B1A':`${M.tan}30`,
                      color: active?'#fff':(isDark?M.paper:M.ink) }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <main className="flex-1">

        {/* ── PROJETOS — fundo kraft ──────────────────────────────────── */}
        <section style={{ background:pageBg, backgroundImage:pageBgImage, padding:'40px 0 48px', scrollMarginTop:'80px' }}>
          <div className="max-w-[1200px] mx-auto px-4 md:px-8">
            <SectionHead icon={Hammer} label={platform==='Todos'?'Todos os Projetos':`Projetos: ${platform}`}
              sub={`${filtered.length} projeto${filtered.length!==1?'s':''} · construa, aprenda, repita`}
              color={M.rust} />
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filtered.map((p,i)=><ProjectCard key={p.id} project={p} idx={i} isDark={isDark} />)}
            </div>
          </div>
        </section>

        {/* Emenda kraft → blueprint */}
        <RivetStrip
          from={isDark?'#1A1208':M.kraft}
          to={isDark?'#0A1520':'#D8EBF5'}
          rivColor={M.tan}
        />

        {/* ── CANAIS — fundo blueprint ────────────────────────────────── */}
        <section style={{
          background: isDark?'#0A1520':'#D8EBF5',
          backgroundImage: isDark
            ? `${BLUEPRINT_GRID(0.18)}, none`
            : `${BLUEPRINT_GRID(0.14)}, none`,
          backgroundSize:'28px 28px',
          padding:'40px 0 48px',
          scrollMarginTop:'80px',
        }}>
          <div className="max-w-[1200px] mx-auto px-4 md:px-8">
            <SectionHead icon={PlayCircle} label="Canais para Assistir"
              sub="aprenda com quem já faz · pt-br e english"
              color={M.blueprint} light={isDark} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {CHANNELS.map((ch,i)=><ChannelCard key={ch.url} ch={ch} isDark={isDark} idx={i} />)}
            </div>
          </div>
        </section>

        {/* Emenda blueprint → circuito escuro */}
        <RivetStrip
          from={isDark?'#0A1520':'#D8EBF5'}
          to='#0F1A0F'
          rivColor={M.blueprint}
        />

        {/* ── FERRAMENTAS — fundo escuro tipo placa de circuito ───────── */}
        <section style={{ background:'#0F1A0F', padding:'40px 0 56px', position:'relative', overflow:'hidden', scrollMarginTop:'80px' }}>
          {/* Circuito de fundo */}
          <svg aria-hidden="true" viewBox="0 0 600 300"
            style={{ position:'absolute', top:0, right:0, width:400, height:200, opacity:.05, pointerEvents:'none' }}>
            <path d="M50,150 H150 V80 H280 V150 H400 V50 H550" stroke={M.circuit} strokeWidth="2" fill="none"/>
            <path d="M150,80 V260" stroke={M.circuit} strokeWidth="2" fill="none"/>
            <path d="M280,150 V260 H450" stroke={M.circuit} strokeWidth="2" fill="none"/>
            <circle cx="150" cy="80"  r="6" fill={M.circuit}/>
            <circle cx="280" cy="150" r="6" fill={M.circuit}/>
            <circle cx="400" cy="150" r="6" fill={M.circuit}/>
            <rect x="540" y="42" width="20" height="32" rx="2" stroke={M.circuit} strokeWidth="2" fill="none"/>
          </svg>

          <div className="max-w-[1200px] mx-auto px-4 md:px-8 relative z-10">
            <SectionHead icon={Wrench} label="Ferramentas Online"
              sub="use no browser · sem instalar nada" color={M.circuit} light />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ONLINE_TOOLS.map(t=><ToolCard key={t.url} tool={t} />)}
            </div>
          </div>
        </section>

      </main>

      {/* Faixa zebra — fundo */}
      <div style={{ height:10, backgroundImage:STRIPE, animation:'stripe-go 1.2s linear infinite reverse' }} />

      <Footer />
    </div>
  );
};

export default MakerPage;
