/*
 * Atividade Final - AED II - Rede Social
 * Ponto de partida em JavaScript (Node.js). Leia o README.md na raiz do repositório.
 *
 * Este arquivo apenas carrega os dados. Todo o resto é com você:
 * crie suas próprias estruturas (hash, AVL, heap, grafo, ordenação)
 * em quantos arquivos quiser dentro desta pasta.
 */
const aedlib = require("./aedlib"); // biblioteca base do projeto (obrigatória - não remova)
const { SocialNetwork } = require("./SocialNetwork");

/**
 * Mostra o perfil de um usuário (comando BUSCAR) ou avisa que ele não existe.
 *
 * @param {SocialNetwork} network rede já montada
 * @param {string|undefined} handle o @usuario pedido
 * @returns {boolean} true se encontrou o usuário
 */
function runFindUser(network, handle) {
  if (!handle) {
    console.log("Uso: buscar @usuario");
    return false;
  }
  const profile = network.findUser(handle);
  if (profile === null) {
    console.log(`Usuário ${handle} não encontrado.`);
    return false;
  }
  console.log(profile.handle);
  console.log(`  Nome:        ${profile.name}`);
  console.log(`  Cadastro:    ${profile.signupDate}`);
  console.log(`  Seguindo:    ${profile.following}`);
  console.log(`  Seguidores:  ${profile.followers}`);
  console.log(`  Posts:       ${profile.posts}`);
  return true;
}

/**
 * Converte o texto em inteiro positivo.
 *
 * @param {string|undefined} text texto digitado
 * @returns {number|null} o número, ou null se não for um inteiro maior que zero
 */
function parsePositiveInt(text) {
  if (text === undefined || !/^\d+$/.test(text)) return null;
  const value = Number(text);
  return value > 0 ? value : null;
}

/**
 * Mostra até k sugestões de quem seguir (comando SUGERIR).
 *
 * @param {SocialNetwork} network rede já montada
 * @param {string|undefined} handle o @usuario pedido
 * @param {string|undefined} kText quantidade de sugestões, como foi digitada
 * @returns {boolean} true se o comando deu certo
 */
function runSuggest(network, handle, kText) {
  const k = parsePositiveInt(kText);
  if (!handle || k === null) {
    console.log("Uso: sugerir @usuario k   (k inteiro maior que zero)");
    return false;
  }
  const suggestions = network.suggest(handle, k);
  if (suggestions === null) {
    console.log(`Usuário ${handle} não encontrado.`);
    return false;
  }
  if (suggestions.length === 0) {
    console.log(`Nenhuma sugestão para ${handle}: não há ninguém a distância 2 no grafo.`);
    return true;
  }
  console.log(`Sugestões para ${handle}:`);
  for (let i = 0; i < suggestions.length; i++) {
    const s = suggestions[i];
    console.log(`  ${i + 1}. ${s.handle} (${s.name}): ${s.common} em comum`);
  }
  if (suggestions.length < k) {
    console.log(`Só existem ${suggestions.length} candidatos (pedidos: ${k}).`);
  }
  return true;
}

function main() {
  const [usuarios, seguidores, posts] = aedlib.socialCarregarDados();
  // usuarios:   [id, usuario, nome, data_cadastro]
  // seguidores: [seguidor, seguido]
  // posts:      [id, autor, data, curtidas, texto]

  const network = new SocialNetwork(usuarios, seguidores, posts);
  const [command, ...args] = process.argv.slice(2);

  if (command === undefined) {
    console.log(`Usuários carregados:  ${usuarios.length}`);
    console.log(`Conexões carregadas:  ${seguidores.length}`);
    console.log(`Posts carregados:     ${posts.length}`);
    console.log("Comandos disponíveis: buscar @usuario | sugerir @usuario k");
    return;
  }

  let ok;
  if (command.toLowerCase() === "buscar") {
    ok = runFindUser(network, args[0]);
  } else if (command.toLowerCase() === "sugerir") {
    ok = runSuggest(network, args[0], args[1]);
  } else {
    console.log(`Comando desconhecido: ${command}`);
    ok = false;
  }
  if (!ok) process.exit(1);
}

main();
