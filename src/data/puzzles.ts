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

  /* ═══════════════ NOVOS — INICIANTE ═══════════════ */
  {
    id: 'bug-07',
    caseNumber: 'CASO #021',
    category: 'bug',
    difficulty: 'Iniciante',
    points: 10,
    title: 'O Guarda da Rede',
    narrative: 'A rede interna de uma empresa começou a receber ataques externos. O gerente de TI precisa de um equipamento que monitore e filtre todo o tráfego de entrada e saída com base em regras de segurança. Qual equipamento resolve o problema?',
    evidence: `Equipamentos disponíveis:
• Hub       — distribui dados para todos os dispositivos da rede
• Bridge    — conecta segmentos de rede diferentes
• Firewall  — monitora e filtra tráfego com base em regras
• Antivírus — detecta e remove software malicioso
• Back-Up   — realiza cópias de segurança dos dados`,
    evidenceType: 'text',
    question: 'Qual equipamento monitora e filtra o tráfego de rede com base em regras de segurança?',
    options: ['Hub', 'Bridge', 'Firewall', 'Antivírus'],
    answer: 2,
    hint: 'Qual equipamento age como uma "barreira" ou "muralha" entre a rede interna e o mundo externo?',
    explanation: 'O **Firewall** funciona como uma barreira de segurança: analisa cada pacote de dados que entra ou sai da rede e decide se deve permitir ou bloquear com base em regras predefinidas. O nome vem do conceito de parede corta-fogo — aqui, impedindo "incêndios" digitais. Hub e Bridge gerenciam tráfego sem filtrar; antivírus age localmente nos arquivos.',
  },
  {
    id: 'bug-08',
    caseNumber: 'CASO #022',
    category: 'bug',
    difficulty: 'Iniciante',
    points: 10,
    title: 'O Arquivo Misterioso',
    narrative: 'Um designer encontrou vários arquivos misturados na pasta do projeto. A extensão do arquivo revela o seu tipo. O detetive precisa identificar duas extensões que pertencem EXCLUSIVAMENTE a arquivos de imagem.',
    evidence: `.PNG — imagem rasterizada com transparência
.CSV — planilha de dados separados por vírgula
.EPS — gráfico vetorial encapsulado (PostScript)
.PHP — script de programação web
.BMP — bitmap, imagem não comprimida
.PDF — documento portátil
.GIF — imagem animada ou estática
.JPG — imagem fotográfica comprimida`,
    evidenceType: 'text',
    question: 'Quais são DUAS extensões usadas exclusivamente para arquivos de imagem?',
    options: ['PNG e CSV', 'BMP e PDF', 'EPS e PHP', 'GIF e JPG'],
    answer: 3,
    hint: 'CSV = dados em tabela; PDF = documento; PHP = código de programação. Quais das opções contêm APENAS extensões de imagem?',
    explanation: '**.GIF** e **.JPG** são formatos exclusivos de imagem. As outras opções combinam imagem com não-imagem: PNG+CSV (CSV é dado), BMP+PDF (PDF é documento), EPS+PHP (PHP é código). A opção D é a única em que AMBAS as extensões são formatos de imagem.',
  },
  {
    id: 'bug-09',
    caseNumber: 'CASO #023',
    category: 'bug',
    difficulty: 'Iniciante',
    points: 10,
    title: 'Intruso no Vocabulário',
    narrative: 'Um suspeito deixou uma lista de termos embaralhados. A maioria pertence à área de Tecnologia da Informação — mas um grupo é completamente estranho ao vocabulário de TI. O detetive precisa identificar o intruso.',
    evidence: `A) "Nuvem" e "rede"
B) "Sala escura" e "IA"
C) "Linguagens" e "bugs"
D) "Dados", "vírus" e "dark web"
E) "Síndrome do ninho vazio"`,
    evidenceType: 'text',
    question: 'Qual dos grupos de termos NÃO pertence ao vocabulário de Tecnologia da Informação?',
    options: [
      '"Nuvem" e "rede" — armazenamento online e conexão',
      '"Sala escura" e "IA" — datacenter e inteligência artificial',
      '"Linguagens" e "bugs" — programação e erros de código',
      '"Síndrome do ninho vazio" — sentimento de pais quando filhos saem de casa',
    ],
    answer: 3,
    hint: 'Analise cada grupo: nuvem (cloud), bugs (erros de código), dark web. Qual grupo claramente vem de outro contexto?',
    explanation: '"**Síndrome do ninho vazio**" é um termo da psicologia que descreve o sentimento de pais quando os filhos saem de casa — não tem nenhuma relação com TI. Os outros grupos são todos termos amplamente usados em tecnologia: nuvem (cloud computing), sala escura (datacenter), linguagens/bugs (programação), dark web (internet oculta).',
  },
  {
    id: 'log-06',
    caseNumber: 'CASO #024',
    category: 'logica',
    difficulty: 'Iniciante',
    points: 10,
    title: 'O Fruto Proibido',
    narrative: 'Um detetive júnior recebeu um caso que parecia simples: descobrir quem comeu o fruto proibido no jardim do paraíso. Mas antes de responder, ele leu a pergunta com muita atenção — e percebeu uma armadilha.',
    evidence: `Adão e Eva estão no jardim do paraíso.
O fruto proibido da história bíblica é mencionado especificamente na tradição popular.
A pergunta do investigador: "Qual dos dois comeu a famosa PERA?"`,
    evidenceType: 'text',
    question: 'Qual dos dois comeu a famosa PERA no jardim do paraíso?',
    options: [
      'Adão comeu a pera',
      'Eva comeu a pera',
      'Os dois comeram a pera',
      'Nenhum dos dois — o fruto proibido era uma MAÇÃ, não uma pera',
    ],
    answer: 3,
    hint: 'Leia a pergunta com atenção máxima. Qual fruto a pergunta menciona? Qual é o fruto proibido da história original?',
    explanation: 'A resposta correta é que **nenhum dos dois** comeu uma pera — o fruto proibido da tradição bíblica é a **maçã**, não uma pera. A questão testa leitura cuidadosa: um detetive precisa sempre examinar as evidências com precisão antes de concluir. Responder sem ler direito é o erro mais comum em provas e investigações.',
  },
  {
    id: 'seq-06',
    caseNumber: 'CASO #025',
    category: 'sequencia',
    difficulty: 'Iniciante',
    points: 10,
    title: 'O Átomo Invisível',
    narrative: 'Um cientista forense precisa documentar a menor evidência já registrada: o diâmetro de um átomo de hidrogênio. Para o relatório técnico, a medida deve estar em notação científica.',
    evidence: `Diâmetro do átomo de hidrogênio:
0,0000001 milímetros

Notação científica: N × 10^x
onde 1 ≤ N < 10

Regra: conte quantas posições o ponto decimal se move para tornar N ≥ 1.`,
    evidenceType: 'text',
    question: 'Em notação científica, 0,0000001 mm é representado como:',
    options: ['1 × 10⁻⁵ mm', '1 × 10⁻⁶ mm', '1 × 10⁻⁷ mm', '1 × 10⁻⁸ mm'],
    answer: 2,
    hint: 'Conte os zeros depois da vírgula antes do "1": 0,000000**1** — quantas casas o ponto decimal andou?',
    explanation: '0,0000001 = 1 × 10⁻⁷. O "1" está 7 casas à direita do ponto decimal. Em notação científica isso vira 10⁻⁷. Essa notação é essencial em computação: nanosegundos = 10⁻⁹s, terabytes = 10¹²B. Saber ler e escrever potências de 10 é fundamental para entender escalas de hardware e performance.',
  },
  {
    id: 'seq-07',
    caseNumber: 'CASO #026',
    category: 'sequencia',
    difficulty: 'Iniciante',
    points: 10,
    title: 'A Dívida da Investigadora',
    narrative: 'Ana, uma investigadora novata, pediu emprestado R$5.000 para comprar equipamentos. O acordo: pagar em 6 meses com juros simples de 2% ao mês. Ela precisa saber o valor total para planejar o orçamento.',
    evidence: `Fórmula de Juros Simples:
J = P × i × t
Total = P + J

Onde:
  P = principal (R$ 5.000)
  i = taxa por período (2% = 0,02)
  t = número de períodos (6 meses)`,
    evidenceType: 'text',
    question: 'Qual o valor total que Ana pagará ao final dos 6 meses?',
    options: ['R$ 5.400,00', 'R$ 5.600,00', 'R$ 5.800,00', 'R$ 6.000,00'],
    answer: 1,
    hint: 'J = 5.000 × 0,02 × 6. Depois some os juros ao principal.',
    explanation: 'J = 5.000 × 0,02 × 6 = **R$600,00**. Total = 5.000 + 600 = **R$5.600,00**. No juros simples os juros são sempre calculados sobre o principal original (diferente do composto). 2% ao mês × 6 meses = 12% do valor inicial — sem capitalização.',
  },
  {
    id: 'seq-09',
    caseNumber: 'CASO #027',
    category: 'sequencia',
    difficulty: 'Iniciante',
    points: 10,
    title: 'A Nota do Meio',
    narrative: 'O professor do curso técnico precisava registrar a nota **mediana** da turma — não a média, mas o valor central quando os dados estão ordenados. O detetive precisa calcular corretamente.',
    evidence: `Notas da turma (9 alunos) na disciplina de Hardware:
9, 2, 4, 7, 9, 8, 6, 3, 8

Mediana = valor central após ordenação crescente.
Com n ímpar: posição central = (n + 1) / 2`,
    evidenceType: 'text',
    question: 'Qual é a mediana das notas?',
    options: ['6', '7', '8', '9'],
    answer: 1,
    hint: 'Ordene as notas de menor para maior. Com 9 valores, a posição central é a 5ª.',
    explanation: 'Ordenando: 2, 3, 4, 6, **7**, 8, 8, 9, 9. A 5ª posição (central de 9) é **7**. A mediana é mais robusta que a média para dados com valores extremos — se um aluno tirasse 0, a média cairia mas a mediana não mudaria. Por isso é usada em estatística e ciência de dados.',
  },
  {
    id: 'seq-10',
    caseNumber: 'CASO #028',
    category: 'sequencia',
    difficulty: 'Iniciante',
    points: 10,
    title: 'O Filtro de E-mail',
    narrative: 'O sistema de e-mail da escola classifica mensagens automaticamente. O detetive digital precisa calcular a probabilidade de sortear aleatoriamente uma mensagem não importante, expressando o resultado como fração simplificada.',
    evidence: `Classificação da caixa de entrada:
• 20% das mensagens → IMPORTANTES
• 80% das mensagens → NÃO IMPORTANTES

Probabilidade = casos favoráveis / total
Para simplificar: divida numerador e denominador pelo MDC.`,
    evidenceType: 'text',
    question: 'Qual é a probabilidade de uma mensagem escolhida ao acaso ser NÃO importante?',
    options: ['2/5', '3/4', '4/5', '7/8'],
    answer: 2,
    hint: '80% = 80/100. Simplifique dividindo por MDC(80, 100).',
    explanation: '80% = 80/100. MDC(80, 100) = 20, então 80÷20 / 100÷20 = **4/5**. Esse tipo de probabilidade é a base dos filtros de spam: o Gmail usa probabilidade condicional (Teorema de Bayes) para calcular a chance de cada e-mail ser spam com base em palavras e padrões.',
  },

  /* ═══════════════ NOVOS — INTERMEDIÁRIO ═══════════════ */
  {
    id: 'log-07',
    caseNumber: 'CASO #029',
    category: 'logica',
    difficulty: 'Intermediário',
    points: 25,
    title: 'A Corrida das Tartarugas',
    narrative: 'Duas tartarugas partiram juntas em linha reta para um lago distante. A mais rápida chegou primeiro e ficou esperando. O detetive precisa descobrir quantos dias de espera houve.',
    evidence: `Tartaruga 1: 30 metros/dia → chegou em 16 dias
Tartaruga 2: 20 metros/dia → mais lenta

Distância = velocidade × tempo
(ambas percorrem a mesma distância)`,
    evidenceType: 'text',
    question: 'Quantos dias a primeira tartaruga esperou pela segunda ao chegar ao lago?',
    options: ['6 dias', '7 dias', '8 dias', '10 dias'],
    answer: 2,
    hint: 'Passo 1: calcule a distância total (vel₁ × tempo₁). Passo 2: calcule o tempo da tartaruga 2 (distância ÷ vel₂). Passo 3: subtraia.',
    explanation: 'Distância = 30 × 16 = **480 metros**. Tartaruga 2: 480 ÷ 20 = **24 dias**. Espera = 24 − 16 = **8 dias**. Esse raciocínio de "mesma distância, velocidades diferentes" aparece em algoritmos de sincronização e em problemas de tempo de execução paralela.',
  },
  {
    id: 'log-08',
    caseNumber: 'CASO #030',
    category: 'logica',
    difficulty: 'Intermediário',
    points: 25,
    title: 'O Horário Misterioso',
    narrative: 'João acordou atrasado e fez uma observação estranha ao olhar o relógio: "o tempo restante até meia-noite é igual à metade do tempo que já passou desde meia-noite." O detetive precisa descobrir a que horas João acordou.',
    evidence: `Um dia = 24 horas (de 00h a 00h do dia seguinte).
Seja t = horas decorridas desde meia-noite.
Tempo restante = 24 − t

Condição: 24 − t = t/2`,
    evidenceType: 'text',
    question: 'A que horas João acordou?',
    options: ['8h00', '12h00', '14h00', '16h00'],
    answer: 3,
    hint: 'Monte a equação com a condição dada e resolva para t: 24 − t = t/2.',
    explanation: '24 − t = t/2 → 48 − 2t = t → 48 = 3t → **t = 16 h**. Prova: decorrido = 16h, restante = 8h. 8 = 16/2 ✓. João acordou às **16h**. Esse tipo de equação de "relação entre partes" é a base do raciocínio proporcional em algoritmos de divisão de recursos.',
  },
  {
    id: 'seq-08',
    caseNumber: 'CASO #031',
    category: 'sequencia',
    difficulty: 'Intermediário',
    points: 25,
    title: 'A Colônia Invasora',
    narrative: 'O laboratório forense detectou uma colônia de bactérias na cena do crime. Para estimar quando a contaminação começou, os cientistas precisam calcular o tamanho da colônia após 6 horas.',
    evidence: `População inicial: 100 bactérias
A colônia DOBRA a cada 2 horas.

Crescimento exponencial: P(t) = P₀ × 2^(t ÷ período)

Em 6 horas, quantos dobramentos ocorrem?`,
    evidenceType: 'text',
    question: 'Qual será a população de bactérias após 6 horas?',
    options: ['400 bactérias', '800 bactérias', '1.200 bactérias', '1.600 bactérias'],
    answer: 1,
    hint: '6h ÷ 2h por dobramento = 3 dobramentos. P = 100 × 2³',
    explanation: '6 ÷ 2 = **3 dobramentos**. P = 100 × 2³ = 100 × 8 = **800 bactérias**. Esse crescimento exponencial é idêntico à complexidade O(2ⁿ) em algoritmos — cada passo extra dobra o trabalho. É por isso que algoritmos exponenciais travam para entradas grandes: para n = 50, 2⁵⁰ ≈ 1 quadrilhão de operações.',
  },
  {
    id: 'alg-06',
    caseNumber: 'CASO #032',
    category: 'algoritmo',
    difficulty: 'Intermediário',
    points: 25,
    title: 'O Sincronismo do Parque',
    narrative: 'O detetive investigava um parque infantil quando percebeu que dois brinquedos se sincronizavam periodicamente. Para prever o próximo momento simultâneo, ele precisa calcular o MMC.',
    evidence: `Carrossel: completa 1 volta a cada 15 segundos
Balanço:    completa 1 oscilação a cada 18 segundos
Ambos partem sincronizados ao mesmo tempo.

MMC = produto dos fatores primos com maior expoente.
15 = 3 × 5
18 = 2 × 3²`,
    evidenceType: 'text',
    question: 'Após quantos segundos os dois brinquedos estarão sincronizados novamente?',
    options: ['60 segundos', '90 segundos', '120 segundos', '180 segundos'],
    answer: 1,
    hint: 'MMC(15, 18): use os fatores primos 15 = 3×5 e 18 = 2×3². MMC = maior expoente de cada primo.',
    explanation: 'MMC(15, 18): fatores = 2¹ × 3² × 5¹ = 2 × 9 × 5 = **90 segundos**. O MMC é fundamental em computação: sistemas operacionais usam esse conceito no agendamento de processos (scheduling) e em sistemas de temporização para sincronizar threads que rodam em frequências diferentes.',
  },
  {
    id: 'alg-07',
    caseNumber: 'CASO #033',
    category: 'algoritmo',
    difficulty: 'Intermediário',
    points: 25,
    title: 'A Viagem da Turma',
    narrative: 'O detetive organizou uma viagem de estudos para uma reserva natural. Mas precisava calcular exatamente quantos ônibus reservar — três porcentagens encadeadas para resolver.',
    evidence: `Total de alunos na escola: 800
• 75% estão interessados em participar
• 40% dos interessados precisam de transporte escolar
• Capacidade por ônibus: 50 pessoas

Sempre arredonde para cima (não pode deixar aluno sem ônibus).`,
    evidenceType: 'text',
    question: 'Quantos ônibus serão necessários?',
    options: ['3 ônibus', '4 ônibus', '5 ônibus', '6 ônibus'],
    answer: 2,
    hint: 'Passo 1: 800 × 75% = ? interessados. Passo 2: ? × 40% = ? precisam transporte. Passo 3: ÷ 50, arredondar para cima.',
    explanation: 'Interessados: 800 × 0,75 = 600. Precisam transporte: 600 × 0,40 = 240. Ônibus: 240 ÷ 50 = 4,8 → **5 ônibus**. Arredondar para cima = função `Math.ceil()` em programação. Não pode deixar nenhum aluno sem transporte, assim como um servidor não pode deixar nenhuma requisição sem resposta.',
  },
  {
    id: 'alg-08',
    caseNumber: 'CASO #034',
    category: 'algoritmo',
    difficulty: 'Intermediário',
    points: 25,
    title: 'A Senha do Roteador',
    narrative: 'O detetive digital precisa avaliar a segurança de um roteador. A senha tem 8 caracteres, cada um podendo ser letra (A-Z) ou número (0-9). Qual é a probabilidade da senha terminar com um número?',
    evidence: `Caracteres possíveis por posição:
• Números: 0 a 9  →  10 opções
• Letras: A a Z   →  26 opções
• Total por posição: 36 caracteres

Apenas o ÚLTIMO caractere determina a condição.
Probabilidade = casos favoráveis / total`,
    evidenceType: 'text',
    question: 'Qual é a probabilidade de que a senha termine com um número?',
    options: ['8/10', '10/36', '8/36', '1/36'],
    answer: 1,
    hint: 'Para o último caractere: quantas opções terminam em número (0-9)? E quantas opções existem no total para aquela posição?',
    explanation: '10 números possíveis de 36 caracteres totais = **10/36 ≈ 27,8%**. Os outros 7 caracteres não afetam a condição — cada posição é independente. Simplificando: 10/36 = 5/18. Esse tipo de análise é a base das políticas de senha em cibersegurança: quantos caracteres especiais tornam a senha suficientemente difícil de adivinhar?',
  },

  /* ═══════════════ NOVOS — AVANÇADO (Nível 4) ═══════════════ */
  {
    id: 'log-09',
    caseNumber: 'CASO #035',
    category: 'logica',
    difficulty: 'Avançado',
    points: 50,
    title: 'Quatro Suspeitos',
    narrative: 'Um crime foi cometido. Quatro suspeitos foram interrogados e cada um fez uma declaração. Apenas UM deles mente. O detetive precisa usar lógica pura para identificar o culpado.',
    evidence: `João  afirma: "Carlos é o criminoso."
Pedro afirma: "Eu não sou o criminoso."
Carlos afirma: "Paulo é o criminoso."
Paulo afirma: "Carlos está mentindo."

Regra: exatamente UM dos quatro suspeitos mente.`,
    evidenceType: 'text',
    question: 'Quem é o criminoso?',
    options: ['João', 'Pedro', 'Carlos', 'Paulo'],
    answer: 2,
    hint: 'Tente assumir que cada pessoa é culpada e verifique se exatamente UMA declaração se torna falsa nas demais.',
    explanation: 'Se **Carlos é o culpado**: João diz "Carlos" → VERDADE ✓. Pedro diz "não sou eu" → VERDADE ✓. Carlos diz "Paulo" → MENTIRA ✓ (Carlos mente, como esperado do culpado). Paulo diz "Carlos está mentindo" → VERDADE ✓. Apenas Carlos mente — consistente! Testando os outros: Pedro ou João culpados → 2+ mentiras. Paulo culpado → 2 mentiras. Carlos é o criminoso.',
  },
  {
    id: 'alg-05',
    caseNumber: 'CASO #036',
    category: 'algoritmo',
    difficulty: 'Avançado',
    points: 50,
    title: 'Torre de Hanói',
    narrative: 'O professor de algoritmos propôs o clássico desafio da Torre de Hanói. O objetivo é transferir todos os discos do pino A para o pino C usando o pino B como auxiliar, com o menor número de movimentos possível.',
    evidence: `Regras:
1. Mova apenas UM disco por vez.
2. Nunca coloque um disco MAIOR sobre um MENOR.
3. Discos: 1 = pequeno, 2 = médio, 3 = grande.

Estado inicial:  A = [3, 2, 1]  (3 embaixo, 1 em cima)
Estado final:    C = [3, 2, 1]

Mínimo de movimentos para n discos = 2ⁿ − 1`,
    evidenceType: 'text',
    question: 'Qual é a sequência correta com o MENOR número de movimentos?',
    options: [
      '1→C, 2→B, 1→B, 3→C, 2→C, 1→C  (6 movimentos)',
      '1→C, 2→B, 1→B, 3→C, 1→A, 2→C, 1→C  (7 movimentos)',
      '1→B, 2→C, 1→C, 3→B, 1→A, 2→A, 1→C  (7 movimentos)',
      '1→B, 2→B, 3→C, 2→C, 1→C  (5 movimentos)',
    ],
    answer: 1,
    hint: 'Para 3 discos, o mínimo é 2³−1 = 7 movimentos. Pense recursivamente: primeiro mova os discos 1 e 2 para B, depois mova o 3 para C.',
    explanation: 'Solução com 7 movimentos (mínimo): 1→C, 2→B, 1→B, 3→C, 1→A, 2→C, 1→C. Estados: A[3,2,1] → A[3,2],C[1] → A[3],B[2],C[1] → A[3],B[2,1] → B[2,1],C[3] → A[1],B[2],C[3] → A[1],C[3,2] → C[3,2,1] ✓. A opção A tem 6 movimentos (impossível) e um passo inválido. O Hanói é um clássico de recursão: solução para n discos = 2ⁿ−1 passos.',
  },
  {
    id: 'log-10',
    caseNumber: 'CASO #037',
    category: 'logica',
    difficulty: 'Avançado',
    points: 50,
    title: 'Humano ou Máquina?',
    narrative: 'O detetive digital enfrenta um desafio filosófico: um dispositivo atrás de uma porta fechada pode ser um robô inteligente ou um humano. Ele pode fazer apenas UMA pergunta para descobrir qual é qual. Qual pergunta é mais eficaz?',
    evidence: `Candidatos:

A) "Guerras geram tecnologia. Tecnologia é positiva. Guerras são positivas?"

B) "Alguém que se declara mentiroso está dizendo a verdade ou mentindo?"

C) "Qual sua recordação de infância mais triste?"

D) "Há 3 diamantes numa caixa de alumínio e 3 pérolas numa caixa de bronze.
Pedro sabe disso. Na ausência de Pedro, Antônio move os diamantes para a
caixa de bronze. Pedro volta e quer ver os diamantes. Qual caixa ele abrirá?"`,
    evidenceType: 'text',
    question: 'Qual pergunta seria MAIS eficaz para distinguir humano de máquina?',
    options: [
      'A) Questão sobre guerras — raciocínio lógico encadeado',
      'B) Paradoxo do mentiroso — lógica formal clássica',
      'C) Recordação de infância — emoção e memória pessoal',
      'D) A caixa de diamantes — testa "teoria da mente" (crença vs. realidade)',
    ],
    answer: 3,
    hint: 'Qual habilidade humanos dominam naturalmente mas máquinas têm grande dificuldade: entender que outra pessoa pode ter CRENÇAS diferentes da realidade atual?',
    explanation: 'A questão D testa **teoria da mente**: entender que Pedro *acredita* que os diamantes estão na caixa de alumínio (porque estavam lá quando saiu), mesmo que agora estejam na de bronze. Pedro abrirá a caixa de **alumínio** — não por onde os diamantes estão, mas por onde ele *acredita* que estão. Máquinas respondem "bronze" (realidade). Humanos respondem "alumínio" (perspectiva de Pedro). Esse é o princípio do Teste de Sally-Anne, usado para avaliar teoria da mente.',
  },
  {
    id: 'alg-09',
    caseNumber: 'CASO #038',
    category: 'algoritmo',
    difficulty: 'Avançado',
    points: 50,
    title: 'A Raiz do Sistema',
    narrative: 'O sistema de segurança usa uma função matemática para gerar chaves de acesso. Para auditar a integridade do sistema, o detetive precisa encontrar o parâmetro que garante que a função tenha uma raiz em x = −2.',
    evidence: `Função: f(x) = x² + x − m

Uma "raiz" é um valor de x onde f(x) = 0.
Se x = −2 é raiz, então f(−2) = 0.

Substituindo x = −2:
f(−2) = (−2)² + (−2) − m = 0`,
    evidenceType: 'text',
    question: 'Qual é o valor de m para que x = −2 seja raiz da função?',
    options: ['m = −2', 'm = 0', 'm = 1', 'm = 2'],
    answer: 3,
    hint: 'Substitua x = −2 na equação f(x) = 0 e resolva para m. Lembre: (−2)² = 4.',
    explanation: 'f(−2) = (−2)² + (−2) − m = 0 → 4 − 2 − m = 0 → **m = 2**. Verificação: f(x) = x² + x − 2. f(−2) = 4 − 2 − 2 = 0 ✓. Raízes de funções quadráticas aparecem em algoritmos de colisão em jogos (interseção de curvas), em otimização e no cálculo de vértices de parábolas em computação gráfica.',
  },
  {
    id: 'alg-10',
    caseNumber: 'CASO #039',
    category: 'algoritmo',
    difficulty: 'Avançado',
    points: 50,
    title: 'O Cercado Ótimo',
    narrative: 'O laboratório de investigação precisa isolar uma área retangular com exatamente 26 metros de corda. O detetive precisa calcular as dimensões que MAXIMIZAM a área cercada — um problema clássico de otimização.',
    evidence: `Corda disponível: 26 metros (= perímetro total)
Perímetro retângulo: 2(l + w) = 26  →  l + w = 13
Área = l × w

Princípio AM-GM: para l + w fixo,
o produto l × w é máximo quando l = w.`,
    evidenceType: 'text',
    question: 'Qual é a maior área retangular que pode ser cercada com 26 metros de corda?',
    options: ['30,00 m²', '33,25 m²', '42,25 m²', '48,75 m²'],
    answer: 2,
    hint: 'Para maximizar l × w com l + w = 13 fixo, use l = w (quadrado). Se l = w = 6,5, a área é?',
    explanation: 'l + w = 13. Máximo quando l = w = 6,5 m. Área = 6,5 × 6,5 = **42,25 m²**. A desigualdade AM-GM garante que (l+w)/2 ≥ √(l×w), com igualdade quando l = w. Esse princípio de otimização aparece em algoritmos de cache (tamanho ótimo), compressão de dados e alocação de memória — sempre que se maximiza algo com restrições.',
  },

  /* ════════ IMD/UFRN 2018 — NOVOS CASOS ════════ */

  /* ── SEQUÊNCIAS ── */
  {
    id: 'seq-11',
    caseNumber: 'CASO #041',
    category: 'sequencia',
    difficulty: 'Iniciante',
    points: 10,
    title: 'O Código das Letras',
    narrative: 'Num laboratório secreto, os cientistas deixaram um padrão encriptado na lousa. A primeira sequência é (M, L, J, G). A segunda começa com (G, F, D, ...) mas o último caractere foi apagado. Você consegue decifrar?',
    evidence: 'Sequência 1: M → L → J → G\nSequência 2: G → F → D → ?',
    evidenceType: 'sequence',
    question: 'Qual deve ser a quarta letra da Sequência 2?',
    options: ['E', 'D', 'C', 'B', 'A'],
    answer: 4,
    hint: 'Observe o padrão de saltos entre as letras na Sequência 1 usando a posição no alfabeto. M=13, L=12, J=10, G=7. Quais são os saltos?',
    explanation: 'Na Sequência 1: M(13)→L(12): salto 1; L(12)→J(10): salto 2; J(10)→G(7): salto 3. Os saltos crescem: 1, 2, 3. Na Sequência 2: G(7)→F(6): salto 1; F(6)→D(4): salto 2; próximo: salto 3 → D(4)-3 = A(1). A resposta é a letra A.',
  },
  {
    id: 'seq-12',
    caseNumber: 'CASO #042',
    category: 'sequencia',
    difficulty: 'Iniciante',
    points: 10,
    title: 'A Equação da População',
    narrative: 'Um estatístico precisa transformar uma relação verbal em matemática. Em certos países da África, há 5 habitantes negros para cada habitante branco. Usando N para negros e B para brancos, qual expressão representa isso corretamente?',
    evidence: 'Relação: 5 negros para cada 1 branco\nN = negros  |  B = brancos',
    evidenceType: 'text',
    question: 'Qual expressão matemática representa a relação 5:1 entre negros e brancos?',
    options: ['1N = 5B  (equivale a N = 5B)', '5N = 1B  (equivale a N = B/5)', 'B = N + 5', 'N = B + 5', 'Nenhuma das alternativas'],
    answer: 0,
    hint: 'Se há 5 negros para 1 branco, a razão N/B = 5/1. Qual equação expressa N = 5×B?',
    explanation: '"5 negros para 1 branco" significa N/B = 5, ou seja, N = 5B. A opção "1N = 5B" simplifica para N = 5B ✓. Já "5N = 1B" significaria N = B/5 (invertido). As opções C e D usam adição, não proporção.',
  },

  /* ── ALGORITMO ── */
  {
    id: 'alg-11',
    caseNumber: 'CASO #043',
    category: 'algoritmo',
    difficulty: 'Iniciante',
    points: 10,
    title: 'O Calendário das Chuvas',
    narrative: 'O meteorologista de Quixajuba precisa analisar janeiro de 2010. Os registros indicam: choveu em 10 manhãs e 17 tardes. Houve 12 dias completamente sem chuva. Janeiro tem 31 dias. Em quantos dias choveu APENAS de manhã?',
    evidence: 'Janeiro = 31 dias\nManhãs com chuva = 10\nTardes com chuva = 17\nDias sem nenhuma chuva = 12',
    evidenceType: 'text',
    question: 'Em quantos dias choveu apenas pela manhã em Quixajuba naquele janeiro?',
    options: ['1 dia', '2 dias', '3 dias', '4 dias', '5 dias'],
    answer: 1,
    hint: 'Dias com chuva = 31-12 = 19. Use inclusão-exclusão: M + T - (ambos) = 19. Descubra quantos dias choveu nos dois períodos.',
    explanation: 'Dias com chuva: 31-12=19. Pela fórmula de inclusão-exclusão: M+T-Ambos=19 → 10+17-Ambos=19 → Ambos=8. Dias com chuva SOMENTE de manhã = M-Ambos = 10-8 = 2 dias. Verificação: 2 (só manhã) + 9 (só tarde) + 8 (ambos) + 12 (sem chuva) = 31 ✓.',
  },
  {
    id: 'alg-12',
    caseNumber: 'CASO #044',
    category: 'algoritmo',
    difficulty: 'Iniciante',
    points: 10,
    title: 'A Média de Marli',
    narrative: 'Marli monitora suas notas com cuidado. O professor aplica provas de 100 pontos. Ela obteve média de 60 nas primeiras 4 provas. Na 5ª prova tirou 80 pontos. O detetive precisa calcular a nova média de Marli.',
    evidence: '4 primeiras provas: média = 60 pts\n5ª prova = 80 pts',
    evidenceType: 'text',
    question: 'Qual é a média de Marli após as cinco provas?',
    options: ['64 pontos', '76 pontos', '70 pontos', '60 pontos', '75 pontos'],
    answer: 0,
    hint: 'Calcule a soma total das 4 primeiras provas. Depois adicione 80 e divida por 5.',
    explanation: 'Soma das 4 primeiras = 60×4 = 240. Somando a 5ª: 240+80 = 320. Nova média = 320÷5 = 64 pontos.',
  },
  {
    id: 'alg-13',
    caseNumber: 'CASO #045',
    category: 'algoritmo',
    difficulty: 'Iniciante',
    points: 10,
    title: 'O Campeonato da Série B',
    narrative: 'O analista do CBF precisa calcular o total de jogos por time na Série B. São 20 times e cada time joga DUAS vezes contra cada adversário — uma em casa e outra fora. Quantas partidas cada time disputa?',
    evidence: '20 times na competição\nCada time joga 2x contra cada adversário (ida e volta)',
    evidenceType: 'text',
    question: 'Quantas partidas cada time disputa no total?',
    options: ['36 partidas', '37 partidas', '38 partidas', '39 partidas', '40 partidas'],
    answer: 2,
    hint: 'Cada time enfrenta X adversários. Quantos? Multiplique por 2 (ida+volta).',
    explanation: 'Cada time enfrenta 19 adversários (todos exceto ele mesmo). Como joga 2 vezes contra cada um: 19×2 = 38 partidas.',
  },
  {
    id: 'alg-14',
    caseNumber: 'CASO #046',
    category: 'algoritmo',
    difficulty: 'Intermediário',
    points: 25,
    title: 'Os Pregos e Parafusos',
    narrative: 'Na loja de ferragens do Sr. Melo, os produtos são vendidos por peso. Um prego + 3 parafusos + 2 ganchos = 24g. Dois pregos + 5 parafusos + 4 ganchos = 44g. Juquinha comprou 12 pregos, 32 parafusos e 24 ganchos. Qual é o peso total?',
    evidence: 'Equação 1: 1P + 3F + 2G = 24 g\nEquação 2: 2P + 5F + 4G = 44 g\nCompra: 12P + 32F + 24G = ?',
    evidenceType: 'text',
    question: 'Quanto pesou a compra de Juquinha?',
    options: ['200 g', '208 g', '256 g', '272 g', '280 g'],
    answer: 3,
    hint: 'Calcule Eq2 - Eq1 para obter uma 3ª equação. Depois tente expressar 12P+32F+24G como combinação linear das equações disponíveis.',
    explanation: 'Eq2 - Eq1: P+2F+2G = 20g (equação auxiliar). Agora: 12P+32F+24G = 8×(P+3F+2G) + 4×(P+2F+2G) = 8×24 + 4×20 = 192+80 = 272g.',
  },
  {
    id: 'alg-15',
    caseNumber: 'CASO #047',
    category: 'algoritmo',
    difficulty: 'Intermediário',
    points: 25,
    title: 'O Preço do Combustível',
    narrative: 'João tem carro flex e abasteceu duas vezes no mesmo posto a preços iguais. 1ª vez: 20L álcool + 20L gasolina = R$120. 2ª vez: 10L álcool + 30L gasolina = R$130. Qual é o preço da gasolina por litro?',
    evidence: 'Compra 1: 20A + 20G = R$120,00\nCompra 2: 10A + 30G = R$130,00\n(A = preço do álcool, G = preço da gasolina)',
    evidenceType: 'text',
    question: 'Qual é o preço por litro da gasolina?',
    options: ['R$ 3,40', 'R$ 3,45', 'R$ 3,50', 'R$ 3,55', 'R$ 3,60'],
    answer: 2,
    hint: 'Divida Eq1 por 20 para simplificar: A+G=6. Divida Eq2 por 10: A+3G=13. Subtraia a primeira da segunda.',
    explanation: 'Eq1÷20: A+G=6. Eq2÷10: A+3G=13. Subtraindo: 2G=7 → G=R$3,50. Verificação: A=6-3,50=R$2,50. Compra1: 20×2,50+20×3,50=50+70=R$120✓. Compra2: 10×2,50+30×3,50=25+105=R$130✓.',
  },
  {
    id: 'alg-16',
    caseNumber: 'CASO #048',
    category: 'algoritmo',
    difficulty: 'Avançado',
    points: 50,
    title: 'O Enigma das Idades',
    narrative: 'Um ancião deixou um enigma antes de partir: "Eu tenho o dobro da idade que TU tinhas quando EU tinha a idade que TU tens. Quando TU tiveres a idade que EU tenho, a soma das nossas idades será 54." Descubra as idades atuais.',
    evidence: 'Seja E = minha idade e T = sua idade (E > T)\nDiferença constante: D = E - T\n"Quando EU tinha T" foi há D anos → TU tinhas T-D\nEquação 1: E = 2×(T-D)\nEquação 2: soma daqui D anos = 54',
    evidenceType: 'text',
    question: 'Quais são as idades ATUAIS de EU e TU?',
    options: ['36 e 18 anos', '27 e 27 anos', '24 e 18 anos', '30 e 24 anos', '24 e 8 anos'],
    answer: 2,
    hint: 'Substitua D = E-T na Eq1: E = 2(T-(E-T)) = 2(2T-E) → 3E = 4T. Na Eq2: daqui D anos, soma = (E+D)+(T+D) = E+T+2D = 3E-T = 54.',
    explanation: 'D=E-T. Eq1: E=2(2T-E) → 3E=4T → T=3E/4. Eq2: 3E-T=54 → 3E-3E/4=54 → 9E/4=54 → E=24. T=3×24/4=18. Verificação: D=6. "Quando EU tinha 18" (há 6 anos), TU tinhas 12; E=2×12=24✓. Daqui 6 anos: EU=30, TU=24, soma=54✓.',
  },
  {
    id: 'alg-17',
    caseNumber: 'CASO #049',
    category: 'algoritmo',
    difficulty: 'Avançado',
    points: 50,
    title: 'As Três Lojas',
    narrative: 'Um homem gastou TODO o seu dinheiro em três lojas. Em cada uma, gastou R$1,00 a mais do que a metade do que tinha ao entrar. Ao sair da terceira loja estava completamente sem dinheiro. Quanto ele tinha ao entrar na primeira loja?',
    evidence: 'Loja 1: entra com X, gasta X/2+1, sai com X-(X/2+1)\nLoja 2: entra com Y, gasta Y/2+1, sai com Y-(Y/2+1)\nLoja 3: entra com Z, gasta Z/2+1, sai com 0',
    evidenceType: 'text',
    question: 'Quanto o homem tinha ao entrar na primeira loja?',
    options: ['R$ 6', 'R$ 14', 'R$ 16', 'R$ 20', 'R$ 21'],
    answer: 1,
    hint: 'Trabalhe de trás para frente (backward induction). Na loja 3 saiu com 0. Z-(Z/2+1)=0 → Z/2=1 → Z=2. Agora encontre Y (o que tinha na loja 2) e depois X.',
    explanation: 'Loja 3: Z-(Z/2+1)=0 → Z=2. Loja 2: sai com Z=2 → Y-(Y/2+1)=2 → Y/2=3 → Y=6. Loja 1: sai com Y=6 → X-(X/2+1)=6 → X/2=7 → X=14. Verificação: Loja1: 14→gasta 8→resta 6. Loja2: 6→gasta 4→resta 2. Loja3: 2→gasta 2→resta 0✓.',
  },
  {
    id: 'alg-18',
    caseNumber: 'CASO #050',
    category: 'algoritmo',
    difficulty: 'Intermediário',
    points: 25,
    title: 'O Ângulo do Relógio',
    narrative: 'O agente está analisando um relógio antigo para encontrar uma pista. Ele precisa calcular o menor ângulo entre os dois ponteiros quando o relógio marca exatamente 2 horas. O mostrador tem 360° divididos em 12 posições.',
    evidence: 'Mostrador = 360° para 12 horas\nCada hora = 30°\nÀs 2h: ponteiro dos minutos no 12, das horas no 2',
    evidenceType: 'text',
    question: 'Qual é o menor ângulo entre os ponteiros às 2 horas exatas?',
    options: ['30°', '45°', '60°', '75°', '90°'],
    answer: 2,
    hint: 'O ponteiro dos minutos está no 12 (posição 0°). O das horas está no 2. Cada número representa 30°.',
    explanation: 'Às 2h exatas: ponteiro dos minutos aponta para o 12 (0°); ponteiro das horas aponta para o 2. Posição das horas = 2×30° = 60°. Menor ângulo entre eles = 60°.',
  },
  {
    id: 'alg-19',
    caseNumber: 'CASO #051',
    category: 'algoritmo',
    difficulty: 'Intermediário',
    points: 25,
    title: 'O Disco Certo',
    narrative: 'A TI precisa armazenar um arquivo de 4.938.427.200 Bytes e quer usar o disco com MENOR espaço que ainda comporte o arquivo. Há cinco discos disponíveis. Qual é o disco ideal?',
    evidence: 'Arquivo: 4.938.427.200 Bytes\n1 Kb = 1.024 Bytes\n1 Mb = 1.024 Kb\n1 Gb = 1.024 Mb = 1.073.741.824 Bytes\n\nDiscos: 470 Mb | 3 Gb | 150 Kb | 5 Gb | 8,2 Gb',
    evidenceType: 'text',
    question: 'Qual disco tem o MENOR espaço que ainda cabe o arquivo?',
    options: ['Disco 1 — 470 Mb', 'Disco 2 — 3 Gb', 'Disco 3 — 150 Kb', 'Disco 4 — 5 Gb', 'Disco 5 — 8,2 Gb'],
    answer: 3,
    hint: 'Converta o arquivo para Gb: 4.938.427.200 ÷ 1.073.741.824 ≈ 4,6 Gb. Agora veja qual disco tem pelo menos 4,6 Gb.',
    explanation: 'Arquivo ≈ 4,6 Gb. Disco1 (470 Mb ≈ 0,46 Gb): NÃO cabe. Disco2 (3 Gb): NÃO cabe. Disco3 (150 Kb): NÃO cabe. Disco4 (5 Gb): CABE! Disco5 (8,2 Gb): cabe, mas é maior que o Disco4. O menor disco adequado é o Disco4 com 5 Gb.',
  },

  /* ── LÓGICA ── */
  {
    id: 'log-11',
    caseNumber: 'CASO #052',
    category: 'logica',
    difficulty: 'Intermediário',
    points: 25,
    title: 'A Balança do Laboratório',
    narrative: 'No laboratório de física, uma balança está em perfeito equilíbrio. Prato esquerdo: 5 saquinhos + 4 bolas. Prato direito: 2 saquinhos + 10 bolas. Todas as bolas têm o mesmo peso, todos os saquinhos também, mas bola ≠ saquinho.',
    evidence: 'Prato esquerdo: 5 saquinhos + 4 bolas\nPrato direito: 2 saquinhos + 10 bolas\nBalança em EQUILÍBRIO PERFEITO',
    evidenceType: 'text',
    question: 'O peso de 1 saquinho de areia equivale ao peso de quantas bolas?',
    options: ['Impossível determinar sem dados numéricos', 'É necessário igual número em cada prato para equilíbrio', '1 saquinho = 2 bolas', '1 saquinho = 3 bolas', '1 saquinho = 5 bolas'],
    answer: 2,
    hint: 'Monte a equação de equilíbrio: 5S + 4B = 2S + 10B. Isole S em função de B.',
    explanation: 'Equação: 5S + 4B = 2S + 10B → 5S-2S = 10B-4B → 3S = 6B → S = 2B. Um saquinho pesa o mesmo que 2 bolas. Não é necessário saber o peso absoluto, apenas a relação entre eles!',
  },
  {
    id: 'log-12',
    caseNumber: 'CASO #053',
    category: 'logica',
    difficulty: 'Intermediário',
    points: 25,
    title: 'O Detector de Robôs',
    narrative: 'A empresa de segurança usa CAPTCHAs para detectar robôs. São três técnicas: T1-completar provérbios, T2-digitar caracteres distorcidos, T3-identificar imagens por conceito ("clique nos fantasmas"). Qual afirmação sobre elas é FALSA?',
    evidence: 'T1: completar expressões comuns (ex: "Em terra de cego...")\nT2: transcrever texto em imagem propositalmente distorcida\nT3: clicar em todas as imagens que contêm determinado objeto/conceito',
    evidenceType: 'text',
    question: 'Qual afirmação sobre as técnicas de CAPTCHA é FALSA?',
    options: ['Para burlar T1, o robô precisaria de banco de dados com provérbios e capacidade de inferência', 'A técnica T2 causa problemas porque os caracteres são difíceis de ler até para humanos', 'Na T3, mesmo que o robô entendesse "fantasma", precisaria associar o conceito a diversas imagens', 'As técnicas T1 e T3 baseiam-se em senso comum humano e podem ser facilmente realizadas por robôs', 'É possível que um humano falhe no CAPTCHA e seja confundido com robô'],
    answer: 3,
    hint: 'Pense: é fácil ou difícil para um robô interpretar provérbios e reconhecer conceitos visuais variados?',
    explanation: 'A afirmação D é FALSA: T1 e T3 NÃO são facilmente realizadas por robôs. Interpretar provérbios exige compreensão de linguagem natural; reconhecer "fantasma" em imagens variadas exige visão computacional por conceito — ambos ainda são desafios difíceis para IA. As demais afirmações são verdadeiras.',
  },
  {
    id: 'log-13',
    caseNumber: 'CASO #054',
    category: 'logica',
    difficulty: 'Intermediário',
    points: 25,
    title: 'A Teoria Abandonada',
    narrative: 'Houve um tempo em que cientistas acreditavam que traços faciais e formato do crânio poderiam prever se alguém seria criminoso. A teoria foi abandonada. A detetive precisa identificar por que isso foi cientificamente correto.',
    evidence: 'Observação histórica: pessoas com certas características faciais às vezes cometiam crimes.\nOutros fatores presentes: pobreza, discriminação social, histórico familiar difícil.\nCorrelação ≠ Causalidade',
    evidenceType: 'text',
    question: 'Qual é a análise mais adequada para o abandono dessa teoria?',
    options: ['Pessoas com tais características que cometiam crimes podiam ter isso explicado por fatores sociais — não há como isolar o fator causal', 'Os estudiosos da época não eram cientistas de verdade — só modernamente existem cientistas confiáveis', 'A teoria é parcialmente verdadeira: pessoas "mal-encaradas" tendem ao crime, como qualquer um percebe', 'A maioria dos criminosos tem aparência de criminoso — o abandono não teve base científica', 'As alternativas C e D representam análise adequada'],
    answer: 0,
    hint: 'O problema central em ciência: quando múltiplos fatores existem simultaneamente, como provar qual deles foi o causador do efeito observado?',
    explanation: 'A alternativa A é a correta. O problema é a confusão entre correlação e causalidade. Mesmo que certas características estivessem presentes em criminosos, fatores sociais (pobreza, exclusão) também estavam. Sem isolar variáveis — controlar um fator enquanto mantém os outros iguais — é impossível afirmar que foram os traços físicos, e não os fatores sociais, os responsáveis.',
  },
  {
    id: 'log-14',
    caseNumber: 'CASO #055',
    category: 'logica',
    difficulty: 'Avançado',
    points: 50,
    title: 'As Afirmações Paradoxais',
    narrative: 'Um filósofo deixou quatro afirmações em uma lousa, cada uma referindo-se ao número de afirmações FALSAS entre as quatro. O detetive precisa descobrir qual é a ÚNICA afirmação necessariamente verdadeira. Cuidado: há armadilhas lógicas!',
    evidence: 'A: "O número de afirmações falsas aqui é UMA."\nB: "O número de afirmações falsas aqui são DUAS."\nC: "O número de afirmações falsas aqui são TRÊS."\nD: "O número de afirmações falsas aqui são QUATRO."',
    evidenceType: 'text',
    question: 'Qual é a única afirmação necessariamente verdadeira?',
    options: ['Afirmação A — há 1 falsa', 'Afirmação B — há 2 falsas', 'Afirmação C — há 3 falsas', 'Afirmação D — há 4 falsas', 'Não é possível responder'],
    answer: 2,
    hint: 'Teste cada hipótese. Se C é verdadeira (3 falsas), quais seriam as 3 falsas? Isso cria contradição? Tente também A: se A é verdadeira (1 falsa), quantas seriam falsas de fato?',
    explanation: 'Testando C: se C é verdadeira, então A, B e D são falsas = 3 falsas ✓ (consistente!). Testando A: se A é verdadeira (1 falsa), então B, C, D são falsas = 3 falsas ≠ 1. Contradição. Testando B: se B é verdadeira (2 falsas), A, C, D são falsas = 3 ≠ 2. Contradição. Testando D: se D é verdadeira (4 falsas), D própria seria falsa — paradoxo. Apenas C é logicamente consistente.',
  },
  {
    id: 'log-15',
    caseNumber: 'CASO #056',
    category: 'logica',
    difficulty: 'Avançado',
    points: 50,
    title: 'O Silogismo das Guerras',
    narrative: 'O ministério analisa um argumento filosófico: "O progresso tecnológico é desejável. As guerras trazem progresso tecnológico. Logo: as guerras são desejáveis." Considerando as premissas como VERDADEIRAS, a conclusão é logicamente válida?',
    evidence: 'Premissa 1: O progresso tecnológico é desejável e benéfico para a sociedade.\nPremissa 2: As guerras trazem progresso tecnológico.\nConclusão: As guerras são desejáveis e benéficas para a sociedade.',
    evidenceType: 'text',
    question: 'Assumindo as premissas como verdadeiras, o que se pode afirmar sobre a conclusão?',
    options: ['A conclusão é logicamente correta e verdadeira dado as premissas', 'A conclusão é logicamente correta, mas moralmente inadmissível — o que a invalida', 'A conclusão é incorreta: guerras não trazem SOMENTE progresso, logo não se pode concluir assim', 'A conclusão é incorreta porque o progresso tecnológico é nefasto — não se pode restringir ao que está escrito', 'As alternativas C e D representam análise adequada'],
    answer: 0,
    hint: 'Em lógica formal, a validade depende APENAS da forma do argumento, não de considerações morais ou de fatores externos não mencionados nas premissas.',
    explanation: 'A conclusão é logicamente VÁLIDA (opção A). Forma: "X é desejável; Y traz X; logo Y é desejável" — esse silogismo é formalmente correto. Moralmente pode ser repugnante (opção B), mas lógica formal e ética são campos separados: a validade lógica não garante verdade moral. A opção C erra ao introduzir elementos externos às premissas dadas.',
  },

  /* ── BUG ── */
  {
    id: 'bug-10',
    caseNumber: 'CASO #057',
    category: 'bug',
    difficulty: 'Iniciante',
    points: 10,
    title: 'O Robô Lavador de Pratos',
    narrative: 'A fábrica programou um robô para lavar pratos. O algoritmo funciona para um único prato, mas precisa de UMA instrução inicial para lavar uma pilha inteira, parando somente quando não houver mais pratos. Qual instrução o programador deve adicionar?',
    evidence: `Passo 1: Pegue o prato
Passo 2: Coloque detergente
Passo 3: Passe a bucha
Passo 4: Enxague o prato
Passo 5: Coloque no escorredor`,
    evidenceType: 'code',
    language: 'algoritmo',
    question: 'Qual instrução inicial faz o robô lavar toda a pilha automaticamente?',
    options: [
      'Enquanto houver prato na pilha, repita o conjunto de instruções abaixo',
      'Se houver prato na pilha, siga as instruções abaixo',
      'Só siga as instruções abaixo se houver prato na pilha',
      'Se houver prato na pilha, siga as instruções. Se não houver, não faça nada.',
    ],
    answer: 0,
    hint: 'A instrução precisa criar um LOOP que continue executando enquanto a condição for verdadeira. Qual palavra-chave em programação representa isso?',
    explanation: '"Enquanto" (while em programação) cria um loop que se repete enquanto a condição for verdadeira — lavará TODOS os pratos, um por vez. As opções B, C e D usam "Se" (if), que verifica a condição apenas UMA vez e executa as instruções uma única vez, parando após o primeiro prato.',
  },
  {
    id: 'bug-11',
    caseNumber: 'CASO #058',
    category: 'bug',
    difficulty: 'Iniciante',
    points: 10,
    title: 'Entrada ou Saída?',
    narrative: 'Na aula de informática, o professor pediu para listar APENAS dispositivos de ENTRADA. Alguns alunos misturaram os conceitos. Dispositivos de entrada RECEBEM dados do usuário. Dispositivos de saída ENVIAM dados ao usuário. Qual lista está correta?',
    evidence: 'Dispositivos de ENTRADA: recebem dados do usuário → computador\nDispositivos de SAÍDA: enviam dados do computador → usuário\n\nExemplos: monitor (saída), caixa de som (saída), teclado (entrada), mouse (entrada), câmera (entrada)',
    evidenceType: 'text',
    question: 'Qual alternativa lista SOMENTE dispositivos de ENTRADA?',
    options: ['Monitor, teclado e câmera', 'Mouse, teclado, monitor e caixa de som', 'Teclado, mouse e monitor', 'Caixa de som, monitor e mouse', 'Mouse, teclado e câmera'],
    answer: 4,
    hint: 'Monitor e caixa de som são de SAÍDA. Câmera, microfone, scanner, teclado e mouse são de ENTRADA. Qual lista não contém nenhum dispositivo de saída?',
    explanation: 'A alternativa E (mouse, teclado, câmera) lista apenas dispositivos de ENTRADA: mouse e teclado enviam comandos do usuário; câmera captura imagens para o computador. As outras alternativas incluem monitor ou caixa de som, que são de SAÍDA.',
  },
  {
    id: 'bug-12',
    caseNumber: 'CASO #059',
    category: 'bug',
    difficulty: 'Iniciante',
    points: 10,
    title: 'Virtual ou Aumentada?',
    narrative: 'Dois desenvolvedores discutem as diferenças entre Realidade Virtual (RV) e Realidade Aumentada (RA). RV: experiência 100% imersiva em ambiente virtual usando óculos especiais. RA: informações virtuais sobrepostas ao mundo real via câmera. Qual afirmação está CORRETA?',
    evidence: 'RV = ambiente 100% virtual, óculos especiais, imersão total\nRA = mundo real + overlay virtual, câmera do celular\n\nExemplos: óculos Oculus (RV), Pokémon GO (RA), visita virtual a museus (RV)',
    evidenceType: 'text',
    question: 'Qual afirmação sobre RV e RA está CORRETA?',
    options: [
      'A realidade virtual só existe em filmes e não está disponível para consumidores comuns',
      'Com a realidade virtual é possível interagir presencialmente com pessoas de verdade',
      'Ambas as tecnologias são novas formas de interação humano-computador',
      'O jogo Pokémon GO é um exemplo de Realidade Virtual',
      'A realidade aumentada não pode ser usada em dispositivos móveis',
    ],
    answer: 2,
    hint: 'Pense na essência de ambas: as duas envolvem computadores e humanos interagindo de formas inovadoras. Qual afirmação captura isso sem erro?',
    explanation: 'C é a correta. Tanto RV quanto RA são novas formas de interação humano-computador. A (errada): headsets de RV existem para consumidores (Oculus, PlayStation VR). B (errada): na RV, o ambiente é completamente virtual. D (errada): Pokémon GO sobrepõe criaturas no mundo real = Realidade AUMENTADA. E (errada): RA funciona no celular por definição.',
  },
  {
    id: 'bug-13',
    caseNumber: 'CASO #060',
    category: 'bug',
    difficulty: 'Intermediário',
    points: 25,
    title: 'O Investigador Digital',
    narrative: 'A detetive Ana investiga afirmações sobre ferramentas de comunicação digital: e-mail, WhatsApp e Facebook. Ela precisa classificar cada uma como Verdadeira ou Falsa para resolver o caso. Qual conjunto está correto?',
    evidence: `I. Para e-mail, remetente e destinatário precisam ter contas em servidor de e-mail.
II. Para WhatsApp, remetente e destinatário precisam ter o app instalado.
III. No Facebook é possível trocar mensagens privadas; o cadastro requer um e-mail.
IV. Nas três formas é possível criar grupos com múltiplos destinatários.
V. Não é possível usar e-mail em celular, pois funciona apenas em computadores.`,
    evidenceType: 'code',
    language: 'análise',
    question: 'Qual sequência de V (verdadeiro) e F (falso) representa corretamente as 5 afirmações?',
    options: ['V F V F V', 'V V V V F', 'F V F V F', 'F F F F V', 'V V F V F'],
    answer: 1,
    hint: 'A afirmação V é claramente falsa (você usa Gmail no celular todo dia). A afirmação I é claramente verdadeira. Com isso elimina 3 opções. Agora verifique II e III.',
    explanation: 'I(V): e-mail exige contas em servidor. II(V): WhatsApp requer app instalado. III(V): Facebook usa e-mail no cadastro e tem Messenger. IV(V): todos suportam grupos. V(F): e-mail funciona perfeitamente em celulares (Gmail, Outlook Mobile etc.). Resultado: V V V V F = opção B.',
  },
];
