const { HashTable } = require("./structures/HashTable");
const { Graph } = require("./structures/Graph");
const { Heap } = require("./structures/Heap");

/**
 * Reúne os dados carregados dos CSV e as estruturas montadas a partir deles.
 * Cada comando do programa (BUSCAR, SUGERIR, ...) vira um método desta classe.
 *
 * Os ids dos usuários vão de 1 a n sem buracos, então informações por usuário
 * ficam em arrays simples indexados pelo id (acesso direto por índice, O(1)).
 */
class SocialNetwork {
  /**
   * Monta as estruturas. Complexidade: O(U + S + P), com U usuários, S conexões e P posts.
   *
   * @param {string[][]} users linhas [id, usuario, nome, data_cadastro]
   * @param {string[][]} follows linhas [seguidor, seguido]
   * @param {string[][]} posts linhas [id, autor, data, curtidas, texto]
   */
  constructor(users, follows, posts) {
    this.userCount = users.length;

    // Posição 0 fica sem uso para que o índice seja o próprio id.
    this.usersById = new Array(this.userCount + 1).fill(null);
    this.postCount = new Array(this.userCount + 1).fill(0);

    // Tabela hash: "@usuario" -> id.
    this.userIndex = new HashTable();

    for (const [id, handle, name, signupDate] of users) {
      const userId = Number(id);
      this.usersById[userId] = { id: userId, handle, name, signupDate };
      this.userIndex.insert(handle, userId);
    }

    // Grafo "quem segue quem".
    this.graph = new Graph(this.userCount);
    for (const [follower, followed] of follows) {
      this.graph.addEdge(Number(follower), Number(followed));
    }


    for (const post of posts) {
      this.postCount[Number(post[1])]++;
    }
  }

  /**
   * Transforma o @usuario digitado no id, usando a tabela hash.
   * O "@" é opcional e maiúsculas são ignoradas.
   *
   * Complexidade: O(L) em média, com L o tamanho do @usuario.
   *
   * @param {string} handle o @usuario digitado
   * @returns {number|null} o id, ou null se o usuário não existir
   */
  findUserId(handle) {
    let key = handle.trim().toLowerCase();
    if (!key.startsWith("@")) key = "@" + key;
    return this.userIndex.get(key);
  }

  /**
   * BUSCAR @usuario: acha o usuário pela tabela hash e monta o perfil dele.
   *
   * Complexidade: O(L) em média (cálculo do hash). Seguindo e seguidores são os
   * tamanhos das listas de adjacência e os posts já foram contados no construtor.
   *
   * @param {string} handle o @usuario digitado
   * @returns {{handle: string, name: string, signupDate: string, following: number,
   *   followers: number, posts: number}|null} o perfil, ou null se o usuário não existir
   */
  findUser(handle) {
    const id = this.findUserId(handle);
    if (id === null) return null;

    const user = this.usersById[id];
    return {
      handle: user.handle,
      name: user.name,
      signupDate: user.signupDate,
      following: this.graph.followingCount(id),
      followers: this.graph.followerCount(id),
      posts: this.postCount[id],
    };
  }

  /**
   * SUGERIR @usuario k: sugere até k pessoas no estilo "amigos de amigos".
   *
   * Candidato: quem é seguido por alguém que o usuário segue (distância 2 no grafo),
   * tirando o próprio usuário e quem ele já segue.
   * Ordem: conexões em comum (quantas pessoas que o usuário segue também seguem o candidato),
   * da maior para a menor. Empate: ordem alfabética do @usuario, para o resultado ser sempre o mesmo.
   *
   * Complexidade: O(V + D + C log k), com V usuários (zerar os arrays auxiliares),
   * D a soma dos graus de saída de quem o usuário segue (as arestas visitadas)
   * e C a quantidade de candidatos, cada um passando uma vez pela heap de tamanho k.
   *
   * @param {string} handle o @usuario digitado
   * @param {number} k quantidade máxima de sugestões (inteiro >= 1)
   * @returns {{handle: string, name: string, common: number}[]|null} sugestões da melhor
   *   para a pior (pode ter menos que k), ou null se o usuário não existir
   */
  suggest(handle, k) {
    const userId = this.findUserId(handle);
    if (userId === null) return null;

    // excluded[id] marca quem não pode ser sugerido: o próprio usuário e quem ele já segue.
    // É um array de booleanos indexado pelo id, consulta em O(1) sem usar Set.
    const excluded = new Array(this.userCount + 1).fill(false);
    excluded[userId] = true;
    for (const followedId of this.graph.getFollowing(userId)) {
      excluded[followedId] = true;
    }

    // commonCount[c] conta por quantos amigos o candidato c foi alcançado,
    // que é exatamente o número de conexões em comum.
    // candidates guarda cada candidato uma única vez, na primeira vez que aparece.
    const commonCount = new Array(this.userCount + 1).fill(0);
    const candidates = [];
    for (const friendId of this.graph.getFollowing(userId)) {
      for (const candidateId of this.graph.getFollowing(friendId)) {
        if (excluded[candidateId]) continue;
        if (commonCount[candidateId] === 0) candidates.push(candidateId);
        commonCount[candidateId]++;
      }
    }

    const best = this.topK(candidates, k, (a, b) => this.isWorseSuggestion(a, b, commonCount));
    const result = new Array(best.length);
    for (let i = 0; i < best.length; i++) {
      const candidate = this.usersById[best[i]];
      result[i] = { handle: candidate.handle, name: candidate.name, common: commonCount[best[i]] };
    }
    return result;
  }

  /**
   * Seleciona os k melhores itens de uma lista, do melhor para o pior, usando uma heap.
   * Usado pelo SUGERIR.
   *
   * Usa heap de MÍNIMO limitada a k itens: o topo é sempre o pior dos k melhores vistos até agora.
   * Cada item novo entra na heap; se ela passar de k, o topo (o pior) sai.
   * No fim sobram exatamente os k melhores. A heap nunca passa de k + 1 itens.
   *
   * Complexidade: O(n log k), com n itens. Com heap de máximo seria preciso colocar
   * os n itens na heap e tirar k, O(n log n) com inserções uma a uma; como k é pequeno, a de mínimo ganha.
   * Se k >= n, devolve todos os itens, em ordem.
   *
   * @param {*[]} items itens a comparar
   * @param {number} k quantos manter (inteiro >= 1)
   * @param {(a: *, b: *) => boolean} isWorse true se a é pior que b (vai para o topo da heap)
   * @returns {*[]} os até k melhores, do melhor para o pior
   */
  topK(items, k, isWorse) {
    const heap = new Heap(isWorse);
    for (const item of items) {
      heap.push(item);
      if (heap.size() > k) heap.pop();
    }

    // A heap devolve do pior para o melhor, então o array é preenchido de trás para frente.
    const result = new Array(heap.size());
    for (let i = result.length - 1; i >= 0; i--) {
      result[i] = heap.pop();
    }
    return result;
  }

  /**
   * Compara duas sugestões: true se a é pior que b (menos conexões em comum ou,
   * no empate, @usuario que vem depois na ordem alfabética).
   *
   * @param {number} a id de um candidato
   * @param {number} b id de outro candidato
   * @param {number[]} commonCount conexões em comum por id
   * @returns {boolean}
   */
  isWorseSuggestion(a, b, commonCount) {
    if (commonCount[a] !== commonCount[b]) return commonCount[a] < commonCount[b];
    return this.usersById[a].handle > this.usersById[b].handle;
  }
}

module.exports = { SocialNetwork };
