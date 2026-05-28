export interface Puzzle {
  id: string;
  caseNumber: string;
  category: 'bug' | 'sequencia' | 'logica' | 'algoritmo';
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
  points: number;
  title: string;
  narrative: string;
  evidence: string;
  evidenceType: 'code' | 'text' | 'sequence';
  language?: string;
  question: string;
  options: string[];
  answer: number;
  hint: string;
  explanation: string;
}

export interface RankInfo {
  title: string;
  color: string;
  next: number | null;
  icon: string; // lucide icon name
}

export function getRank(points: number): RankInfo {
  if (points >= 1000) return { title: 'Mestre Detetive', color: '#fbbf24', next: null,  icon: 'Crown'    };
  if (points >= 500)  return { title: 'Especialista',    color: '#a78bfa', next: 1000,  icon: 'Star'     };
  if (points >= 200)  return { title: 'Detetive',        color: '#60a5fa', next: 500,   icon: 'Search'   };
  if (points >= 75)   return { title: 'Investigador',    color: '#34d399', next: 200,   icon: 'Eye'      };
  return                     { title: 'Aprendiz',        color: '#94a3b8', next: 75,    icon: 'BookOpen' };
}

export const CATEGORY_CONFIG = {
  bug:       { label: 'Caça ao Bug',  color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  sequencia: { label: 'Sequências',   color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  logica:    { label: 'Lógica Pura',  color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  algoritmo: { label: 'Algoritmos',   color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
} as const;

export const PUZZLES: Puzzle[] = [
  /* ═══════════════ CAÇA AO BUG ═══════════════ */
  {
    id: 'bug-01',
    caseNumber: 'CASO #001',
    category: 'bug',
    difficulty: 'Iniciante',
    points: 10,
    title: 'O Recibo Errado',
    narrative: 'A padaria do Sr. Costa usou um novo programa para calcular o troco. Os clientes estão reclamando que estão recebendo o dobro do troco! O Sr. Costa está perdendo dinheiro rapidamente. Encontre o bug antes que a padaria feche.',
    evidence: `def calcular_troco(pagamento, total):
    troco = pagamento - total
    return troco * 2`,
    evidenceType: 'code',
    language: 'python',
    question: 'Qual é o bug neste código?',
    options: [
      'A função deveria chamar-se "calcularTroco" (camelCase)',
      'A subtração está invertida: deveria ser total - pagamento',
      'O troco está sendo multiplicado por 2 desnecessariamente',
      'Não há bug — o código está correto',
    ],
    answer: 2,
    hint: 'O cálculo de troco na linha 2 está correto. O problema está no valor que é retornado na linha 3.',
    explanation: 'Na linha 3, `return troco * 2` multiplica o troco por 2 sem motivo algum. Se alguém paga R$10 em algo de R$7, o troco correto é R$3, mas a função retorna R$6. A correção é simplesmente `return troco`.',
  },

  {
    id: 'bug-02',
    caseNumber: 'CASO #002',
    category: 'bug',
    difficulty: 'Iniciante',
    points: 10,
    title: 'A Senha Bloqueada',
    narrative: 'O sistema de login da escola parou de funcionar após uma atualização. Nenhum aluno consegue entrar, mesmo digitando a senha correta. A TI está em pânico. Você consegue encontrar o erro?',
    evidence: `senha_correta = "ctrl123"
senha_digitada = input("Digite sua senha: ")

if senha_digitada = senha_correta:
    print("Acesso liberado!")
else:
    print("Senha incorreta.")`,
    evidenceType: 'code',
    language: 'python',
    question: 'O que está errado no código?',
    options: [
      'A variável senha_correta deveria usar aspas simples (\' \')',
      'Falta dois pontos depois do else',
      'O operador = deveria ser == dentro do if (atribuição vs comparação)',
      'A função input() não aceita argumentos com texto',
    ],
    answer: 2,
    hint: 'Em programação há uma diferença crucial entre "atribuir um valor" e "comparar dois valores". Qual operador faz cada coisa?',
    explanation: 'Em Python (e na maioria das linguagens), `=` é atribuição (define um valor) e `==` é comparação (testa igualdade). Dentro de um `if`, precisamos de `==` para verificar se as senhas são iguais. Com `=`, o Python encontra um erro de sintaxe.',
  },

  {
    id: 'bug-03',
    caseNumber: 'CASO #003',
    category: 'bug',
    difficulty: 'Intermediário',
    points: 25,
    title: 'O Aluno Fantasma',
    narrative: 'A professora Ana criou uma função para classificar notas dos alunos. Porém, quando um aluno tira 10, o sistema exibe "Aprovado" em vez de "Nota máxima!". Algo está errado na lógica.',
    evidence: `function verificarNota(nota) {
  if (nota >= 7) {
    return "Aprovado";
  } else if (nota >= 5) {
    return "Recuperação";
  } else if (nota == 10) {
    return "Nota máxima!";
  } else {
    return "Reprovado";
  }
}`,
    evidenceType: 'code',
    language: 'javascript',
    question: 'Por que a mensagem "Nota máxima!" nunca aparece?',
    options: [
      'JavaScript não suporta o operador == para comparar números',
      'Deveria usar === (igualdade estrita) em vez de ==',
      'A condição nota == 10 nunca é alcançada: nota >= 7 já é verdade para nota 10 e retorna antes',
      'O return dentro do else if está incorreto em JavaScript',
    ],
    answer: 2,
    hint: 'Quando nota = 10, qual é o primeiro if que é verdadeiro? A execução continua depois do return?',
    explanation: 'Quando nota = 10, a primeira condição `nota >= 7` já é VERDADEIRA, então a função retorna "Aprovado" imediatamente. O `else if (nota == 10)` nunca é executado porque o código já saiu da função. Para corrigir, a verificação de nota 10 deveria vir ANTES do `if (nota >= 7)`.',
  },

  {
    id: 'bug-04',
    caseNumber: 'CASO #004',
    category: 'bug',
    difficulty: 'Intermediário',
    points: 25,
    title: 'O Contador Teimoso',
    narrative: 'A diretora Márcia quer saber quantos alunos passaram na prova. O programa sempre mostra 1 a menos que o total correto, independentemente da turma. O erro é sistemático — há um bug lógico na varredura da lista.',
    evidence: `notas = [8, 5, 9, 4, 7, 6, 3, 10]
aprovados = 0

for i in range(len(notas) - 1):
    if notas[i] >= 6:
        aprovados += 1

print(f"Aprovados: {aprovados}")`,
    evidenceType: 'code',
    language: 'python',
    question: 'Qual é o problema no código?',
    options: [
      'A variável aprovados deveria começar com 1, não com 0',
      'range(len(notas) - 1) gera índices de 0 a 6, pulando o último elemento (notas[7] = 10)',
      'O critério de aprovação deveria ser nota > 6, não nota >= 6',
      'O f-string está formatado incorretamente',
    ],
    answer: 1,
    hint: 'A lista tem 8 elementos (índices 0 a 7). Quantos índices o range(7) gera? Qual elemento fica de fora?',
    explanation: '`range(len(notas) - 1)` é `range(7)`, que gera os índices 0, 1, 2, 3, 4, 5, 6 — pulando o índice 7 (notas[7] = 10, que seria aprovado). O correto é `range(len(notas))` ou, mais pythônico, `for nota in notas`.',
  },

  {
    id: 'bug-05',
    caseNumber: 'CASO #005',
    category: 'bug',
    difficulty: 'Avançado',
    points: 50,
    title: 'O Banco em Colapso',
    narrative: 'O Banco Digital começou a apresentar saldos negativos sem motivo aparente. Em dias de alto movimento, vários clientes viram seus saldos zerados. O sistema foi auditado linha por linha, mas o bug é sutil e aparece só sob pressão.',
    evidence: `saldo = 1000

def sacar(valor):
    global saldo
    if saldo >= valor:
        # simulação de delay de rede (0.001s)
        import time; time.sleep(0.001)
        saldo -= valor
        return True
    return False

# Executado simultaneamente (2 threads):
# Thread A: sacar(600)  → verifica: 1000 >= 600 ✓
# Thread B: sacar(600)  → verifica: 1000 >= 600 ✓
# Thread A: saldo = 1000 - 600 = 400
# Thread B: saldo = 400 - 600 = -200  ← !!`,
    evidenceType: 'code',
    language: 'python',
    question: 'Que tipo de problema de programação é este?',
    options: [
      'Bug de sintaxe: o import deveria estar no topo do arquivo',
      'Race condition: duas threads verificam o saldo simultaneamente antes que qualquer uma o modifique',
      'Stack overflow: recursão infinita causada pelo time.sleep',
      'Memory leak: a variável global saldo não é liberada da memória',
    ],
    answer: 1,
    hint: 'O bug só aparece quando duas operações acontecem "ao mesmo tempo". O que acontece se duas threads passam pela verificação antes de qualquer uma fazer o saque?',
    explanation: 'Ambas as threads verificam `saldo >= valor` (1000 >= 600 = true) antes que qualquer uma execute o saque. Ambas aprovam a operação e ambas sacam, resultando em -200. Isso é uma **race condition** (condição de corrida), resolvida com mutexes, semáforos ou operações atômicas que bloqueiam o recurso durante a operação.',
  },

  {
    id: 'bug-06',
    caseNumber: 'CASO #006',
    category: 'bug',
    difficulty: 'Avançado',
    points: 50,
    title: 'A Recursão Sem Fim',
    narrative: 'A equipe de TI criou uma função para calcular fatorial. Para números pequenos funciona, mas para qualquer número acima de 5, o computador trava completamente. O sistema de segurança da escola está em risco.',
    evidence: `def fatorial(n):
    if n == 0:
        return 1
    return n * fatorial(n)

# fatorial(5) → trava o sistema`,
    evidenceType: 'code',
    language: 'python',
    question: 'O que causa o travamento do sistema?',
    options: [
      'O caso base está errado: deveria ser if n == 1, não if n == 0',
      'Python não permite funções que chamam a si mesmas',
      'A chamada `fatorial(n)` não decrementa n, criando recursão infinita até estourar a pilha',
      'Falta um else antes do return final',
    ],
    answer: 2,
    hint: 'Para que a recursão termine, o que precisa acontecer a cada chamada? O que muda no argumento entre uma chamada e a próxima?',
    explanation: '`fatorial(n)` chama a si mesma com o MESMO valor de n, que nunca muda, então nunca alcança o caso base (n == 0). Isso causa um **stack overflow** (estouro de pilha) pois a recursão é infinita. A correção é `fatorial(n - 1)` para que n diminua a cada chamada: fatorial(5) → fatorial(4) → ... → fatorial(0) → 1.',
  },

  /* ═══════════════ SEQUÊNCIAS ═══════════════ */
  {
    id: 'seq-01',
    caseNumber: 'CASO #007',
    category: 'sequencia',
    difficulty: 'Iniciante',
    points: 10,
    title: 'O Código da Caixa-Forte',
    narrative: 'Um ladrão misterioso deixou uma pista antes de fugir: a combinação da caixa-forte segue uma sequência matemática famosa. O inspetor conhece os primeiros números, mas precisa prever o próximo para abrir o cofre a tempo.',
    evidence: '1, 1, 2, 3, 5, 8, 13, 21, ?',
    evidenceType: 'sequence',
    question: 'Qual é o próximo número desta sequência?',
    options: ['29', '34', '35', '42'],
    answer: 1,
    hint: 'Tente somar dois números consecutivos da sequência. O que você obtém?',
    explanation: 'É a famosa **sequência de Fibonacci**! Cada número é a soma dos dois anteriores: 1+1=2, 1+2=3, 2+3=5, 3+5=8, 5+8=13, 8+13=21, e 13+21=**34**. Essa sequência aparece em conchas de náutilos, flores e até em algoritmos de computação.',
  },

  {
    id: 'seq-02',
    caseNumber: 'CASO #008',
    category: 'sequencia',
    difficulty: 'Iniciante',
    points: 10,
    title: 'As Pegadas no Jardim',
    narrative: 'O jardineiro do parque notou pegadas numéricas na grama molhada, deixadas pelo suspeito. As pegadas seguem um padrão preciso. Descobrir o próximo número revela quantas pegadas o invasor deixará antes de sair pelo portão norte.',
    evidence: '2, 4, 8, 16, 32, ?',
    evidenceType: 'sequence',
    question: 'Qual é o próximo número?',
    options: ['48', '56', '64', '36'],
    answer: 2,
    hint: 'Observe a relação entre cada número e o seguinte. O que você precisa fazer com cada número para obter o próximo?',
    explanation: 'Cada número é o **dobro do anterior**: 2×2=4, 4×2=8, 8×2=16, 16×2=32, 32×2=**64**. São as potências de 2 (2¹, 2², 2³, 2⁴, 2⁵, 2⁶). Essa progressão geométrica é fundamental em computação — é por isso que memórias têm 4GB, 8GB, 16GB, 32GB...',
  },

  {
    id: 'seq-03',
    caseNumber: 'CASO #009',
    category: 'sequencia',
    difficulty: 'Intermediário',
    points: 25,
    title: 'A Mensagem Codificada',
    narrative: 'Uma mensagem cifrada foi interceptada pelo departamento de segurança. Para decifrá-la, é necessário descobrir o padrão numérico oculto. O próximo número na sequência revela o andar do prédio onde o encontro secreto acontecerá.',
    evidence: '1, 4, 9, 16, 25, 36, ?',
    evidenceType: 'sequence',
    question: 'Qual é o próximo número?',
    options: ['42', '46', '49', '52'],
    answer: 2,
    hint: 'Calcule a raiz quadrada de cada número: √1, √4, √9, √16... Que padrão você vê?',
    explanation: 'São os **quadrados perfeitos**: 1²=1, 2²=4, 3²=9, 4²=16, 5²=25, 6²=36, 7²=**49**. Cada número é o quadrado do seu índice na sequência. Quadrados perfeitos aparecem em algoritmos de ordenação, geometria computacional e criptografia.',
  },

  {
    id: 'seq-04',
    caseNumber: 'CASO #010',
    category: 'sequencia',
    difficulty: 'Intermediário',
    points: 25,
    title: 'O Ladrão Serial',
    narrative: 'Um ladrão metódico numera cada crime com um código especial. Os detetives descobriram a sequência dos últimos crimes. Precisam prever o próximo código para antecipar e interceptar a ação antes que aconteça.',
    evidence: '3, 7, 13, 21, 31, 43, ?',
    evidenceType: 'sequence',
    question: 'Qual é o próximo número?',
    options: ['53', '57', '59', '61'],
    answer: 1,
    hint: 'Calcule as diferenças entre números consecutivos: 7-3=4, 13-7=6, 21-13=8... Que padrão você vê nessas diferenças?',
    explanation: 'As diferenças entre termos consecutivos são: 4, 6, 8, 10, 12 — crescem de **2 em 2** (progressão aritmética das diferenças). A próxima diferença seria 14, então: 43 + 14 = **57**. Esse tipo de sequência é chamado de "progressão de segunda ordem".',
  },

  {
    id: 'seq-05',
    caseNumber: 'CASO #011',
    category: 'sequencia',
    difficulty: 'Avançado',
    points: 50,
    title: 'A Sequência do Cofre',
    narrative: 'O cofre do laboratório só abre com a sequência correta de números. O Professor Enigma deixou uma dica: "Esses números têm uma propriedade muito especial — eles só se dividem por 1 e por si mesmos." Qual é o próximo?',
    evidence: '2, 3, 5, 7, 11, 13, 17, ?',
    evidenceType: 'sequence',
    question: 'Qual é o próximo número na sequência?',
    options: ['19', '20', '21', '23'],
    answer: 0,
    hint: 'A dica do Professor: "só se dividem por 1 e por si mesmos". Verifique: 18 = 2×9, então 18 não serve. E 19?',
    explanation: 'São os **números primos**! Um número primo só é divisível por 1 e por ele mesmo. Após 17, testamos: 18 = 2×9 (não primo), **19** não tem divisores além de 1 e 19 (primo!). O próximo seria 23. Números primos são a base da criptografia moderna usada em bancos e na internet.',
  },

  /* ═══════════════ LÓGICA PURA ═══════════════ */
  {
    id: 'log-01',
    caseNumber: 'CASO #012',
    category: 'logica',
    difficulty: 'Iniciante',
    points: 10,
    title: 'O Ladrão da Merenda',
    narrative: 'A merenda da escola desapareceu! Três alunos são suspeitos: Lara, Marcos e Nina. Uma regra é certa: o culpado sempre mente, e os inocentes sempre falam a verdade. Apenas um é culpado.',
    evidence: `Lara diz:  "Marcos é o culpado."
Marcos diz: "Nina é a culpada."
Nina diz:  "Marcos está mentindo."`,
    evidenceType: 'text',
    question: 'Quem roubou a merenda?',
    options: ['Lara', 'Marcos', 'Nina', 'Impossível determinar'],
    answer: 1,
    hint: 'Tente assumir que cada pessoa é culpada e veja se as afirmações ficam consistentes. Quem, sendo culpado, tornaria todas as outras afirmações verdadeiras?',
    explanation: 'Se **Marcos é culpado** (mente): Lara diz "Marcos é culpado" → VERDADE ✓ (Lara é inocente). Marcos diz "Nina é culpada" → MENTIRA ✓ (Marcos mente, como esperado). Nina diz "Marcos está mentindo" → VERDADE ✓ (Nina é inocente). Tudo é consistente! Marcos roubou a merenda.',
  },

  {
    id: 'log-02',
    caseNumber: 'CASO #013',
    category: 'logica',
    difficulty: 'Iniciante',
    points: 10,
    title: 'As Senhas da Sala Secreta',
    narrative: 'Para entrar na sala secreta do clube de programação, você precisa responder ao enigma do guardião. 30 estudantes responderam uma pesquisa sobre esportes. Descubra quantos não praticam nenhum esporte.',
    evidence: `Total de estudantes: 30
Gostam de futebol:         18
Gostam de basquete:        15
Gostam dos DOIS esportes:   8`,
    evidenceType: 'text',
    question: 'Quantos estudantes não gostam de nenhum dos dois esportes?',
    options: ['3', '5', '7', '10'],
    answer: 1,
    hint: 'Cuidado para não contar quem gosta dos dois esportes duas vezes! Use a fórmula: |A ∪ B| = |A| + |B| - |A ∩ B|.',
    explanation: 'Usando a fórmula da união de conjuntos: alunos que gostam de pelo menos um esporte = 18 + 15 - 8 = **25** (subtraímos 8 para não contar quem gosta dos dois duas vezes). Portanto, alunos que não gostam de nenhum = 30 - 25 = **5**.',
  },

  {
    id: 'log-03',
    caseNumber: 'CASO #014',
    category: 'logica',
    difficulty: 'Intermediário',
    points: 25,
    title: 'O Testamento do Professor',
    narrative: 'O Professor Lógico deixou um enigma para revelar onde está o tesouro. As pistas estão no quadro da sala de aula. Use lógica encadeada para descobrir a conclusão correta.',
    evidence: `Pista 1: Se chove, então o pátio fica molhado.
Pista 2: Se o pátio fica molhado, os alunos ficam dentro da escola.
Pista 3: Os alunos estão FORA da escola agora.`,
    evidenceType: 'text',
    question: 'O que podemos concluir com certeza a partir das pistas?',
    options: [
      'Está chovendo agora',
      'O pátio está molhado',
      'Não está chovendo agora',
      'Os alunos não gostam de chuva',
    ],
    answer: 2,
    hint: 'Comece pelo fato concreto (Pista 3) e "trabalhe ao contrário". Se alunos estão fora, o que a Pista 2 implica ao contrário?',
    explanation: 'Usamos **modus tollens** ("se P → Q" e "não-Q" → "não-P") encadeado: Pista 3: alunos fora → pela Pista 2 ao contrário: pátio NÃO está molhado → pela Pista 1 ao contrário: NÃO está chovendo. Portanto, **não está chovendo agora**. Se estivesse chovendo, o pátio estaria molhado e os alunos estariam dentro — mas estão fora, contradição!',
  },

  {
    id: 'log-04',
    caseNumber: 'CASO #015',
    category: 'logica',
    difficulty: 'Intermediário',
    points: 25,
    title: 'O Enigma da Mochila',
    narrative: 'Um crime aconteceu no laboratório. Quatro objetos foram examinados. O detetive encontrou as regras exatas do que o ladrão carregava em sua mochila. Descubra quais objetos foram levados.',
    evidence: `Regras encontradas na cena do crime:
1. Se levou o livro, então NÃO levou a caneta.
2. Se NÃO levou a régua, então levou a borracha.
3. Levou a caneta.
4. NÃO levou a borracha.`,
    evidenceType: 'text',
    question: 'Quais objetos o ladrão levou?',
    options: [
      'Apenas o livro',
      'Caneta e régua',
      'Livro, caneta e régua',
      'Apenas a caneta',
    ],
    answer: 1,
    hint: 'Comece pelas afirmações diretas (3 e 4) e use-as para descobrir as indiretas (2 e 1).',
    explanation: 'Regra 4: não tem borracha. Regra 2: "se não tem régua → tem borracha"; como NÃO tem borracha, por contrapositiva → **tem régua**. Regra 3: **tem caneta**. Regra 1: "se tem livro → não tem caneta"; como TEM caneta, por contrapositiva → **não tem livro**. Resultado: levou **caneta e régua** apenas.',
  },

  {
    id: 'log-05',
    caseNumber: 'CASO #016',
    category: 'logica',
    difficulty: 'Avançado',
    points: 50,
    title: 'O Cofre Digital',
    narrative: 'Um espião deixou um cofre com senha de 6 dígitos. O computador da escola faz 1 milhão de tentativas por segundo usando força bruta. O agente precisa saber se tem tempo de quebrar a senha antes do prazo de 1 hora.',
    evidence: `Senha: 6 dígitos (cada dígito: 0 a 9)
Combinações para N dígitos = 10^N

N=1: 10 combinações
N=2: 100 combinações
N=3: 1.000 combinações
N=6: ?

Velocidade do computador: 1.000.000 tentativas/segundo`,
    evidenceType: 'text',
    question: 'Quanto tempo leva para testar TODAS as combinações de uma senha de 6 dígitos?',
    options: [
      '1 segundo',
      '10 segundos',
      '100 segundos',
      '16 minutos',
    ],
    answer: 0,
    hint: 'Calcule 10^6 para saber o total de combinações, depois divida pela velocidade do computador.',
    explanation: 'Para N=6 dígitos: 10⁶ = **1.000.000 combinações**. Com 1.000.000 tentativas/segundo: 1.000.000 ÷ 1.000.000 = **1 segundo**! Por isso senhas curtas são perigosas — um computador moderno quebra em segundos. Uma senha de 12 dígitos levaria 10¹²/10⁶ = 1.000.000 segundos ≈ 11,5 dias.',
  },

  /* ═══════════════ ALGORITMOS ═══════════════ */
  {
    id: 'alg-01',
    caseNumber: 'CASO #017',
    category: 'algoritmo',
    difficulty: 'Iniciante',
    points: 10,
    title: 'O Mapa do Tesouro',
    narrative: 'Para encontrar o tesouro escondido, você deve entender como o explorador organiza e procura dados. Ele quer saber a eficiência do seu método de busca — quantas verificações serão necessárias no pior caso?',
    evidence: `def busca_linear(lista, alvo):
    for i in range(len(lista)):
        if lista[i] == alvo:
            return i
    return -1

# Lista com N elementos
# Pior caso: o alvo não está na lista`,
    evidenceType: 'code',
    language: 'python',
    question: 'Qual é a complexidade de tempo deste algoritmo no pior caso?',
    options: [
      'O(1) — constante: sempre 1 operação',
      'O(log n) — logarítmica: divide pela metade a cada passo',
      'O(n) — linear: verifica cada elemento uma vez',
      'O(n²) — quadrática: dois loops aninhados',
    ],
    answer: 2,
    hint: 'No pior caso (alvo não encontrado), quantas vezes o if é executado em uma lista com N elementos?',
    explanation: 'A busca linear percorre cada elemento da lista do começo ao fim. No pior caso (alvo não encontrado ou está no final), verifica todos os **n** elementos — uma verificação por elemento. Portanto, a complexidade é **O(n)** (linear). Se a lista dobrar de tamanho, o tempo máximo também dobra.',
  },

  {
    id: 'alg-02',
    caseNumber: 'CASO #018',
    category: 'algoritmo',
    difficulty: 'Intermediário',
    points: 25,
    title: 'O Cofre Binário',
    narrative: 'A combinação do cofre foi escondida em uma lista ordenada de 1024 números. O agente usa busca binária para ser mais eficiente. Quantas verificações são necessárias no pior caso para encontrar qualquer número?',
    evidence: `Lista ordenada com 1024 números.
Busca binária: verifica o elemento do meio.
- Se é o alvo: encontrou!
- Se alvo < meio: busca na metade esquerda
- Se alvo > meio: busca na metade direita

Passo 1: 1024 → 512 elementos restantes
Passo 2:  512 → 256 elementos restantes
Passo 3:  256 → 128 elementos restantes
...`,
    evidenceType: 'text',
    question: 'Quantas verificações são necessárias no PIOR CASO para 1024 elementos?',
    options: ['5 verificações', '10 verificações', '100 verificações', '512 verificações'],
    answer: 1,
    hint: '1024 = 2^10. A busca binária divide por 2 a cada passo. Quantas vezes você pode dividir 1024 por 2 até chegar a 1?',
    explanation: 'A busca binária tem complexidade **O(log₂ n)**. Para 1024 elementos: log₂(1024) = **10 verificações** no máximo (1024→512→256→128→64→32→16→8→4→2→1). Compare com busca linear: até 1024 verificações. Para 1 bilhão de elementos, busca linear precisaria de 1 bilhão de verificações; busca binária precisaria de apenas 30!',
  },

  {
    id: 'alg-03',
    caseNumber: 'CASO #019',
    category: 'algoritmo',
    difficulty: 'Intermediário',
    points: 25,
    title: 'A Escada Infinita',
    narrative: 'Um hacker criou um programa que calcula a sequência de Fibonacci usando recursão. Para números pequenos é rápido, mas fibonacci(50) trava o computador por minutos. O Detetive Digital precisa explicar por quê.',
    evidence: `def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# fibonacci(10) → rápido
# fibonacci(30) → lento (1 segundo)
# fibonacci(50) → trava por minutos`,
    evidenceType: 'code',
    language: 'python',
    question: 'Por que fibonacci(50) é tão lento?',
    options: [
      'Python não suporta recursão para valores de n maiores que 30',
      'A função recalcula os mesmos valores exponencialmente: complexidade O(2^n)',
      'O caso base está errado: deveria ser if n <= 2',
      'O operador + não funciona com chamadas recursivas em Python',
    ],
    answer: 1,
    hint: 'Para calcular fibonacci(5), quantas vezes fibonacci(3) é chamado? E fibonacci(2)?',
    explanation: 'A função chama fibonacci(n-1) E fibonacci(n-2), cada uma fazendo mais duas chamadas, e assim por diante. fibonacci(3) é recalculado milhões de vezes! A complexidade é **O(2^n)** — exponencial. Para fibonacci(50), são ~2^50 ≈ 1 quadrilhão de operações. A solução é **memoização** (guardar resultados já calculados) ou programação dinâmica, reduzindo para O(n).',
  },

  {
    id: 'alg-04',
    caseNumber: 'CASO #020',
    category: 'algoritmo',
    difficulty: 'Avançado',
    points: 50,
    title: 'O Último Desafio',
    narrative: 'O Grande Mestre Lógico bloqueou a saída com um desafio final: o Problema da Mochila. Para cruzar a ponte, você deve escolher os itens certos para maximizar o valor carregado sem exceder o peso limite.',
    evidence: `Capacidade da mochila: 5 kg

Itens disponíveis:
  Livro de Código:  2 kg  →  valor 6
  Laptop:           3 kg  →  valor 9
  Tablet:           1 kg  →  valor 3
  Câmera:           4 kg  →  valor 10

Combinações possíveis (≤ 5kg):
  Livro + Laptop  = 5kg, valor = ?
  Câmera + Tablet = 5kg, valor = ?
  Laptop + Tablet = 4kg, valor = ?`,
    evidenceType: 'text',
    question: 'Qual combinação maximiza o valor total sem ultrapassar 5 kg?',
    options: [
      'Livro + Laptop = 5kg, valor 15',
      'Câmera + Tablet = 5kg, valor 13',
      'Laptop + Tablet = 4kg, valor 12',
      'Câmera sozinha = 4kg, valor 10',
    ],
    answer: 0,
    hint: 'Calcule o valor total de cada combinação que não ultrapasse 5kg. Quais combinações cabem? Qual tem o maior valor?',
    explanation: 'Testando as combinações dentro do limite: Livro+Laptop=5kg/**valor 15**, Câmera+Tablet=5kg/valor 13, Laptop+Tablet=4kg/valor 12. A combinação **Livro + Laptop** vence com valor **15**! Este é o clássico **Problema da Mochila (Knapsack Problem)** — resolvido eficientemente com programação dinâmica, preenchendo uma tabela de subproblemas para evitar recalcular.',
  },
];
