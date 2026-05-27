import { Roadmap, RoadmapCategoryConfig } from '../types/roadmap';

export const ROADMAP_CATEGORIES: RoadmapCategoryConfig[] = [
  { id: 'todos',        label: 'Todos',          icon: 'LayoutGrid', color: '#64748b', description: 'Todas as trilhas' },
  { id: 'desenvolvimento', label: 'Desenvolvimento', icon: 'Code2',      color: '#06b6d4', description: 'Web, Mobile e APIs' },
  { id: 'jogos',        label: 'Jogos',           icon: 'Gamepad2',   color: '#a855f7', description: 'Game Dev & Design' },
  { id: 'infra',        label: 'Infra & Cloud',   icon: 'Server',     color: '#22c55e', description: 'DevOps, Segurança & Suporte' },
  { id: 'ia-dados',     label: 'IA & Dados',      icon: 'Brain',      color: '#f97316', description: 'Machine Learning & Analytics' },
];

export const ROADMAPS: Roadmap[] = [
  /* ─────────────────────────── DESENVOLVIMENTO ─────────────────────────── */
  {
    id: 'frontend',
    title: 'Frontend Developer',
    shortTitle: 'Frontend',
    icon: 'Globe',
    description: 'Crie interfaces web modernas, responsivas e acessíveis.',
    longDescription: 'A trilha de Frontend cobre desde os fundamentos da web até frameworks modernos como React, passando por JavaScript avançado, TypeScript, acessibilidade e testes. Ao final, você será capaz de construir aplicações web completas do zero.',
    category: 'desenvolvimento',
    color: '#06b6d4',
    estimatedTime: '8–14 meses',
    difficulty: 'Iniciante',
    tags: ['HTML', 'CSS', 'JavaScript', 'React', 'TypeScript', 'Vite'],
    steps: [
      {
        id: 'fe-1', order: 1,
        title: 'Fundamentos Web',
        description: 'A base de tudo: como a web funciona, HTML semântico e CSS moderno.',
        level: 'Iniciante',
        techs: [
          {
            name: 'HTML5',
            description: 'Estrutura semântica de páginas web.',
            resources: [
              { title: 'MDN – Aprenda HTML', url: 'https://developer.mozilla.org/pt-BR/docs/Learn/HTML', type: 'free', platform: 'MDN' },
              { title: 'Curso em Vídeo – HTML5', url: 'https://www.cursoemvideo.com/curso/html5/', type: 'free', platform: 'YouTube' },
              { title: 'FreeCodeCamp – Responsive Web Design', url: 'https://www.freecodecamp.org/learn/2022/responsive-web-design/', type: 'free', platform: 'freeCodeCamp' },
            ]
          },
          {
            name: 'CSS3',
            description: 'Estilização, Flexbox, Grid e responsividade.',
            resources: [
              { title: 'MDN – Aprenda CSS', url: 'https://developer.mozilla.org/pt-BR/docs/Learn/CSS', type: 'free', platform: 'MDN' },
              { title: 'Flexbox Froggy', url: 'https://flexboxfroggy.com/', type: 'free', platform: 'Jogo Interativo' },
              { title: 'CSS Grid Garden', url: 'https://cssgridgarden.com/', type: 'free', platform: 'Jogo Interativo' },
              { title: 'CSS Tricks – Guia completo Flexbox', url: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/', type: 'free', platform: 'CSS-Tricks' },
            ]
          },
          {
            name: 'Git & GitHub',
            description: 'Controle de versão e colaboração.',
            resources: [
              { title: 'Learn Git Branching (interativo)', url: 'https://learngitbranching.js.org/', type: 'free', platform: 'Interativo' },
              { title: 'Git – Guia Prático', url: 'https://rogerdudler.github.io/git-guide/index.pt_BR.html', type: 'free', platform: 'Guia' },
            ]
          },
        ]
      },
      {
        id: 'fe-2', order: 2,
        title: 'JavaScript Essencial',
        description: 'A linguagem da web: variáveis, funções, DOM, eventos e lógica.',
        level: 'Iniciante',
        techs: [
          {
            name: 'JavaScript',
            description: 'Linguagem de programação da web.',
            resources: [
              { title: 'javascript.info – Guia Moderno', url: 'https://javascript.info/', type: 'free', platform: 'javascript.info' },
              { title: 'FreeCodeCamp – JavaScript Algorithms', url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/', type: 'free', platform: 'freeCodeCamp' },
              { title: 'Eloquent JavaScript (PT-BR)', url: 'https://braziljs.github.io/eloquente-javascript/', type: 'free', platform: 'Livro Online' },
            ]
          },
          {
            name: 'DOM & Eventos',
            description: 'Manipulação do HTML via JavaScript.',
            resources: [
              { title: 'MDN – DOM Manipulation', url: 'https://developer.mozilla.org/pt-BR/docs/Learn/JavaScript/Client-side_web_APIs/Manipulating_documents', type: 'free', platform: 'MDN' },
              { title: 'The Odin Project – DOM Manipulation', url: 'https://www.theodinproject.com/lessons/foundations-dom-manipulation-and-events', type: 'free', platform: 'The Odin Project' },
            ]
          },
        ]
      },
      {
        id: 'fe-3', order: 3,
        title: 'JavaScript Avançado',
        description: 'ES6+, programação assíncrona, fetch de APIs e módulos.',
        level: 'Intermediário',
        techs: [
          {
            name: 'ES6+ Moderno',
            description: 'Arrow functions, destructuring, async/await, módulos.',
            resources: [
              { title: 'javascript.info – ES6 Moderno', url: 'https://javascript.info/js', type: 'free', platform: 'javascript.info' },
              { title: 'You Don\'t Know JS (livro grátis)', url: 'https://github.com/getify/You-Dont-Know-JS', type: 'free', platform: 'GitHub' },
            ]
          },
          {
            name: 'Fetch & APIs REST',
            description: 'Consumir APIs externas com fetch e async/await.',
            resources: [
              { title: 'MDN – Fetch API', url: 'https://developer.mozilla.org/pt-BR/docs/Web/API/Fetch_API/Using_Fetch', type: 'free', platform: 'MDN' },
              { title: 'The Odin Project – APIs', url: 'https://www.theodinproject.com/lessons/node-path-javascript-working-with-apis', type: 'free', platform: 'The Odin Project' },
            ]
          },
        ]
      },
      {
        id: 'fe-4', order: 4,
        title: 'React',
        description: 'A biblioteca mais usada no mercado para criar UIs declarativas.',
        level: 'Intermediário',
        techs: [
          {
            name: 'React',
            description: 'Componentes, hooks, estado e context API.',
            resources: [
              { title: 'React – Documentação Oficial', url: 'https://react.dev/learn', type: 'free', platform: 'React Docs' },
              { title: 'Rocketseat – Ignite React', url: 'https://www.rocketseat.com.br/ignite', type: 'paid', platform: 'Rocketseat' },
              { title: 'FreeCodeCamp – React', url: 'https://www.freecodecamp.org/learn/front-end-development-libraries/', type: 'free', platform: 'freeCodeCamp' },
            ]
          },
          {
            name: 'React Router',
            description: 'Navegação e roteamento em SPAs.',
            resources: [
              { title: 'React Router – Docs Oficiais', url: 'https://reactrouter.com/en/main', type: 'free', platform: 'Docs' },
            ]
          },
        ]
      },
      {
        id: 'fe-5', order: 5,
        title: 'TypeScript',
        description: 'Tipagem estática que torna seu código mais seguro e legível.',
        level: 'Intermediário',
        techs: [
          {
            name: 'TypeScript',
            description: 'Tipos, interfaces, generics e integração com React.',
            resources: [
              { title: 'TypeScript – Handbook Oficial', url: 'https://www.typescriptlang.org/docs/handbook/', type: 'free', platform: 'TypeScript Docs' },
              { title: 'Total TypeScript – Free Tutorials', url: 'https://www.totaltypescript.com/tutorials', type: 'free', platform: 'Total TypeScript' },
              { title: 'Execute Program – TypeScript', url: 'https://www.executeprogram.com/courses/typescript', type: 'paid', platform: 'Execute Program' },
            ]
          },
        ]
      },
      {
        id: 'fe-6', order: 6,
        title: 'Ferramentas & Deploy',
        description: 'Build tools, testes e publicação de projetos profissionais.',
        level: 'Avançado',
        techs: [
          {
            name: 'Vite & Build Tools',
            description: 'Bundlers modernos para desenvolvimento e produção.',
            resources: [
              { title: 'Vite – Guia de Início', url: 'https://vitejs.dev/guide/', type: 'free', platform: 'Vite Docs' },
            ]
          },
          {
            name: 'Testes com Vitest',
            description: 'Testes unitários e de integração.',
            resources: [
              { title: 'Vitest – Documentação', url: 'https://vitest.dev/', type: 'free', platform: 'Docs' },
              { title: 'Testing Library – Guia', url: 'https://testing-library.com/docs/react-testing-library/intro/', type: 'free', platform: 'Testing Library' },
            ]
          },
          {
            name: 'Deploy com Vercel e Netlify',
            description: 'Publicar projetos gratuitamente na web.',
            resources: [
              { title: 'Vercel – Documentação', url: 'https://vercel.com/docs', type: 'free', platform: 'Vercel' },
              { title: 'Netlify – Getting Started', url: 'https://docs.netlify.com/', type: 'free', platform: 'Netlify' },
            ]
          },
        ]
      },
    ]
  },

  {
    id: 'backend',
    title: 'Backend Developer',
    shortTitle: 'Backend',
    icon: 'Settings2',
    description: 'Construa servidores, APIs e lógica de negócio robustos.',
    longDescription: 'A trilha de Backend cobre Node.js, criação de APIs RESTful, bancos de dados SQL e NoSQL, autenticação, Docker e deploy em nuvem. Ideal para quem quer criar o "motor" por trás das aplicações.',
    category: 'desenvolvimento',
    color: '#06b6d4',
    estimatedTime: '10–16 meses',
    difficulty: 'Iniciante',
    tags: ['Node.js', 'Express', 'PostgreSQL', 'MongoDB', 'Docker', 'REST API'],
    steps: [
      {
        id: 'be-1', order: 1,
        title: 'Fundamentos de Programação',
        description: 'Lógica, algoritmos e estruturas de dados essenciais.',
        level: 'Iniciante',
        techs: [
          {
            name: 'Lógica de Programação',
            description: 'Variáveis, condicionais, laços e funções.',
            resources: [
              { title: 'CS50P – Intro to Python (Harvard)', url: 'https://cs50.harvard.edu/python/', type: 'free', platform: 'Harvard' },
              { title: 'Curso em Vídeo – Algoritmos', url: 'https://www.cursoemvideo.com/curso/curso-de-algoritmo/', type: 'free', platform: 'YouTube' },
            ]
          },
          {
            name: 'Git & Terminal',
            description: 'Controle de versão e linha de comando.',
            resources: [
              { title: 'The Missing Semester – MIT', url: 'https://missing.csail.mit.edu/', type: 'free', platform: 'MIT' },
              { title: 'Learn Git Branching', url: 'https://learngitbranching.js.org/', type: 'free', platform: 'Interativo' },
            ]
          },
        ]
      },
      {
        id: 'be-2', order: 2,
        title: 'Node.js Fundamentos',
        description: 'JavaScript no servidor: módulos, file system, HTTP nativo.',
        level: 'Iniciante',
        techs: [
          {
            name: 'Node.js',
            description: 'Runtime JavaScript para o servidor.',
            resources: [
              { title: 'Node.js – Documentação Oficial', url: 'https://nodejs.org/en/docs/', type: 'free', platform: 'Node.js Docs' },
              { title: 'Node.js Crash Course – Traversy Media', url: 'https://www.youtube.com/watch?v=fBNz5xF-Kx4', type: 'free', platform: 'YouTube' },
              { title: 'Rocketseat – Trilha Node.js', url: 'https://www.rocketseat.com.br/ignite', type: 'paid', platform: 'Rocketseat' },
            ]
          },
        ]
      },
      {
        id: 'be-3', order: 3,
        title: 'APIs RESTful',
        description: 'Criar endpoints, rotas, middlewares e tratar erros.',
        level: 'Intermediário',
        techs: [
          {
            name: 'Express.js',
            description: 'Framework web minimalista para Node.js.',
            resources: [
              { title: 'Express.js – Docs Oficiais', url: 'https://expressjs.com/', type: 'free', platform: 'Docs' },
              { title: 'FreeCodeCamp – APIs and Microservices', url: 'https://www.freecodecamp.org/learn/back-end-development-and-apis/', type: 'free', platform: 'freeCodeCamp' },
            ]
          },
          {
            name: 'Fastify',
            description: 'Framework Node.js de alta performance.',
            resources: [
              { title: 'Fastify – Documentação', url: 'https://www.fastify.io/docs/latest/', type: 'free', platform: 'Docs' },
              { title: 'Rocketseat – Fastify API', url: 'https://www.rocketseat.com.br/ignite', type: 'paid', platform: 'Rocketseat' },
            ]
          },
        ]
      },
      {
        id: 'be-4', order: 4,
        title: 'Bancos de Dados',
        description: 'SQL com PostgreSQL e NoSQL com MongoDB.',
        level: 'Intermediário',
        techs: [
          {
            name: 'PostgreSQL',
            description: 'Banco de dados relacional robusto e open-source.',
            resources: [
              { title: 'PostgreSQL Tutorial', url: 'https://www.postgresqltutorial.com/', type: 'free', platform: 'Tutorial' },
              { title: 'SQLBolt – SQL interativo', url: 'https://sqlbolt.com/', type: 'free', platform: 'Interativo' },
            ]
          },
          {
            name: 'Prisma ORM',
            description: 'ORM moderno para TypeScript com Node.js.',
            resources: [
              { title: 'Prisma – Documentação Oficial', url: 'https://www.prisma.io/docs/', type: 'free', platform: 'Docs' },
            ]
          },
          {
            name: 'MongoDB',
            description: 'Banco de dados NoSQL orientado a documentos.',
            resources: [
              { title: 'MongoDB University (grátis)', url: 'https://university.mongodb.com/', type: 'free', platform: 'MongoDB' },
            ]
          },
        ]
      },
      {
        id: 'be-5', order: 5,
        title: 'Autenticação & Segurança',
        description: 'JWT, OAuth2, hash de senhas e boas práticas de segurança.',
        level: 'Intermediário',
        techs: [
          {
            name: 'JWT & Sessões',
            description: 'Autenticação stateless com JSON Web Tokens.',
            resources: [
              { title: 'JWT.io – Introdução', url: 'https://jwt.io/introduction', type: 'free', platform: 'jwt.io' },
              { title: 'OWASP – Authentication Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html', type: 'free', platform: 'OWASP' },
            ]
          },
        ]
      },
      {
        id: 'be-6', order: 6,
        title: 'Docker & Deploy',
        description: 'Containerizar aplicações e fazer deploy em produção.',
        level: 'Avançado',
        techs: [
          {
            name: 'Docker',
            description: 'Containers para desenvolvimento e produção.',
            resources: [
              { title: 'Docker – Documentação Oficial', url: 'https://docs.docker.com/get-started/', type: 'free', platform: 'Docker Docs' },
              { title: 'Play with Docker (sandbox online)', url: 'https://labs.play-with-docker.com/', type: 'free', platform: 'Interativo' },
            ]
          },
          {
            name: 'Cloud Deploy',
            description: 'Deploy em Railway, Render ou AWS EC2.',
            resources: [
              { title: 'Railway – Deploy em segundos', url: 'https://railway.app/', type: 'free', platform: 'Railway' },
              { title: 'Render – Docs', url: 'https://render.com/docs', type: 'free', platform: 'Render' },
            ]
          },
        ]
      },
    ]
  },

  {
    id: 'fullstack',
    title: 'Fullstack Developer',
    shortTitle: 'Fullstack',
    icon: 'Layers',
    description: 'Domine frontend e backend para criar produtos completos.',
    longDescription: 'O Fullstack Developer une as trilhas de Frontend e Backend, adicionando integrações end-to-end, autenticação completa, upload de arquivos, WebSockets e arquitetura de produto. Ideal para quem quer trabalhar em startups ou como freelancer.',
    category: 'desenvolvimento',
    color: '#06b6d4',
    estimatedTime: '12–18 meses',
    difficulty: 'Intermediário',
    tags: ['React', 'Node.js', 'PostgreSQL', 'Docker', 'TypeScript', 'REST API'],
    steps: [
      {
        id: 'fs-1', order: 1,
        title: 'Pré-requisitos',
        description: 'Complete as trilhas de Frontend e Backend antes de continuar.',
        level: 'Iniciante',
        techs: [
          {
            name: 'Frontend — React + TypeScript',
            description: 'Fundamentos de React e TypeScript.',
            resources: [
              { title: 'Siga a trilha de Frontend primeiro', url: '#', type: 'free', platform: 'Roadmap' },
            ]
          },
          {
            name: 'Backend — Node.js + REST API',
            description: 'APIs RESTful e bancos de dados.',
            resources: [
              { title: 'Siga a trilha de Backend primeiro', url: '#', type: 'free', platform: 'Roadmap' },
            ]
          },
        ]
      },
      {
        id: 'fs-2', order: 2,
        title: 'Integração Frontend e Backend',
        description: 'Conectar a interface com a API: autenticação, estado global e erros.',
        level: 'Intermediário',
        techs: [
          {
            name: 'TanStack Query (React Query)',
            description: 'Gerenciamento de estado assíncrono e cache.',
            resources: [
              { title: 'TanStack Query – Documentação', url: 'https://tanstack.com/query/latest', type: 'free', platform: 'Docs' },
            ]
          },
          {
            name: 'Zustand',
            description: 'Gerenciamento de estado simples para React.',
            resources: [
              { title: 'Zustand – Documentação', url: 'https://zustand-demo.pmnd.rs/', type: 'free', platform: 'Docs' },
            ]
          },
        ]
      },
      {
        id: 'fs-3', order: 3,
        title: 'Autenticação Completa',
        description: 'JWT, refresh tokens, OAuth (Google/GitHub) e permissões.',
        level: 'Intermediário',
        techs: [
          {
            name: 'Auth.js',
            description: 'Autenticação completa para apps Next.js e Node.',
            resources: [
              { title: 'Auth.js – Documentação', url: 'https://authjs.dev/', type: 'free', platform: 'Docs' },
            ]
          },
        ]
      },
      {
        id: 'fs-4', order: 4,
        title: 'Upload de Arquivos e Storage',
        description: 'Upload de imagens e armazenamento em S3 ou Cloudflare R2.',
        level: 'Avançado',
        techs: [
          {
            name: 'AWS S3 e Cloudflare R2',
            description: 'Armazenamento de objetos na nuvem.',
            resources: [
              { title: 'AWS S3 – Guia de Início', url: 'https://aws.amazon.com/s3/getting-started/', type: 'free', platform: 'AWS' },
              { title: 'Cloudflare R2 – Docs', url: 'https://developers.cloudflare.com/r2/', type: 'free', platform: 'Cloudflare' },
            ]
          },
        ]
      },
      {
        id: 'fs-5', order: 5,
        title: 'WebSockets e Tempo Real',
        description: 'Chats, notificações e atualizações em tempo real.',
        level: 'Avançado',
        techs: [
          {
            name: 'Socket.io',
            description: 'WebSockets para comunicação bidirecional.',
            resources: [
              { title: 'Socket.io – Documentação', url: 'https://socket.io/docs/v4/', type: 'free', platform: 'Docs' },
              { title: 'Rocketseat – NLW Planner (real-time)', url: 'https://www.rocketseat.com.br/', type: 'free', platform: 'Rocketseat' },
            ]
          },
        ]
      },
      {
        id: 'fs-6', order: 6,
        title: 'CI/CD e Monitoramento',
        description: 'Automatizar deploys e monitorar a aplicação em produção.',
        level: 'Avançado',
        techs: [
          {
            name: 'GitHub Actions',
            description: 'Pipelines de CI/CD automatizados.',
            resources: [
              { title: 'GitHub Actions – Docs', url: 'https://docs.github.com/en/actions', type: 'free', platform: 'GitHub' },
            ]
          },
          {
            name: 'Sentry',
            description: 'Monitoramento de erros em produção.',
            resources: [
              { title: 'Sentry – Getting Started', url: 'https://sentry.io/welcome/', type: 'free', platform: 'Sentry' },
            ]
          },
        ]
      },
    ]
  },

  {
    id: 'mobile',
    title: 'Mobile Developer',
    shortTitle: 'Mobile',
    icon: 'Smartphone',
    description: 'Crie apps para iOS e Android com React Native.',
    longDescription: 'A trilha Mobile foca em React Native com Expo, cobrindo navegação, consumo de APIs, armazenamento local, notificações push e publicação nas lojas. Exige conhecimento prévio de React.',
    category: 'desenvolvimento',
    color: '#06b6d4',
    estimatedTime: '8–12 meses',
    difficulty: 'Intermediário',
    tags: ['React Native', 'Expo', 'TypeScript', 'Firebase', 'iOS', 'Android'],
    steps: [
      {
        id: 'mob-1', order: 1,
        title: 'Pré-requisito: React',
        description: 'React Native é baseado em React — precisa conhecer bem antes de começar.',
        level: 'Iniciante',
        techs: [
          {
            name: 'React + TypeScript',
            description: 'Componentes, hooks e tipagem.',
            resources: [
              { title: 'React – Documentação Oficial', url: 'https://react.dev/learn', type: 'free', platform: 'React Docs' },
            ]
          },
        ]
      },
      {
        id: 'mob-2', order: 2,
        title: 'React Native & Expo',
        description: 'Fundamentos: componentes nativos, estilização, navegação.',
        level: 'Iniciante',
        techs: [
          {
            name: 'Expo',
            description: 'Framework React Native com experiência de desenvolvimento incrível.',
            resources: [
              { title: 'Expo – Documentação Oficial', url: 'https://docs.expo.dev/', type: 'free', platform: 'Expo Docs' },
              { title: 'Rocketseat – Ignite React Native', url: 'https://www.rocketseat.com.br/ignite', type: 'paid', platform: 'Rocketseat' },
            ]
          },
          {
            name: 'React Navigation',
            description: 'Navegação entre telas (stack, tabs, drawer).',
            resources: [
              { title: 'React Navigation – Docs', url: 'https://reactnavigation.org/docs/getting-started', type: 'free', platform: 'Docs' },
            ]
          },
        ]
      },
      {
        id: 'mob-3', order: 3,
        title: 'Dados e Armazenamento',
        description: 'Consumo de APIs, cache e armazenamento local no device.',
        level: 'Intermediário',
        techs: [
          {
            name: 'AsyncStorage e SQLite',
            description: 'Persistência de dados no device.',
            resources: [
              { title: 'Expo SQLite – Docs', url: 'https://docs.expo.dev/versions/latest/sdk/sqlite/', type: 'free', platform: 'Expo Docs' },
            ]
          },
          {
            name: 'Firebase',
            description: 'Backend as a Service: autenticação, banco de dados, storage.',
            resources: [
              { title: 'Firebase – Web Codelab', url: 'https://firebase.google.com/docs/web/setup', type: 'free', platform: 'Firebase Docs' },
            ]
          },
        ]
      },
      {
        id: 'mob-4', order: 4,
        title: 'Publicação nas Lojas',
        description: 'Build, testes e submissão na Play Store e App Store.',
        level: 'Avançado',
        techs: [
          {
            name: 'EAS Build (Expo)',
            description: 'Build e deploy automatizados com Expo.',
            resources: [
              { title: 'EAS – Introduction', url: 'https://docs.expo.dev/eas/', type: 'free', platform: 'Expo Docs' },
            ]
          },
        ]
      },
    ]
  },

  /* ─────────────────────────────── JOGOS ───────────────────────────────── */
  {
    id: 'unity',
    title: 'Game Dev com Unity',
    shortTitle: 'Unity',
    icon: 'Gamepad2',
    description: 'Desenvolva jogos 2D e 3D profissionais com Unity e C#.',
    longDescription: 'A trilha Unity cobre desde C# básico até shaders, animações, multiplayer e publicação. Engine padrão da indústria para jogos mobile, PC e console.',
    category: 'jogos',
    color: '#a855f7',
    estimatedTime: '10–18 meses',
    difficulty: 'Iniciante',
    tags: ['Unity', 'C#', 'Physics', 'Shaders', 'Animation', 'Multiplayer'],
    steps: [
      {
        id: 'unity-1', order: 1,
        title: 'C# Básico',
        description: 'Programação orientada a objetos com a linguagem C#.',
        level: 'Iniciante',
        techs: [
          {
            name: 'C# Fundamentos',
            description: 'Variáveis, classes, herança e interfaces.',
            resources: [
              { title: 'Microsoft – C# Learning Path', url: 'https://learn.microsoft.com/pt-br/dotnet/csharp/', type: 'free', platform: 'Microsoft Learn' },
              { title: 'Unity Learn – C# Survival Guide', url: 'https://learn.unity.com/course/unity-c-survival-guide', type: 'free', platform: 'Unity Learn' },
            ]
          },
        ]
      },
      {
        id: 'unity-2', order: 2,
        title: 'Fundamentos do Unity',
        description: 'Interface, GameObjects, Components, cenas e prefabs.',
        level: 'Iniciante',
        techs: [
          {
            name: 'Unity Basics',
            description: 'Editor, Transform, Hierarchy e Project.',
            resources: [
              { title: 'Unity Learn – Unity Essentials', url: 'https://learn.unity.com/pathway/unity-essentials', type: 'free', platform: 'Unity Learn' },
              { title: 'Brackeys – How to Make a Game', url: 'https://www.youtube.com/watch?v=j48LtUkZRjU', type: 'free', platform: 'YouTube' },
            ]
          },
        ]
      },
      {
        id: 'unity-3', order: 3,
        title: 'Física e Gameplay',
        description: 'Rigidbody, Colliders, triggers, movimento e câmera.',
        level: 'Iniciante',
        techs: [
          {
            name: 'Física 2D e 3D',
            description: 'Simulação física realista em Unity.',
            resources: [
              { title: 'Unity – Physics Manual', url: 'https://docs.unity3d.com/Manual/PhysicsSection.html', type: 'free', platform: 'Unity Docs' },
              { title: 'Brackeys – Physics Tutorial', url: 'https://www.youtube.com/watch?v=bh37zbefZk4', type: 'free', platform: 'YouTube' },
            ]
          },
        ]
      },
      {
        id: 'unity-4', order: 4,
        title: 'Interface e Game Design',
        description: 'Canvas, menus, HUD, inventário e fluxo de jogo.',
        level: 'Intermediário',
        techs: [
          {
            name: 'Unity UI Toolkit',
            description: 'Sistema moderno de interface do Unity.',
            resources: [
              { title: 'Unity – UI Toolkit Manual', url: 'https://docs.unity3d.com/Manual/UIElements.html', type: 'free', platform: 'Unity Docs' },
            ]
          },
        ]
      },
      {
        id: 'unity-5', order: 5,
        title: 'Animação e Áudio',
        description: 'Animator Controller, blend trees e sistema de áudio do jogo.',
        level: 'Intermediário',
        techs: [
          {
            name: 'Animator e Cinemachine',
            description: 'Animações e câmeras cinematográficas.',
            resources: [
              { title: 'Unity – Animation Manual', url: 'https://docs.unity3d.com/Manual/AnimationSection.html', type: 'free', platform: 'Unity Docs' },
              { title: 'Brackeys – Cinemachine', url: 'https://www.youtube.com/watch?v=Gx9gZ9cfrys', type: 'free', platform: 'YouTube' },
            ]
          },
          {
            name: 'FMOD e Unity Audio',
            description: 'Áudio dinâmico e interativo em jogos.',
            resources: [
              { title: 'FMOD – Unity Integration', url: 'https://fmod.com/docs/2.02/unity/', type: 'free', platform: 'FMOD Docs' },
            ]
          },
        ]
      },
      {
        id: 'unity-6', order: 6,
        title: 'Shaders e Efeitos Visuais',
        description: 'Shader Graph visual, partículas e efeitos avançados.',
        level: 'Avançado',
        techs: [
          {
            name: 'Shader Graph',
            description: 'Shaders visuais sem código HLSL.',
            resources: [
              { title: 'Unity – Shader Graph Manual', url: 'https://docs.unity3d.com/Packages/com.unity.shadergraph@latest', type: 'free', platform: 'Unity Docs' },
              { title: 'Brackeys – Shader Graph Tutorial', url: 'https://www.youtube.com/watch?v=VsUK9K6UbY4', type: 'free', platform: 'YouTube' },
            ]
          },
        ]
      },
      {
        id: 'unity-7', order: 7,
        title: 'Publicação do Jogo',
        description: 'Build para PC, mobile, Web e publicação em lojas.',
        level: 'Avançado',
        techs: [
          {
            name: 'Build e Publicação',
            description: 'Exportar e publicar em Steam, Play Store e itch.io.',
            resources: [
              { title: 'itch.io – Developer Guide', url: 'https://itch.io/docs/creators/', type: 'free', platform: 'itch.io' },
              { title: 'Unity – Build & Distribute', url: 'https://docs.unity3d.com/Manual/PublishingBuilds.html', type: 'free', platform: 'Unity Docs' },
            ]
          },
        ]
      },
    ]
  },

  {
    id: 'godot',
    title: 'Game Dev com Godot',
    shortTitle: 'Godot',
    icon: 'Joystick',
    description: 'Crie jogos indie com a engine open-source mais amada.',
    longDescription: 'Godot é uma engine poderosa, gratuita e open-source ideal para jogos indie 2D e 3D. A trilha cobre GDScript, física, exportação e publicação no itch.io e Steam.',
    category: 'jogos',
    color: '#a855f7',
    estimatedTime: '8–14 meses',
    difficulty: 'Iniciante',
    tags: ['Godot', 'GDScript', '2D', '3D', 'Indie', 'itch.io'],
    steps: [
      {
        id: 'godot-1', order: 1,
        title: 'GDScript — A Linguagem do Godot',
        description: 'A linguagem de programação parecida com Python usada no Godot.',
        level: 'Iniciante',
        techs: [
          {
            name: 'GDScript',
            description: 'Sintaxe, variáveis, funções e classes.',
            resources: [
              { title: 'Godot 4 – GDScript Reference', url: 'https://docs.godotengine.org/en/stable/tutorials/scripting/gdscript/', type: 'free', platform: 'Godot Docs' },
              { title: 'GDQuest – Learn GDScript', url: 'https://www.gdquest.com/tutorial/godot/learning-paths/getting-started-in-2021/', type: 'free', platform: 'GDQuest' },
            ]
          },
        ]
      },
      {
        id: 'godot-2', order: 2,
        title: 'Fundamentos do Godot',
        description: 'Nodes, Scenes, Signals e como funciona o editor.',
        level: 'Iniciante',
        techs: [
          {
            name: 'Nodes e Cenas',
            description: 'Arquitetura de cenas e nós do Godot.',
            resources: [
              { title: 'Godot – Getting Started', url: 'https://docs.godotengine.org/en/stable/getting_started/introduction/', type: 'free', platform: 'Godot Docs' },
              { title: 'HeartBeast – Godot 4 Beginner Series', url: 'https://www.youtube.com/watch?v=LOhfqjmasi0', type: 'free', platform: 'YouTube' },
            ]
          },
        ]
      },
      {
        id: 'godot-3', order: 3,
        title: 'Criando um Jogo 2D Completo',
        description: 'Crie um jogo de plataforma ou top-down do zero.',
        level: 'Intermediário',
        techs: [
          {
            name: 'Plataformer 2D',
            description: 'Movimento, física 2D, animações e câmera.',
            resources: [
              { title: 'GDQuest – Godot 4 Platformer', url: 'https://www.gdquest.com/', type: 'free', platform: 'GDQuest' },
              { title: 'HeartBeast – Action RPG Series', url: 'https://www.youtube.com/playlist?list=PL9FzW-m48fn2SlrW0KoLT4n5egNdX-W9a', type: 'free', platform: 'YouTube' },
            ]
          },
        ]
      },
      {
        id: 'godot-4', order: 4,
        title: 'Introdução ao Jogo 3D',
        description: 'Fundamentos 3D no Godot: meshes, iluminação e física.',
        level: 'Intermediário',
        techs: [
          {
            name: 'Godot 3D',
            description: 'MeshInstance, CSG, iluminação e câmera 3D.',
            resources: [
              { title: 'GDQuest – Godot 3D Game', url: 'https://www.gdquest.com/', type: 'paid', platform: 'GDQuest' },
              { title: 'Godot – 3D Tutorial', url: 'https://docs.godotengine.org/en/stable/tutorials/3d/', type: 'free', platform: 'Godot Docs' },
            ]
          },
        ]
      },
      {
        id: 'godot-5', order: 5,
        title: 'Publicação do Jogo Indie',
        description: 'Exportar, criar a página e publicar no itch.io ou Steam.',
        level: 'Avançado',
        techs: [
          {
            name: 'itch.io e Steam',
            description: 'Publicação e marketing de jogos indie.',
            resources: [
              { title: 'itch.io – Developer FAQ', url: 'https://itch.io/docs/creators/faq', type: 'free', platform: 'itch.io' },
              { title: 'Godot – Export Templates', url: 'https://docs.godotengine.org/en/stable/tutorials/export/', type: 'free', platform: 'Godot Docs' },
            ]
          },
        ]
      },
    ]
  },

  {
    id: 'game-design',
    title: 'Game Designer',
    shortTitle: 'Game Design',
    icon: 'Target',
    description: 'Conceptualize, balance e documente jogos do zero.',
    longDescription: 'Game Design vai além da programação: é sobre criar experiências, mecânicas, narrativas e economias de jogo. Ideal para quem quer liderar equipes ou criar conceitos originais.',
    category: 'jogos',
    color: '#a855f7',
    estimatedTime: '6–12 meses',
    difficulty: 'Iniciante',
    tags: ['GDD', 'Mecânicas', 'Narrativa', 'Balanceamento', 'UX', 'Prototipagem'],
    steps: [
      {
        id: 'gd-1', order: 1,
        title: 'O Que é Game Design',
        description: 'Teoria dos jogos, pilares e tipos de design.',
        level: 'Iniciante',
        techs: [
          {
            name: 'Teoria de Jogos',
            description: 'MDA Framework, mecânicas, dinâmicas e estéticas.',
            resources: [
              { title: 'The Art of Game Design – Jesse Schell', url: 'https://www.amazon.com.br/Art-Game-Design-Jesse-Schell/dp/1138632058', type: 'paid', platform: 'Livro' },
              { title: 'GDC Vault – Free Talks', url: 'https://www.gdcvault.com/free', type: 'free', platform: 'GDC' },
              { title: 'Game Design – Coursera (SCAD)', url: 'https://www.coursera.org/learn/game-design', type: 'free', platform: 'Coursera' },
            ]
          },
        ]
      },
      {
        id: 'gd-2', order: 2,
        title: 'Game Design Document (GDD)',
        description: 'Escrever documentos de design claros e objetivos.',
        level: 'Iniciante',
        techs: [
          {
            name: 'Game Design Document',
            description: 'Templates, one-pagers e GDDs completos.',
            resources: [
              { title: 'GDD Template – Notion', url: 'https://www.notion.so/Game-Design-Document-Template-', type: 'free', platform: 'Notion' },
              { title: 'GDC – Writing Better Design Docs', url: 'https://www.gdcvault.com/play/1012217/One-Page', type: 'free', platform: 'GDC' },
            ]
          },
        ]
      },
      {
        id: 'gd-3', order: 3,
        title: 'Prototipagem Rápida',
        description: 'Prototipe para testar mecânicas antes de programar.',
        level: 'Intermediário',
        techs: [
          {
            name: 'Prototipagem Física e Digital',
            description: 'Board games, Figma e ferramentas de protótipo.',
            resources: [
              { title: 'Tabletop Simulator (prototipagem)', url: 'https://www.tabletopsimulator.com/', type: 'paid', platform: 'Steam' },
              { title: 'Figma – Game UI Prototyping', url: 'https://www.figma.com/', type: 'free', platform: 'Figma' },
            ]
          },
        ]
      },
      {
        id: 'gd-4', order: 4,
        title: 'Balanceamento e Economia',
        description: 'Sistemas de progressão, moedas e balanceamento de mecânicas.',
        level: 'Intermediário',
        techs: [
          {
            name: 'Balanceamento de Jogos',
            description: 'Planilhas, fórmulas e testes de balanceamento.',
            resources: [
              { title: 'GDC – Systems Balancing', url: 'https://www.gdcvault.com/', type: 'free', platform: 'GDC' },
              { title: 'Extra Credits – Game Design YouTube', url: 'https://www.youtube.com/@extracredits', type: 'free', platform: 'YouTube' },
            ]
          },
        ]
      },
      {
        id: 'gd-5', order: 5,
        title: 'UX e Testes com Jogadores',
        description: 'Testar o jogo com pessoas reais e melhorar o design.',
        level: 'Avançado',
        techs: [
          {
            name: 'Playtesting e Métricas',
            description: 'Metodologias de teste com usuários reais.',
            resources: [
              { title: 'The Playtesting Bible – GDC', url: 'https://www.gdcvault.com/', type: 'free', platform: 'GDC' },
            ]
          },
        ]
      },
    ]
  },

  /* ────────────────────────────── INFRA ────────────────────────────────── */
  {
    id: 'devops',
    title: 'DevOps & Cloud',
    shortTitle: 'DevOps',
    icon: 'Cloud',
    description: 'Automatize deploys, gerencie infra e garanta disponibilidade.',
    longDescription: 'DevOps une desenvolvimento e operações. Esta trilha cobre Linux, Docker, Kubernetes, CI/CD, IaC com Terraform e observabilidade em nuvens AWS, GCP e Azure.',
    category: 'infra',
    color: '#22c55e',
    estimatedTime: '12–18 meses',
    difficulty: 'Intermediário',
    tags: ['Linux', 'Docker', 'Kubernetes', 'AWS', 'Terraform', 'CI/CD'],
    steps: [
      {
        id: 'dv-1', order: 1,
        title: 'Linux e Terminal',
        description: 'O sistema operacional base de toda a infraestrutura moderna.',
        level: 'Iniciante',
        techs: [
          {
            name: 'Linux Fundamentos',
            description: 'Filesystem, permissões, processos e scripting.',
            resources: [
              { title: 'Linux Journey (interativo)', url: 'https://linuxjourney.com/', type: 'free', platform: 'Interativo' },
              { title: 'The Missing Semester – MIT', url: 'https://missing.csail.mit.edu/', type: 'free', platform: 'MIT' },
              { title: 'OverTheWire: Bandit (gamificado)', url: 'https://overthewire.org/wargames/bandit/', type: 'free', platform: 'Wargame' },
            ]
          },
        ]
      },
      {
        id: 'dv-2', order: 2,
        title: 'Docker e Containers',
        description: 'Containerize aplicações para ambiente consistente.',
        level: 'Iniciante',
        techs: [
          {
            name: 'Docker',
            description: 'Images, containers, volumes e networking.',
            resources: [
              { title: 'Docker – Getting Started', url: 'https://docs.docker.com/get-started/', type: 'free', platform: 'Docker Docs' },
              { title: 'Play with Docker (sandbox)', url: 'https://labs.play-with-docker.com/', type: 'free', platform: 'Interativo' },
              { title: 'Docker & Kubernetes – Udemy', url: 'https://www.udemy.com/course/docker-kubernetes-the-practical-guide/', type: 'paid', platform: 'Udemy' },
            ]
          },
        ]
      },
      {
        id: 'dv-3', order: 3,
        title: 'CI/CD com GitHub Actions',
        description: 'Automatizar testes, builds e deploys.',
        level: 'Intermediário',
        techs: [
          {
            name: 'GitHub Actions',
            description: 'Workflows de CI/CD integrados ao GitHub.',
            resources: [
              { title: 'GitHub Actions – Docs', url: 'https://docs.github.com/en/actions', type: 'free', platform: 'GitHub' },
              { title: 'Act – Run Actions Locally', url: 'https://github.com/nektos/act', type: 'free', platform: 'GitHub' },
            ]
          },
        ]
      },
      {
        id: 'dv-4', order: 4,
        title: 'Cloud — AWS e GCP',
        description: 'Serviços essenciais de nuvem para hospedar e escalar apps.',
        level: 'Intermediário',
        techs: [
          {
            name: 'AWS Essentials',
            description: 'EC2, S3, RDS, IAM e VPC.',
            resources: [
              { title: 'AWS Skill Builder – Gratuito', url: 'https://skillbuilder.aws/', type: 'free', platform: 'AWS' },
              { title: 'Cloud Practitioner Essentials', url: 'https://aws.amazon.com/training/digital/aws-cloud-practitioner-essentials/', type: 'free', platform: 'AWS' },
            ]
          },
        ]
      },
      {
        id: 'dv-5', order: 5,
        title: 'Kubernetes',
        description: 'Orquestração de containers em escala.',
        level: 'Avançado',
        techs: [
          {
            name: 'Kubernetes',
            description: 'Pods, Services, Deployments e Ingress.',
            resources: [
              { title: 'Kubernetes.io – Tutoriais', url: 'https://kubernetes.io/docs/tutorials/', type: 'free', platform: 'K8s Docs' },
              { title: 'Play with Kubernetes', url: 'https://labs.play-with-k8s.com/', type: 'free', platform: 'Interativo' },
            ]
          },
        ]
      },
      {
        id: 'dv-6', order: 6,
        title: 'Infraestrutura como Código e Monitoramento',
        description: 'Terraform para provisionar infra e Grafana para monitorar.',
        level: 'Avançado',
        techs: [
          {
            name: 'Terraform',
            description: 'Provisionar infraestrutura com código.',
            resources: [
              { title: 'HashiCorp Learn – Terraform', url: 'https://developer.hashicorp.com/terraform/tutorials', type: 'free', platform: 'HashiCorp' },
            ]
          },
          {
            name: 'Grafana e Prometheus',
            description: 'Monitoramento de métricas e alertas.',
            resources: [
              { title: 'Grafana – Getting Started', url: 'https://grafana.com/docs/grafana/latest/getting-started/', type: 'free', platform: 'Grafana Docs' },
            ]
          },
        ]
      },
    ]
  },

  {
    id: 'seguranca',
    title: 'Segurança da Informação',
    shortTitle: 'Segurança',
    icon: 'Shield',
    description: 'Proteja sistemas, encontre vulnerabilidades e defenda redes.',
    longDescription: 'A trilha de Segurança cobre fundamentos de redes, Linux, OWASP, ethical hacking, pentest web e criptografia. Ideal para se tornar analista de segurança, pentester ou especialista em segurança.',
    category: 'infra',
    color: '#22c55e',
    estimatedTime: '12–24 meses',
    difficulty: 'Intermediário',
    tags: ['Pentest', 'OWASP', 'Kali Linux', 'CTF', 'Redes', 'Criptografia'],
    steps: [
      {
        id: 'sec-1', order: 1,
        title: 'Fundamentos de Redes',
        description: 'TCP/IP, DNS, HTTP, firewalls e como as redes funcionam.',
        level: 'Iniciante',
        techs: [
          {
            name: 'Redes de Computadores',
            description: 'Modelo OSI, TCP/IP e subnetting.',
            resources: [
              { title: 'Professor Messer – CompTIA Network+', url: 'https://www.professormesser.com/network-plus/n10-008/n10-008-video/n10-008-training-course/', type: 'free', platform: 'YouTube' },
              { title: 'Cisco NetAcad – Intro to Networks', url: 'https://www.netacad.com/courses/networking/ccna-introduction-networks', type: 'free', platform: 'Cisco' },
            ]
          },
        ]
      },
      {
        id: 'sec-2', order: 2,
        title: 'Linux para Segurança',
        description: 'Terminal, permissões, logs e ferramentas de análise.',
        level: 'Iniciante',
        techs: [
          {
            name: 'Kali Linux e Parrot OS',
            description: 'Distribuições Linux focadas em segurança.',
            resources: [
              { title: 'OverTheWire: Bandit', url: 'https://overthewire.org/wargames/bandit/', type: 'free', platform: 'Wargame' },
              { title: 'Kali Linux – Documentação', url: 'https://www.kali.org/docs/', type: 'free', platform: 'Kali Docs' },
            ]
          },
        ]
      },
      {
        id: 'sec-3', order: 3,
        title: 'OWASP Top 10 e Segurança Web',
        description: 'As vulnerabilidades web mais críticas: SQL injection, XSS e CSRF.',
        level: 'Intermediário',
        techs: [
          {
            name: 'OWASP Top 10',
            description: 'As 10 vulnerabilidades web mais perigosas.',
            resources: [
              { title: 'PortSwigger Web Security Academy', url: 'https://portswigger.net/web-security', type: 'free', platform: 'PortSwigger' },
              { title: 'OWASP – Top 10 Oficial', url: 'https://owasp.org/www-project-top-ten/', type: 'free', platform: 'OWASP' },
            ]
          },
        ]
      },
      {
        id: 'sec-4', order: 4,
        title: 'CTF e Ethical Hacking',
        description: 'Praticar em ambientes controlados e competições CTF.',
        level: 'Intermediário',
        techs: [
          {
            name: 'TryHackMe',
            description: 'Plataforma gamificada de cibersegurança.',
            resources: [
              { title: 'TryHackMe – Learning Paths', url: 'https://tryhackme.com/paths', type: 'free', platform: 'TryHackMe' },
            ]
          },
          {
            name: 'Hack The Box',
            description: 'Laboratórios avançados de pentest.',
            resources: [
              { title: 'Hack The Box – Platform', url: 'https://www.hackthebox.com/', type: 'free', platform: 'HTB' },
              { title: 'HTB Academy', url: 'https://academy.hackthebox.com/', type: 'free', platform: 'HTB Academy' },
            ]
          },
        ]
      },
      {
        id: 'sec-5', order: 5,
        title: 'Criptografia',
        description: 'Algoritmos, hashing, PKI e criptografia moderna.',
        level: 'Avançado',
        techs: [
          {
            name: 'Fundamentos de Criptografia',
            description: 'Symmetric, asymmetric, hashing e TLS.',
            resources: [
              { title: 'Cryptopals Challenges', url: 'https://cryptopals.com/', type: 'free', platform: 'Interativo' },
              { title: 'CryptoHack', url: 'https://cryptohack.org/', type: 'free', platform: 'Gamificado' },
            ]
          },
        ]
      },
      {
        id: 'sec-6', order: 6,
        title: 'Certificações e Carreira',
        description: 'Certificações reconhecidas pelo mercado de segurança.',
        level: 'Avançado',
        techs: [
          {
            name: 'CompTIA Security+, CEH e OSCP',
            description: 'Certificações de segurança reconhecidas mundialmente.',
            resources: [
              { title: 'eJPT – eLearnSecurity (entrada)', url: 'https://ine.com/learning/certifications/internal/elearnsecurity-junior-penetration-tester-cert', type: 'paid', platform: 'INE Security' },
              { title: 'Professor Messer – Security+', url: 'https://www.professormesser.com/security-plus/', type: 'free', platform: 'YouTube' },
            ]
          },
        ]
      },
    ]
  },

  {
    id: 'suporte',
    title: 'Suporte & SysAdmin',
    shortTitle: 'SysAdmin',
    icon: 'Monitor',
    description: 'Gerencie servidores, redes e suporte de TI profissional.',
    longDescription: 'A trilha de Suporte e SysAdmin cobre help desk, redes, Windows Server, Active Directory, virtualização e fundamentos de nuvem. Porta de entrada sólida para a área de TI.',
    category: 'infra',
    color: '#22c55e',
    estimatedTime: '6–12 meses',
    difficulty: 'Iniciante',
    tags: ['Windows Server', 'Active Directory', 'Redes', 'Linux', 'ITIL', 'Virtualização'],
    steps: [
      {
        id: 'sup-1', order: 1,
        title: 'Hardware e Sistema Operacional',
        description: 'Componentes de PC, instalação de OS e resolução de problemas.',
        level: 'Iniciante',
        techs: [
          {
            name: 'Hardware e Montagem',
            description: 'Componentes, BIOS, POST e resolução de problemas.',
            resources: [
              { title: 'Professor Messer – CompTIA A+', url: 'https://www.professormesser.com/free-a-plus-training/', type: 'free', platform: 'YouTube' },
            ]
          },
        ]
      },
      {
        id: 'sup-2', order: 2,
        title: 'Redes Básicas',
        description: 'Configuração de redes, endereçamento IP e protocolos.',
        level: 'Iniciante',
        techs: [
          {
            name: 'TCP/IP e Redes',
            description: 'DHCP, DNS, HTTP/S e subnetting.',
            resources: [
              { title: 'Cisco Networking Basics', url: 'https://www.netacad.com/courses/networking/networking-basics', type: 'free', platform: 'Cisco' },
              { title: 'Kurose & Ross – Computer Networks (grátis)', url: 'https://gaia.cs.umass.edu/kurose_ross/', type: 'free', platform: 'Livro' },
            ]
          },
        ]
      },
      {
        id: 'sup-3', order: 3,
        title: 'Windows Server e Active Directory',
        description: 'Active Directory, GPO, DHCP e DNS no Windows Server.',
        level: 'Intermediário',
        techs: [
          {
            name: 'Windows Server',
            description: 'Active Directory, Group Policy e Remote Desktop.',
            resources: [
              { title: 'Microsoft Learn – Windows Server', url: 'https://learn.microsoft.com/pt-br/windows-server/', type: 'free', platform: 'Microsoft Learn' },
            ]
          },
        ]
      },
      {
        id: 'sup-4', order: 4,
        title: 'Virtualização',
        description: 'Máquinas virtuais com Hyper-V, VMware e introdução a containers.',
        level: 'Intermediário',
        techs: [
          {
            name: 'VirtualBox e Hyper-V',
            description: 'Criar e gerenciar máquinas virtuais.',
            resources: [
              { title: 'VirtualBox – User Manual', url: 'https://www.virtualbox.org/manual/', type: 'free', platform: 'Docs' },
            ]
          },
        ]
      },
      {
        id: 'sup-5', order: 5,
        title: 'ITIL e Gestão de TI',
        description: 'Boas práticas de suporte e gestão de serviços de TI.',
        level: 'Avançado',
        techs: [
          {
            name: 'ITIL 4 Foundation',
            description: 'Framework de gerenciamento de serviços de TI.',
            resources: [
              { title: 'IT Service Management – Free Course', url: 'https://alison.com/course/itil-foundation-certificate-in-it-service-management', type: 'free', platform: 'Alison' },
              { title: 'Axelos – ITIL Foundation', url: 'https://www.axelos.com/certifications/itil-service-management/itil-4-foundation', type: 'paid', platform: 'Axelos' },
            ]
          },
        ]
      },
    ]
  },

  /* ─────────────────────────────── IA & DADOS ──────────────────────────── */
  {
    id: 'ia-ml',
    title: 'IA & Machine Learning',
    shortTitle: 'IA / ML',
    icon: 'Bot',
    description: 'Crie modelos de inteligência artificial que aprendem com dados.',
    longDescription: 'A trilha de IA e Machine Learning cobre Python, matemática essencial, scikit-learn, deep learning com PyTorch e LLMs com Hugging Face. Para quem quer trabalhar com a tecnologia mais quente do mercado.',
    category: 'ia-dados',
    color: '#f97316',
    estimatedTime: '12–24 meses',
    difficulty: 'Intermediário',
    tags: ['Python', 'PyTorch', 'scikit-learn', 'LLMs', 'Hugging Face', 'NumPy'],
    steps: [
      {
        id: 'ia-1', order: 1,
        title: 'Python para Inteligência Artificial',
        description: 'Python além do básico: listas, NumPy, Pandas e Jupyter.',
        level: 'Iniciante',
        techs: [
          {
            name: 'Python Avançado',
            description: 'Comprehensions, generators, OOP e decorators.',
            resources: [
              { title: 'CS50P – Python (Harvard)', url: 'https://cs50.harvard.edu/python/', type: 'free', platform: 'Harvard' },
              { title: 'Python.org – Tutorial Oficial', url: 'https://docs.python.org/pt-br/3/tutorial/', type: 'free', platform: 'Python Docs' },
            ]
          },
          {
            name: 'NumPy e Pandas',
            description: 'Manipulação de arrays e dataframes.',
            resources: [
              { title: 'NumPy – Quickstart', url: 'https://numpy.org/doc/stable/user/quickstart.html', type: 'free', platform: 'NumPy Docs' },
              { title: 'Pandas – Getting Started', url: 'https://pandas.pydata.org/docs/getting_started/', type: 'free', platform: 'Pandas Docs' },
              { title: 'Kaggle – Pandas Course', url: 'https://www.kaggle.com/learn/pandas', type: 'free', platform: 'Kaggle' },
            ]
          },
        ]
      },
      {
        id: 'ia-2', order: 2,
        title: 'Matemática para IA',
        description: 'Álgebra linear, cálculo e estatística essenciais para ML.',
        level: 'Iniciante',
        techs: [
          {
            name: 'Álgebra Linear e Cálculo',
            description: 'Matrizes, vetores, derivadas e gradientes.',
            resources: [
              { title: '3Blue1Brown – Essence of Linear Algebra', url: 'https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2ZVjce8v4aBDRQ', type: 'free', platform: 'YouTube' },
              { title: 'Khan Academy – Linear Algebra', url: 'https://www.khanacademy.org/math/linear-algebra', type: 'free', platform: 'Khan Academy' },
            ]
          },
          {
            name: 'Estatística e Probabilidade',
            description: 'Distribuições, inferência e testes estatísticos.',
            resources: [
              { title: 'StatQuest with Josh Starmer', url: 'https://www.youtube.com/@statquest', type: 'free', platform: 'YouTube' },
            ]
          },
        ]
      },
      {
        id: 'ia-3', order: 3,
        title: 'Machine Learning Clássico',
        description: 'Regressão, classificação e clustering com scikit-learn.',
        level: 'Intermediário',
        techs: [
          {
            name: 'scikit-learn',
            description: 'Biblioteca padrão de Machine Learning para Python.',
            resources: [
              { title: 'scikit-learn – Documentação', url: 'https://scikit-learn.org/stable/user_guide.html', type: 'free', platform: 'Docs' },
              { title: 'Kaggle – Intro to Machine Learning', url: 'https://www.kaggle.com/learn/intro-to-machine-learning', type: 'free', platform: 'Kaggle' },
              { title: 'fast.ai – Practical ML', url: 'https://www.fast.ai/', type: 'free', platform: 'fast.ai' },
            ]
          },
        ]
      },
      {
        id: 'ia-4', order: 4,
        title: 'Deep Learning com PyTorch',
        description: 'Redes neurais, CNNs e RNNs com PyTorch.',
        level: 'Avançado',
        techs: [
          {
            name: 'PyTorch',
            description: 'Framework de deep learning mais usado em pesquisa.',
            resources: [
              { title: 'PyTorch – Tutorials Oficiais', url: 'https://pytorch.org/tutorials/', type: 'free', platform: 'PyTorch Docs' },
              { title: 'fast.ai – Practical Deep Learning', url: 'https://course.fast.ai/', type: 'free', platform: 'fast.ai' },
              { title: 'Deep Learning Specialization – Coursera', url: 'https://www.coursera.org/specializations/deep-learning', type: 'paid', platform: 'Coursera' },
            ]
          },
        ]
      },
      {
        id: 'ia-5', order: 5,
        title: 'LLMs e IA Generativa',
        description: 'Hugging Face, fine-tuning, RAG e engenharia de prompts.',
        level: 'Avançado',
        techs: [
          {
            name: 'Hugging Face',
            description: 'Biblioteca e hub de modelos de linguagem.',
            resources: [
              { title: 'Hugging Face – NLP Course', url: 'https://huggingface.co/learn/nlp-course/', type: 'free', platform: 'Hugging Face' },
            ]
          },
          {
            name: 'LangChain e RAG',
            description: 'Frameworks para criar aplicações com LLMs.',
            resources: [
              { title: 'LangChain – Python Docs', url: 'https://python.langchain.com/docs/', type: 'free', platform: 'LangChain Docs' },
              { title: 'OpenAI Cookbook', url: 'https://github.com/openai/openai-cookbook', type: 'free', platform: 'GitHub' },
            ]
          },
        ]
      },
    ]
  },

  {
    id: 'data-science',
    title: 'Data Science',
    shortTitle: 'Data Science',
    icon: 'BarChart2',
    description: 'Extraia insights de dados e conte histórias com visualizações.',
    longDescription: 'Data Science é transformar dados brutos em decisões inteligentes. A trilha cobre análise exploratória, visualização, estatística, SQL avançado e ferramentas como Power BI.',
    category: 'ia-dados',
    color: '#f97316',
    estimatedTime: '10–16 meses',
    difficulty: 'Iniciante',
    tags: ['Python', 'SQL', 'Pandas', 'Power BI', 'Matplotlib', 'Estatística'],
    steps: [
      {
        id: 'ds-1', order: 1,
        title: 'Fundamentos: Python e SQL',
        description: 'As duas ferramentas base de qualquer cientista de dados.',
        level: 'Iniciante',
        techs: [
          {
            name: 'Python para Dados',
            description: 'Python, Jupyter Notebooks e bibliotecas essenciais.',
            resources: [
              { title: 'Kaggle – Python Course', url: 'https://www.kaggle.com/learn/python', type: 'free', platform: 'Kaggle' },
            ]
          },
          {
            name: 'SQL para Análise',
            description: 'SELECT avançado, JOINs e Window Functions.',
            resources: [
              { title: 'SQLBolt – Aprenda SQL', url: 'https://sqlbolt.com/', type: 'free', platform: 'Interativo' },
              { title: 'Mode – SQL Tutorial', url: 'https://mode.com/sql-tutorial/', type: 'free', platform: 'Mode' },
            ]
          },
        ]
      },
      {
        id: 'ds-2', order: 2,
        title: 'Análise Exploratória de Dados (EDA)',
        description: 'Entender os dados profundamente antes de modelar.',
        level: 'Iniciante',
        techs: [
          {
            name: 'Pandas e EDA',
            description: 'Limpeza, transformação e análise de dados.',
            resources: [
              { title: 'Kaggle – Data Cleaning', url: 'https://www.kaggle.com/learn/data-cleaning', type: 'free', platform: 'Kaggle' },
              { title: 'Pandas – Cookbook', url: 'https://pandas.pydata.org/docs/user_guide/cookbook.html', type: 'free', platform: 'Pandas Docs' },
            ]
          },
        ]
      },
      {
        id: 'ds-3', order: 3,
        title: 'Visualização de Dados',
        description: 'Contar histórias com gráficos e dashboards interativos.',
        level: 'Intermediário',
        techs: [
          {
            name: 'Matplotlib e Seaborn',
            description: 'Gráficos estáticos e interativos em Python.',
            resources: [
              { title: 'Matplotlib – Tutorials', url: 'https://matplotlib.org/stable/tutorials/', type: 'free', platform: 'Docs' },
              { title: 'Kaggle – Data Visualization', url: 'https://www.kaggle.com/learn/data-visualization', type: 'free', platform: 'Kaggle' },
            ]
          },
          {
            name: 'Power BI',
            description: 'Dashboards empresariais com Microsoft Power BI.',
            resources: [
              { title: 'Microsoft Learn – Power BI', url: 'https://learn.microsoft.com/pt-br/power-bi/', type: 'free', platform: 'Microsoft Learn' },
              { title: 'Guy in a Cube – Power BI YouTube', url: 'https://www.youtube.com/@GuyInACube', type: 'free', platform: 'YouTube' },
            ]
          },
        ]
      },
      {
        id: 'ds-4', order: 4,
        title: 'Estatística Aplicada',
        description: 'Inferência, testes A/B, correlação e regressão.',
        level: 'Intermediário',
        techs: [
          {
            name: 'Estatística com Python',
            description: 'Scipy, hypothesis testing e distribuições.',
            resources: [
              { title: 'StatQuest – Statistics Fundamentals', url: 'https://www.youtube.com/@statquest', type: 'free', platform: 'YouTube' },
              { title: 'Think Stats – Allen B. Downey (grátis)', url: 'https://greenteapress.com/thinkstats2/', type: 'free', platform: 'Livro Online' },
            ]
          },
        ]
      },
      {
        id: 'ds-5', order: 5,
        title: 'Machine Learning para Dados',
        description: 'Aplicar modelos preditivos a problemas de negócio reais.',
        level: 'Avançado',
        techs: [
          {
            name: 'scikit-learn na prática',
            description: 'Feature engineering, pipelines e validação cruzada.',
            resources: [
              { title: 'Kaggle – Intermediate ML', url: 'https://www.kaggle.com/learn/intermediate-machine-learning', type: 'free', platform: 'Kaggle' },
            ]
          },
          {
            name: 'Competições no Kaggle',
            description: 'Problemas reais para praticar e construir portfólio.',
            resources: [
              { title: 'Kaggle – Competitions', url: 'https://www.kaggle.com/competitions', type: 'free', platform: 'Kaggle' },
            ]
          },
        ]
      },
    ]
  },
];
