import React, { useState } from 'react';
import {
  ArrowLeft, Cpu, ExternalLink, PlayCircle, Wrench,
  ChevronRight, Layers, Zap, Box, Wifi, Code2, Globe,
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

interface PlayCircleChannel {
  name: string;
  handle: string;
  url: string;
  lang: 'PT-BR' | 'EN';
  desc: string;
  focus: string;
  avatar: string;
}

interface OnlineTool {
  name: string;
  url: string;
  desc: string;
  icon: React.ElementType;
  color: string;
}

/* ── Dados ──────────────────────────────────────────────────────────────── */

const PROJECTS: MakerProject[] = [
  {
    id: 'semaforo-arduino',
    title: 'Semáforo Inteligente',
    platform: 'Arduino',
    difficulty: 'Fácil',
    duration: '1-2h',
    description: 'Construa um semáforo funcional com LEDs RGB e Arduino UNO. Aprenda lógica de temporização e controle de saídas digitais — projeto perfeito para quem está começando.',
    materials: ['Arduino UNO', 'LED vermelho, amarelo e verde', 'Resistores 220Ω', 'Protoboard', 'Cabos jumper'],
    skills: ['Saídas digitais', 'delay()', 'Controle de LEDs'],
    tutorialUrl: 'https://www.instructables.com/Arduino-Traffic-Light-Controller/',
    imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&q=80&fit=crop',
  },
  {
    id: 'estacao-meteorologica',
    title: 'Estação Meteorológica',
    platform: 'Arduino',
    difficulty: 'Médio',
    duration: '3-4h',
    description: 'Monitore temperatura e umidade em tempo real com sensor DHT11 e exiba os dados em um display LCD. Aprenda a ler sensores analógicos e usar bibliotecas externas.',
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
    duration: '4-6h',
    description: 'Monte um robô que segue uma linha preta no chão usando sensores infravermelhos. Um projeto clássico que ensina robótica, controle de motores e lógica de decisão.',
    materials: ['Arduino UNO', '2x Motor DC + chassi', 'Módulo L298N', 'Sensores IR (TCRT5000)', 'Bateria 9V'],
    skills: ['Controle de motores', 'Sensores IR', 'Lógica de decisão', 'PWM'],
    tutorialUrl: 'https://www.instructables.com/Line-Follower-Robot-Using-Arduino/',
    imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&q=80&fit=crop',
  },
  {
    id: 'irrigacao-automatica',
    title: 'Irrigação Automática de Plantas',
    platform: 'Arduino',
    difficulty: 'Médio',
    duration: '3-4h',
    description: 'Sistema inteligente que rega suas plantas automaticamente quando o solo está seco. Aprenda a usar sensores de umidade de solo e controlar uma mini bomba d\'água.',
    materials: ['Arduino UNO', 'Sensor de umidade de solo', 'Mini bomba d\'água 5V', 'Relé 5V', 'Mangueira'],
    skills: ['Leitura analógica', 'Relé', 'Automação', 'Sensores'],
    tutorialUrl: 'https://www.instructables.com/Arduino-Plant-Watering-System/',
    imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80&fit=crop',
  },
  {
    id: 'snake-microbit',
    title: 'Jogo Snake no micro:bit',
    platform: 'micro:bit',
    difficulty: 'Fácil',
    duration: '1h',
    description: 'Programe o clássico jogo da cobrinha na matriz de LEDs 5×5 do micro:bit usando o editor MakeCode. Aprenda laços, condicionais e uso dos acelerômetros.',
    materials: ['micro:bit v2', 'Cabo USB', 'Computador'],
    skills: ['MakeCode', 'Matrizes de LED', 'Lógica de jogo', 'Acelerômetro'],
    tutorialUrl: 'https://microbit.org/projects/make-it-code-it/snake/',
    imageUrl: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=600&q=80&fit=crop',
  },
  {
    id: 'termometro-microbit',
    title: 'Termômetro micro:bit',
    platform: 'micro:bit',
    difficulty: 'Fácil',
    duration: '30min',
    description: 'Use o sensor de temperatura interno do micro:bit para criar um termômetro que exibe a temperatura na matriz de LEDs e toca alertas quando está muito quente ou frio.',
    materials: ['micro:bit v2', 'Cabo USB'],
    skills: ['Sensor de temperatura', 'MakeCode/Python', 'Condicionais', 'LED matrix'],
    tutorialUrl: 'https://makecode.microbit.org/projects/temperature',
    imageUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80&fit=crop',
  },
  {
    id: 'camera-seguranca-rpi',
    title: 'Câmera de Segurança com IA',
    platform: 'Raspberry Pi',
    difficulty: 'Difícil',
    duration: '6-8h',
    description: 'Monte uma câmera de segurança com detecção de movimento usando OpenCV e Raspberry Pi. Receba alertas por e-mail quando movimento for detectado.',
    materials: ['Raspberry Pi 4', 'Câmera Pi ou USB', 'Cartão microSD 32GB', 'Fonte 5V 3A'],
    skills: ['Python', 'OpenCV', 'Linux', 'Redes', 'API de e-mail'],
    tutorialUrl: 'https://www.hackster.io/mjrobot/real-time-face-recognition-an-end-to-end-project-a10826',
    imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&q=80&fit=crop',
  },
  {
    id: 'smart-home-esp32',
    title: 'Casa Inteligente com ESP32',
    platform: 'ESP32',
    difficulty: 'Difícil',
    duration: '5-8h',
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
    duration: '2-3h',
    description: 'Projete e imprima uma case personalizada para seu Arduino usando o Tinkercad. Aprenda modelagem 3D básica e configure a impressora para o melhor resultado.',
    materials: ['Impressora 3D', 'Filamento PLA', 'Arduino UNO (para medir)', 'Paquímetro'],
    skills: ['Tinkercad', 'Modelagem 3D', 'Configuração de impressora', 'Fatiamento'],
    tutorialUrl: 'https://www.tinkercad.com/things/hmK1dkXjzPD',
    imageUrl: 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=600&q=80&fit=crop',
  },
  {
    id: 'porta-canetas-3d',
    title: 'Porta-Canetas Customizado',
    platform: '3D Print',
    difficulty: 'Fácil',
    duration: '1-2h',
    description: 'Crie seu primeiro objeto 3D funcional: um porta-canetas com seu nome ou uma forma criativa. Perfeito para aprender as ferramentas básicas de modelagem 3D.',
    materials: ['Impressora 3D', 'Filamento PLA colorido', 'Faca de acabamento'],
    skills: ['Tinkercad ou Fusion 360', 'Extrusão', 'Formas básicas', 'Fatiamento Cura'],
    tutorialUrl: 'https://www.instructables.com/Custom-3D-Printed-Pen-Holder/',
    imageUrl: 'https://images.unsplash.com/photo-1599666505285-9af5e66d0ed7?w=600&q=80&fit=crop',
  },
  {
    id: 'piano-arduino',
    title: 'Piano com Sensores de Toque',
    platform: 'Arduino',
    difficulty: 'Fácil',
    duration: '2h',
    description: 'Construa um piano de 8 notas com folhas de alumínio como teclas e um buzzer piezoeléctrico. Um projeto criativo que mistura música, eletrônica e código.',
    materials: ['Arduino UNO', 'Buzzer piezoeléctrico', 'Folha de alumínio', 'Resistores 1MΩ', 'Cabos'],
    skills: ['tone()', 'Entradas analógicas', 'Arrays', 'Sensores de capacitância'],
    tutorialUrl: 'https://www.instructables.com/Touche-for-Arduino-Advanced-Touch-Sensing/',
    imageUrl: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=600&q=80&fit=crop',
  },
  {
    id: 'media-center-rpi',
    title: 'Media Center com Raspberry Pi',
    platform: 'Raspberry Pi',
    difficulty: 'Médio',
    duration: '2-3h',
    description: 'Transforme uma TV velha em um Smart TV completo com Kodi. Acesse Netflix, YouTube, filmes locais e streaming — tudo com um Raspberry Pi e um controle remoto.',
    materials: ['Raspberry Pi 4 (2GB)', 'Cartão microSD 32GB', 'Cabo HDMI', 'Teclado/Mouse ou controle USB'],
    skills: ['Linux', 'Kodi', 'Configuração de sistema', 'Redes'],
    tutorialUrl: 'https://www.raspberrypi.com/tutorials/turn-your-raspberry-pi-into-a-kodi-tv-box/',
    imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829e1?w=600&q=80&fit=crop',
  },
];

const CHANNELS: PlayCircleChannel[] = [
  {
    name: 'Brincando com Ideias',
    handle: '@BrincandocomIdeias',
    url: 'https://www.youtube.com/@BrincandocomIdeias',
    lang: 'PT-BR',
    desc: 'Arduino, ESP32 e projetos maker para iniciantes com linguagem simples',
    focus: 'Arduino · ESP32 · IoT',
    avatar: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=128',
  },
  {
    name: 'FilipeFlop',
    handle: '@filipeflop',
    url: 'https://www.youtube.com/@filipeflop',
    lang: 'PT-BR',
    desc: 'Tutoriais de Arduino, Raspberry Pi e componentes eletrônicos em PT-BR',
    focus: 'Arduino · Raspberry Pi · Eletrônica',
    avatar: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=128',
  },
  {
    name: 'Dronebot Workshop',
    handle: '@dronebotworkshop',
    url: 'https://www.youtube.com/@dronebotworkshop',
    lang: 'EN',
    desc: 'Projetos detalhados com Arduino, Raspberry Pi, sensores e robótica',
    focus: 'Arduino · Robótica · Sensores',
    avatar: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=128',
  },
  {
    name: 'Paul McWhorter',
    handle: '@paulmcwhorter',
    url: 'https://www.youtube.com/@paulmcwhorter',
    lang: 'EN',
    desc: 'Curso completo de Arduino e Raspberry Pi do zero, passo a passo',
    focus: 'Arduino · Raspberry Pi · Python',
    avatar: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=128',
  },
  {
    name: 'RoboCore',
    handle: '@RoboCore',
    url: 'https://www.youtube.com/@RoboCore',
    lang: 'PT-BR',
    desc: 'Robótica educacional, Arduino e projetos maker para escolas',
    focus: 'Robótica · Arduino · Educação',
    avatar: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=128',
  },
  {
    name: 'Hackster.io',
    handle: '@HacksterProjects',
    url: 'https://www.youtube.com/@HacksterProjects',
    lang: 'EN',
    desc: 'Projetos IoT, wearables e hardware da maior comunidade maker',
    focus: 'IoT · ESP32 · Wearables',
    avatar: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=128',
  },
];

const ONLINE_TOOLS: OnlineTool[] = [
  { name: 'Tinkercad',    url: 'https://www.tinkercad.com/',            desc: 'Simule circuitos e modele objetos 3D no browser',       icon: Cpu,    color: '#F16529' },
  { name: 'MakeCode',     url: 'https://makecode.microbit.org/',         desc: 'Programação visual e Python para o micro:bit',         icon: Code2,  color: '#0075BF' },
  { name: 'Wokwi',        url: 'https://wokwi.com/',                    desc: 'Simulador online de Arduino e ESP32 com código real',  icon: Zap,    color: '#1abc9c' },
  { name: 'Fritzing',     url: 'https://fritzing.org/',                  desc: 'Desenhe esquemas de circuitos e PCBs',                 icon: Layers, color: '#be3030' },
  { name: 'Arduino IDE',  url: 'https://www.arduino.cc/en/software',    desc: 'IDE oficial para programar placas Arduino',            icon: Box,    color: '#00979D' },
  { name: 'PlatformIO',   url: 'https://platformio.org/',               desc: 'Ambiente profissional de desenvolvimento embarcado',   icon: Globe,  color: '#FF7F00' },
];

/* ── Helpers ────────────────────────────────────────────────────────────── */

const PLATFORM_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Arduino':       { bg: 'bg-teal-50 dark:bg-teal-900/30',   text: 'text-teal-700 dark:text-teal-300',   border: 'border-teal-200 dark:border-teal-700' },
  'Raspberry Pi':  { bg: 'bg-red-50 dark:bg-red-900/30',     text: 'text-red-700 dark:text-red-300',     border: 'border-red-200 dark:border-red-700'   },
  'micro:bit':     { bg: 'bg-blue-50 dark:bg-blue-900/30',   text: 'text-blue-700 dark:text-blue-300',   border: 'border-blue-200 dark:border-blue-700' },
  'ESP32':         { bg: 'bg-purple-50 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-700' },
  '3D Print':      { bg: 'bg-orange-50 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-700' },
};

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  'Fácil':  'text-emerald-600 dark:text-emerald-400',
  'Médio':  'text-amber-600 dark:text-amber-400',
  'Difícil': 'text-rose-600 dark:text-rose-400',
};

const DIFFICULTY_DOTS: Record<Difficulty, number> = { 'Fácil': 1, 'Médio': 2, 'Difícil': 3 };

const PLATFORM_ICONS: Record<string, React.ElementType> = {
  'Arduino': Cpu, 'Raspberry Pi': Wifi, 'micro:bit': Zap, 'ESP32': Globe, '3D Print': Box,
};

const PLATFORMS: Platform[] = ['Todos', 'Arduino', 'Raspberry Pi', 'micro:bit', 'ESP32', '3D Print'];

/* ── Componentes internos ───────────────────────────────────────────────── */

const ProjectCard: React.FC<{ project: MakerProject }> = ({ project }) => {
  const [expanded, setExpanded] = useState(false);
  const pc = PLATFORM_COLORS[project.platform];
  const PlatformIcon = PLATFORM_ICONS[project.platform] ?? Cpu;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group">

      {/* Imagem */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={project.imageUrl}
          alt={project.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Platform badge */}
        <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-black ${pc.bg} ${pc.text} ${pc.border}`}>
          <PlatformIcon className="w-3 h-3" />
          {project.platform}
        </div>

        {/* Difficulty */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${i < DIFFICULTY_DOTS[project.difficulty] ? 'bg-white' : 'bg-white/30'}`}
            />
          ))}
          <span className="text-[10px] font-black text-white ml-1">{project.difficulty}</span>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 flex flex-col p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-base font-black text-slate-800 dark:text-slate-100 leading-tight">
            {project.title}
          </h3>
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 shrink-0 flex items-center gap-1">
            <Wrench className="w-3 h-3" />
            {project.duration}
          </span>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4 flex-1">
          {project.description}
        </p>

        {/* Materiais toggle */}
        <button
          onClick={() => setExpanded(v => !v)}
          className="flex items-center gap-1 text-xs font-black text-ctrl-blue dark:text-blue-400 mb-3 hover:text-ctrl-orange transition-colors"
        >
          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-90' : ''}`} />
          {expanded ? 'Ocultar detalhes' : 'Ver materiais e habilidades'}
        </button>

        {expanded && (
          <div className="mb-4 space-y-3 animate-fadeIn">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">Materiais</p>
              <div className="flex flex-wrap gap-1">
                {project.materials.map(m => (
                  <span key={m} className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
                    {m}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">O que você aprende</p>
              <div className="flex flex-wrap gap-1">
                {project.skills.map(s => (
                  <span key={s} className="text-[11px] px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 font-medium border border-teal-100 dark:border-teal-800">
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
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-ctrl-blue to-ctrl-orange text-white text-sm font-black hover:opacity-90 hover:-translate-y-0.5 transition-all shadow-sm hover:shadow-md"
        >
          Ver Tutorial Completo
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
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
    <div className="min-h-screen flex flex-col transition-colors duration-300"
      style={{ background: isDark ? '#0f172a' : '#f8f4ef' }}>

      <Header isDark={isDark} onToggleTheme={toggleTheme} onOpenRoadmaps={onOpenRoadmaps} />

      {/* ── Safety-stripe hero ─────────────────────────────────────────── */}
      <div
        className="w-full py-1"
        style={{ backgroundImage: 'repeating-linear-gradient(-45deg, #FFD600 0, #FFD600 18px, #1a1a1a 18px, #1a1a1a 36px)' }}
      />

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 md:px-8 pb-14">

        {/* Voltar */}
        <div className="py-6">
          <button
            onClick={onBackToHub}
            className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-ctrl-blue dark:hover:text-blue-400 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Voltar ao Hub
          </button>
        </div>

        {/* Hero card */}
        <div className="relative rounded-3xl overflow-hidden mb-10 border-2 border-yellow-400 shadow-xl"
          style={{ background: isDark ? '#1e293b' : '#fffbeb' }}>

          {/* Corner stripes decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 opacity-20"
            style={{ backgroundImage: 'repeating-linear-gradient(-45deg, #FFD600 0, #FFD600 8px, transparent 8px, transparent 16px)' }} />

          <div className="relative z-10 px-8 py-10 md:py-14 max-w-3xl">
            <div className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full border-2 border-yellow-400 bg-yellow-400/20">
              <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-widest text-yellow-700 dark:text-yellow-300">
                Cultura Maker
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-slate-100 mb-4 leading-tight">
              Construa.{' '}
              <span style={{ color: '#00979D' }}>Crie.</span>{' '}
              <span className="text-ctrl-orange">Inove.</span>
            </h1>

            <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed mb-6">
              Projetos reais com Arduino, Raspberry Pi, micro:bit e impressão 3D.
              Aprenda construindo — tutoriais em vídeo, lista de materiais e tudo que você precisa para tirar sua ideia do papel.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-6">
              {[
                { label: 'Projetos',     value: PROJECTS.length },
                { label: 'Plataformas',  value: 5 },
                { label: 'Canais',       value: CHANNELS.length },
                { label: 'Ferramentas',  value: ONLINE_TOOLS.length },
              ].map(s => (
                <div key={s.label}>
                  <div className="text-2xl font-black text-ctrl-orange">{s.value}</div>
                  <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Filtro de plataforma ─────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2 mb-8">
          {PLATFORMS.map(pl => {
            const active = platform === pl;
            const Icon = pl !== 'Todos' ? PLATFORM_ICONS[pl] : Wrench;
            return (
              <button
                key={pl}
                onClick={() => setPlatform(pl)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-black border-2 transition-all ${
                  active
                    ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 border-slate-800 dark:border-slate-200 shadow-md'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:border-slate-400 hover:-translate-y-0.5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {pl}
                {pl !== 'Todos' && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                    active ? 'bg-white/20 text-white dark:text-slate-900 dark:bg-black/20' : 'bg-gray-100 dark:bg-slate-700 text-slate-500'
                  }`}>
                    {PROJECTS.filter(p => p.platform === pl).length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Grid de projetos ─────────────────────────────────────────── */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 rounded-full bg-ctrl-orange" />
            <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">
              {platform === 'Todos' ? 'Todos os Projetos' : `Projetos com ${platform}`}
            </h2>
            <span className="text-sm font-bold text-slate-400">({filtered.length})</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map(p => <ProjectCard key={p.id} project={p} />)}
          </div>
        </section>

        {/* Safety stripe divider */}
        <div
          className="w-full h-3 rounded-full mb-10 opacity-60"
          style={{ backgroundImage: 'repeating-linear-gradient(-45deg, #FFD600 0, #FFD600 8px, #1a1a1a 8px, #1a1a1a 16px)' }}
        />

        {/* ── Canais do YouTube ────────────────────────────────────────── */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 rounded-full" style={{ background: '#FF0000' }} />
            <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <PlayCircle className="w-5 h-5" style={{ color: '#FF0000' }} />
              Canais para Assistir
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CHANNELS.map(ch => (
              <a
                key={ch.url}
                href={ch.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex gap-4 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 flex items-center justify-center shrink-0">
                  <PlayCircle className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-black text-slate-800 dark:text-slate-100 truncate">{ch.name}</span>
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase shrink-0 ${
                      ch.lang === 'PT-BR'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                    }`}>
                      {ch.lang}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight mb-1">{ch.desc}</p>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500">{ch.focus}</p>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Safety stripe divider */}
        <div
          className="w-full h-3 rounded-full mb-10 opacity-60"
          style={{ backgroundImage: 'repeating-linear-gradient(-45deg, #FFD600 0, #FFD600 8px, #1a1a1a 8px, #1a1a1a 16px)' }}
        />

        {/* ── Ferramentas Online ───────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 rounded-full bg-teal-500" />
            <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">
              Ferramentas Online
            </h2>
            <span className="text-xs text-slate-400 font-medium">— use no browser, sem instalar nada</span>
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
                  className="group flex items-center gap-4 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${tool.color}18`, border: `1px solid ${tool.color}30` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: tool.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-black text-slate-800 dark:text-slate-100 mb-0.5">{tool.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 leading-tight">{tool.desc}</div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-ctrl-orange transition-colors shrink-0" />
                </a>
              );
            })}
          </div>
        </section>

      </main>

      {/* Safety stripe footer band */}
      <div
        className="w-full py-1"
        style={{ backgroundImage: 'repeating-linear-gradient(-45deg, #FFD600 0, #FFD600 18px, #1a1a1a 18px, #1a1a1a 36px)' }}
      />

      <Footer />
    </div>
  );
};

export default MakerPage;
