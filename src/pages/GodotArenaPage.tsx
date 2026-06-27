import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronLeft, Play, Users, Trophy, Clock, CheckCircle, XCircle,
  Copy, Check, RotateCcw, Crown, Star, User, LogIn, Zap, Shield,
  Code2, Gamepad2, Network, Film, Box, ChevronDown, ChevronUp,
} from 'lucide-react';
import { db } from '../lib/firebase';
import { ref, set, update as dbUpdate, onValue, get } from 'firebase/database';
import { gameTheme } from '../lib/gameTheme';
import { useGameState } from '../hooks/useGameState';

/* ── Constants ─────────────────────────────────────────────────────────── */
const QUESTION_TIME = 25;
const REVIEW_TIME   = 5;
const TOTAL_Q       = 10;
const FB_PATH       = 'godot_arena';

/* ── Animations ─────────────────────────────────────────────────────────── */
const ANIM = `
  @keyframes gaIn    { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
  @keyframes gaPop   { 0%{opacity:0;transform:scale(.7)} 60%{transform:scale(1.07)} 100%{opacity:1;transform:scale(1)} }
  @keyframes gaRight { 0%,100%{box-shadow:0 0 0 2px #22c55e} 50%{box-shadow:0 0 0 6px #22c55e44,0 0 24px #22c55e55} }
  @keyframes gaWrong { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-5px)} 60%{transform:translateX(5px)} }
  @keyframes gaPulse { 0%,100%{opacity:1} 50%{opacity:0.55} }
  @keyframes gaCrown { 0%{transform:rotate(-15deg)scale(0)} 60%{transform:rotate(5deg)scale(1.1)} 100%{transform:rotate(0)scale(1)} }
`;

/* ── Godot Logo ─────────────────────────────────────────────────────────── */
const GodotLogo = ({ size = 40 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 400 400" fill="none">
    <circle cx="200" cy="200" r="195" fill="#478cbf"/>
    <ellipse cx="200" cy="185" rx="80" ry="75" fill="white" opacity="0.97"/>
    <ellipse cx="200" cy="185" rx="55" ry="50" fill="#478cbf"/>
    <circle cx="175" cy="168" r="14" fill="white"/>
    <circle cx="225" cy="168" r="14" fill="white"/>
    <circle cx="178" cy="170" r="5" fill="#1a1a2e"/>
    <circle cx="228" cy="170" r="5" fill="#1a1a2e"/>
    <path d="M160 240 Q200 275 240 240 L245 265 Q200 305 155 265Z" fill="white" opacity="0.95"/>
    <path d="M120 195 L140 185 L145 210 L125 215Z" fill="white" opacity="0.9"/>
    <path d="M280 195 L260 185 L255 210 L275 215Z" fill="white" opacity="0.9"/>
  </svg>
);

/* ── Types ──────────────────────────────────────────────────────────────── */
type Diff     = 'facil' | 'medio' | 'dificil';
type Category = 'gdscript' | 'gamedesign' | 'nos' | 'animacao' | 'fisica' | 'estrutura';

interface Question {
  id: number;
  cat: Category;
  diff: Diff;
  topic: string;
  q: string;
  code?: string;
  opts: string[];
  ans: number;
  exp: string;
}

interface CatCfg {
  label: string;
  desc: string;
  color: string;
  icon: React.ReactNode;
}

const CAT_CFG: Record<Category, CatCfg> = {
  gdscript:   { label: 'GDScript',     desc: 'Programação com GDScript', color: '#478cbf', icon: <Code2 size={20}/> },
  gamedesign: { label: 'Game Design',  desc: 'Conceitos de design de jogos', color: '#a855f7', icon: <Gamepad2 size={20}/> },
  nos:        { label: 'Nós e Cenas',  desc: 'Qual nó usar e quando', color: '#22c55e', icon: <Network size={20}/> },
  animacao:   { label: 'Animação',     desc: 'AnimationPlayer, Tween e mais', color: '#f59e0b', icon: <Film size={20}/> },
  fisica:     { label: 'Física',       desc: 'Corpos físicos e colisões', color: '#ef4444', icon: <Zap size={20}/> },
  estrutura:  { label: 'Estrutura 3D', desc: 'CSG, Mesh, GridMap e cenas', color: '#06b6d4', icon: <Box size={20}/> },
};

/* ── Question Bank ──────────────────────────────────────────────────────── */
const QUESTIONS: Question[] = [

  /* ══ GDSCRIPT ══════════════════════════════════════════════════════════ */
  { id:1,  cat:'gdscript', diff:'facil',   topic:'Variáveis',
    q:'Como declarar uma variável "vida" com valor 100?',
    opts:['var vida = 100','int vida = 100','variable vida = 100','let vida = 100'], ans:0,
    exp:'Em GDScript usamos "var". O tipo é inferido automaticamente.' },
  { id:2,  cat:'gdscript', diff:'facil',   topic:'print()',
    q:'Qual é a saída?', code:'print(2 + 3)',
    opts:['5','23','"2 + 3"','Erro'], ans:0,
    exp:'print() exibe o resultado da expressão. 2+3=5.' },
  { id:3,  cat:'gdscript', diff:'facil',   topic:'Strings',
    q:'Qual é a saída?', code:'print("Olá " + "mundo")',
    opts:['Olá mundo','Erro de tipo','"Olá mundo"','OláMundo'], ans:0,
    exp:'O + concatena strings em GDScript.' },
  { id:4,  cat:'gdscript', diff:'facil',   topic:'Funções',
    q:'Como definir uma função "pular" em GDScript?',
    opts:['func pular():','function pular() {','def pular():','void pular() {'], ans:0,
    exp:'GDScript usa "func". O bloco começa após os dois pontos.' },
  { id:5,  cat:'gdscript', diff:'facil',   topic:'if/else',
    q:'O que exibe quando vida = 0?', code:'if vida > 0:\n    print("Vivo!")\nelse:\n    print("Game Over!")',
    opts:['Game Over!','Vivo!','Nada','Erro'], ans:0,
    exp:'vida=0 não é > 0, então o else executa: "Game Over!".' },
  { id:6,  cat:'gdscript', diff:'facil',   topic:'for',
    q:'Quantas vezes "oi" é impresso?', code:'for i in range(5):\n    print("oi")',
    opts:['5 vezes','4 vezes','6 vezes','1 vez'], ans:0,
    exp:'range(5)=[0,1,2,3,4] — 5 valores. O loop roda uma vez para cada.' },
  { id:7,  cat:'gdscript', diff:'facil',   topic:'Booleanos',
    q:'Qual é o valor de "true and false"?',
    opts:['false','true','0','Erro'], ans:0,
    exp:'"and" retorna true só se AMBOS forem true. Um é false → false.' },
  { id:8,  cat:'gdscript', diff:'facil',   topic:'Arrays',
    q:'Como criar um array com 1, 2 e 3?',
    opts:['var arr = [1, 2, 3]','var arr = (1, 2, 3)','var arr = {1, 2, 3}','array arr = [1,2,3]'], ans:0,
    exp:'Arrays usam colchetes [ ] e são declarados com var.' },
  { id:9,  cat:'gdscript', diff:'facil',   topic:'Comentários',
    q:'Como escrever um comentário em GDScript?',
    opts:['# Comentário','// Comentário','/* Comentário */','-- Comentário'], ans:0,
    exp:'O # inicia um comentário. Tudo depois na linha é ignorado.' },
  { id:10, cat:'gdscript', diff:'facil',   topic:'Operadores',
    q:'Qual a saída?', code:'var x = 10\nprint(x * 2)',
    opts:['20','10','x * 2','Erro'], ans:0,
    exp:'x=10, 10*2=20.' },
  { id:11, cat:'gdscript', diff:'medio',   topic:'len()',
    q:'Qual a saída?', code:'var f = ["maçã","banana","uva"]\nprint(len(f))',
    opts:['3','2','0','Erro'], ans:0,
    exp:'len() retorna o número de elementos. O array tem 3.' },
  { id:12, cat:'gdscript', diff:'medio',   topic:'range()',
    q:'Qual é o resultado de range(4)?',
    opts:['[0, 1, 2, 3]','[1, 2, 3, 4]','[0, 1, 2, 3, 4]','[4]'], ans:0,
    exp:'range(n) gera de 0 até n-1.' },
  { id:13, cat:'gdscript', diff:'medio',   topic:'Sinais',
    q:'O que "signal pulou" faz?',
    opts:['Declara um sinal chamado pulou','Emite o sinal pulou imediatamente','Conecta o sinal a uma função','Remove o sinal'], ans:0,
    exp:'"signal" declara. Para emitir: pulou.emit() (Godot 4).' },
  { id:14, cat:'gdscript', diff:'medio',   topic:'@export',
    q:'Qual a diferença entre "var vida" e "@export var vida"?',
    opts:['@export mostra no Inspetor do Godot','@export é mais rápida','@export salva automaticamente','Não há diferença'], ans:0,
    exp:'@export expõe a variável no Inspetor para editar sem código.' },
  { id:15, cat:'gdscript', diff:'medio',   topic:'Depuração',
    q:'Qual o erro nesse código?', code:'func _ready()\n    print("Iniciou!")',
    opts:['Falta ":" após _ready()','print usa aspas erradas','_ready é escrito errado','Não há erro'], ans:0,
    exp:'Funções precisam de dois pontos: func _ready():' },
  { id:16, cat:'gdscript', diff:'medio',   topic:'while',
    q:'Qual a saída?', code:'var i = 0\nwhile i < 3:\n    print(i)\n    i += 1',
    opts:['0  1  2','1  2  3','0  1  2  3','Loop infinito'], ans:0,
    exp:'i=0, incrementa até i=3. Imprime 0,1,2 e para.' },
  { id:17, cat:'gdscript', diff:'medio',   topic:'Dicionários',
    q:'Como acessar "Ana" nesse dicionário?', code:'var j = {"nome":"Ana","vida":100}',
    opts:['j["nome"]','j.get(0)','j[0]','j.nome()'], ans:0,
    exp:'Dicionários são acessados pela chave: j["nome"]="Ana".' },
  { id:18, cat:'gdscript', diff:'dificil', topic:'@onready',
    q:'O que "@onready var sprite = $Sprite2D" garante?',
    opts:['Atribuição só após a cena estar pronta','Cria o Sprite2D automaticamente','Exporta para o Inspetor','sprite fica null até ser atribuído manualmente'], ans:0,
    exp:'@onready faz a atribuição em _ready(), garantindo que os nós existem.' },
  { id:19, cat:'gdscript', diff:'dificil', topic:'delta',
    q:'Para que serve "delta" em _process(delta)?',
    opts:['Tempo desde o último frame','Velocidade do personagem','Posição do mouse','Número do frame atual'], ans:0,
    exp:'Multiplicar por delta garante movimento igual em qualquer FPS.' },
  { id:20, cat:'gdscript', diff:'dificil', topic:'Arrays',
    q:'Qual a saída?', code:'var arr = [10, 20, 30]\nprint(arr[1])',
    opts:['20','10','30','Erro'], ans:0,
    exp:'Arrays começam no índice 0: arr[0]=10, arr[1]=20.' },
  { id:21, cat:'gdscript', diff:'dificil', topic:'match',
    q:'Qual palavra-chave substitui "switch" em GDScript?',
    opts:['match','switch','case','select'], ans:0,
    exp:'GDScript usa "match" como estrutura de múltipla escolha.' },
  { id:22, cat:'gdscript', diff:'dificil', topic:'Funções com retorno',
    q:'Qual a saída?', code:'func dobrar(n):\n    return n * 2\n\nprint(dobrar(7))',
    opts:['14','7','2','Erro'], ans:0,
    exp:'dobrar(7) retorna 7*2=14.' },
  { id:23, cat:'gdscript', diff:'dificil', topic:'Erros em runtime',
    q:'O que acontece?', code:'var arr = [1, 2, 3]\nprint(arr[5])',
    opts:['Erro: índice fora dos limites','Imprime null','Imprime 0','Imprime o último elemento'], ans:0,
    exp:'Índice 5 não existe (só 0,1,2). Causa erro em runtime.' },
  { id:24, cat:'gdscript', diff:'medio',   topic:'Strings',
    q:'Qual a saída?', code:'var n = "Godot"\nprint(n.length())',
    opts:['5','4','6','Erro'], ans:0,
    exp:'"Godot" tem 5 caracteres. length() retorna 5.' },
  { id:25, cat:'gdscript', diff:'dificil', topic:'Lambda / Callable',
    q:'O que é um Callable em GDScript 4?',
    opts:['Uma referência a uma função que pode ser passada como valor','Um tipo de array especial','Um sinal sem parâmetros','Um nó que chama funções automaticamente'], ans:0,
    exp:'Callable guarda referência a func para usar em connect() ou call_deferred().' },

  /* ══ GAME DESIGN ════════════════════════════════════════════════════════ */
  { id:26, cat:'gamedesign', diff:'facil', topic:'Game Loop',
    q:'O que é um game loop?',
    opts:['Ciclo que atualiza e renderiza o jogo a cada frame','Uma fase que se repete no jogo','Um loop infinito de código','A trilha sonora principal do jogo'], ans:0,
    exp:'O game loop roda constantemente: processa input → atualiza → renderiza.' },
  { id:27, cat:'gamedesign', diff:'facil', topic:'FPS',
    q:'O que significa FPS em jogos?',
    opts:['Frames Per Second — quadros por segundo','First Person Shooter','Fast Processing Speed','Floating Point System'], ans:0,
    exp:'FPS = quantas imagens são mostradas por segundo. 60 FPS é o padrão.' },
  { id:28, cat:'gamedesign', diff:'facil', topic:'Sprite',
    q:'O que é um sprite em game development?',
    opts:['Imagem 2D que representa personagem ou objeto','Código de movimentação','Tipo de colisão','Sistema de partículas'], ans:0,
    exp:'Sprites são imagens 2D usadas para representar elementos visuais do jogo.' },
  { id:29, cat:'gamedesign', diff:'facil', topic:'Hitbox',
    q:'O que é uma hitbox?',
    opts:['Área invisível que detecta colisões/acertos','A caixa de diálogo do jogo','O inventário do personagem','A barra de vida do personagem'], ans:0,
    exp:'Hitbox é a área de colisão. Hurtbox é onde o personagem pode ser atingido.' },
  { id:30, cat:'gamedesign', diff:'facil', topic:'Tilemap',
    q:'Para que serve um tilemap?',
    opts:['Criar cenários com peças reutilizáveis de imagem','Guardar a pontuação dos jogadores','Controlar as animações do personagem','Definir a física do jogo'], ans:0,
    exp:'Tilemaps usam tiles (blocos de imagem) para montar cenários de forma eficiente.' },
  { id:31, cat:'gamedesign', diff:'medio', topic:'State Machine',
    q:'O que é uma máquina de estados (state machine) num personagem?',
    opts:['Sistema que controla comportamentos: idle, andar, pular, atacar','Um tipo de inteligência artificial avançada','Uma lista de animações do personagem','Um script que controla a câmera'], ans:0,
    exp:'State machines organizam comportamentos em estados, cada um com regras de transição.' },
  { id:32, cat:'gamedesign', diff:'medio', topic:'Parallax',
    q:'O que é parallax scrolling?',
    opts:['Camadas de fundo em velocidades diferentes para criar profundidade','Tipo de movimento do personagem','Sistema de câmera que segue o jogador','Efeito de pós-processamento'], ans:0,
    exp:'Camadas mais distantes movem mais devagar, criando sensação de profundidade 3D.' },
  { id:33, cat:'gamedesign', diff:'medio', topic:'Prototipagem',
    q:'O que é prototipagem em game dev?',
    opts:['Criar versão simples para testar mecânicas rapidamente','Criar o arte final do jogo','Escrever o roteiro completo','Publicar uma demo do jogo'], ans:0,
    exp:'Protótipos testam se uma ideia funciona antes de investir em arte e conteúdo.' },
  { id:34, cat:'gamedesign', diff:'medio', topic:'Juiciness',
    q:'O que é "juiciness" em game design?',
    opts:['Feedback visual e sonoro exagerado e satisfatório para cada ação','A dificuldade progressiva do jogo','O sistema de pontuação','A variedade de inimigos'], ans:0,
    exp:'Juice = partículas, shake de câmera, sons, animações que tornam ações satisfatórias.' },
  { id:35, cat:'gamedesign', diff:'medio', topic:'Gameplay Loop',
    q:'O que é o core gameplay loop?',
    opts:['Ciclo principal de ações que o jogador repete (ex: explorar→lutar→melhorar)','O menu principal do jogo','A história do jogo','O sistema de save/load'], ans:0,
    exp:'O gameplay loop é o que faz o jogador continuar jogando repetidamente.' },
  { id:36, cat:'gamedesign', diff:'dificil', topic:'Geração Procedural',
    q:'O que é geração procedural em jogos?',
    opts:['Criar conteúdo automaticamente com algoritmos (mapas, itens, missões)','Contratar uma equipe para gerar conteúdo','Usar inteligência artificial para jogar','Gerar código de programação automaticamente'], ans:0,
    exp:'Roguelikes como Hades e Spelunky usam geração procedural para replayability.' },
  { id:37, cat:'gamedesign', diff:'dificil', topic:'Polish',
    q:'O que é "polish" em game development?',
    opts:['Refinamento final: efeitos, sons e feedback que tornam o jogo satisfatório','Traduzir o jogo para outro idioma','Otimizar o código para rodar mais rápido','Criar a capa do jogo'], ans:0,
    exp:'Polish é a camada final que transforma um jogo funcional em algo que se sente profissional.' },
  { id:38, cat:'gamedesign', diff:'dificil', topic:'Game Feel',
    q:'O que define o "game feel" de um jogo?',
    opts:['A sensação tátil e responsiva de controlar o personagem','A dificuldade do jogo','A qualidade dos gráficos','O tamanho do mapa'], ans:0,
    exp:'Game feel é como o jogo responde ao input — inércia, aceleração, câmera, feedback.' },
  { id:39, cat:'gamedesign', diff:'facil', topic:'Checkpoint',
    q:'O que é um checkpoint em jogos?',
    opts:['Ponto onde o progresso é salvo automaticamente','Uma moeda colecionável','Um inimigo especial','O fim de uma fase'], ans:0,
    exp:'Checkpoints reduzem frustração salvando o progresso em pontos estratégicos.' },
  { id:40, cat:'gamedesign', diff:'medio', topic:'Balanceamento',
    q:'O que é balanceamento de jogo (game balance)?',
    opts:['Ajustar dificuldade e números para o jogo ser justo e divertido','Igualar o número de inimigos e aliados','Equalizar o volume do áudio','Distribuir os objetos no mapa'], ans:0,
    exp:'Balance envolve ajustar stats, spawns e dificuldade para criar uma experiência justa.' },

  /* ══ NÓS E CENAS ════════════════════════════════════════════════════════ */
  { id:41, cat:'nos', diff:'facil', topic:'CharacterBody2D',
    q:'Qual nó usar para um personagem 2D controlado pelo jogador?',
    opts:['CharacterBody2D','RigidBody2D','StaticBody2D','Area2D'], ans:0,
    exp:'CharacterBody2D é controlado por script com move_and_slide(). Perfeito para personagens.' },
  { id:42, cat:'nos', diff:'facil', topic:'Sprite2D',
    q:'Qual nó exibe uma imagem 2D na cena?',
    opts:['Sprite2D','TextureRect','MeshInstance2D','Panel'], ans:0,
    exp:'Sprite2D é o nó padrão para imagens 2D em objetos do jogo.' },
  { id:43, cat:'nos', diff:'facil', topic:'CollisionShape2D',
    q:'Qual nó define a área de colisão de um objeto 2D?',
    opts:['CollisionShape2D','HitboxArea','Polygon2D','Shape2D'], ans:0,
    exp:'CollisionShape2D define a forma (círculo, caixa, cápsula) de colisão.' },
  { id:44, cat:'nos', diff:'facil', topic:'Camera2D',
    q:'Qual nó controla o que o jogador vê na tela em 2D?',
    opts:['Camera2D','Viewport2D','Screen2D','ViewCamera'], ans:0,
    exp:'Camera2D segue o jogador e define o que aparece na tela.' },
  { id:45, cat:'nos', diff:'facil', topic:'Label',
    q:'Qual nó exibir texto na interface (HUD/UI)?',
    opts:['Label','TextNode','DisplayText','UIText'], ans:0,
    exp:'Label é o nó básico para texto estático na interface.' },
  { id:46, cat:'nos', diff:'facil', topic:'Button',
    q:'Qual nó criar um botão clicável na UI?',
    opts:['Button','ClickArea','Interact2D','UIButton'], ans:0,
    exp:'Button é o nó padrão para botões. O sinal "pressed" dispara ao clicar.' },
  { id:47, cat:'nos', diff:'facil', topic:'TileMap',
    q:'Qual nó criar cenários com tiles (grade de imagens)?',
    opts:['TileMap','GridMap2D','SpriteGrid','TileGrid'], ans:0,
    exp:'TileMap (Godot 4: TileMapLayer) monta cenários com tiles eficientemente.' },
  { id:48, cat:'nos', diff:'medio', topic:'Area2D',
    q:'Para que serve o nó Area2D?',
    opts:['Detectar objetos que entram/saem da área sem física real','Mover o personagem pelo mapa','Reproduzir sons quando tocado','Criar colisões sólidas'], ans:0,
    exp:'Area2D detecta presença sem empurrar — perfeito para zonas, power-ups, detectores.' },
  { id:49, cat:'nos', diff:'medio', topic:'StaticBody3D',
    q:'Qual nó para paredes e chão estáticos em 3D?',
    opts:['StaticBody3D','StaticMesh3D','GroundBody3D','FixedBody3D'], ans:0,
    exp:'StaticBody3D não se move — ideal para chão, paredes e plataformas estáticas.' },
  { id:50, cat:'nos', diff:'medio', topic:'AudioStreamPlayer',
    q:'Qual nó reproduz sons e músicas no jogo?',
    opts:['AudioStreamPlayer','SoundNode','MusicPlayer','AudioClip'], ans:0,
    exp:'AudioStreamPlayer toca sons. AudioStreamPlayer2D tem posição no espaço 2D.' },
  { id:51, cat:'nos', diff:'medio', topic:'GPUParticles2D',
    q:'Qual nó criar efeitos de partículas (chuva, fogo, faíscas)?',
    opts:['GPUParticles2D','EffectNode2D','ParticleEmitter','SpriteEffect'], ans:0,
    exp:'GPUParticles2D usa a GPU para simular muitas partículas com boa performance.' },
  { id:52, cat:'nos', diff:'medio', topic:'RigidBody2D',
    q:'Qual nó para objetos com física completa (cai, bate, quica)?',
    opts:['RigidBody2D','PhysicsBody2D','DynamicBody2D','FallBody2D'], ans:0,
    exp:'RigidBody2D tem física automática. Não use para o personagem principal.' },
  { id:53, cat:'nos', diff:'medio', topic:'Timer',
    q:'Qual nó dispara um evento após um tempo definido?',
    opts:['Timer','Countdown','DelayNode','TimeEvent'], ans:0,
    exp:'Timer conta tempo e dispara o sinal "timeout" ao terminar. Pode repetir.' },
  { id:54, cat:'nos', diff:'medio', topic:'RayCast2D',
    q:'Qual nó detectar colisões com um raio invisível?',
    opts:['RayCast2D','LineDetector','LaserShape','BeamSensor'], ans:0,
    exp:'RayCast2D lança um raio e detecta o primeiro objeto que toca — útil para visão de IA.' },
  { id:55, cat:'nos', diff:'dificil', topic:'CanvasLayer',
    q:'Para que serve o nó CanvasLayer?',
    opts:['Criar camada que não se move com a câmera (HUD, menus)','Definir a ordem de renderização dos sprites','Criar efeitos de pós-processamento','Controlar a profundidade de nós 3D'], ans:0,
    exp:'CanvasLayer mantém UI/HUD fixo na tela independente de câmera ou zoom.' },
  { id:56, cat:'nos', diff:'dificil', topic:'AnimatedSprite2D',
    q:'Qual nó exibir animações de spritesheet 2D?',
    opts:['AnimatedSprite2D','Sprite2D com loop','AnimationSprite','SpriteAnimation'], ans:0,
    exp:'AnimatedSprite2D usa SpriteFrames para definir frames de cada animação.' },
  { id:57, cat:'nos', diff:'dificil', topic:'Path2D + PathFollow2D',
    q:'Para que servem Path2D e PathFollow2D juntos?',
    opts:['Mover um objeto ao longo de um caminho desenhado','Criar um labirinto no mapa','Definir o trajeto do raio de visão','Animar a câmera automaticamente'], ans:0,
    exp:'Path2D define a curva, PathFollow2D move um nó ao longo dela. Ótimo para patrulhas.' },
  { id:58, cat:'nos', diff:'dificil', topic:'SubViewport',
    q:'Para que serve um SubViewport?',
    opts:['Renderizar uma cena numa textura separada (minimapa, espelho)','Criar uma sub-câmera para o co-op','Dividir a tela em partes','Criar janelas do sistema operacional'], ans:0,
    exp:'SubViewport renderiza para textura — usado em minimapas, portais e esplitscreen.' },
  { id:59, cat:'nos', diff:'dificil', topic:'CharacterBody3D',
    q:'Qual a diferença de CharacterBody3D para RigidBody3D?',
    opts:['CharacterBody3D é controlado por script; RigidBody3D tem física automática','CharacterBody3D é mais rápido para renderizar','RigidBody3D não aceita colisões','Não há diferença em 3D'], ans:0,
    exp:'CharacterBody dá controle total. RigidBody3D simula física (cai, rola, empurra).' },
  { id:60, cat:'nos', diff:'facil', topic:'Instancing',
    q:'O que é instanciar uma cena no Godot?',
    opts:['Criar uma cópia de uma cena salva dentro de outra cena','Salvar a cena atual no disco','Abrir uma cena diferente','Duplicar todos os nós manualmente'], ans:0,
    exp:'Instancing permite reusar cenas: inimigos, moedas, etc. são instâncias da mesma cena.' },

  /* ══ ANIMAÇÃO ══════════════════════════════════════════════════════════ */
  { id:61, cat:'animacao', diff:'facil', topic:'AnimationPlayer',
    q:'Qual nó controla e toca animações no Godot?',
    opts:['AnimationPlayer','AnimationController','MotionPlayer','Animator'], ans:0,
    exp:'AnimationPlayer é o nó padrão para criar e tocar animações de qualquer propriedade.' },
  { id:62, cat:'animacao', diff:'facil', topic:'play()',
    q:'Como tocar uma animação "correr" pelo script?',
    opts:['$AnimationPlayer.play("correr")','$AnimationPlayer.start("correr")','$AnimationPlayer.run("correr")','play_animation("correr")'], ans:0,
    exp:'AnimationPlayer.play("nome") toca a animação pelo nome registrado.' },
  { id:63, cat:'animacao', diff:'facil', topic:'Keyframe',
    q:'O que é um keyframe em animação?',
    opts:['Ponto no tempo que define o valor de uma propriedade','Um tipo de sprite especial','O primeiro frame de uma animação','Um frame que se repete automaticamente'], ans:0,
    exp:'Keyframes definem valores em momentos específicos. A engine interpola entre eles.' },
  { id:64, cat:'animacao', diff:'facil', topic:'stop()',
    q:'Como parar uma animação pelo script?',
    opts:['$AnimationPlayer.stop()','$AnimationPlayer.pause()','$AnimationPlayer.cancel()','$AnimationPlayer.end()'], ans:0,
    exp:'stop() para a animação imediatamente. pause() a pausa para continuar depois.' },
  { id:65, cat:'animacao', diff:'facil', topic:'AnimatedSprite2D',
    q:'Qual nó animar personagens 2D com spritesheet?',
    opts:['AnimatedSprite2D','Sprite2D','AnimationPlayer','SpriteAnimator'], ans:0,
    exp:'AnimatedSprite2D usa SpriteFrames com vários frames por animação.' },
  { id:66, cat:'animacao', diff:'medio', topic:'AnimationTree',
    q:'Para que serve o AnimationTree?',
    opts:['Gerenciar transições e misturar animações (idle→correr→pular)','Tocar animações mais rápido','Criar animações sem keyframes','Controlar partículas com animação'], ans:0,
    exp:'AnimationTree permite state machines e blend spaces para transições suaves.' },
  { id:67, cat:'animacao', diff:'medio', topic:'Blend Space',
    q:'O que é um Blend Space no AnimationTree?',
    opts:['Mistura animações baseando-se em valores contínuos (ex: velocidade)','Um espaço para guardar todas as animações','Uma área da tela onde a animação fica','Um tipo de keyframe especial'], ans:0,
    exp:'Blend Space 1D/2D mistura animações suavemente (andar→correr baseado na velocidade).' },
  { id:68, cat:'animacao', diff:'medio', topic:'animation_finished',
    q:'Para que serve o sinal animation_finished do AnimationPlayer?',
    opts:['Avisa quando a animação terminou de tocar','Toca a próxima animação automaticamente','Para a animação em loop','Reinicia a animação do início'], ans:0,
    exp:'animation_finished permite executar código ao fim da animação (ex: voltar ao idle).' },
  { id:69, cat:'animacao', diff:'medio', topic:'Tween',
    q:'O que é um Tween em Godot 4?',
    opts:['Anima propriedades suavemente sem precisar do AnimationPlayer','Um tipo de animação de spritesheet','Uma transição entre cenas','Um efeito de câmera'], ans:0,
    exp:'Tween é ideal para animações simples por código: mover, escalar, fade.' },
  { id:70, cat:'animacao', diff:'medio', topic:'create_tween()',
    q:'Como criar um Tween por script em Godot 4?',
    opts:['var t = create_tween()','var t = Tween.new()','var t = tween_property()','var t = AnimationTree.new()'], ans:0,
    exp:'create_tween() cria um Tween ligado ao nó. Depois usa tween_property() ou tween_method().' },
  { id:71, cat:'animacao', diff:'dificil', topic:'State Machine (AnimationTree)',
    q:'O que é uma State Machine dentro do AnimationTree?',
    opts:['Controla qual animação toca baseado em estados e condições','Cria animações procedurais automaticamente','Define a velocidade de cada animação','Sincroniza animações de vários personagens'], ans:0,
    exp:'AnimationStateMachine define estados (idle, run, jump) e as transições entre eles.' },
  { id:72, cat:'animacao', diff:'dificil', topic:'Skeleton3D',
    q:'Para que serve o nó Skeleton3D?',
    opts:['Controlar os ossos de um modelo 3D para animação skeletal','Criar personagens 3D gerados por código','Definir a colisão de um modelo 3D','Renderizar modelos de esqueleto'], ans:0,
    exp:'Skeleton3D manipula bones — base das animações de personagens 3D importados.' },
  { id:73, cat:'animacao', diff:'dificil', topic:'SpriteFrames',
    q:'O que é um SpriteFrames resource?',
    opts:['Armazena os frames de cada animação do AnimatedSprite2D','Um arquivo de spritesheet PNG','Um script de animação','Um preset de AnimationPlayer'], ans:0,
    exp:'SpriteFrames guarda as imagens e configurações de cada animação (fps, loop, frames).' },
  { id:74, cat:'animacao', diff:'dificil', topic:'play_backwards()',
    q:'O que faz $AnimationPlayer.play_backwards("nome")?',
    opts:['Toca a animação ao contrário','Toca a animação mais devagar','Inverte os keyframes permanentemente','Espelha a animação verticalmente'], ans:0,
    exp:'play_backwards() toca do fim para o começo — útil para "desfazer" uma ação.' },
  { id:75, cat:'animacao', diff:'medio', topic:'Interpolação',
    q:'O que é interpolação em animação?',
    opts:['Cálculo automático dos valores entre dois keyframes','A velocidade da animação','A quantidade de frames por segundo','O número de keyframes'], ans:0,
    exp:'A engine interpola (calcula os valores intermediários) entre keyframes. Ex: Linear, Ease.' },

  /* ══ FÍSICA ════════════════════════════════════════════════════════════ */
  { id:76, cat:'fisica', diff:'facil', topic:'move_and_slide()',
    q:'O que faz move_and_slide()?',
    opts:['Move o personagem e desliza pelas superfícies ao colidir','Teletransporta o personagem para a posição alvo','Move sem detectar colisões','Calcula a velocidade de queda'], ans:0,
    exp:'move_and_slide() aplica velocity e desliza em colisões. Chame em _physics_process.' },
  { id:77, cat:'fisica', diff:'facil', topic:'is_on_floor()',
    q:'O que retorna is_on_floor()?',
    opts:['true se o personagem está no chão','true se o personagem está parado','true se há um chão abaixo do personagem','A distância até o chão'], ans:0,
    exp:'is_on_floor() detecta se o personagem encosta no chão — essencial para pulo.' },
  { id:78, cat:'fisica', diff:'facil', topic:'CharacterBody2D vs RigidBody2D',
    q:'Qual a principal diferença entre CharacterBody2D e RigidBody2D?',
    opts:['CharacterBody é controlado por script; RigidBody tem física automática','CharacterBody é mais rápido de renderizar','RigidBody não colide com nada','São idênticos, só mudam o nome'], ans:0,
    exp:'CharacterBody dá controle total. RigidBody simula física (gravidade, impulso, torque).' },
  { id:79, cat:'fisica', diff:'facil', topic:'StaticBody2D',
    q:'Para que serve StaticBody2D?',
    opts:['Chão, paredes e plataformas que não se movem','Personagem do jogador','Objeto que o jogador empurra','Detector de colisão sem física'], ans:0,
    exp:'StaticBody2D é estático — não tem velocidade. Outros objetos colidem com ele.' },
  { id:80, cat:'fisica', diff:'medio', topic:'Area2D body_entered',
    q:'O que é o sinal body_entered da Area2D?',
    opts:['Disparado quando um corpo físico entra na área','Quando o jogador clica na área','Quando a área é criada','Quando dois objetos colidem entre si'], ans:0,
    exp:'body_entered é disparado ao entrar — body_exited ao sair. Ótimo para power-ups.' },
  { id:81, cat:'fisica', diff:'medio', topic:'Gravidade',
    q:'Como aplicar gravidade num CharacterBody2D em Godot 4?',
    opts:['velocity.y += gravity * delta em _physics_process()','set_gravity(9.8) no script','Adicionar PhysicsMaterial com gravity','Usar o nó GravityField'], ans:0,
    exp:'gravity = ProjectSettings.get_setting("physics/2d/default_gravity"). Aplique manualmente.' },
  { id:82, cat:'fisica', diff:'medio', topic:'move_and_collide()',
    q:'Qual a diferença de move_and_collide() para move_and_slide()?',
    opts:['move_and_collide retorna dados da colisão e não desliza automaticamente','move_and_collide é mais rápido','move_and_collide ignora plataformas','São idênticos'], ans:0,
    exp:'move_and_collide retorna KinematicCollision2D com normal, ponto e objeto colidido.' },
  { id:83, cat:'fisica', diff:'medio', topic:'Camadas de Física',
    q:'Para que servem as camadas de física (Physics Layers)?',
    opts:['Definir quais grupos de objetos se colidem entre si','Definir a cor dos objetos físicos','Organizar os objetos por camada visual','Controlar a ordem de renderização'], ans:0,
    exp:'Physics layers permitem que projéteis passem pelo jogador mas colidam com paredes.' },
  { id:84, cat:'fisica', diff:'dificil', topic:'KinematicCollision2D',
    q:'O que é um KinematicCollision2D?',
    opts:['Objeto com dados da colisão retornado por move_and_collide()','Um tipo de corpo físico','Uma forma de colisão especial','Um sinal da colisão entre corpos'], ans:0,
    exp:'KinematicCollision2D tem: position, normal, collider, remainder — dados completos da colisão.' },
  { id:85, cat:'fisica', diff:'dificil', topic:'is_on_wall()',
    q:'O que retorna is_on_wall() em CharacterBody2D?',
    opts:['true se o personagem está encostando em uma parede lateral','true se há uma parede à frente','true se o personagem está bloqueado','A distância até a parede mais próxima'], ans:0,
    exp:'is_on_wall() + is_on_ceiling() + is_on_floor() são os três detectores do CharacterBody.' },
  { id:86, cat:'fisica', diff:'dificil', topic:'PhysicsMaterial',
    q:'Para que serve um PhysicsMaterial?',
    opts:['Definir o atrito e quanto o objeto ricocheia ao colidir','Mudar a cor do objeto na simulação física','Definir qual camada física o objeto usa','Criar múltiplos pontos de colisão'], ans:0,
    exp:'PhysicsMaterial tem friction (atrito) e bounce (ricochete). Aplique em StaticBody ou RigidBody.' },
  { id:87, cat:'fisica', diff:'dificil', topic:'linear_velocity',
    q:'O que é linear_velocity em um RigidBody2D?',
    opts:['A velocidade atual do corpo no espaço (vetor X e Y)','A velocidade máxima permitida','A velocidade de rotação do corpo','A força de gravidade aplicada ao corpo'], ans:0,
    exp:'linear_velocity é o vetor velocidade atual. angular_velocity é a velocidade de rotação.' },
  { id:88, cat:'fisica', diff:'medio', topic:'get_slide_collision_count()',
    q:'O que retorna get_slide_collision_count()?',
    opts:['Número de colisões ocorridas no último move_and_slide()','Quantas vezes o personagem colidiu na vida','A força total das colisões','O índice da colisão mais forte'], ans:0,
    exp:'Junto com get_slide_collision(i) permite processar cada colisão individualmente.' },
  { id:89, cat:'fisica', diff:'facil', topic:'_physics_process',
    q:'Por que usar _physics_process() para movimentação?',
    opts:['Roda em fps de física fixo (60Hz), independente do FPS do jogo','É mais rápido que _process()','Funciona sem delta','Permite movimentos em câmera lenta'], ans:0,
    exp:'_physics_process tem taxa fixa (padrão 60Hz). move_and_slide() deve ser chamado aqui.' },
  { id:90, cat:'fisica', diff:'medio', topic:'velocity',
    q:'O que é "velocity" em CharacterBody2D?',
    opts:['Vector2 com a velocidade do personagem usada pelo move_and_slide()','A posição atual do personagem','A aceleração do personagem','O vetor de gravidade'], ans:0,
    exp:'velocity é uma propriedade do CharacterBody2D. Modifique-a e chame move_and_slide().' },

  /* ══ ESTRUTURA 3D ══════════════════════════════════════════════════════ */
  { id:91, cat:'estrutura', diff:'facil', topic:'Scene Tree',
    q:'O que é o scene tree no Godot?',
    opts:['A hierarquia de todos os nós ativos na cena atual','O arquivo de salvamento do projeto','A árvore de animações do personagem','O sistema de arquivos do projeto'], ans:0,
    exp:'O scene tree organiza todos os nós em hierarquia pai-filho. A raiz é o nó principal.' },
  { id:92, cat:'estrutura', diff:'facil', topic:'PackedScene',
    q:'O que é uma PackedScene?',
    opts:['Arquivo .tscn salvo que pode ser instanciado várias vezes','Uma cena comprimida para economizar espaço','Um snapshot da cena atual','Uma cena que só pode ser usada uma vez'], ans:0,
    exp:'PackedScene é o .tscn no disco. Use load("res://cena.tscn").instantiate() no script.' },
  { id:93, cat:'estrutura', diff:'facil', topic:'MeshInstance3D',
    q:'Qual nó exibe um modelo 3D (mesh) na cena?',
    opts:['MeshInstance3D','Model3D','Object3D','StaticMesh3D'], ans:0,
    exp:'MeshInstance3D renderiza um Mesh (BoxMesh, SphereMesh, ou importado de .glb).' },
  { id:94, cat:'estrutura', diff:'medio', topic:'CSG',
    q:'O que é CSG (Constructive Solid Geometry) no Godot?',
    opts:['Sistema para criar formas 3D combinando e subtraindo primitivas','Um formato de arquivo 3D','Um shader especial para objetos sólidos','Um sistema de colisão simplificado'], ans:0,
    exp:'CSG permite prototipar cenários 3D rápido com União, Subtração e Interseção de formas.' },
  { id:95, cat:'estrutura', diff:'medio', topic:'CSGBox3D',
    q:'Para que é recomendado usar CSGBox3D?',
    opts:['Prototipagem rápida de cenários 3D sem precisar de arte final','Criar terrenos complexos','Renderizar modelos importados','Criar colisões otimizadas'], ans:0,
    exp:'CSGBox3D (e outros nós CSG) são ótimos para blockouts e protótipos. Não use em produção final.' },
  { id:96, cat:'estrutura', diff:'medio', topic:'GridMap',
    q:'Para que serve o nó GridMap?',
    opts:['Colocar meshes em grade 3D para criar mapas como Minecraft','Criar terrenos procedurais','Organizar sprites em 2D','Otimizar a renderização de muitos objetos'], ans:0,
    exp:'GridMap é como TileMap mas em 3D — ideal para jogos de grade como RPGs e dungeon crawlers.' },
  { id:97, cat:'estrutura', diff:'dificil', topic:'MultiMesh',
    q:'Para que serve um MultiMesh?',
    opts:['Renderizar muitas instâncias do mesmo mesh de forma muito eficiente','Criar múltiplos personagens idênticos com física','Duplicar uma cena automaticamente','Criar portais entre cenas'], ans:0,
    exp:'MultiMesh usa uma única drawcall para centenas de instâncias — perfeito para árvores, pedras.' },
  { id:98, cat:'estrutura', diff:'dificil', topic:'CSG Operações',
    q:'Qual operação CSG remove o volume de uma forma de outra?',
    opts:['CSG Subtraction','CSG Union','CSG Intersection','CSG Merge'], ans:0,
    exp:'Union combina, Subtraction remove, Intersection mantém só a sobreposição.' },
  { id:99, cat:'estrutura', diff:'dificil', topic:'ArrayMesh',
    q:'O que é um ArrayMesh?',
    opts:['Mesh criada por código definindo vértices, normais e UVs manualmente','Um array de meshes para animação','Um mesh que usa array de texturas','Um mesh simplificado para colisão'], ans:0,
    exp:'ArrayMesh permite gerar geometria 3D por código. Usado em terrenos procedurais.' },
  { id:100,cat:'estrutura', diff:'dificil', topic:'SubViewport',
    q:'Como usar SubViewport para criar um minimapa?',
    opts:['Renderizar uma câmera aérea no SubViewport e exibir como TextureRect','Duplicar a cena principal em menor escala','Usar uma segunda câmera principal','Criar um novo projeto dentro do projeto'], ans:0,
    exp:'SubViewport renderiza para ViewportTexture. Adicione Camera2D aérea e mostre numa TextureRect na UI.' },
];

/* ── Helpers ─────────────────────────────────────────────────────────── */
function genCode(): string {
  const c = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  return Array.from({ length: 4 }, () => c[Math.floor(Math.random() * c.length)]).join('');
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function calcScore(correct: boolean, ms: number): number {
  if (!correct) return 0;
  const s = ms / 1000;
  if (s <= 5) return 300; if (s <= 10) return 250;
  if (s <= 15) return 200; if (s <= 20) return 150;
  return 100;
}

function diffColor(d: Diff) { return d === 'facil' ? '#22c55e' : d === 'medio' ? '#f59e0b' : '#ef4444'; }
function diffLabel(d: Diff) { return d === 'facil' ? 'FÁCIL' : d === 'medio' ? 'MÉDIO' : 'DIFÍCIL'; }

/* ── Code Block ─────────────────────────────────────────────────────── */
function CodeBlock({ code, isDark }: { code: string; isDark: boolean }) {
  const KW = ['var','func','if','else','elif','for','while','in','return','print','true','false','null','and','or','not','signal','match','@export','@onready','range','len','self','super','class_name','extends'];
  return (
    <div style={{ background: isDark?'#1e1e1e':'#f5f5f5', border:`2px solid ${isDark?'#333':'#ddd'}`,
      borderLeft:'4px solid #478cbf', padding:'12px 16px',
      fontFamily:"'Courier New',monospace", fontSize:14, lineHeight:1.7, overflowX:'auto', marginBottom:4 }}>
      {code.split('\n').map((line, i) => {
        const tokens: React.ReactNode[] = [];
        let rest = line; let k = 0;
        while (rest.length > 0) {
          if (rest.startsWith('#')) { tokens.push(<span key={k++} style={{color:'#6a9955'}}>{rest}</span>); rest=''; continue; }
          const sm = rest.match(/^("(?:[^"\\]|\\.)*")/);
          if (sm) { tokens.push(<span key={k++} style={{color:'#ce9178'}}>{sm[1]}</span>); rest=rest.slice(sm[1].length); continue; }
          const nm = rest.match(/^(\d+\.?\d*)/);
          if (nm) { tokens.push(<span key={k++} style={{color:'#b5cea8'}}>{nm[1]}</span>); rest=rest.slice(nm[1].length); continue; }
          const kw = KW.find(w => rest.startsWith(w) && (rest.length===w.length||/\W/.test(rest[w.length])));
          if (kw) { tokens.push(<span key={k++} style={{color:'#569cd6'}}>{kw}</span>); rest=rest.slice(kw.length); continue; }
          const fn = rest.match(/^([a-zA-Z_]\w*)\s*(?=\()/);
          if (fn) { tokens.push(<span key={k++} style={{color:'#dcdcaa'}}>{fn[1]}</span>); rest=rest.slice(fn[1].length); continue; }
          tokens.push(<span key={k++} style={{color:isDark?'#d4d4d4':'#1e1e1e'}}>{rest[0]}</span>); rest=rest.slice(1);
        }
        return (
          <div key={i} style={{display:'flex',gap:12}}>
            <span style={{color:'#858585',userSelect:'none',minWidth:20,textAlign:'right',fontSize:11}}>{i+1}</span>
            <span>{tokens}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ── Firebase types ─────────────────────────────────────────────────── */
interface PlayerRoom { name:string; score:number; answered:boolean; answers:Record<number,{opt:number;correct:boolean;ms:number}>; }
interface RoomData   { hostId:string; status:'waiting'|'question'|'review'|'finished'; players:Record<string,PlayerRoom>; qIndices:number[]; currentQ:number; totalQ:number; qStartedAt:number; createdAt:number; }
type View = 'menu' | 'setup' | 'lobby' | 'game' | 'results';
type Mode = 'solo' | 'create' | 'join';

/* ── Main Component ─────────────────────────────────────────────────── */
interface Props { onBack:()=>void; isDark?:boolean; }

export default function GodotArenaPage({ onBack, isDark=true }: Props) {
  const { addCoins, addPoints } = useGameState();

  /* UI */
  const [view,        setView]        = useState<View>('menu');
  const [mode,        setMode]        = useState<Mode>('solo');
  const [error,       setError]       = useState('');
  const [loading,     setLoading]     = useState(false);
  const [copied,      setCopied]      = useState(false);
  const [playerName,  setPlayerName]  = useState(() => localStorage.getItem('godot_arena_name') ?? '');
  const [codeInput,   setCodeInput]   = useState('');

  /* Setup (category/difficulty selection) */
  const [selCats,  setSelCats]  = useState<Category[]>(['gdscript','gamedesign','nos','animacao','fisica','estrutura']);
  const [selDiff,  setSelDiff]  = useState<Diff | 'all'>('all');

  /* Room */
  const [roomCode, setRoomCode] = useState('');
  const [roomData, setRoomData] = useState<RoomData|null>(null);

  /* Solo */
  const [soloIndices, setSoloIndices] = useState<number[]>([]);
  const [soloQ,       setSoloQ]       = useState(0);
  const [soloScore,   setSoloScore]   = useState(0);
  const [soloAnswers, setSoloAnswers] = useState<Record<number,{opt:number;correct:boolean;ms:number}>>({});
  const [soloQStart,  setSoloQStart]  = useState(0);

  /* Shared answer */
  const [selected,  setSelected]  = useState<number|null>(null);
  const [answered,  setAnswered]  = useState(false);
  const [timeLeft,  setTimeLeft]  = useState(QUESTION_TIME);
  const [reviewing, setReviewing] = useState(false);

  /* Refs */
  const playerIdRef    = useRef<string>((() => {
    let pid = sessionStorage.getItem('godot_arena_pid');
    if (!pid) { pid=`p_${Date.now()}_${Math.random().toString(36).slice(2,7)}`; sessionStorage.setItem('godot_arena_pid',pid); }
    return pid;
  })());
  const unsubRef       = useRef<(()=>void)|null>(null);
  const timerRef       = useRef<ReturnType<typeof setInterval>|null>(null);
  const reviewRef      = useRef<ReturnType<typeof setTimeout>|null>(null);
  const hostAdvRef     = useRef<ReturnType<typeof setTimeout>|null>(null);
  const soloQRef       = useRef(0);
  const soloIndicesRef = useRef<number[]>([]);

  const isHost = mode === 'create';

  useEffect(() => {
    let pid = sessionStorage.getItem('godot_arena_pid');
    if (!pid) { pid=`p_${Date.now()}_${Math.random().toString(36).slice(2,7)}`; sessionStorage.setItem('godot_arena_pid',pid); }
    playerIdRef.current = pid;
  }, []);

  useEffect(() => () => {
    unsubRef.current?.();
    if (timerRef.current)   clearInterval(timerRef.current);
    if (reviewRef.current)  clearTimeout(reviewRef.current);
    if (hostAdvRef.current) clearTimeout(hostAdvRef.current);
  }, []);

  /* Derived */
  const roomPlayers   = roomData?.players ?? {};
  const playerList    = Object.entries(roomPlayers).map(([id,p])=>({id,...p}));
  const qIndices      = roomData?.qIndices ?? [];
  const currentQMp    = roomData?.currentQ ?? 0;
  const totalQMp      = roomData?.totalQ ?? TOTAL_Q;
  const mpStatus      = roomData?.status ?? 'waiting';
  const qStartAt      = roomData?.qStartedAt ?? 0;
  const mpQuestion    = (mpStatus==='question'||mpStatus==='review') ? QUESTIONS[qIndices[currentQMp]] : null;
  const soloQuestion  = soloIndices[soloQ]!==undefined ? QUESTIONS[soloIndices[soloQ]] : null;

  /* Subscribe Firebase */
  const subscribeRoom = useCallback((code:string) => {
    unsubRef.current?.();
    const unsub = onValue(ref(db,`${FB_PATH}/${code}`), snap => {
      const d:RoomData|null = snap.val();
      if (d) setRoomData(d);
    });
    unsubRef.current = unsub;
  }, []);

  /* MP timer */
  useEffect(() => {
    if (view!=='game'||mode==='solo'||mpStatus!=='question'||qStartAt===0) return;
    if (timerRef.current) clearInterval(timerRef.current);
    const tick = () => setTimeLeft(Math.max(0, QUESTION_TIME - Math.floor((Date.now()-qStartAt)/1000)));
    tick(); timerRef.current = setInterval(tick,500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [view,mode,mpStatus,qStartAt]);

  /* Solo timer */
  useEffect(() => {
    if (view!=='game'||mode!=='solo'||reviewing||answered) return;
    if (timerRef.current) clearInterval(timerRef.current);
    const start = soloQStart||Date.now();
    const tick = () => {
      const left = Math.max(0, QUESTION_TIME - Math.floor((Date.now()-start)/1000));
      setTimeLeft(left);
      if (left===0) doSoloTimeUp();
    };
    tick(); timerRef.current = setInterval(tick,500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [view,mode,reviewing,answered,soloQ,soloQStart]);

  /* Host: advance */
  const allAnswered = playerList.length>0 && playerList.every(p=>p.answered);
  useEffect(() => {
    if (!isHost||view!=='game'||mpStatus!=='question'||qStartAt===0) return;
    if (allAnswered) { doMpToReview(); return; }
    if (hostAdvRef.current) clearTimeout(hostAdvRef.current);
    const rem = Math.max(0, QUESTION_TIME*1000-(Date.now()-qStartAt));
    hostAdvRef.current = setTimeout(doMpToReview, rem);
    return () => { if (hostAdvRef.current) clearTimeout(hostAdvRef.current); };
  }, [isHost,view,mpStatus,qStartAt,allAnswered]);

  useEffect(() => {
    if (!isHost||view!=='game'||mpStatus!=='review') return;
    if (reviewRef.current) clearTimeout(reviewRef.current);
    reviewRef.current = setTimeout(doMpNextOrFinish, REVIEW_TIME*1000);
    return () => { if (reviewRef.current) clearTimeout(reviewRef.current); };
  }, [isHost,view,mpStatus]);

  /* MP state sync — also transitions non-host players from lobby → game */
  useEffect(() => {
    if (mode==='solo') return;
    if (mpStatus==='review')   { setReviewing(true); }
    else if (mpStatus==='question') {
      setReviewing(false); setAnswered(false); setSelected(null); setTimeLeft(QUESTION_TIME);
      setView('game');
    }
    else if (mpStatus==='finished') { setView('results'); }
  }, [mpStatus,mode]);

  /* ── Solo handlers ── */
  function doSoloTimeUp() {
    if (answered) return;
    if (timerRef.current) clearInterval(timerRef.current);
    const q = soloQRef.current;
    setAnswered(true); setReviewing(true);
    setSoloAnswers(p=>({...p,[q]:{opt:-1,correct:false,ms:QUESTION_TIME*1000}}));
    reviewRef.current = setTimeout(doSoloNext, REVIEW_TIME*1000);
  }
  function doSoloNext() {
    const next = soloQRef.current + 1;
    if (next >= soloIndicesRef.current.length) { setView('results'); return; }
    soloQRef.current = next;
    setSoloQ(next); setSoloQStart(Date.now()); setSelected(null); setAnswered(false); setReviewing(false); setTimeLeft(QUESTION_TIME);
  }

  /* ── MP handlers ── */
  async function doMpToReview() {
    const snap = await get(ref(db,`${FB_PATH}/${roomCode}`));
    const d:RoomData|null = snap.val();
    if (!d||d.status!=='question') return;
    await dbUpdate(ref(db,`${FB_PATH}/${roomCode}`),{status:'review'});
  }
  async function doMpNextOrFinish() {
    const snap = await get(ref(db,`${FB_PATH}/${roomCode}`));
    const d:RoomData|null = snap.val();
    if (!d||d.status!=='review') return;
    const next = (d.currentQ??0)+1;
    if (next>=(d.totalQ??TOTAL_Q)) {
      await dbUpdate(ref(db,`${FB_PATH}/${roomCode}`),{status:'finished'});
    } else {
      const upd: Record<string,any> = {status:'question',currentQ:next,qStartedAt:Date.now()};
      Object.keys(d.players??{}).forEach(pid => { upd[`players/${pid}/answered`]=false; });
      await dbUpdate(ref(db,`${FB_PATH}/${roomCode}`),upd);
    }
  }

  /* ── Filter questions by category + difficulty ── */
  function filteredIndices(cats:Category[], diff:Diff|'all'): number[] {
    return QUESTIONS
      .map((_,i)=>i)
      .filter(i => cats.includes(QUESTIONS[i].cat) && (diff==='all'||QUESTIONS[i].diff===diff));
  }

  /* ── Start solo ── */
  function startSolo() {
    if (!playerName.trim()) { setError('Digite seu nome.'); return; }
    localStorage.setItem('godot_arena_name',playerName.trim());
    const pool = filteredIndices(selCats,selDiff);
    if (pool.length<3) { setError('Selecione mais categorias ou mude a dificuldade.'); return; }
    const idx = shuffle(pool).slice(0,Math.min(TOTAL_Q,pool.length));
    soloIndicesRef.current = idx; soloQRef.current = 0;
    setSoloIndices(idx); setSoloQ(0); setSoloScore(0); setSoloAnswers({});
    setSelected(null); setAnswered(false); setReviewing(false); setTimeLeft(QUESTION_TIME); setSoloQStart(Date.now());
    setMode('solo'); setView('game');
  }

  /* ── Create room ── */
  async function createRoom() {
    if (!playerName.trim()) { setError('Digite seu nome.'); return; }
    localStorage.setItem('godot_arena_name',playerName.trim());
    setLoading(true); setError('');
    const code = genCode();
    const pid  = playerIdRef.current;
    const pool = filteredIndices(selCats,selDiff);
    if (pool.length<3) { setError('Selecione mais categorias ou mude a dificuldade.'); setLoading(false); return; }
    const idx  = shuffle(pool).slice(0,Math.min(TOTAL_Q,pool.length));
    try {
      await set(ref(db,`${FB_PATH}/${code}`),{
        hostId:pid, status:'waiting',
        players:{[pid]:{name:playerName.trim(),score:0,answered:false,answers:{}}},
        qIndices:idx, currentQ:0, totalQ:idx.length, qStartedAt:0, createdAt:Date.now(),
      } satisfies RoomData);
      setRoomCode(code); setMode('create'); subscribeRoom(code); setView('lobby');
    } catch { setError('Erro ao criar sala.'); }
    setLoading(false);
  }

  /* ── Join room ── */
  async function joinRoom() {
    const name = playerName.trim(); const code = codeInput.toUpperCase().trim();
    if (!name) { setError('Digite seu nome.'); return; }
    if (code.length!==4) { setError('Código tem 4 letras.'); return; }
    setLoading(true); setError('');
    localStorage.setItem('godot_arena_name',name);
    try {
      const snap = await get(ref(db,`${FB_PATH}/${code}`));
      const d:RoomData|null = snap.val();
      if (!d) { setError('Sala não encontrada.'); setLoading(false); return; }
      if (d.status!=='waiting') { setError('Essa sala já começou.'); setLoading(false); return; }
      const pid = playerIdRef.current;
      await dbUpdate(ref(db,`${FB_PATH}/${code}/players/${pid}`),{name,score:0,answered:false,answers:{}});
      setRoomCode(code); setMode('join'); subscribeRoom(code); setView('lobby');
    } catch { setError('Erro ao entrar na sala.'); }
    setLoading(false);
  }

  /* ── Start game (host) ── */
  async function startGame() {
    await dbUpdate(ref(db,`${FB_PATH}/${roomCode}`),{status:'question',currentQ:0,qStartedAt:Date.now()});
    setView('game');
  }

  /* ── Answer solo ── */
  function handleSoloAnswer(opt:number) {
    if (answered||!soloQuestion) return;
    if (timerRef.current) clearInterval(timerRef.current);
    const ms = Date.now()-soloQStart;
    const correct = opt===soloQuestion.ans;
    const q = soloQRef.current;
    setSelected(opt); setAnswered(true); setReviewing(true);
    setSoloScore(s=>s+calcScore(correct,ms));
    setSoloAnswers(p=>({...p,[q]:{opt,correct,ms}}));
    if (correct) { addCoins(5); addPoints(3); }
    reviewRef.current = setTimeout(doSoloNext, REVIEW_TIME*1000);
  }

  /* ── Answer MP ── */
  async function handleMpAnswer(opt:number) {
    if (answered||mpStatus!=='question'||!mpQuestion) return;
    const ms = Date.now()-qStartAt;
    const correct = opt===mpQuestion.ans;
    const pts = calcScore(correct,ms);
    const pid = playerIdRef.current;
    // Cap: máximo possível = TOTAL_Q questões × 300 pts cada
    const newScore = Math.min((roomPlayers[pid]?.score??0)+pts, TOTAL_Q * 300);
    setSelected(opt); setAnswered(true);
    if (correct) { addCoins(5); addPoints(3); }
    await dbUpdate(ref(db,`${FB_PATH}/${roomCode}/players/${pid}`),{
      answered:true, score:newScore, [`answers/${currentQMp}`]:{opt,correct,ms},
    });
  }

  function leaveRoom() {
    unsubRef.current?.(); setRoomCode(''); setRoomData(null);
    setView('menu'); setError(''); setSelected(null); setAnswered(false); setReviewing(false);
  }

  function copyCode() { navigator.clipboard.writeText(roomCode); setCopied(true); setTimeout(()=>setCopied(false),2000); }

  /* ── Theme ── */
  const { bg: _baseBg, panel, panel2: pnl2, border: bdr, text: tx, sub } = gameTheme(isDark);
  // Light-mode usa #eef2ff (azul-índigo da marca Godot); dark usa o tema base
  const bg  = isDark ? _baseBg : '#eef2ff';
  const acc = '#478cbf';

  /* ═══════════════════════════════════════════
     MENU
  ═══════════════════════════════════════════ */
  if (view==='menu') return (
    <div style={{minHeight:'100vh',background:bg,color:tx,fontFamily:'system-ui,-apple-system,sans-serif'}}>
      <style>{ANIM}</style>
      <div style={{display:'flex',alignItems:'center',padding:'12px 20px',borderBottom:`1px solid ${bdr}`,background:panel}}>
        <button onClick={onBack} style={{display:'flex',alignItems:'center',gap:6,background:'none',border:`1px solid ${bdr}`,color:sub,cursor:'pointer',padding:'7px 14px',fontSize:12}}>
          <ChevronLeft size={13}/> Voltar
        </button>
      </div>

      <div style={{maxWidth:700,margin:'0 auto',padding:'40px 20px',animation:'gaIn .5s ease both'}}>
        <div style={{textAlign:'center',marginBottom:40}}>
          <div style={{display:'flex',justifyContent:'center',marginBottom:16}}><GodotLogo size={72}/></div>
          <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:9,color:acc,marginBottom:10,letterSpacing:'0.2em'}}>TURMAS CT</div>
          <h1 style={{fontFamily:"'Press Start 2P',monospace",fontSize:'clamp(18px,4vw,26px)',color:tx,margin:'0 0 12px',lineHeight:1.4}}>GODOT ARENA</h1>
          <p style={{fontSize:14,color:sub,margin:0}}>Quiz de Godot — GDScript, Game Design, Nós, Física e mais!</p>
        </div>

        {/* Name */}
        <div style={{marginBottom:24,background:pnl2,border:`1px solid ${bdr}`,padding:'18px 22px'}}>
          <label style={{display:'block',fontSize:11,fontWeight:700,color:sub,marginBottom:8,textTransform:'uppercase',letterSpacing:'0.08em'}}>Seu nome</label>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <User size={15} color={sub}/>
            <input value={playerName} onChange={e=>{setPlayerName(e.target.value);setError('');}}
              placeholder="Ex: Programador123" maxLength={20}
              style={{flex:1,padding:'9px 12px',background:panel,border:`1.5px solid ${bdr}`,color:tx,fontSize:14,fontFamily:'inherit',outline:'none'}}
              onFocus={e=>(e.currentTarget.style.borderColor=acc)} onBlur={e=>(e.currentTarget.style.borderColor=bdr)}/>
          </div>
          {error && <div style={{marginTop:8,fontSize:12,color:'#ef4444'}}>{error}</div>}
        </div>

        {/* Modes */}
        <div style={{display:'flex',flexDirection:'column',gap:14,marginBottom:28}}>
          {/* Solo */}
          <div onClick={()=>{if(!playerName.trim()){setError('Digite seu nome.');return;}setMode('solo');setView('setup');}}
            style={{background:pnl2,border:`2px solid ${bdr}`,padding:'18px 22px',cursor:'pointer',transition:'all .15s'}}
            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor=acc;(e.currentTarget as HTMLElement).style.transform='translateY(-2px)';}}
            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor=bdr;(e.currentTarget as HTMLElement).style.transform='none';}}>
            <div style={{display:'flex',alignItems:'center',gap:14}}>
              <div style={{width:44,height:44,background:`${acc}22`,border:`2px solid ${acc}55`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <Zap size={20} color={acc}/>
              </div>
              <div><div style={{fontWeight:700,fontSize:15,color:tx,marginBottom:3}}>Praticar Solo</div>
              <div style={{fontSize:12,color:sub}}>Escolha as categorias e treine antes do duelo!</div></div>
              <Play size={16} color={acc} style={{marginLeft:'auto',flexShrink:0}}/>
            </div>
          </div>

          {/* Create */}
          <div onClick={()=>{if(!playerName.trim()){setError('Digite seu nome.');return;}setMode('create');setView('setup');}}
            style={{background:pnl2,border:`2px solid ${bdr}`,padding:'18px 22px',cursor:'pointer',transition:'all .15s'}}
            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor='#22c55e';(e.currentTarget as HTMLElement).style.transform='translateY(-2px)';}}
            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor=bdr;(e.currentTarget as HTMLElement).style.transform='none';}}>
            <div style={{display:'flex',alignItems:'center',gap:14}}>
              <div style={{width:44,height:44,background:'#22c55e22',border:'2px solid #22c55e55',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <Users size={20} color="#22c55e"/>
              </div>
              <div><div style={{fontWeight:700,fontSize:15,color:tx,marginBottom:3}}>Criar Sala</div>
              <div style={{fontSize:12,color:sub}}>Compartilhe o código com a turma e joguem juntos!</div></div>
              <Play size={16} color="#22c55e" style={{marginLeft:'auto',flexShrink:0}}/>
            </div>
          </div>

          {/* Join */}
          <div style={{background:pnl2,border:`2px solid ${bdr}`,padding:'18px 22px'}}>
            <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:14}}>
              <div style={{width:44,height:44,background:'#a855f722',border:'2px solid #a855f755',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <LogIn size={20} color="#a855f7"/>
              </div>
              <div><div style={{fontWeight:700,fontSize:15,color:tx,marginBottom:3}}>Entrar em Sala</div>
              <div style={{fontSize:12,color:sub}}>Já tem o código? Entre diretamente!</div></div>
            </div>
            <div style={{display:'flex',gap:10}}>
              <input value={codeInput} onChange={e=>setCodeInput(e.target.value.toUpperCase())} placeholder="XXXX" maxLength={4}
                style={{flex:1,padding:'9px 14px',background:panel,border:'2px solid #a855f755',color:tx,fontSize:20,fontFamily:"'Press Start 2P',monospace",textAlign:'center',letterSpacing:'0.3em',outline:'none',textTransform:'uppercase'}}
                onFocus={e=>(e.currentTarget.style.borderColor='#a855f7')} onBlur={e=>(e.currentTarget.style.borderColor='#a855f755')}
                onKeyDown={e=>e.key==='Enter'&&joinRoom()}/>
              <button onClick={joinRoom} disabled={loading}
                style={{padding:'9px 18px',background:'#a855f7',border:'none',color:'#fff',fontWeight:700,fontSize:13,cursor:'pointer',display:'flex',alignItems:'center',gap:6}}>
                <LogIn size={13}/> ENTRAR
              </button>
            </div>
          </div>
        </div>

        {/* Category preview */}
        <div style={{display:'flex',gap:8,flexWrap:'wrap',justifyContent:'center'}}>
          {(Object.entries(CAT_CFG) as [Category,CatCfg][]).map(([k,c])=>(
            <div key={k} style={{display:'flex',alignItems:'center',gap:6,padding:'6px 12px',background:pnl2,border:`1px solid ${bdr}`,fontSize:11,color:c.color}}>
              {c.icon} {c.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════
     SETUP (category + difficulty selection)
  ═══════════════════════════════════════════ */
  if (view==='setup') {
    const pool = filteredIndices(selCats,selDiff);
    const qCount = Math.min(TOTAL_Q, pool.length);
    const toggleCat = (cat:Category) =>
      setSelCats(prev => prev.includes(cat) ? prev.filter(c=>c!==cat) : [...prev,cat]);

    return (
      <div style={{minHeight:'100vh',background:bg,color:tx,fontFamily:'system-ui,-apple-system,sans-serif'}}>
        <style>{ANIM}</style>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 20px',borderBottom:`1px solid ${bdr}`,background:panel}}>
          <button onClick={()=>setView('menu')} style={{display:'flex',alignItems:'center',gap:6,background:'none',border:`1px solid ${bdr}`,color:sub,cursor:'pointer',padding:'7px 14px',fontSize:12}}>
            <ChevronLeft size={13}/> Voltar
          </button>
          <span style={{fontFamily:"'Press Start 2P',monospace",fontSize:9,color:acc}}>CONFIGURAR PARTIDA</span>
          <div/>
        </div>

        <div style={{maxWidth:680,margin:'0 auto',padding:'32px 20px',animation:'gaIn .4s ease both'}}>

          {/* Categories */}
          <div style={{marginBottom:28}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
              <span style={{fontFamily:"'Press Start 2P',monospace",fontSize:9,color:sub}}>CATEGORIAS</span>
              <div style={{display:'flex',gap:8}}>
                <button onClick={()=>setSelCats(['gdscript','gamedesign','nos','animacao','fisica','estrutura'])}
                  style={{padding:'4px 12px',background:'none',border:`1px solid ${bdr}`,color:sub,fontSize:11,cursor:'pointer'}}>Todas</button>
                <button onClick={()=>setSelCats([])}
                  style={{padding:'4px 12px',background:'none',border:`1px solid ${bdr}`,color:sub,fontSize:11,cursor:'pointer'}}>Nenhuma</button>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:10}}>
              {(Object.entries(CAT_CFG) as [Category,CatCfg][]).map(([k,c])=>{
                const on = selCats.includes(k);
                const cnt = QUESTIONS.filter(q=>q.cat===k&&(selDiff==='all'||q.diff===selDiff)).length;
                return (
                  <div key={k} onClick={()=>toggleCat(k)}
                    style={{padding:'14px 16px',border:`2px solid ${on?c.color:bdr}`,background:on?`${c.color}12`:pnl2,cursor:'pointer',transition:'all .15s'}}
                    onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor=c.color;}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor=on?c.color:bdr;}}>
                    <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:6}}>
                      <div style={{color:on?c.color:sub,display:'flex'}}>{c.icon}</div>
                      <span style={{fontWeight:700,fontSize:13,color:on?c.color:tx}}>{c.label}</span>
                      <div style={{marginLeft:'auto',width:18,height:18,border:`2px solid ${on?c.color:bdr}`,background:on?c.color:'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                        {on && <Check size={11} color="#fff"/>}
                      </div>
                    </div>
                    <div style={{fontSize:11,color:sub,marginBottom:4}}>{c.desc}</div>
                    <div style={{fontSize:10,color:on?c.color:sub}}>{cnt} questões disponíveis</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Difficulty */}
          <div style={{marginBottom:28}}>
            <span style={{fontFamily:"'Press Start 2P',monospace",fontSize:9,color:sub,display:'block',marginBottom:12}}>DIFICULDADE</span>
            <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
              {([['all','Todas as dificuldades','#8b949e'],['facil','Fácil','#22c55e'],['medio','Médio','#f59e0b'],['dificil','Difícil','#ef4444']] as const).map(([d,label,color])=>(
                <button key={d} onClick={()=>setSelDiff(d)}
                  style={{padding:'9px 18px',border:`2px solid ${selDiff===d?color:bdr}`,background:selDiff===d?`${color}18`:pnl2,color:selDiff===d?color:sub,fontSize:12,fontWeight:600,cursor:'pointer',transition:'all .12s'}}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div style={{padding:'14px 20px',background:pnl2,border:`1px solid ${bdr}`,marginBottom:24,display:'flex',alignItems:'center',gap:16,flexWrap:'wrap'}}>
            <div>
              <span style={{fontFamily:"'Press Start 2P',monospace",fontSize:18,color:pool.length>=3?acc:'#ef4444'}}>{qCount}</span>
              <span style={{fontSize:12,color:sub,marginLeft:8}}>questões nesta partida</span>
            </div>
            <div style={{fontSize:11,color:sub}}>
              ({pool.length} disponíveis no banco)
            </div>
            {pool.length<3 && <div style={{fontSize:12,color:'#ef4444'}}>Selecione mais categorias!</div>}
          </div>

          {error && <div style={{padding:'10px 14px',background:'#ef444415',border:'1px solid #ef444444',color:'#ef4444',fontSize:13,marginBottom:16}}>{error}</div>}

          <button
            onClick={mode==='solo' ? startSolo : createRoom}
            disabled={pool.length<3||loading}
            style={{width:'100%',padding:'15px',background:pool.length>=3?acc:(isDark?'#21262d':'#e5e7eb'),
              border:'none',color:pool.length>=3?'#fff':sub,
              fontFamily:"'Press Start 2P',monospace",fontSize:11,cursor:pool.length>=3?'pointer':'not-allowed',
              boxShadow:pool.length>=3?`3px 3px 0 #2a6496`:'none',
              display:'flex',alignItems:'center',justifyContent:'center',gap:10}}>
            <Play size={13} fill="currentColor"/>
            {loading ? 'CRIANDO...' : mode==='solo' ? 'INICIAR SOLO' : 'CRIAR SALA'}
          </button>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════
     LOBBY
  ═══════════════════════════════════════════ */
  if (view==='lobby') return (
    <div style={{minHeight:'100vh',background:bg,color:tx,fontFamily:'system-ui,-apple-system,sans-serif'}}>
      <style>{ANIM}</style>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 20px',borderBottom:`1px solid ${bdr}`,background:panel}}>
        <button onClick={leaveRoom} style={{display:'flex',alignItems:'center',gap:6,background:'none',border:`1px solid ${bdr}`,color:sub,cursor:'pointer',padding:'7px 14px',fontSize:12}}>
          <ChevronLeft size={13}/> Sair
        </button>
        <span style={{fontFamily:"'Press Start 2P',monospace",fontSize:9,color:acc}}>GODOT ARENA</span>
      </div>

      <div style={{maxWidth:520,margin:'0 auto',padding:'36px 20px',animation:'gaIn .5s ease both'}}>
        <div style={{textAlign:'center',marginBottom:36}}>
          <div style={{fontSize:12,color:sub,marginBottom:10}}>Código da Sala</div>
          <div style={{display:'inline-flex',alignItems:'center',gap:12,padding:'14px 28px',background:`${acc}15`,border:`3px solid ${acc}55`}}>
            <span style={{fontFamily:"'Press Start 2P',monospace",fontSize:30,color:acc,letterSpacing:'0.25em'}}>{roomCode}</span>
            <button onClick={copyCode} style={{background:'none',border:`1px solid ${acc}55`,color:acc,cursor:'pointer',padding:8,display:'flex',alignItems:'center'}}>
              {copied?<Check size={15}/>:<Copy size={15}/>}
            </button>
          </div>
          <div style={{fontSize:12,color:sub,marginTop:10}}>{isHost?'Compartilhe este código!':'Aguardando o host iniciar...'}</div>
        </div>

        <div style={{background:pnl2,border:`1px solid ${bdr}`,marginBottom:20}}>
          <div style={{padding:'10px 16px',borderBottom:`1px solid ${bdr}`,display:'flex',alignItems:'center',gap:8}}>
            <Users size={13} color={acc}/>
            <span style={{fontFamily:"'Press Start 2P',monospace",fontSize:8,color:acc}}>JOGADORES ({playerList.length})</span>
          </div>
          <div style={{padding:12,display:'flex',flexDirection:'column',gap:8}}>
            {playerList.map((p,i)=>(
              <div key={p.id} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 13px',background:panel,border:`1px solid ${bdr}`,animation:`gaIn .3s ease ${i*.08}s both`}}>
                {roomData?.hostId===p.id&&<Crown size={13} color="#fbbf24"/>}
                <User size={13} color={sub}/>
                <span style={{fontSize:13,fontWeight:600,color:p.id===playerIdRef.current?acc:tx}}>
                  {p.name}{p.id===playerIdRef.current?' (você)':''}
                </span>
                {roomData?.hostId===p.id&&<span style={{fontSize:10,color:'#fbbf24',marginLeft:'auto'}}>HOST</span>}
              </div>
            ))}
          </div>
        </div>

        {isHost ? (
          <button onClick={startGame}
            style={{width:'100%',padding:'14px',background:'#22c55e',border:'none',color:'#fff',
              fontFamily:"'Press Start 2P',monospace",fontSize:11,cursor:'pointer',
              boxShadow:'3px 3px 0 #15803d',display:'flex',alignItems:'center',justifyContent:'center',gap:10}}>
            <Play size={13} fill="currentColor"/> INICIAR JOGO
          </button>
        ) : (
          <div style={{textAlign:'center',padding:'18px',background:pnl2,border:`1px solid ${bdr}`}}>
            <div style={{animation:'gaPulse 1.5s ease infinite',fontSize:13,color:sub}}>Aguardando o host iniciar...</div>
          </div>
        )}
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════
     GAME
  ═══════════════════════════════════════════ */
  if (view==='game') {
    const question  = mode==='solo' ? soloQuestion : mpQuestion;
    const qNum      = mode==='solo' ? soloQ+1 : currentQMp+1;
    const total     = mode==='solo' ? soloIndices.length : totalQMp;
    const myScore   = mode==='solo' ? soloScore : (roomPlayers[playerIdRef.current]?.score??0);
    const isReview  = mode==='solo' ? reviewing : mpStatus==='review';
    const picked    = mode==='solo' ? (soloAnswers[soloQ]?.opt??selected) : selected;
    const timerPct  = (timeLeft/QUESTION_TIME)*100;
    const timerClr  = timerPct>50?'#22c55e':timerPct>25?'#f59e0b':'#ef4444';

    if (!question) return (
      <div style={{minHeight:'100vh',background:bg,display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div style={{color:sub}}>Carregando...</div>
      </div>
    );

    const catCfg = CAT_CFG[question.cat];

    return (
      <div style={{minHeight:'100vh',background:bg,color:tx,fontFamily:'system-ui,-apple-system,sans-serif'}}>
        <style>{ANIM}</style>
        <div style={{padding:'10px 20px',borderBottom:`1px solid ${bdr}`,background:panel,display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:8}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <GodotLogo size={26}/>
            <span style={{fontFamily:"'Press Start 2P',monospace",fontSize:8,color:acc}}>GODOT ARENA</span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:18,flexWrap:'wrap'}}>
            <span style={{fontFamily:"'Press Start 2P',monospace",fontSize:8,color:sub}}>{qNum}/{total}</span>
            <div style={{display:'flex',alignItems:'center',gap:5}}>
              <Star size={13} color="#fbbf24" fill="#fbbf24"/>
              <span style={{fontFamily:"'Press Start 2P',monospace",fontSize:9,color:'#fbbf24'}}>{myScore}</span>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:5}}>
              <Clock size={13} color={isReview?sub:timerClr}/>
              {!isReview&&<span style={{fontFamily:"'Press Start 2P',monospace",fontSize:10,color:timerClr,minWidth:22}}>{timeLeft}</span>}
            </div>
          </div>
        </div>

        {/* Timer bar */}
        <div style={{height:4,background:isDark?'#21262d':'#e5e7eb'}}>
          {!isReview&&<div style={{height:'100%',background:timerClr,width:`${timerPct}%`,transition:'width 0.5s linear,background 0.5s'}}/>}
        </div>

        <div style={{maxWidth:780,margin:'0 auto',padding:'24px 20px'}}>
          {/* Meta */}
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14,flexWrap:'wrap'}}>
            <span style={{display:'flex',alignItems:'center',gap:6,padding:'4px 12px',fontSize:11,fontWeight:700,color:catCfg.color,background:`${catCfg.color}18`,border:`1px solid ${catCfg.color}44`}}>
              {catCfg.icon} {catCfg.label}
            </span>
            <span style={{padding:'4px 10px',fontSize:10,fontWeight:700,color:diffColor(question.diff),background:`${diffColor(question.diff)}18`,border:`1px solid ${diffColor(question.diff)}44`}}>
              {diffLabel(question.diff)}
            </span>
            <span style={{fontSize:12,color:sub}}>{question.topic}</span>
          </div>

          {/* Question */}
          <div style={{fontSize:17,fontWeight:700,color:tx,marginBottom:16,lineHeight:1.5}}>{question.q}</div>
          {question.code && <CodeBlock code={question.code} isDark={isDark}/>}

          {/* Options */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:10,marginTop:question.code?16:0,marginBottom:20}}>
            {question.opts.map((opt,i)=>{
              const isSel = picked===i;
              const isAns = i===question.ans;
              let bc=bdr, bg2=pnl2, tc=tx, an='';
              if (isReview||answered) {
                if (isAns)            { bc='#22c55e'; bg2='#22c55e15'; tc='#22c55e'; an='gaRight 1.5s ease infinite'; }
                else if(isSel&&!isAns){ bc='#ef4444'; bg2='#ef444415'; tc='#ef4444'; an='gaWrong .4s ease'; }
                else                  { bc=bdr; bg2=isDark?'#21262d':'#f0f4ff'; tc=sub; }
              } else if(isSel)        { bc=acc; bg2=`${acc}15`; tc=acc; }
              const canClick = !answered&&!isReview&&(mode==='solo'||mpStatus==='question');
              return (
                <button key={i} onClick={()=>canClick&&(mode==='solo'?handleSoloAnswer(i):handleMpAnswer(i))}
                  style={{padding:'13px 16px',background:bg2,border:`2px solid ${bc}`,color:tc,fontSize:13,
                    cursor:canClick?'pointer':'default',textAlign:'left',display:'flex',alignItems:'center',gap:10,
                    fontFamily:'inherit',transition:'all .12s',animation:an}}
                  onMouseEnter={e=>{if(canClick)(e.currentTarget as HTMLElement).style.transform='translateY(-2px)';}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.transform='none';}}>
                  <div style={{width:26,height:26,flexShrink:0,border:`2px solid ${bc}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:bc}}>
                    {isReview&&isAns?<CheckCircle size={14}/>:isReview&&isSel&&!isAns?<XCircle size={14}/>:['A','B','C','D'][i]}
                  </div>
                  <span style={{lineHeight:1.4}}>{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {isReview && (
            <div style={{padding:'14px 18px',background:`${acc}12`,border:`2px solid ${acc}33`,animation:'gaPop .35s ease both',display:'flex',gap:12,alignItems:'flex-start',marginBottom:16}}>
              <Shield size={16} color={acc} style={{flexShrink:0,marginTop:2}}/>
              <div>
                <div style={{fontWeight:700,fontSize:11,color:acc,marginBottom:5,fontFamily:"'Press Start 2P',monospace"}}>
                  {(mode==='solo'?soloAnswers[soloQ]?.correct:selected!==null&&selected===question.ans)?'Correto!':'Quase lá!'}
                </div>
                <div style={{fontSize:13,color:tx,lineHeight:1.6}}>{question.exp}</div>
              </div>
            </div>
          )}

          {/* MP waiting */}
          {mode!=='solo'&&answered&&mpStatus==='question'&&(
            <div style={{textAlign:'center',fontSize:13,color:sub,animation:'gaPulse 1.5s ease infinite',padding:'12px'}}>
              Aguardando outros jogadores...
            </div>
          )}

          {/* MP scoreboard during review */}
          {mode!=='solo'&&mpStatus==='review'&&(
            <div style={{background:pnl2,border:`1px solid ${bdr}`}}>
              <div style={{padding:'9px 16px',borderBottom:`1px solid ${bdr}`}}>
                <span style={{fontFamily:"'Press Start 2P',monospace",fontSize:8,color:acc}}>PLACAR</span>
              </div>
              <div style={{padding:10,display:'flex',flexDirection:'column',gap:5}}>
                {[...playerList].sort((a,b)=>b.score-a.score).map((p,i)=>(
                  <div key={p.id} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 12px',
                    background:p.id===playerIdRef.current?`${acc}15`:'transparent',
                    border:p.id===playerIdRef.current?`1px solid ${acc}44`:'1px solid transparent'}}>
                    {i===0?<Crown size={12} color="#fbbf24"/>:<span style={{fontFamily:"'Press Start 2P',monospace",fontSize:8,color:sub,minWidth:18}}>#{i+1}</span>}
                    <span style={{flex:1,fontSize:13,fontWeight:600,color:p.id===playerIdRef.current?acc:tx}}>{p.name}</span>
                    <span style={{fontFamily:"'Press Start 2P',monospace",fontSize:9,color:'#fbbf24'}}>{p.score}pts</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════
     RESULTS
  ═══════════════════════════════════════════ */
  if (view==='results') {
    const isSolo = mode==='solo';
    const sorted = isSolo?[]:[...playerList].sort((a,b)=>b.score-a.score);
    const correct = isSolo
      ? Object.values(soloAnswers).filter(a=>a.correct).length
      : Object.values(roomPlayers[playerIdRef.current]?.answers??{}).filter(a=>a.correct).length;
    const myFinal = isSolo ? soloScore : (roomPlayers[playerIdRef.current]?.score??0);
    const myRank  = isSolo ? 1 : sorted.findIndex(p=>p.id===playerIdRef.current)+1;

    return (
      <div style={{minHeight:'100vh',background:bg,color:tx,fontFamily:'system-ui,-apple-system,sans-serif'}}>
        <style>{ANIM}</style>
        <div style={{maxWidth:600,margin:'0 auto',padding:'40px 20px',animation:'gaIn .5s ease both'}}>
          <div style={{textAlign:'center',marginBottom:36}}>
            <div style={{animation:'gaCrown .6s ease both',display:'flex',justifyContent:'center',marginBottom:14}}>
              <Trophy size={60} color="#fbbf24" fill="#fbbf24"/>
            </div>
            <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:13,color:tx,marginBottom:8}}>
              {isSolo?'FIM DO QUIZ!':myRank===1?'VOCÊ VENCEU!':'FIM DE JOGO!'}
            </div>
            <div style={{fontSize:13,color:sub}}>{playerName}</div>
          </div>

          <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap',marginBottom:28}}>
            {[
              {label:'Pontos',val:myFinal,color:'#fbbf24'},
              {label:'Acertos',val:`${correct}/${isSolo?soloIndices.length:totalQMp}`,color:'#22c55e'},
              ...(!isSolo?[{label:'Posição',val:`#${myRank}`,color:acc}]:[]),
            ].map(s=>(
              <div key={s.label} style={{padding:'14px 22px',background:pnl2,border:`2px solid ${s.color}44`,textAlign:'center',animation:'gaPop .4s ease both'}}>
                <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:16,color:s.color,marginBottom:5}}>{s.val}</div>
                <div style={{fontSize:11,color:sub}}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* MP ranking */}
          {!isSolo&&(
            <div style={{background:pnl2,border:`1px solid ${bdr}`,marginBottom:22}}>
              <div style={{padding:'10px 16px',borderBottom:`1px solid ${bdr}`}}>
                <span style={{fontFamily:"'Press Start 2P',monospace",fontSize:8,color:acc}}>RANKING FINAL</span>
              </div>
              <div style={{padding:10,display:'flex',flexDirection:'column',gap:5}}>
                {sorted.map((p,i)=>(
                  <div key={p.id} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',
                    background:p.id===playerIdRef.current?`${acc}15`:i%2===0?(isDark?'#ffffff06':'#00000003'):'transparent',
                    border:p.id===playerIdRef.current?`1px solid ${acc}44`:'1px solid transparent',
                    animation:`gaIn .3s ease ${i*.07}s both`}}>
                    <div style={{width:22,display:'flex',justifyContent:'center'}}>
                      {i===0?<Crown size={13} color="#fbbf24"/>:i===1?<Crown size={13} color="#94a3b8"/>:i===2?<Crown size={13} color="#cd7c0f"/>:
                       <span style={{fontFamily:"'Press Start 2P',monospace",fontSize:8,color:sub}}>#{i+1}</span>}
                    </div>
                    <span style={{flex:1,fontSize:13,fontWeight:600,color:p.id===playerIdRef.current?acc:tx}}>
                      {p.name}{p.id===playerIdRef.current?' (você)':''}
                    </span>
                    <span style={{fontFamily:"'Press Start 2P',monospace",fontSize:9,color:'#fbbf24'}}>{p.score}pts</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Solo review */}
          {isSolo&&(
            <div style={{background:pnl2,border:`1px solid ${bdr}`,marginBottom:22}}>
              <div style={{padding:'10px 16px',borderBottom:`1px solid ${bdr}`}}>
                <span style={{fontFamily:"'Press Start 2P',monospace",fontSize:8,color:acc}}>REVISÃO</span>
              </div>
              <div style={{padding:10,display:'flex',flexDirection:'column',gap:6}}>
                {soloIndices.map((qi,idx)=>{
                  const q=QUESTIONS[qi]; const a=soloAnswers[idx];
                  return (
                    <div key={idx} style={{padding:'9px 13px',background:a?.correct?'#22c55e12':'#ef444412',border:`1px solid ${a?.correct?'#22c55e44':'#ef444444'}`,display:'flex',alignItems:'flex-start',gap:10}}>
                      {a?.correct?<CheckCircle size={14} color="#22c55e" style={{flexShrink:0,marginTop:2}}/>:<XCircle size={14} color="#ef4444" style={{flexShrink:0,marginTop:2}}/>}
                      <div>
                        <div style={{fontSize:11,fontWeight:600,color:tx,marginBottom:2}}>Q{idx+1}: {q.q.slice(0,55)}{q.q.length>55?'...':''}</div>
                        <div style={{fontSize:10,color:sub}}>{a?.correct?'Correto':a?.opt===-1?`Tempo esgotado → ${q.opts[q.ans]}`:`Errou → ${q.opts[q.ans]}`}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{display:'flex',gap:12}}>
            <button onClick={leaveRoom}
              style={{flex:1,padding:'12px',background:'none',border:`2px solid ${bdr}`,color:sub,fontSize:13,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,fontFamily:'inherit'}}>
              <ChevronLeft size={13}/> Menu
            </button>
            <button onClick={()=>{if(isSolo){setView('setup');}else{leaveRoom();}}}
              style={{flex:1,padding:'12px',background:acc,border:'none',color:'#fff',fontSize:13,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,fontFamily:'inherit',boxShadow:`3px 3px 0 #2a6496`}}>
              <RotateCcw size={13}/> {isSolo?'Jogar Novamente':'Nova Sala'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
