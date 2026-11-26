# Relatório: Atividade Final de AED II (Rede Social Simplificada)

**Dupla:** Derek R C Bezerra e Julia Alsina

**Linguagem:** JavaScript (Node.js), sem bibliotecas externas. Todo o código está na pasta `js/`.

**Como rodar** (na raiz do repositório):

```bash
node js/main.js                                    # carrega os dados e lista os comandos
node js/main.js buscar @henrique_nascimento
node js/main.js sugerir @henrique_nascimento 5
node js/main.js comunidades
node js/main.js posts-entre 2025-03-01 2025-03-31
node js/main.js top-seguidos 10
node js/main.js top-curtidos 10
node js/main.js ranking
node js/main.js ranking @henrique_nascimento       # top 20 + posição do usuário
```

**No PowerShell**, o `@` é um operador do próprio PowerShell e o `@usuario` some antes de chegar ao programa.
Use aspas (`node js/main.js buscar "@henrique_nascimento"`) ou escreva sem o `@` (`node js/main.js buscar henrique_nascimento`).
No Git Bash, no Prompt de Comando (cmd) e em terminais Linux/Mac o `@` funciona sem aspas.

---

## 1. O que foi feito

| Item | Comando | Estrutura usada | Situação |
|---|---|---|---|
| 3.1 | `buscar @usuario` | Tabela hash própria | Completo |
| 3.2 | `sugerir @usuario k` | Grafo (lista de adjacência) + heap | Completo |
| 3.3 | `comunidades` | Grafo + BFS | Completo |
| 3.4 | `posts-entre data1 data2` | Árvore AVL | Completo |
| 3.5 | `top-seguidos k` e `top-curtidos k` | Heap | Completo |
| 3.6 | `ranking [@usuario]` | Merge Sort | Completo |
| 3.7 | Bônus (API com `ajuda` e `--json`) | | Não feito |

Os comandos são passados como argumentos na linha de comando. Em caso de erro (usuário inexistente, `k` inválido,
data inválida, comando desconhecido), o programa mostra uma mensagem e termina com código de saída 1.
Não usamos `Map`, `Set`, `WeakMap`, objeto `{}` como dicionário, `Array.prototype.sort()` nem `shift()`.
Os objetos literais que aparecem no código são só registros com campos fixos (por exemplo, o perfil de um usuário), nunca dicionários.

---

## 2. Como foi feito

```
js/
├── main.js                 lê os argumentos, chama a rede e imprime o resultado de cada comando
├── aedlib.js               biblioteca do professor que carrega os CSV (não alterada)
├── SocialNetwork.js        monta as estruturas a partir dos dados; cada comando é um método
└── structures/
    ├── HashTable.js        tabela hash com encadeamento separado
    ├── Graph.js            grafo dirigido com listas de adjacência e BFS (componentes conexos)
    ├── Heap.js             heap binária genérica (mínimo ou máximo)
    ├── AVLTree.js          árvore AVL com rotações e busca por intervalo
    └── MergeSort.js        Merge Sort com critério de comparação
```

- **Separação:** cada estrutura fica num arquivo e não sabe nada de "usuário" ou "post". A `SocialNetwork` usa as estruturas
  para responder aos comandos, e o `main.js` só cuida da entrada e da saída no terminal.
- **Montagem:** o construtor da `SocialNetwork` roda uma vez, ao iniciar. Ele coloca cada `@usuario` na tabela hash,
  cada conexão no grafo e cada post na árvore AVL, e já soma, por usuário, a quantidade de posts e o total de curtidas.
- **Dados por usuário em arrays:** os ids vão de 1 a 2000 sem buracos (conferimos nos CSV). Por isso, informações por usuário
  ficam em arrays simples indexados pelo id, com acesso direto em O(1). A posição 0 fica sem uso.
- **Reaproveitamento:** a mesma heap serve a SUGERIR, COMUNIDADES e aos dois TOP. O método `topK` da `SocialNetwork`
  (seleção dos k melhores) é usado por SUGERIR, TOP_SEGUIDOS e TOP_CURTIDOS.

---

## 3. Escolhas tomadas e por quê

### Tabela hash (BUSCAR)

- **Função de hash:** polinomial de base 31 pelo método de Horner, `h = (h * 31 + código do caractere) % capacidade`.
  A base 31 faz a posição de cada letra contar, então `@ana` e `@naa` caem em baldes diferentes.
  O resto da divisão é tirado a cada caractere, e não só no final, para o número nunca passar do inteiro seguro do JavaScript.
- **Colisões:** encadeamento separado. Cada balde é uma lista encadeada, e chaves que caem no mesmo índice ficam na mesma lista.
  Escolhemos encadeamento porque é simples e não piora muito quando a tabela enche, ao contrário do endereçamento aberto.
- **Tamanho:** 4001 baldes. É um número primo (espalha melhor as chaves no resto da divisão) e fica perto do dobro dos
  2.000 usuários, o que dá fator de carga de cerca de 0,5.
- **Resultado medido** com o método `stats()`: 2.416 baldes vazios, 352 baldes com colisão e a maior lista com 5 itens.
- O `@` é opcional na busca e maiúsculas são ignoradas (`buscar Renata_Dias` encontra `@renata_dias`).

### Grafo (SUGERIR e COMUNIDADES)

- **Representação:** listas de adjacência, guardando as duas direções: `following[id]` (quem o usuário segue) e
  `followers[id]` (quem segue o usuário). Custa o dobro de memória, mas "quantos sigo" e "quantos me seguem" saem em O(1)
  e não é preciso varrer todas as arestas.
- **Por que não matriz:** com 2.000 usuários a matriz teria 4 milhões de posições para só 15.000 conexões, e percorrer
  os vizinhos de alguém custaria O(V) em vez de O(grau).
- **SUGERIR:** um array de verdadeiro/falso indexado pelo id marca quem não pode ser sugerido (o próprio usuário e quem
  ele já segue). Para cada pessoa que o usuário segue, percorremos quem ela segue e somamos 1 no contador do candidato.
  Esse contador é exatamente o número de conexões em comum. **Empate:** ordem alfabética do `@usuario`
  (o enunciado não define o desempate; escolhemos esse para o resultado ser sempre o mesmo).
- **COMUNIDADES:** BFS a partir de cada usuário ainda não visitado; tudo o que ela alcança forma uma comunidade.
  "Seguir" é tratado como ligação não dirigida usando as duas listas (`following` e `followers`) como vizinhos,
  sem precisar montar outro grafo. A fila é um array com um ponteiro de início, porque `shift()` custaria O(n) a cada chamada.
  O usuário é marcado como visitado ao entrar na fila, para ninguém entrar duas vezes.
- **Isolados:** um usuário isolado forma sozinho uma comunidade de tamanho 1. Como ninguém segue a si mesmo,
  toda comunidade de tamanho 1 é um isolado. Contamos os isolados no total de comunidades e também mostramos à parte.

### Heap (SUGERIR, TOP_SEGUIDOS, TOP_CURTIDOS e COMUNIDADES)

- **Implementação:** heap binária num array (filhos em `2i + 1` e `2i + 2`, pai em `(i - 1) / 2`). A regra de prioridade é
  passada como função, então a mesma classe funciona como heap de mínimo ou de máximo.
- **Top-k com heap de MÍNIMO:** para escolher os k melhores, usamos uma heap de mínimo com no máximo k itens.
  O topo é sempre o pior dos k melhores vistos até agora: cada item novo entra e, se a heap passar de k, o topo sai.
  No fim sobram exatamente os k melhores. Isso custa O(n log k). Com uma heap de máximo, teríamos que colocar todos os
  n itens na heap e tirar k, o que custa O(n log n) com inserções uma a uma. Como k costuma ser bem menor que n,
  a de mínimo é melhor.
- **Empates:** em TOP_SEGUIDOS, ordem alfabética do `@usuario`; em TOP_CURTIDOS, o post de menor id (o mais antigo) vem primeiro.
- **COMUNIDADES** usa a heap como **heap de máximo** para listar os tamanhos do maior para o menor, já que não podemos usar `sort()`.

### Árvore AVL (POSTS_ENTRE)

- **Por que AVL e não lista ordenada:** numa lista ordenada a busca binária acha o início do intervalo em O(log n),
  mas cada inserção custa O(n), porque é preciso deslocar os itens. Na AVL inserir custa O(log n), e a árvore se
  rebalanceia sozinha, então a altura fica O(log n) mesmo se as datas chegarem em ordem (numa árvore de busca comum,
  datas em ordem viram uma "lista" de altura n).
- **Um nó por data:** os 20.000 posts têm só 669 datas distintas (até 50 posts no mesmo dia). Cada nó guarda a lista
  de posts daquele dia. A árvore fica com 669 nós e altura 11, e datas repetidas não precisam de tratamento especial.
  Dentro do mesmo dia, os posts ficam em ordem de id.
- **Chave:** a data como texto `AAAA-MM-DD`. Nesse formato, a ordem alfabética é igual à ordem cronológica.
- **Rotações:** à direita e à esquerda, com os quatro casos (esquerda-esquerda, direita-direita, esquerda-direita e
  direita-esquerda). Nos dois casos em zigue-zague, uma primeira rotação no filho transforma o problema num caso simples.
- **Busca por intervalo sem percorrer a árvore inteira:** percurso em ordem com poda. Só desce para a esquerda se a chave do nó
  for maior que `data1` e só desce para a direita se for menor que `data2`. Contamos os nós visitados:

| Intervalo | Posts encontrados | Nós visitados (de 669) |
|---|---|---|
| 1 dia (2025-03-10) | 35 | 11 |
| 1 mês (março de 2025) | 922 | 39 |
| 2027 inteiro (sem posts) | 0 | 9 |
| Tudo (2000 a 2030) | 20.000 | 669 |

- **Validação:** datas que não existem (como `2025-02-30`) ou mal formatadas dão erro. Se as datas vierem invertidas,
  o programa troca as duas e avisa, em vez de devolver vazio.

### Ordenação (RANKING)

- **Merge Sort**, porque é O(n log n) em qualquer caso (o Quick Sort pode cair para O(n²) no pior caso) e é **estável**:
  na intercalação, quando dois itens empatam, vence o da metade esquerda, que veio antes.
- Usa um único array auxiliar, criado uma vez, em vez de criar arrays novos a cada chamada recursiva.
- O critério de comparação é passado como função: engajamento do maior para o menor e, no empate,
  ordem alfabética do `@usuario`.
- **Engajamento** = seguidores × 2 + soma das curtidas dos posts. Os seguidores saem do grafo e a soma de curtidas
  já é feita no construtor, então calcular o engajamento de todos custa O(V).
- `ranking @usuario` mostra os 20 primeiros e a posição do usuário, encontrada com uma busca linear no resultado (O(V)).

---

## 4. Complexidade

Notação: V = usuários (2.000), E = conexões (15.000), P = posts (20.000), D = datas distintas (669),
L = tamanho do `@usuario`, k = quantidade pedida.

| Comando | Complexidade | Justificativa |
|---|---|---|
| Montagem (ao iniciar) | O(V·L + E + P log D) | Cada usuário entra na hash, cada conexão vai para duas listas em O(1) e cada post é inserido na AVL em O(log D). |
| `buscar` | O(L) em média | Calcular o hash percorre o `@usuario`; a lista do balde tem poucos itens. Seguidores, seguindo e posts são lidos em O(1). Pior caso (todas as chaves no mesmo balde): O(V). |
| `sugerir` | O(V + A + C log k) | O(V) para criar os arrays auxiliares; A são as arestas percorridas (quem os amigos seguem); cada um dos C candidatos passa uma vez pela heap de tamanho k. |
| `comunidades` | O(V + E + C log C) | A BFS visita cada usuário uma vez e cada conexão duas vezes (uma por ponta). Depois, os C tamanhos são ordenados com a heap. |
| `posts-entre` | O(log D + m) | Desce a altura da AVL até o intervalo e visita só os nós dentro dele; m é a quantidade de posts devolvidos. |
| `top-seguidos` | O(V log k) | Cada usuário passa uma vez pela heap de tamanho k; o número de seguidores sai em O(1) do grafo. |
| `top-curtidos` | O(P log k) | Cada post passa uma vez pela heap de tamanho k. |
| `ranking` | O(V log V) | Calcular o engajamento é O(V) e o Merge Sort é O(V log V). A posição de um usuário custa mais O(V). |

---

## 5. Testes feitos manualmente

Todos os comandos foram executados na raiz do repositório com `node js/main.js ...`.
Também conferimos algumas contagens direto nos CSV com `awk` (por exemplo, o usuário de id 1 segue 10, tem 12 seguidores e 8 posts,
igual ao que o BUSCAR mostra).

### BUSCAR

```
$ node js/main.js buscar @henrique_nascimento
@henrique_nascimento
  Nome:        Henrique Nascimento
  Cadastro:    2022-10-26
  Seguindo:    10
  Seguidores:  12
  Posts:       8

$ node js/main.js buscar Renata_Dias          (sem @ e com maiúsculas)
@renata_dias
  Nome:        Renata Dias
  ...

$ node js/main.js buscar @nao_existe          (usuário inexistente, saída 1)
Usuário @nao_existe não encontrado.
```

### SUGERIR

```
$ node js/main.js sugerir @henrique_nascimento 5
Sugestões para @henrique_nascimento:
  1. @andre_martins2 (André Martins): 2 em comum
  2. @beatriz_moreira3 (Beatriz Moreira): 2 em comum
  3. @eduarda_rocha5 (Eduarda Rocha): 2 em comum
  4. @mateus_pereira2 (Mateus Pereira): 2 em comum
  5. @sofia_freitas (Sofia Freitas): 2 em comum

$ node js/main.js sugerir @renata_dias 1000   (k maior que o número de candidatos)
  ...
  57. @zeca_barbosa (Zeca Barbosa): 1 em comum
Só existem 57 candidatos (pedidos: 1000).

$ node js/main.js sugerir @mariana_gomes 5    (usuário que não segue ninguém)
Nenhuma sugestão para @mariana_gomes: não há ninguém a distância 2 no grafo.

$ node js/main.js sugerir @henrique_nascimento abc    (k inválido, saída 1)
Uso: sugerir @usuario k   (k inteiro maior que zero)
```

### COMUNIDADES

```
$ node js/main.js comunidades
Comunidades: 76 (18 com 2 ou mais usuários + 58 isoladas)
Tamanhos, da maior para a menor:
  1. 930 usuários
  2. 620 usuários
  3. 310 usuários
  4. 8 usuários
  ...
  18. 3 usuários
  19ª a 76ª: 1 usuário cada
Usuários totalmente isolados: 58
```

A soma dos tamanhos dá 2.000, o total de usuários.

### POSTS_ENTRE

```
$ node js/main.js posts-entre 2025-03-01 2025-03-01   (intervalo de um dia só)
  2025-03-01  #66  @mariana_araujo3  (0 curtidas)  Hash grafo javascript treino viagem semana dados
  2025-03-01  #531  @renata_martins  (0 curtidas)  Grafo chuva semana muito heap música
  2025-03-01  #844  @quesia_dias2  (3 curtidas)  Viagem semana música ontem muito de incrível
  ...
30 posts entre 2025-03-01 e 2025-03-01.

$ node js/main.js posts-entre 2025-03-05 2025-03-01   (datas invertidas)
Datas invertidas: buscando de 2025-03-01 a 2025-03-05.
  ...
134 posts entre 2025-03-01 e 2025-03-05.

$ node js/main.js posts-entre 2027-01-01 2027-12-31   (intervalo sem posts)
0 posts entre 2027-01-01 e 2027-12-31.

$ node js/main.js posts-entre 2025-02-30 2025-03-01   (data que não existe, saída 1)
Uso: posts-entre AAAA-MM-DD AAAA-MM-DD   (datas válidas, ex.: 2025-03-01 2025-03-31)
```

### TOP_SEGUIDOS e TOP_CURTIDOS

```
$ node js/main.js top-seguidos 5
Top 5 usuários com mais seguidores:
  1. @nicolas_mendes (Nicolas Mendes): 110 seguidores
  2. @mariana_costa (Mariana Costa): 109 seguidores
  3. @renata_pinto (Renata Pinto): 109 seguidores
  4. @isabela_freitas3 (Isabela Freitas): 108 seguidores
  5. @larissa_moreira (Larissa Moreira): 108 seguidores

$ node js/main.js top-seguidos 5000           (k maior que o total)
  ...
  2000. @zeca_vieira2 (Zeca Vieira): 0 seguidores
Só existem 2000 usuários (pedidos: 5000).

$ node js/main.js top-curtidos 3
Top 3 posts com mais curtidas:
  1. 2988 curtidas  #7571  @zeca_pinto  2025-06-16  De jogo de fim viagem livro café bom árvore cansado estruturas
  2. 1274 curtidas  #17974  @ursula_martins  2025-01-17  Sol café finalmente ontem sabe algoritmo ruim
  3. 789 curtidas  #11454  @renata_souza2  2026-06-03  Dados viagem algoritmo academia

$ node js/main.js top-curtidos 0              (k inválido, saída 1)
Uso: top-curtidos k   (k inteiro maior que zero)
```

No `top-seguidos 5`, os empates (109 e 108 seguidores) aparecem em ordem alfabética.

### RANKING

```
$ node js/main.js ranking
Ranking de engajamento (seguidores x 2 + curtidas):
  1. @zeca_pinto (Zeca Pinto): 3012  [7 seguidores, 2998 curtidas]
  2. @ursula_martins (Úrsula Martins): 1301  [5 seguidores, 1291 curtidas]
  3. @renata_souza2 (Renata Souza): 939  [7 seguidores, 925 curtidas]
  4. @mateus_vieira (Mateus Vieira): 771  [8 seguidores, 755 curtidas]
  ...
  20. @zeca_cardoso4 (Zeca Cardoso): 394  [4 seguidores, 386 curtidas]

$ node js/main.js ranking @henrique_nascimento
  ...
@henrique_nascimento está em 927º de 2000, com engajamento 30 [12 seguidores, 6 curtidas].

$ node js/main.js ranking @nao_existe         (usuário inexistente, saída 1)
Usuário @nao_existe não encontrado.
```

Conferência do 1º lugar: 7 seguidores × 2 + 2.998 curtidas = 3.012.

### Comando inválido

```
$ node js/main.js xyz                         (saída 1)
Comando desconhecido: xyz
```
