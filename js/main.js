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

/**
 * Mostra as comunidades da rede e quantos usuários estão isolados (comando COMUNIDADES).
 * As comunidades de tamanho 1 (usuários isolados) são resumidas numa linha só.
 *
 * @param {SocialNetwork} network rede já montada
 * @returns {boolean} sempre true
 */
function runCommunities(network) {
  const { total, isolated, sizes } = network.communities();
  console.log(`Comunidades: ${total} (${total - isolated} com 2 ou mais usuários + ${isolated} isoladas)`);
  console.log("Tamanhos, da maior para a menor:");
  let position = 1;
  for (const size of sizes) {
    if (size === 1) break;
    console.log(`  ${position}. ${size} usuários`);
    position++;
  }
  if (isolated > 0) {
    console.log(`  ${position}ª a ${total}ª: 1 usuário cada`);
  }
  console.log(`Usuários totalmente isolados: ${isolated}`);
  return true;
}

/**
 * Confere se o texto é uma data real no formato AAAA-MM-DD (ex.: recusa 2025-02-30 e 2025-13-01).
 *
 * @param {string|undefined} text texto digitado
 * @returns {boolean}
 */
function isValidDate(text) {
  if (text === undefined || !/^\d{4}-\d{2}-\d{2}$/.test(text)) return false;
  const year = Number(text.slice(0, 4));
  const month = Number(text.slice(5, 7));
  const day = Number(text.slice(8, 10));
  if (month < 1 || month > 12 || day < 1) return false;
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const daysInMonth = [31, isLeapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day <= daysInMonth[month - 1];
}

/**
 * Lista os posts entre duas datas, inclusive (comando POSTS_ENTRE).
 * Se as datas vierem invertidas, troca e avisa.
 *
 * @param {SocialNetwork} network rede já montada
 * @param {string|undefined} from data inicial
 * @param {string|undefined} to data final
 * @returns {boolean} true se o comando deu certo
 */
function runPostsBetween(network, from, to) {
  if (!isValidDate(from) || !isValidDate(to)) {
    console.log("Uso: posts-entre AAAA-MM-DD AAAA-MM-DD   (datas válidas, ex.: 2025-03-01 2025-03-31)");
    return false;
  }
  if (from > to) {
    console.log(`Datas invertidas: buscando de ${to} a ${from}.`);
    const temp = from;
    from = to;
    to = temp;
  }
  const posts = network.postsBetween(from, to);
  for (const post of posts) {
    const likesLabel = post.likes === 1 ? "curtida" : "curtidas";
    console.log(`  ${post.date}  #${post.id}  ${post.handle}  (${post.likes} ${likesLabel})  ${post.text}`);
  }
  console.log(`${posts.length} posts entre ${from} e ${to}.`);
  return true;
}

/**
 * Mostra os k usuários com mais seguidores (comando TOP_SEGUIDOS).
 *
 * @param {SocialNetwork} network rede já montada
 * @param {string|undefined} kText quantidade, como foi digitada
 * @returns {boolean} true se o comando deu certo
 */
function runTopFollowed(network, kText) {
  const k = parsePositiveInt(kText);
  if (k === null) {
    console.log("Uso: top-seguidos k   (k inteiro maior que zero)");
    return false;
  }
  const users = network.topFollowed(k);
  console.log(`Top ${users.length} usuários com mais seguidores:`);
  for (let i = 0; i < users.length; i++) {
    const u = users[i];
    console.log(`  ${i + 1}. ${u.handle} (${u.name}): ${u.followers} seguidores`);
  }
  if (users.length < k) {
    console.log(`Só existem ${users.length} usuários (pedidos: ${k}).`);
  }
  return true;
}

/**
 * Mostra os k posts com mais curtidas (comando TOP_CURTIDOS).
 *
 * @param {SocialNetwork} network rede já montada
 * @param {string|undefined} kText quantidade, como foi digitada
 * @returns {boolean} true se o comando deu certo
 */
function runTopLiked(network, kText) {
  const k = parsePositiveInt(kText);
  if (k === null) {
    console.log("Uso: top-curtidos k   (k inteiro maior que zero)");
    return false;
  }
  const posts = network.topLiked(k);
  console.log(`Top ${posts.length} posts com mais curtidas:`);
  for (let i = 0; i < posts.length; i++) {
    const p = posts[i];
    console.log(`  ${i + 1}. ${p.likes} curtidas  #${p.id}  ${p.handle}  ${p.date}  ${p.text}`);
  }
  if (posts.length < k) {
    console.log(`Só existem ${posts.length} posts (pedidos: ${k}).`);
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
    console.log("Comandos disponíveis: buscar @usuario | sugerir @usuario k | comunidades | posts-entre data1 data2");
    console.log("                      top-seguidos k | top-curtidos k");
    return;
  }

  let ok;
  if (command.toLowerCase() === "buscar") {
    ok = runFindUser(network, args[0]);
  } else if (command.toLowerCase() === "sugerir") {
    ok = runSuggest(network, args[0], args[1]);
  } else if (command.toLowerCase() === "comunidades") {
    ok = runCommunities(network);
  } else if (command.toLowerCase() === "posts-entre" || command.toLowerCase() === "posts_entre") {
    ok = runPostsBetween(network, args[0], args[1]);
  } else if (command.toLowerCase() === "top-seguidos" || command.toLowerCase() === "top_seguidos") {
    ok = runTopFollowed(network, args[0]);
  } else if (command.toLowerCase() === "top-curtidos" || command.toLowerCase() === "top_curtidos") {
    ok = runTopLiked(network, args[0]);
  } else {
    console.log(`Comando desconhecido: ${command}`);
    ok = false;
  }
  if (!ok) process.exit(1);
}

main();
