/**
 * Nó da árvore AVL. Guarda uma chave e TODOS os valores com essa chave,
 * para que chaves repetidas (vários posts no mesmo dia) fiquem num nó só.
 */
class AVLNode {
  /**
   * @param {string} key chave do nó (aqui, uma data "AAAA-MM-DD")
   * @param {*} value primeiro valor com essa chave
   */
  constructor(key, value) {
    this.key = key;
    this.values = [value];
    this.left = null;
    this.right = null;
    // Altura da subárvore que começa neste nó; uma folha tem altura 1.
    this.height = 1;
  }
}

/**
 * Árvore AVL: árvore binária de busca que se rebalanceia sozinha.
 *
 * Em todo nó, a diferença de altura entre a subárvore esquerda e a direita
 * (o "fator de balanceamento") fica entre -1 e 1. Quando uma inserção quebra isso,
 * uma ou duas rotações consertam. Com isso a altura fica sempre O(log n),
 * e inserir e buscar custam O(log n) mesmo se as chaves chegarem em ordem.
 *
 * As chaves são comparadas com < e >. Datas no formato "AAAA-MM-DD" ficam na mesma
 * ordem como texto e como data, então podem ser comparadas direto.
 */
class AVLTree {
  constructor() {
    this.root = null;
    this.nodeCount = 0;
    this.valueCount = 0;
  }

  /**
   * @param {AVLNode|null} node nó ou null
   * @returns {number} altura do nó; 0 para null (árvore vazia)
   */
  height(node) {
    return node === null ? 0 : node.height;
  }

  /**
   * Recalcula a altura de um nó a partir das alturas dos filhos.
   *
   * @param {AVLNode} node nó cujos filhos já estão com a altura certa
   */
  updateHeight(node) {
    node.height = 1 + Math.max(this.height(node.left), this.height(node.right));
  }

  /**
   * Fator de balanceamento: altura da esquerda menos altura da direita.
   * Maior que 1: pende para a esquerda. Menor que -1: pende para a direita.
   *
   * @param {AVLNode} node nó
   * @returns {number}
   */
  balanceFactor(node) {
    return this.height(node.left) - this.height(node.right);
  }

  /**
   * Rotação simples à direita, usada quando o nó pende para a esquerda.
   *
   *         node                 pivot
   *        /    \               /     \
   *     pivot    C    ==>      A      node
   *     /   \                         /   \
   *    A     B                       B     C
   *
   * O filho esquerdo (pivot) sobe e node desce para a direita dele.
   * A subárvore B, que estava à direita de pivot, passa para a esquerda de node:
   * todas as chaves de B são maiores que pivot e menores que node, então a ordem se mantém.
   * Complexidade: O(1).
   *
   * @param {AVLNode} node raiz da subárvore desbalanceada
   * @returns {AVLNode} nova raiz da subárvore (pivot)
   */
  rotateRight(node) {
    const pivot = node.left;
    node.left = pivot.right;
    pivot.right = node;
    // node agora está abaixo de pivot, então a altura dele é atualizada primeiro.
    this.updateHeight(node);
    this.updateHeight(pivot);
    return pivot;
  }

  /**
   * Rotação simples à esquerda, espelho da rotateRight, usada quando o nó pende para a direita.
   *
   *     node                     pivot
   *    /    \                   /     \
   *   A    pivot      ==>     node     C
   *        /   \             /    \
   *       B     C           A      B
   *
   * Complexidade: O(1).
   *
   * @param {AVLNode} node raiz da subárvore desbalanceada
   * @returns {AVLNode} nova raiz da subárvore (pivot)
   */
  rotateLeft(node) {
    const pivot = node.right;
    node.right = pivot.left;
    pivot.left = node;
    this.updateHeight(node);
    this.updateHeight(pivot);
    return pivot;
  }

  /**
   * Confere o fator de balanceamento do nó e aplica a rotação necessária.
   * São quatro casos:
   *   - esquerda-esquerda: rotação à direita;
   *   - direita-direita: rotação à esquerda;
   *   - esquerda-direita: primeiro rotação à esquerda no filho esquerdo, depois à direita no nó;
   *   - direita-esquerda: primeiro rotação à direita no filho direito, depois à esquerda no nó.
   * Nos casos "em zigue-zague" a primeira rotação endireita o filho, transformando o caso
   * num esquerda-esquerda (ou direita-direita), que uma rotação simples resolve.
   * Complexidade: O(1).
   *
   * @param {AVLNode} node nó cujos filhos já estão balanceados
   * @returns {AVLNode} raiz da subárvore depois do balanceamento
   */
  rebalance(node) {
    this.updateHeight(node);
    const balance = this.balanceFactor(node);

    if (balance > 1) {
      // Pende para a esquerda. Se o filho esquerdo pende para a direita, é zigue-zague.
      if (this.balanceFactor(node.left) < 0) {
        node.left = this.rotateLeft(node.left);
      }
      return this.rotateRight(node);
    }
    if (balance < -1) {
      // Pende para a direita. Se o filho direito pende para a esquerda, é zigue-zague.
      if (this.balanceFactor(node.right) > 0) {
        node.right = this.rotateRight(node.right);
      }
      return this.rotateLeft(node);
    }
    return node;
  }

  /**
   * Insere um valor com a chave dada. Se a chave já existir, o valor entra na lista do nó
   * (no fim, então valores da mesma chave ficam na ordem de inserção).
   *
   * Complexidade: O(log n), com n o número de chaves distintas.
   *
   * @param {string} key chave
   * @param {*} value valor
   */
  insert(key, value) {
    this.root = this.insertAt(this.root, key, value);
    this.valueCount++;
  }

  /**
   * Inserção recursiva: desce como numa árvore de busca comum e, na volta da recursão,
   * rebalanceia cada nó do caminho até a raiz.
   *
   * @param {AVLNode|null} node raiz da subárvore atual
   * @param {string} key chave
   * @param {*} value valor
   * @returns {AVLNode} nova raiz desta subárvore (pode mudar por causa de uma rotação)
   */
  insertAt(node, key, value) {
    if (node === null) {
      this.nodeCount++;
      return new AVLNode(key, value);
    }
    if (key < node.key) {
      node.left = this.insertAt(node.left, key, value);
    } else if (key > node.key) {
      node.right = this.insertAt(node.right, key, value);
    } else {
      // Chave repetida: não cria nó, então a altura não muda e não há o que rebalancear.
      node.values.push(value);
      return node;
    }
    return this.rebalance(node);
  }

  /**
   * Devolve, em ordem crescente de chave, todos os valores com chave entre from e to
   * (as duas pontas incluídas).
   *
   * Não percorre a árvore inteira: só desce para a esquerda se ainda pode haver chave >= from
   * ali, e só desce para a direita se ainda pode haver chave <= to.
   * Complexidade: O(log n + m), com m a quantidade de nós dentro do intervalo
   * (mais os valores devolvidos).
   *
   * @param {string} from menor chave do intervalo
   * @param {string} to maior chave do intervalo
   * @returns {*[]} valores encontrados, em ordem de chave
   */
  rangeQuery(from, to) {
    const result = [];
    this.collectRange(this.root, from, to, result);
    return result;
  }

  /**
   * Percurso em ordem (esquerda, nó, direita) com poda dos ramos fora do intervalo.
   *
   * @param {AVLNode|null} node raiz da subárvore atual
   * @param {string} from menor chave do intervalo
   * @param {string} to maior chave do intervalo
   * @param {*[]} result array onde os valores são acumulados
   */
  collectRange(node, from, to, result) {
    if (node === null) return;
    // Tudo à esquerda é menor que node.key. Se node.key <= from, nada lá chega a from.
    if (from < node.key) {
      this.collectRange(node.left, from, to, result);
    }
    if (from <= node.key && node.key <= to) {
      for (const value of node.values) result.push(value);
    }
    // Tudo à direita é maior que node.key. Se node.key >= to, nada lá fica abaixo de to.
    if (node.key < to) {
      this.collectRange(node.right, from, to, result);
    }
  }
}

module.exports = { AVLTree };
