/**
 * Nó de uma lista encadeada dentro de um balde da tabela hash.
 * Guarda um par chave/valor e aponta para o próximo nó do mesmo balde.
 */
class HashNode {
  /**
   * @param {string} key chave do par (ex.: "@ana_silva")
   * @param {*} value valor associado à chave
   * @param {HashNode|null} next próximo nó do balde, ou null no fim da lista
   */
  constructor(key, value, next) {
    this.key = key;
    this.value = value;
    this.next = next;
  }
}

/**
 * Tabela hash com encadeamento separado.
 *
 * Os dados ficam num array de "baldes". Cada balde é uma lista encadeada de HashNode,
 * então duas chaves que caem no mesmo índice (colisão) simplesmente ficam na mesma lista.
 * Com capacidade de cerca do dobro do número de chaves, as listas ficam curtas
 * e buscar e inserir custam O(1) em média.
 */
class HashTable {
  /**
   * @param {number} capacity quantidade de baldes. Um número primo espalha melhor as chaves
   *   no resto da divisão. O padrão 4001 é primo e dá fator de carga ~0,5 para os 2.000 usuários.
   */
  constructor(capacity = 4001) {
    this.capacity = capacity;
    this.buckets = new Array(capacity).fill(null);
    this.size = 0;
  }

  /**
   * Função de hash polinomial (método de Horner) sobre os códigos dos caracteres da chave:
   * h = (c0 * 31^(n-1) + c1 * 31^(n-2) + ... + c(n-1)) mod capacidade.
   *
   * Complexidade: O(L), em que L é o tamanho da chave.
   *
   * @param {string} key texto a ser transformado em índice
   * @returns {number} índice do balde, entre 0 e capacity - 1
   */
  hash(key) {
    let h = 0;
    for (let i = 0; i < key.length; i++) {
      // O resto da divisão é aplicado a cada passo, não só no final.
      // Assim h nunca passa de capacity * 31 + 65535 e a conta não perde precisão,
      // mesmo com chaves longas (31^20 já estoura o inteiro seguro do JavaScript).
      // A base 31 é um primo pequeno: faz a posição de cada letra pesar no resultado,
      // então "@ana" e "@naa" caem em baldes diferentes.
      h = (h * 31 + key.charCodeAt(i)) % this.capacity;
    }
    return h;
  }

  /**
   * Insere o par chave/valor. Se a chave já existir, só troca o valor.
   *
   * Complexidade: O(1) em média; O(n) no pior caso, se todas as chaves caírem no mesmo balde.
   *
   * @param {string} key chave do par
   * @param {*} value valor a guardar
   */
  insert(key, value) {
    const index = this.hash(key);
    let node = this.buckets[index];
    while (node !== null) {
      if (node.key === key) {
        node.value = value;
        return;
      }
      node = node.next;
    }
    // Chave nova: entra no início da lista do balde, sem precisar percorrer até o fim.
    this.buckets[index] = new HashNode(key, value, this.buckets[index]);
    this.size++;
  }

  /**
   * Procura o valor associado à chave.
   *
   * Complexidade: O(1) em média; O(n) no pior caso.
   *
   * @param {string} key chave procurada
   * @returns {*} o valor guardado, ou null se a chave não existir
   */
  get(key) {
    let node = this.buckets[this.hash(key)];
    while (node !== null) {
      if (node.key === key) return node.value;
      node = node.next;
    }
    return null;
  }

  /**
   * Mede como as chaves se espalharam pelos baldes. Serve para justificar no relatório
   * a função de hash e o tamanho escolhido.
   *
   * Complexidade: O(capacity + n).
   *
   * @returns {{capacity: number, size: number, loadFactor: number,
   *   emptyBuckets: number, bucketsWithCollision: number, longestChain: number}}
   */
  stats() {
    let emptyBuckets = 0;
    let bucketsWithCollision = 0;
    let longestChain = 0;
    for (let i = 0; i < this.capacity; i++) {
      let chainLength = 0;
      let node = this.buckets[i];
      while (node !== null) {
        chainLength++;
        node = node.next;
      }
      if (chainLength === 0) emptyBuckets++;
      if (chainLength > 1) bucketsWithCollision++;
      if (chainLength > longestChain) longestChain = chainLength;
    }
    return {
      capacity: this.capacity,
      size: this.size,
      loadFactor: this.size / this.capacity,
      emptyBuckets,
      bucketsWithCollision,
      longestChain,
    };
  }
}

module.exports = { HashTable };
