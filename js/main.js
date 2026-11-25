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
    console.log("Comandos disponíveis: buscar @usuario");
    return;
  }

  let ok;
  if (command.toLowerCase() === "buscar") {
    ok = runFindUser(network, args[0]);
  } else {
    console.log(`Comando desconhecido: ${command}`);
    ok = false;
  }
  if (!ok) process.exit(1);
}

main();
