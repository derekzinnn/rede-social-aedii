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
}

module.exports = { Graph };
