/**
 * Ordena uma lista com Merge Sort, sem alterar a lista original.
 *
 * Divide a lista ao meio, ordena cada metade (recursivamente) e intercala as duas
 * metades já ordenadas. A recursão tem log n níveis e cada nível intercala n itens no total,
 * então a complexidade é O(n log n) em qualquer caso (melhor, médio e pior).
 * Usa um array auxiliar de n posições, criado uma vez só: O(n) de memória extra.
 *
 * É estável: itens que o compare considera iguais mantêm a ordem em que estavam.
 *
 * @param {*[]} items lista a ordenar
 * @param {(a: *, b: *) => number} compare negativo se a vem antes de b, positivo se depois, 0 se tanto faz
 * @returns {*[]} nova lista ordenada
 */
function mergeSort(items, compare) {
  const sorted = new Array(items.length);
  for (let i = 0; i < items.length; i++) sorted[i] = items[i];
  const buffer = new Array(items.length);
  sortRange(sorted, buffer, 0, items.length - 1, compare);
  return sorted;
}

/**
 * Ordena a faixa array[left..right] (pontas incluídas).
 *
 * @param {*[]} array lista sendo ordenada
 * @param {*[]} buffer array auxiliar do mesmo tamanho
 * @param {number} left primeira posição da faixa
 * @param {number} right última posição da faixa
 * @param {(a: *, b: *) => number} compare critério de ordem
 */
function sortRange(array, buffer, left, right, compare) {
  // Faixa com 0 ou 1 item já está ordenada: é o caso base da recursão.
  if (left >= right) return;
  const middle = Math.floor((left + right) / 2);
  sortRange(array, buffer, left, middle, compare);
  sortRange(array, buffer, middle + 1, right, compare);
  merge(array, buffer, left, middle, right, compare);
}

/**
 * Intercala as duas metades ordenadas array[left..middle] e array[middle+1..right].
 * Complexidade: O(right - left + 1).
 *
 * @param {*[]} array lista sendo ordenada
 * @param {*[]} buffer array auxiliar
 * @param {number} left início da primeira metade
 * @param {number} middle fim da primeira metade
 * @param {number} right fim da segunda metade
 * @param {(a: *, b: *) => number} compare critério de ordem
 */
function merge(array, buffer, left, middle, right, compare) {
  // Copia a faixa para o buffer e escreve o resultado de volta em array.
  for (let i = left; i <= right; i++) buffer[i] = array[i];

  let i = left; // próximo da metade esquerda
  let j = middle + 1; // próximo da metade direita
  let k = left; // próxima posição a preencher

  while (i <= middle && j <= right) {
    // "<= 0" e não "< 0": no empate vence a metade esquerda, que veio antes.
    // É isso que torna o Merge Sort estável.
    if (compare(buffer[i], buffer[j]) <= 0) {
      array[k++] = buffer[i++];
    } else {
      array[k++] = buffer[j++];
    }
  }
  // Uma das metades acabou; o que sobrou da outra já está em ordem e vai direto.
  while (i <= middle) array[k++] = buffer[i++];
  while (j <= right) array[k++] = buffer[j++];
}

module.exports = { mergeSort };
