import React, { useState } from 'react';
import {
  ArrowLeft, Cpu, ExternalLink, PlayCircle, Wrench,
  Layers, Zap, Box, Wifi, Code2, Globe, Settings, Package,
  ChevronRight, Hammer,
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useTheme } from '../hooks/useTheme';

/* ── Tipos ──────────────────────────────────────────────────────────────── */

type Platform = 'Todos' | 'Arduino' | 'Raspberry Pi' | 'micro:bit' | 'ESP32' | '3D Print';
type Difficulty = 'Fácil' | 'Médio' | 'Difícil';

interface MakerProject {
  id: string;
  title: string;
  platform: Exclude<Platform, 'Todos'>;
  difficulty: Difficulty;
  duration: string;
  description: string;
  materials: string[];
  skills: string[];
  tutorialUrl: string;
  imageUrl: string;
}

interface Channel {
  name: string;
  url: string;
  lang: 'PT-BR' | 'EN';
  desc: string;
  focus: string;
}

interface OnlineTool {
  name: string;
  url: string;
  desc: string;
  icon: React.ElementType;
  color: string;
}

/* ── Config de plataformas ─────────────────────────────────────────────── */

const PC: Record<string, { hex: string; icon: React.ElementType }> = {
  'Arduino':      { hex: '#00979D', icon: Cpu   },
  'Raspberry Pi': { hex: '#C51A4A', icon: Wifi  },
  'micro:bit':    { hex: '#1E88E5', icon: Zap   },
  'ESP32':        { hex: '#7B2D8B', icon: Globe },
  '3D Print':     { hex: '#E65100', icon: Box   },
};

const DC: Record<Difficulty, { hex: string; level: number; label: string }> = {
  'Fácil':   { hex: '#22c55e', level: 1, label: 'Iniciante'      },
  'Médio':   { hex: '#f59e0b', level: 2, label: 'Intermediário'  },
  'Difícil': { hex: '#ef4444', level: 3, label: 'Avançado'       },
};

const PLATFORMS: Platform[] = ['Todos', 'Arduino', 'Raspberry Pi', 'micro:bit', 'ESP32', '3D Print'];

const STRIPE = 'repeating-linear-gradient(-45deg,#FFD600 0,#FFD600 16px,#141414 16px,#141414 32px)';

/* ── Dados ──────────────────────────────────────────────────────────────── */

const PROJECTS: MakerProject[] = [
  {
    id: 'semaforo-arduino',
    title: 'Semáforo Inteligente',
    platform: 'Arduino',
    difficulty: 'Fácil',
    duration: '1–2h',
    description: 'Construa um semáforo funcional com LEDs RGB e Arduino UNO. Aprenda lógica de temporização e controle de saídas digitais — projeto perfeito para quem está começando.',
    materials: ['Arduino UNO', 'LED vermelho, amarelo e verde', 'Resistores 220Ω', 'Protoboard', 'Jumpers'],
    skills: ['Saídas digitais', 'delay()', 'Controle de LEDs'],
    tutorialUrl: 'https://www.instructables.com/Arduino-Traffic-Light-Controller/',
    imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&q=80&fit=crop',
  },
  {
    id: 'estacao-meteorologica',
    title: 'Estação Meteorológica',
    platform: 'Arduino',
    difficulty: 'Médio',
    duration: '3–4h',
    description: 'Monitore temperatura e umidade em tempo real com sensor DHT11 e exiba os dados em um display LCD. Aprenda a ler sensores e usar bibliotecas externas.',
    materials: ['Arduino UNO', 'Sensor DHT11', 'Display LCD 16x2', 'Módulo I2C', 'Protoboard'],
    skills: ['Sensores', 'Bibliotecas', 'Display LCD', 'Protocolo I2C'],
    tutorialUrl: 'https://www.instructables.com/Arduino-Weather-Station-Part-1/',
    imageUrl: 'https://images.unsplash.com/photo-1561484930-974b10b82e69?w=600&q=80&fit=crop',
  },
  {
    id: 'robo-seguidor',
    title: 'Robô Seguidor de Linha',
    platform: 'Arduino',
    difficulty: 'Médio',
    duration: '4–6h',
    description: 'Monte um robô que segue uma linha preta no chão usando sensores infravermelhos. Um clássico de robótica que ensina controle de motores e lógica de decisão.',
    materials: ['Arduino UNO', '2× Motor DC + chassi', 'Módulo L298N', 'Sensores IR', 'Bateria 9V'],
    skills: ['Controle de motores', 'Sensores IR', 'Lógica de decisão', 'PWM'],
    tutorialUrl: 'https://www.instructables.com/Line-Follower-Robot-Using-Arduino/',
    imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&q=80&fit=crop',
  },
  {
    id: 'irrigacao-automatica',
    title: 'Irrigação Automática de Plantas',
    platform: 'Arduino',
    difficulty: 'Médio',
    duration: '3–4h',
    description: 'Sistema inteligente que rega suas plantas automaticamente quando o solo está seco. Sensor de umidade de solo + mini bomba d\'água controlada por relé.',
    materials: ['Arduino UNO', 'Sensor umidade de solo', 'Mini bomba 5V', 'Relé 5V', 'Mangueira'],
    skills: ['Leitura analógica', 'Relé', 'Automação', 'Sensores'],
    tutorialUrl: 'https://www.instructables.com/Arduino-Plant-Watering-System/',
    imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80&fit=crop',
  },
  {
    id: 'piano-arduino',
    title: 'Piano com Sensores de Toque',
    platform: 'Arduino',
    difficulty: 'Fácil',
    duration: '2h',
    description: 'Construa um piano de 8 notas com folhas de alumínio como teclas e um buzzer piezoeléctrico. Criatividade, eletrônica e código numa só experiência.',
    materials: ['Arduino UNO', 'Buzzer piezoeléctrico', 'Folha de alumínio', 'Resistores 1MΩ', 'Cabos'],
    skills: ['tone()', 'Entradas analógicas', 'Arrays', 'Capacitância'],
    tutorialUrl: 'https://www.instructables.com/Touche-for-Arduino-Advanced-Touch-Sensing/',
    imageUrl: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=600&q=80&fit=crop',
  },
  {
    id: 'snake-microbit',
    title: 'Jogo Snake no micro:bit',
    platform: 'micro:bit',
    difficulty: 'Fácil',
    duration: '1h',
    description: 'Programe o clássico jogo da cobrinha na matriz de LEDs 5×5 do micro:bit usando o MakeCode. Aprenda laços, condicionais e uso dos acelerômetros.',
    materials: ['micro:bit v2', 'Cabo USB', 'Computador'],
    skills: ['MakeCode', 'Matrizes de LED', 'Lógica de jogo', 'Acelerômetro'],
    tutorialUrl: 'https://microbit.org/projects/make-it-code-it/snake/',
    imageUrl: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=600&q=80&fit=crop',
  },
  {
    id: 'termometro-microbit',
    title: 'Termômetro com micro:bit',
    platform: 'micro:bit',
    difficulty: 'Fácil',
    duration: '30min',
    description: 'Use o sensor de temperatura embutido do micro:bit para criar um termômetro que exibe alertas na matriz de LEDs quando está quente ou frio.',
    materials: ['micro:bit v2', 'Cabo USB'],
    skills: ['Sensor de temperatura', 'MakeCode', 'Condicionais', 'LED matrix'],
    tutorialUrl: 'https://makecode.microbit.org/projects/temperature',
    imageUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80&fit=crop',
  },
  {
    id: 'camera-seguranca-rpi',
    title: 'Câmera de Segurança com IA',
    platform: 'Raspberry Pi',
    difficulty: 'Difícil',
    duration: '6–8h',
    description: 'Monte uma câmera de segurança com detecção de movimento usando OpenCV e Raspberry Pi. Receba alertas por e-mail quando movimento for detectado.',
    materials: ['Raspberry Pi 4', 'Câmera Pi ou USB', 'Cartão microSD 32GB', 'Fonte 5V 3A'],
    skills: ['Python', 'OpenCV', 'Linux', 'Redes', 'API e-mail'],
    tutorialUrl: 'https://www.hackster.io/mjrobot/real-time-face-recognition-an-end-to-end-project-a10826',
    imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&q=80&fit=crop',
  },
  {
    id: 'media-center-rpi',
    title: 'Smart TV com Raspberry Pi',
    platform: 'Raspberry Pi',
    difficulty: 'Médio',
    duration: '2–3h',
    description: 'Transforme uma TV velha em Smart TV completa com Kodi. Acesse Netflix, YouTube e streaming — tudo com um Raspberry Pi e um controle remoto.',
    materials: ['Raspberry Pi 4 (2GB)', 'Cartão microSD 32GB', 'Cabo HDMI', 'Teclado/Mouse ou controle USB'],
    skills: ['Linux', 'Kodi', 'Configuração de sistema', 'Redes'],
    tutorialUrl: 'https://www.raspberrypi.com/tutorials/turn-your-raspberry-pi-into-a-kodi-tv-box/',
    imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829e1?w=600&q=80&fit=crop',
  },
  {
    id: 'smart-home-esp32',
    title: 'Casa Inteligente com ESP32',
    platform: 'ESP32',
    difficulty: 'Difícil',
    duration: '5–8h',
    description: 'Controle luzes, ventilador e tomadas pelo celular via Wi-Fi usando o ESP32. Crie um servidor web embarcado e aprenda IoT de verdade.',
    materials: ['ESP32 DevKit', 'Módulo relé 4 canais', 'Sensor DHT22', 'LED stripe 12V', 'Fonte chaveada'],
    skills: ['Wi-Fi', 'Servidor HTTP', 'HTML/CSS básico', 'MQTT', 'JSON'],
    tutorialUrl: 'https://randomnerdtutorials.com/esp32-web-server-arduino-ide/',
    imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600&q=80&fit=crop',
  },
  {
    id: 'case-3d-arduino',
    title: 'Case 3D para Arduino',
    platform: '3D Print',
    difficulty: 'Fácil',
    duration: '2–3h',
    description: 'Projete e imprima uma case personalizada para seu Arduino usando o Tinkercad. Aprenda modelagem 3D básica e configure a impressora para o melhor resultado.',
    materials: ['Impressora 3D', 'Filamento PLA', 'Arduino UNO (para medir)', 'Paquímetro'],
    skills: ['Tinkercad', 'Modelagem 3D', 'Configuração impressora', 'Fatiamento'],
    tutorialUrl: 'https://www.tinkercad.com/things/hmK1dkXjzPD',
    imageUrl: 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=600&q=80&fit=crop',
  },
  {
    id: 'porta-canetas-3d',
    title: 'Porta-Canetas Customizado',
    platform: '3D Print',
    difficulty: 'Fácil',
    duration: '1–2h',
    description: 'Crie seu primeiro objeto 3D funcional: um porta-canetas com seu nome ou uma forma criativa. Aprenda as ferramentas básicas de modelagem 3D.',
    materials: ['Impressora 3D', 'Filamento PLA colorido', 'Faca de acabamento'],
    skills: ['Tinkercad ou Fusion 360', 'Extrusão', 'Formas básicas', 'Fatiamento Cura'],
    tutorialUrl: 'https://www.instructables.com/Custom-3D-Printed-Pen-Holder/',
    imageUrl: 'https://images.unsplash.com/photo-1599666505285-9af5e66d0ed7?w=600&q=80&fit=crop',
  },
];

const CHANNELS: Channel[] = [
  { name: 'Brincando com Ideias', url: 'https://www.youtube.com/@BrincandocomIdeias', lang: 'PT-BR', desc: 'Arduino, ESP32 e IoT para iniciantes com linguagem simples', focus: 'Arduino · ESP32 · IoT' },
  { name: 'FilipeFlop',           url: 'https://www.youtube.com/@filipeflop',         lang: 'PT-BR', desc: 'Tutoriais de Arduino, Raspberry Pi e eletrônica em PT-BR',  focus: 'Arduino · Raspberry Pi · Eletrônica' },
  { name: 'RoboCore',             url: 'https://www.youtube.com/@RoboCore',           lang: 'PT-BR', desc: 'Robótica educacional, Arduino e projetos maker para escolas', focus: 'Robótica · Arduino · Educação' },
  { name: 'Dronebot Workshop',    url: 'https://www.youtube.com/@dronebotworkshop',   lang: 'EN',    desc: 'Projetos detalhados com Arduino, RPi, sensores e robótica',  focus: 'Arduino · Robótica · Sensores' },
  { name: 'Paul McWhorter',       url: 'https://www.youtube.com/@paulmcwhorter',      lang: 'EN',    desc: 'Curso completo de Arduino e Raspberry Pi do zero, passo a passo', focus: 'Arduino · Raspberry Pi · Python' },
  { name: 'Hackster.io',          url: 'https://www.youtube.com/@HacksterProjects',   lang: 'EN',    desc: 'Projetos IoT, wearables e hardware da maior comunidade maker', focus: 'IoT · ESP32 · Wearables' },
];

const ONLINE_TOOLS: OnlineTool[] = [
  { name: 'Tinkercad',   url: 'https://www.tinkercad.com/',          desc: 'Simule circuitos e modele objetos 3D no browser', icon: Cpu,    color: '#F16529' },
  { name: 'MakeCode',    url: 'https://makecode.microbit.org/',       desc: 'Programação visual e Python para o micro:bit',    icon: Code2,  color: '#0075BF' },
  { name: 'Wokwi',       url: 'https://wokwi.com/',                  desc: 'Simulador online de Arduino e ESP32 em tempo real', icon: Zap,    color: '#1abc9c' },
  { name: 'Fritzing',    url: 'https://fritzing.org/',                desc: 'Desenhe esquemas de circuitos e PCBs',            icon: Layers, color: '#be3030' },
  { name: 'Arduino IDE', url: 'https://www.arduino.cc/en/software',  desc: 'IDE oficial para programar placas Arduino',       icon: Box,    color: '#00979D' },
  { name: 'PlatformIO',  url: 'https://platformio.org/',             desc: 'Ambiente profissional de desenvolvimento embarcado', icon: Globe,  color: '#FF7F00' },
];

/* ── Componentes internos ───────────────────────────────────────────────── */

const StripeDivider = () => (
  <div className="flex items-center gap-3 my-10">
    <div className="flex-1 h-5 rounded-lg" style={{ backgroundImage: STRIPE, opacity: 0.5 }} />
    <Settings
      className="text-yellow-400 shrink-0"
      style={{ width: 22, height: 22, animation: 'gear 5s linear infinite' }}
    />
    <div className="flex-1 h-5 rounded-lg" style={{ backgroundImage: STRIPE, opacity: 0.5 }} />
  </div>
);

const ProjectCard: React.FC<{ project: MakerProject; idx: number }> = ({ project, idx }) => {
  const [open, setOpen] = useState(false);
  const pc = PC[project.platform];
  const dc = DC[project.difficulty];
  const Icon = pc.icon;

  return (
    <article
      className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden flex flex-col group"
      style={{
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        border: `1px solid ${pc.hex}30`,
        borderTop: `4px solid ${pc.hex}`,
        animation: `fade-up 0.4s ease both`,
        animationDelay: `${idx * 60}ms`,
      }}
    >
      {/* Imagem */}
      <div className="relative h-52 overflow-hidden bg-slate-200 dark:bg-slate-700 shrink-0">
        <img
          src={project.imageUrl}
          alt={project.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

        {/* Badge plataforma */}
        <div
          className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black text-white shadow"
          style={{ background: pc.hex }}
        >
          <Icon className="w-3 h-3" />
          {project.platform}
        </div>

        {/* Tempo */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/50 text-white text-[10px] font-bold">
          <Wrench className="w-3 h-3" />
          {project.duration}
        </div>

        {/* Dificuldade */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <div className="flex gap-1">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="w-4 h-2 rounded-sm"
                style={{ background: i <= dc.level ? dc.hex : 'rgba(255,255,255,0.25)' }}
              />
            ))}
          </div>
          <span className="text-[10px] font-black text-white">{dc.label}</span>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 flex flex-col p-5">
        <h3 className="text-base font-black text-slate-800 dark:text-slate-100 leading-snug mb-2 group-hover:text-[var(--pc)] transition-colors"
          style={{ ['--pc' as string]: pc.hex }}>
          {project.title}
        </h3>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4 flex-1">
          {project.description}
        </p>

        <button
          onClick={() => setOpen(v => !v)}
          className="flex items-center gap-1 text-[11px] font-black mb-3 transition-opacity hover:opacity-80"
          style={{ color: pc.hex }}
        >
          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-90' : ''}`} />
          {open ? 'Ocultar detalhes' : 'Materiais e habilidades'}
        </button>

        {open && (
          <div className="mb-4 space-y-3 animate-fadeIn">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 mb-2">
                Materiais necessários
              </p>
              <div className="flex flex-wrap gap-1">
                {project.materials.map(m => (
                  <span
                    key={m}
                    className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: `${pc.hex}15`, color: pc.hex, border: `1px solid ${pc.hex}35` }}
                  >
                    <Package className="w-2.5 h-2.5 shrink-0" />
                    {m}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 mb-2">
                O que você aprende
              </p>
              <div className="flex flex-wrap gap-1">
                {project.skills.map(s => (
                  <span
                    key={s}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        <a
          href={project.tutorialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-white text-sm font-black hover:-translate-y-0.5 transition-all shadow-sm hover:shadow-md"
          style={{ background: `linear-gradient(135deg, ${pc.hex}ee, ${pc.hex}aa)` }}
        >
          <Hammer className="w-4 h-4" />
          Montar Projeto
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </article>
  );
};

/* ── Página ──────────────────────────────────────────────────────────────── */

interface MakerPageProps {
  onBackToHub: () => void;
  onOpenRoadmaps: () => void;
}

const MakerPage: React.FC<MakerPageProps> = ({ onBackToHub, onOpenRoadmaps }) => {
  const { isDark, toggleTheme } = useTheme();
  const [platform, setPlatform] = useState<Platform>('Todos');

  const filtered = platform === 'Todos'
    ? PROJECTS
    : PROJECTS.filter(p => p.platform === platform);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: isDark ? '#0d0d0d' : '#f2ece1' }}>

      {/* Keyframes */}
      <style>{`
        @keyframes gear      { from { transform: rotate(0deg);   } to { transform: rotate(360deg);  } }
        @keyframes gear-r    { from { transform: rotate(360deg); } to { transform: rotate(0deg);    } }
        @keyframes stripe-go { from { background-position: 0 0; } to { background-position: 64px 0;} }
        @keyframes fade-up   { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse-dot { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>

      {/* Faixa de segurança animada — topo */}
      <div style={{ height: 10, backgroundImage: STRIPE, animation: 'stripe-go 1.2s linear infinite' }} />

      <Header isDark={isDark} onToggleTheme={toggleTheme} onOpenRoadmaps={onOpenRoadmaps} />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ background: '#111008' }}>

        {/* Engrenagens decorativas */}
        <Settings
          className="absolute text-yellow-400 pointer-events-none"
          style={{ width: 260, height: 260, top: -60, right: -60, opacity: 0.07, animation: 'gear 25s linear infinite' }}
        />
        <Settings
          className="absolute text-orange-500 pointer-events-none"
          style={{ width: 160, height: 160, bottom: -40, left: -40, opacity: 0.06, animation: 'gear-r 18s linear infinite' }}
        />
        <Settings
          className="absolute text-yellow-300 pointer-events-none"
          style={{ width: 110, height: 110, top: '30%', left: '40%', opacity: 0.04, animation: 'gear 12s linear infinite' }}
        />
        <Settings
          className="absolute text-amber-400 pointer-events-none"
          style={{ width: 80, height: 80, bottom: '20%', right: '25%', opacity: 0.05, animation: 'gear-r 8s linear infinite' }}
        />

        {/* Faixa inferior dentro do hero */}
        <div
          className="absolute bottom-0 left-0 right-0 h-2 opacity-40"
          style={{ backgroundImage: STRIPE }}
        />

        <div className="relative z-10 max-w-[1200px] mx-auto px-4 md:px-8 py-12 md:py-20">

          {/* Voltar */}
          <button
            onClick={onBackToHub}
            className="flex items-center gap-2 mb-10 text-sm font-bold text-white/40 hover:text-yellow-400 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Voltar ao Hub
          </button>

          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 mb-6 px-4 py-2 rounded-full border border-yellow-400/30 bg-yellow-400/8">
            <div
              className="w-2 h-2 rounded-full bg-yellow-400"
              style={{ animation: 'pulse-dot 1.8s ease-in-out infinite' }}
            />
            <span className="text-xs font-black uppercase tracking-[0.25em] text-yellow-400">
              Cultura Maker
            </span>
          </div>

          {/* Título */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-5 leading-none tracking-tight">
            Construa.{' '}
            <span style={{ color: '#00979D' }}>Crie.</span>{' '}
            <br />
            <span style={{ color: '#FFD600' }}>Inove.</span>
          </h1>

          <p className="text-sm md:text-base text-white/50 max-w-lg mb-10 leading-relaxed">
            Projetos reais com Arduino, Raspberry Pi, micro:bit, ESP32 e impressão 3D.
            Aprenda construindo — tutoriais em vídeo, lista de materiais e tudo que você precisa.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap gap-8">
            {[
              { n: PROJECTS.length,      l: 'Projetos'         },
              { n: 5,                    l: 'Plataformas'       },
              { n: CHANNELS.length,      l: 'Canais'           },
              { n: ONLINE_TOOLS.length,  l: 'Ferramentas'      },
            ].map(s => (
              <div key={s.l}>
                <div className="text-3xl md:text-4xl font-black leading-none" style={{ color: '#FFD600' }}>{s.n}</div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTEÚDO PRINCIPAL ─────────────────────────────────────────────── */}
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 md:px-8 pb-16">

        {/* ── Filtro de plataformas ──────────────────────────────────────── */}
        <div className="py-8 flex flex-wrap gap-2">
          {PLATFORMS.map(pl => {
            const active = platform === pl;
            const conf = pl !== 'Todos' ? PC[pl] : null;
            const Icon = conf ? conf.icon : Wrench;
            const count = pl === 'Todos'
              ? PROJECTS.length
              : PROJECTS.filter(p => p.platform === pl).length;

            return (
              <button
                key={pl}
                onClick={() => setPlatform(pl)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: active
                    ? (conf ? `${conf.hex}22` : (isDark ? '#334155' : '#1e293b22'))
                    : (isDark ? '#1e293b' : '#ffffff'),
                  color: active
                    ? (conf?.hex ?? (isDark ? '#f8fafc' : '#0f172a'))
                    : (isDark ? '#94a3b8' : '#64748b'),
                  border: `2px solid ${active ? (conf?.hex ?? '#475569') : (isDark ? '#334155' : '#e2e8f0')}`,
                  boxShadow: active ? `0 0 0 4px ${conf?.hex ?? '#47556920'}` : 'none',
                }}
              >
                <Icon className="w-4 h-4" />
                {pl}
                <span
                  className="text-[10px] font-black px-1.5 py-0.5 rounded-full"
                  style={{
                    background: active
                      ? (conf ? `${conf.hex}30` : '#47556930')
                      : (isDark ? '#334155' : '#f1f5f9'),
                    color: active ? (conf?.hex ?? '#475569') : (isDark ? '#94a3b8' : '#64748b'),
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Grid de projetos ─────────────────────────────────────────────── */}
        <section className="mb-4">
          <div className="flex items-center gap-3 mb-6">
            <div
              className="flex items-center justify-center w-9 h-9 rounded-xl text-white shrink-0"
              style={{ background: '#E65100' }}
            >
              <Hammer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">
                {platform === 'Todos' ? 'Todos os Projetos' : `Projetos: ${platform}`}
                <span className="text-sm font-bold text-slate-400 ml-2">({filtered.length})</span>
              </h2>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">
                Construa, aprenda, repita
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((p, i) => <ProjectCard key={p.id} project={p} idx={i} />)}
          </div>
        </section>

        <StripeDivider />

        {/* ── Canais do YouTube ─────────────────────────────────────────────── */}
        <section className="mb-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl text-white shrink-0 bg-red-600">
              <PlayCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">Canais para Assistir</h2>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">
                Aprenda com quem já faz
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CHANNELS.map(ch => (
              <a
                key={ch.url}
                href={ch.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex gap-4 bg-white dark:bg-slate-800 rounded-2xl p-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                style={{ border: '1px solid rgba(239,68,68,0.2)', borderLeft: '4px solid #dc2626' }}
              >
                <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 flex items-center justify-center shrink-0">
                  <PlayCircle className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-black text-slate-800 dark:text-slate-100 truncate">{ch.name}</span>
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase shrink-0 ${
                      ch.lang === 'PT-BR'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                    }`}>
                      {ch.lang}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight mb-1.5">{ch.desc}</p>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">{ch.focus}</p>
                </div>
              </a>
            ))}
          </div>
        </section>

        <StripeDivider />

        {/* ── Ferramentas Online ─────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div
              className="flex items-center justify-center w-9 h-9 rounded-xl text-white shrink-0"
              style={{ background: '#00979D' }}
            >
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">Ferramentas Online</h2>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">
                Use no browser — sem instalar nada
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ONLINE_TOOLS.map(tool => {
              const Icon = tool.icon;
              return (
                <a
                  key={tool.url}
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 bg-white dark:bg-slate-800 rounded-2xl p-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                  style={{ border: `1px solid ${tool.color}25`, borderLeft: `4px solid ${tool.color}` }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${tool.color}15` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: tool.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-black text-slate-800 dark:text-slate-100 mb-0.5">{tool.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 leading-snug">{tool.desc}</div>
                  </div>
                  <ExternalLink
                    className="w-4 h-4 shrink-0 transition-colors text-slate-300 dark:text-slate-600 group-hover:text-ctrl-orange"
                  />
                </a>
              );
            })}
          </div>
        </section>

      </main>

      {/* Faixa de segurança animada — fundo */}
      <div style={{ height: 10, backgroundImage: STRIPE, animation: 'stripe-go 1.2s linear infinite reverse' }} />

      <Footer />
    </div>
  );
};

export default MakerPage;
