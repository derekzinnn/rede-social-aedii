/**
 * Heap binária guardada num array.
 *
 * A árvore fica "achatada" no array: o nó da posição i tem os filhos em 2i + 1 e 2i + 2,
 * e o pai em floor((i - 1) / 2). Não precisa de ponteiros.
 *
 * A regra de prioridade vem de fora, na função hasPriority(a, b), que devolve true
 * quando a deve ficar acima de b. Assim a mesma classe serve de heap de máximo
 * (maior no topo) ou de heap de mínimo (menor no topo), conforme a função passada.
 */
class Heap {
  /**
   * @param {(a: *, b: *) => boolean} hasPriority true se a deve ficar mais perto do topo que b
   */
  constructor(hasPriority) {
    this.hasPriority = hasPriority;
    this.items = [];
  }

  /**
   * @returns {number} quantidade de itens na heap
   */
  size() {
    return this.items.length;
  }

  /**
   * Item do topo, sem remover. Complexidade: O(1).
   *
   * @returns {*} o item de maior prioridade, ou null se a heap estiver vazia
   */
  peek() {
    return this.items.length > 0 ? this.items[0] : null;
  }

  /**
   * Insere um item. Complexidade: O(log n).
   *
   * @param {*} item item a inserir
   */
  push(item) {
    this.items.push(item);
    this.siftUp(this.items.length - 1);
  }

  /**
   * Remove e devolve o item do topo. Complexidade: O(log n).
   *
   * @returns {*} o item de maior prioridade, ou null se a heap estiver vazia
   */
  pop() {
    if (this.items.length === 0) return null;
    const top = this.items[0];
    const last = this.items.pop();
    if (this.items.length > 0) {
      // O último item tapa o buraco da raiz e depois desce até a posição certa.
      this.items[0] = last;
      this.siftDown(0);
    }
    return top;
  }

  /**
   * Sobe o item da posição index enquanto ele tiver mais prioridade que o pai.
   * Usado depois de inserir no fim do array. Complexidade: O(log n), a altura da árvore.
   *
   * @param {number} index posição do item que pode estar fora do lugar
   */
  siftUp(index) {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (!this.hasPriority(this.items[index], this.items[parent])) break;
      this.swap(index, parent);
      index = parent;
    }
  }

  /**
   * Desce o item da posição index enquanto algum filho tiver mais prioridade que ele.
   * Troca sempre com o filho de maior prioridade: se trocasse com o outro, esse filho
   * menos prioritário viraria pai do mais prioritário e a propriedade da heap quebraria.
   * Complexidade: O(log n).
   *
   * @param {number} index posição do item que pode estar fora do lugar
   */
  siftDown(index) {
    const n = this.items.length;
    while (true) {
      const left = 2 * index + 1;
      const right = 2 * index + 2;
      let best = index;
      if (left < n && this.hasPriority(this.items[left], this.items[best])) best = left;
      if (right < n && this.hasPriority(this.items[right], this.items[best])) best = right;
      if (best === index) break;
      this.swap(index, best);
      index = best;
    }
  }

  /**
   * Troca dois itens de posição no array.
   *
   * @param {number} i posição
   * @param {number} j posição
   */
  swap(i, j) {
    const temp = this.items[i];
    this.items[i] = this.items[j];
    this.items[j] = temp;
  }
}

module.exports = { Heap };
