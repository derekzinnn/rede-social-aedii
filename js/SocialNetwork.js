const { HashTable } = require("./structures/HashTable");

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
    this.followingCount = new Array(this.userCount + 1).fill(0);
    this.followerCount = new Array(this.userCount + 1).fill(0);
    this.postCount = new Array(this.userCount + 1).fill(0);

    // Tabela hash: "@usuario" -> id.
    this.userIndex = new HashTable();

    for (const [id, handle, name, signupDate] of users) {
      const userId = Number(id);
      this.usersById[userId] = { id: userId, handle, name, signupDate };
      this.userIndex.insert(handle, userId);
    }

    for (const [follower, followed] of follows) {
      this.followingCount[Number(follower)]++;
      this.followerCount[Number(followed)]++;
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
   * Complexidade: O(L) em média (cálculo do hash).
   * As contagens já foram feitas no construtor e aqui só são lidas por índice.
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
      following: this.followingCount[id],
      followers: this.followerCount[id],
      posts: this.postCount[id],
    };
  }
}

module.exports = { SocialNetwork };
