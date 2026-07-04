/* ═══════════════════════════════════════════════════════════════
   SISTEMAS.PY — catálogo de sistemas simulados

   Cada sistema pede uma classe Python com um contrato fixo: métodos
   de ação (que a interface vira botão) e um método estado() que
   devolve um dicionário — é esse dicionário que a visualização lê
   pra desenhar o sistema. Isso mantém a engine agnóstica ao "miolo"
   da classe do aluno: ela só chama método e lê estado().
═══════════════════════════════════════════════════════════════ */
import type { SystemDef } from './types';

export const SYSTEMS: SystemDef[] = [
  {
    id: 'estacionamento',
    title: 'Estacionamento',
    subtitle: '5 vagas — controle de entrada e saída',
    prompt:
      'Implemente a classe Estacionamento com 5 vagas. entrar(placa) ocupa a primeira vaga livre ' +
      '(se não houver vaga, não faz nada). sair(placa) libera a vaga que tinha essa placa. ' +
      'estado() já está pronto — só devolve a lista de vagas pra visualização.',
    className: 'Estacionamento',
    visual: 'estacionamento',
    methods: [
      { id: 'entrar', label: 'Carro entra', params: [{ name: 'placa', label: 'Placa', type: 'texto', placeholder: 'ABC1234' }] },
      { id: 'sair', label: 'Carro sai', params: [{ name: 'placa', label: 'Placa', type: 'texto', placeholder: 'ABC1234' }] },
    ],
    starterCode:
`class Estacionamento:
    def __init__(self):
        # 5 vagas, todas livres (None = vaga livre)
        self.vagas = [None, None, None, None, None]

    def entrar(self, placa):
        # TODO: ocupe a primeira vaga livre com a placa.
        # Se não tiver vaga livre, não faça nada.
        pass

    def sair(self, placa):
        # TODO: encontre a vaga que tem essa placa e libere (None).
        pass

    def estado(self):
        return {"vagas": self.vagas}
`,
  },
  {
    id: 'fila',
    title: 'Fila de Atendimento',
    subtitle: 'entra no fim, sai do começo',
    prompt:
      'Implemente a classe FilaDeAtendimento. entrar(nome) coloca a pessoa no final da fila. ' +
      'atender() remove e retorna quem está na frente da fila (ou None se estiver vazia). ' +
      'estado() já está pronto.',
    className: 'FilaDeAtendimento',
    visual: 'fila',
    methods: [
      { id: 'entrar', label: 'Entrar na fila', params: [{ name: 'nome', label: 'Nome', type: 'texto', placeholder: 'Maria' }] },
      { id: 'atender', label: 'Atender próximo', params: [] },
    ],
    starterCode:
`class FilaDeAtendimento:
    def __init__(self):
        self.fila = []

    def entrar(self, nome):
        # TODO: adicione o nome no final da lista self.fila.
        pass

    def atender(self):
        # TODO: remova e retorne o primeiro nome da fila.
        # Se a fila estiver vazia, retorne None.
        pass

    def estado(self):
        return {"fila": self.fila}
`,
  },
  {
    id: 'carrinho',
    title: 'Carrinho de Compras',
    subtitle: 'itens, preços e total',
    prompt:
      'Implemente a classe Carrinho. adicionar(nome, preco) acrescenta um item na lista. ' +
      'remover(nome) remove a PRIMEIRA ocorrência de um item com esse nome. ' +
      'estado() já está pronto — devolve os itens e o total (soma dos preços).',
    className: 'Carrinho',
    visual: 'carrinho',
    methods: [
      {
        id: 'adicionar', label: 'Adicionar item',
        params: [
          { name: 'nome', label: 'Item', type: 'texto', placeholder: 'Caderno' },
          { name: 'preco', label: 'Preço (R$)', type: 'numero', placeholder: '9.90' },
        ],
      },
      { id: 'remover', label: 'Remover item', params: [{ name: 'nome', label: 'Item', type: 'texto', placeholder: 'Caderno' }] },
    ],
    starterCode:
`class Carrinho:
    def __init__(self):
        self.itens = []

    def adicionar(self, nome, preco):
        # TODO: acrescente {"nome": nome, "preco": preco} em self.itens.
        pass

    def remover(self, nome):
        # TODO: remova a primeira ocorrência de um item com esse nome.
        pass

    def estado(self):
        total = sum(item["preco"] for item in self.itens)
        return {"itens": self.itens, "total": total}
`,
  },
];

export function findSystem(id: string): SystemDef {
  return SYSTEMS.find(s => s.id === id) ?? SYSTEMS[0];
}
