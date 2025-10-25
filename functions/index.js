// functions/index.js

// Importa os módulos necessários do Firebase Functions e do Firebase Admin SDK
const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Inicializa o Firebase Admin SDK.
// Isso permite que suas funções interajam com os serviços do Firebase (Auth, Firestore, etc.)
// com permissões administrativas.
admin.initializeApp();

// =========================================================================
// 1. Função para LISTAR TODOS OS USUÁRIOS
//    Esta função retorna uma lista paginada de usuários com UID, email, etc.
//    Ela é invocada pelo seu frontend.
// =========================================================================
exports.listUsers = functions.https.onCall(async (data, context) => {
  console.log('listUsers: Função chamada.');
  console.log('listUsers: context.auth:', context.auth);

  // --- TEMPORARIAMENTE COMENTADO PARA DEBUG: VAMOS OBTER A LISTA MESMO SEM AUTENTICAÇÃO ---
  // (Em produção, este bloco DEVE estar ativo para segurança.)
  /*
  if (!context.auth) {
    console.warn('listUsers: Chamada sem autenticação detectada. Retornando detalhes de debug.');
    return {
      status: 'error',
      code: 'unauthenticated',
      message: 'Chamada de função não autenticada. context.auth é null.',
      debugContextAuth: context.auth // Envia o valor de context.auth de volta
    };
  }
  */

  const users = [];
  let nextPageToken = undefined;

  try {
    do {
      const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);
      listUsersResult.users.forEach((userRecord) => {
        users.push({
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName || 'N/A',
          photoURL: userRecord.photoURL || 'N/A',
          createdAt: userRecord.metadata.creationTime,
        });
      });
      nextPageToken = listUsersResult.pageToken;
    } while (nextPageToken);

    return {
      status: 'success',
      count: users.length,
      users: users,
      message: `Total de ${users.length} usuários listados.`
    };

  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    return {
      status: 'error',
      code: 'internal',
      message: 'Falha interna ao listar usuários.',
      debugError: error.message
    };
  }
});

// =========================================================================
// 2. Função para EXCLUIR UM ÚNICO USUÁRIO por UID
//    Esta função exclui o usuário do Firebase Auth E do Firestore.
// =========================================================================
exports.deleteSingleUser = functions.https.onCall(async (data, context) => {
  // **Verificação de Autorização (MUITO IMPORTANTE para EXCLUSÃO!):**
  if (!context.auth || !context.auth.token || !context.auth.token.admin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Apenas administradores podem excluir usuários.'
    );
  }

  const uidToDelete = data.uid;
  if (!uidToDelete) {
    throw new functions.https.HttpsError('invalid-argument', 'UID do usuário a ser excluído é obrigatório.');
  }

  try {
    await admin.auth().deleteUser(uidToDelete);
    await admin.firestore().collection('users').doc(uidToDelete).delete();
    return { success: true, message: `Usuário ${uidToDelete} excluído com sucesso.` };
  } catch (error) {
    console.error(`Erro ao excluir usuário ${uidToDelete}:`, error);
    throw new functions.https.HttpsError('internal', `Falha ao excluir usuário ${uidToDelete}.`);
  }
});

// =========================================================================
// 3. Função para EXCLUIR MÚLTIPLOS USUÁRIOS por UID (em lote)
//    Útil para excluir vários usuários de uma vez.
// =========================================================================
exports.deleteMultipleUsers = functions.https.onCall(async (data, context) => {
  // **Verificação de Autorização (MUITO IMPORTANTE para EXCLUSÃO!):**
  if (!context.auth || !context.auth.token || !context.auth.token.admin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Apenas administradores podem excluir múltiplos usuários.'
    );
  }

  const uidsToDelete = data.uids;
  if (!Array.isArray(uidsToDelete) || uidsToDelete.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Um array de UIDs a serem excluídos é obrigatório.');
  }

  try {
    const deleteUsersResult = await admin.auth().deleteUsers(uidsToDelete);
    const firestoreBatch = admin.firestore().batch();
    uidsToDelete.forEach(uid => {
      firestoreBatch.delete(admin.firestore().collection('users').doc(uid));
    });
    await firestoreBatch.commit();

    return {
      success: true,
      successCount: deleteUsersResult.successCount,
      failureCount: deleteUsersResult.failureCount,
      errors: deleteUsersResult.errors,
      message: `${deleteUsersResult.successCount} usuários excluídos com sucesso. ${deleteUsersResult.failureCount} falharam.`
    };
  } catch (error) {
    console.error('Erro ao excluir múltiplos usuários:', error);
    throw new functions.https.HttpsError('internal', 'Falha ao excluir múltiplos usuários.');
  }
});
// =========================================================================
// FUNÇÃO TEMPORÁRIA PARA DEFINIR ADMIN CLAIMS - APAGAR DEPOIS DE USAR!
// =========================================================================
exports.setAdminClaim = functions.https.onCall(async (data, context) => {
    // MUITO IMPORTANTE: Esta função NÃO TEM VERIFICAÇÃO DE AUTENTICAÇÃO/ADMIN
    // porque ela é para ser usada UMA VEZ para definir o primeiro admin.
    // EM AMBIENTE DE PRODUÇÃO, REMOVA ESTA FUNÇÃO OU PROTEJA-A RIGOROSAMENTE!

    const targetUid = data.uid;
    if (!targetUid) {
        throw new functions.https.HttpsError('invalid-argument', 'UID é necessário para definir o claim de admin.');
    }

    try {
        await admin.auth().setCustomUserClaims(targetUid, { admin: true });
        console.log(`Claims de admin definidas para o UID: ${targetUid}`);
        return {
            status: 'success',
            message: `UID ${targetUid} agora é administrador.`
        };
    } catch (error) {
        console.error(`Erro ao definir claim de admin para ${targetUid}:`, error);
        throw new functions.https.HttpsError('internal', `Falha ao definir claim de admin: ${error.message}`);
    }
});
// =========================================================================
// NOVO: Função para obter metadados (prévia) de um link
// =========================================================================

// Importar bibliotecas que precisaremos para esta função
// IMPORTANTE: Você precisará instalar estas bibliotecas! (Passo 2)
const axios = require('axios'); // Para fazer requisições HTTP
const cheerio = require('cheerio'); // Para parsear HTML e extrair dados

exports.getLinkMetadata = functions.https.onCall(async (data, context) => {
    console.log('getLinkMetadata: Função chamada.');

    // Verificação de autenticação: Apenas usuários logados podem solicitar prévias de link
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'A solicitação deve ser autenticada para obter metadados de link.'
        );
    }

    const { url } = data; // A URL do link será passada via `data`

    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'URL inválida fornecida.'
        );
    }

    try {
        console.log(`getLinkMetadata: Buscando URL: ${url}`);
        // Faz a requisição HTTP para a URL
        const response = await axios.get(url, {
            headers: {
                // Algumas páginas podem bloquear user-agents de bots, então simulamos um navegador
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 5000 // Limite de tempo para a requisição (5 segundos)
        });

        const $ = cheerio.load(response.data); // Carrega o HTML da página

        // Extrai os metadados Open Graph
        const title = $('meta[property="og:title"]').attr('content') || $('title').text();
        const description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content');
        const image = $('meta[property="og:image"]').attr('content');
        const siteName = $('meta[property="og:site_name"]').attr('content');
        const favicon = $('link[rel="icon"]').attr('href') || $('link[rel="shortcut icon"]').attr('href');

        console.log('getLinkMetadata: Metadados extraídos com sucesso.');
        return {
            status: 'success',
            data: {
                title: title || url, // Se não encontrar título, usa a URL
                description: description || '',
                image: image || null,
                url: url, // Retorna a URL original
                siteName: siteName || '',
                favicon: favicon ? (favicon.startsWith('http') ? favicon : new URL(favicon, url).href) : null // Trata favicons relativos
            }
        };

    } catch (error) {
        console.error(`getLinkMetadata: Erro ao obter metadados para ${url}:`, error.message);
        // Retorna um erro amigável, mas mantém a URL e um placeholder
        return {
            status: 'error',
            message: `Não foi possível obter a prévia do link. Erro: ${error.message.substring(0, 100)}...`,
            data: {
                title: `Link: ${url.substring(0, 50)}...`,
                description: `Não foi possível carregar a prévia.`,
                image: 'https://via.placeholder.com/150x100?text=Link+Erro', // Imagem de erro
                url: url,
                siteName: '',
                favicon: null
            }
        };
    }
});



