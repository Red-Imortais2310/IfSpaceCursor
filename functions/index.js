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
// =========================================================================
// 1. Função para LISTAR TODOS OS USUÁRIOS (AGORA COM MAIS DETALHES DE DEBUG PARA O FRONTEND)
// =========================================================================
exports.listUsers = functions.https.onCall(async (data, context) => {
  console.log('listUsers: Função chamada.');
  console.log('listUsers: context.auth:', context.auth);

  // SE context.auth FOR NULL, VAMOS ENVIAR A INFORMAÇÃO DE VOLTA PARA O FRONTEND
  if (!context.auth) {
    console.warn('listUsers: Chamada sem autenticação detectada. Retornando detalhes de debug.');
    return {
      status: 'error',
      code: 'unauthenticated',
      message: 'Chamada de função não autenticada. context.auth é null.',
      debugContextAuth: context.auth // Envia o valor de context.auth de volta
    };
  }

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
      status: 'success', // Adicionando status para o frontend
      count: users.length,
      users: users,
      message: `Total de ${users.length} usuários listados.`
    };

  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    // Em vez de throw, vamos retornar o erro para o frontend ver
    return {
      status: 'error',
      code: 'internal',
      message: 'Falha interna ao listar usuários.',
      debugError: error.message
    };
  }
});

// ... (As funções deleteSingleUser e deleteMultipleUsers permanecem as mesmas abaixo) ...


// =========================================================================
// 2. Função para EXCLUIR UM ÚNICO USUÁRIO por UID
//    Esta função exclui o usuário do Firebase Auth E do Firestore.
// =========================================================================
exports.deleteSingleUser = functions.https.onCall(async (data, context) => {
  // **Verificação de Autorização (MUITO IMPORTANTE para EXCLUSÃO!):**
  // Em um aplicativo real, esta função deve ser acessível APENAS por administradores.
  // Para este exemplo, vamos exigir que o usuário tenha um 'custom claim' de 'admin: true'.
  // Se você não configurou isso ainda, esta função não funcionará sem um admin real.
  if (!context.auth || !context.auth.token || !context.auth.token.admin) {
    // Se o usuário não está autenticado ou não é admin, recusa a operação.
    throw new functions.https.HttpsError('permission-denied', 'Apenas administradores podem excluir usuários.');
  }

  const uidToDelete = data.uid; // Pega o UID a ser excluído dos dados enviados pelo frontend
  if (!uidToDelete) {
    throw new functions.https.HttpsError('invalid-argument', 'UID do usuário a ser excluído é obrigatório.');
  }

  try {
    // Exclui o usuário do Firebase Authentication
    await admin.auth().deleteUser(uidToDelete);
    
    // Exclui o documento do perfil do usuário no Cloud Firestore
    await admin.firestore().collection('users').doc(uidToDelete).delete();
    
    // Opcional: Se o usuário tiver dados no Storage (ex: profilePictures/UID), você também pode excluir
    // a pasta inteira aqui para economizar espaço e evitar dados órfãos.
    // await admin.storage().bucket().file(`profilePictures/${uidToDelete}/`).delete(); // Isso é mais complexo para um diretório inteiro

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
  // Assim como a função de exclusão única, esta também deve ser acessível APENAS por administradores.
  if (!context.auth || !context.auth.token || !context.auth.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Apenas administradores podem excluir múltiplos usuários.');
  }

  const uidsToDelete = data.uids; // Pega o array de UIDs dos dados enviados
  if (!Array.isArray(uidsToDelete) || uidsToDelete.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Um array de UIDs a serem excluídos é obrigatório.');
  }

  try {
    // Exclui os usuários do Firebase Authentication em lote
    const deleteUsersResult = await admin.auth().deleteUsers(uidsToDelete);
    
    // Exclui os documentos de perfil do Firestore em lote usando um Batch
    const firestoreBatch = admin.firestore().batch();
    uidsToDelete.forEach(uid => {
      firestoreBatch.delete(admin.firestore().collection('users').doc(uid));
    });
    await firestoreBatch.commit(); // Confirma todas as exclusões do Firestore de uma vez

    return {
      success: true,
      successCount: deleteUsersResult.successCount,
      failureCount: deleteUsersResult.failureCount,
      errors: deleteUsersResult.errors, // Lista de erros para usuários que não puderam ser excluídos
      message: `${deleteUsersResult.successCount} usuários excluídos com sucesso. ${deleteUsersResult.failureCount} falharam.`
    };
  } catch (error) {
    console.error('Erro ao excluir múltiplos usuários:', error);
    throw new functions.https.HttpsError('internal', 'Falha ao excluir múltiplos usuários.');
  }
});


