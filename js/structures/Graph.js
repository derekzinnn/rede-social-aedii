/**
 * Grafo dirigido representado por listas de adjacência.
 *
 * Os vértices são os ids dos usuários (1 a n). Uma aresta A -> B quer dizer "A segue B".
 * Para cada vértice guardamos duas listas:
 *   - following[A]: quem A segue (arestas que saem de A);
 *   - followers[B]: quem segue B (arestas que chegam em B).
 * Guardar as duas direções custa o dobro de memória (O(V + 2E)), mas deixa
 * "quem eu sigo" e "quem me segue" com acesso direto, sem varrer todas as arestas.
 *
 * Lista de adjacência e não matriz: com 2.000 usuários e 15.000 conexões, a matriz teria
 * 4 milhões de posições quase todas vazias, e percorrer os vizinhos custaria O(V) em vez de O(grau).
 */
class Graph {
  /**
   * @param {number} vertexCount quantidade de vértices; os ids válidos vão de 1 a vertexCount
   */
  constructor(vertexCount) {
    this.vertexCount = vertexCount;
    // Posição 0 fica sem uso para que o índice seja o próprio id.
    this.following = new Array(vertexCount + 1);
    this.followers = new Array(vertexCount + 1);
    for (let id = 0; id <= vertexCount; id++) {
      this.following[id] = [];
      this.followers[id] = [];
    }
    this.edgeCount = 0;
  }

  /**
   * Adiciona a aresta "follower segue followed".
   * Não confere duplicatas: os dados não têm conexão repetida (conferido nos CSV).
   *
   * Complexidade: O(1) amortizado (push no fim de cada lista).
   *
   * @param {number} follower id de quem segue
   * @param {number} followed id de quem é seguido
   */
  addEdge(follower, followed) {
    this.following[follower].push(followed);
    this.followers[followed].push(follower);
    this.edgeCount++;
  }

  /**
   * @param {number} id vértice
   * @returns {number[]} ids que este usuário segue. É a própria lista interna: não alterar.
   */
  getFollowing(id) {
    return this.following[id];
  }

  /**
   * @param {number} id vértice
   * @returns {number[]} ids que seguem este usuário. É a própria lista interna: não alterar.
   */
  getFollowers(id) {
    return this.followers[id];
  }

  /**
   * Grau de saída: quantos o usuário segue. Complexidade: O(1).
   *
   * @param {number} id vértice
   * @returns {number}
   */
  followingCount(id) {
    return this.following[id].length;
  }

  /**
   * Grau de entrada: quantos seguidores o usuário tem. Complexidade: O(1).
   *
   * @param {number} id vértice
   * @returns {number}
   */
  followerCount(id) {
    return this.followers[id].length;
  }

  /**
   * Encontra os componentes conexos tratando cada aresta como NÃO dirigida:
   * se A segue B, A e B ficam ligados nos dois sentidos.
   *
   * Faz uma BFS a partir de cada vértice ainda não visitado; tudo o que essa BFS
   * alcança forma um componente. Cada vértice entra na fila uma única vez e cada aresta
   * é olhada duas vezes (uma por ponta), então a complexidade é O(V + E).
   *
   * @returns {number[]} tamanho de cada componente, na ordem em que foram encontrados
   */
  connectedComponents() {
    const visited = new Array(this.vertexCount + 1).fill(false);
    const sizes = [];

    // Fila da BFS: um array só, com "head" apontando o próximo a sair.
    // Não uso shift(), que reposiciona o array inteiro a cada chamada (O(n)).
    // Como cada vértice entra na fila uma vez só, o array nunca passa de V posições.
    const queue = new Array(this.vertexCount);

    for (let start = 1; start <= this.vertexCount; start++) {
      if (visited[start]) continue;

      // Nova BFS: o vértice é marcado ao ENTRAR na fila, não ao sair.
      // Assim ninguém é enfileirado duas vezes, mesmo sendo vizinho de vários.
      let head = 0;
      let tail = 0;
      queue[tail++] = start;
      visited[start] = true;

      while (head < tail) {
        const current = queue[head++];
        // Vizinhos não dirigidos = quem current segue + quem segue current.
        for (const neighbor of this.following[current]) {
          if (!visited[neighbor]) {
            visited[neighbor] = true;
            queue[tail++] = neighbor;
          }
        }
        for (const neighbor of this.followers[current]) {
          if (!visited[neighbor]) {
            visited[neighbor] = true;
            queue[tail++] = neighbor;
          }
        }
      }

      // tail = quantos vértices entraram na fila nesta BFS = tamanho do componente.
      sizes.push(tail);
    }
    return sizes;
  }
}

module.exports = { Graph };
