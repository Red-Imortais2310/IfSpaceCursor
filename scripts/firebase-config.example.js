// scripts/firebase-config.js

// 1. Importar as funções necessárias do SDK do Firebase
// As URLs CDN devem ser consistentes com o resto do seu projeto (versão 10.7.1)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, collection, addDoc, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

// 2. Suas configurações específicas do projeto RedeIfSpace
const firebaseConfig = {
    apiKey: "AIzaSyDQ_hTliPlLpW2W6ACCoka1HD5So0K9b9Q",
    authDomain: "redeifspace.firebaseapp.com",
    projectId: "redeifspace",
    storageBucket: "redeifspace.firebasestorage.app",
    messagingSenderId: "237485490117",
    appId: "1:237485490117:web:6ad953ad50e6097cb7d5ac",
    measurementId: "G-JKRWBEBJKV" // Opcional, usado para o Google Analytics
};

// 3. Inicializar o Firebase App (uma única vez)
const app = initializeApp(firebaseConfig);

// 4. Obter as instâncias dos serviços e exportá-las para uso em outros arquivos
export const auth = getAuth(app);       // Instância de autenticação
export const db = getFirestore(app);   // Instância do Cloud Firestore
export const storage = getStorage(app); // Instância do Cloud Storage

// 5. Funções Customizadas que você está importando no feed.js
//    **ATENÇÃO: VOCÊ PRECISA PREENCHER A LÓGICA DESTAS FUNÇÕES**

// Exemplo de como exportar onAuthStateChange (que é um wrapper para a função do SDK)
// Esta função é uma forma de expor o listener de estado de autenticação.
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Exemplo de PLACEHOLDER para savePostToFirebase
// Você PRECISA substituir o corpo desta função com a sua lógica real de salvar posts.
export async function savePostToFirebase(postData) {
  try {
    const docRef = await addDoc(collection(db, "posts"), postData);
    console.log("Document written with ID: ", docRef.id);
    return docRef;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e; // Lançar o erro para que a função chamadora possa tratá-lo
  }
}

// Exemplo de PLACEHOLDER para onPostsChange
// Você PRECISA substituir o corpo desta função com a sua lógica real de observação de posts.
// Esta função provavelmente configura um listener em tempo real para uma coleção de posts.
export const onPostsChange = (callback) => {
  const postsCollection = collection(db, "posts");
  const unsubscribe = onSnapshot(postsCollection, (snapshot) => {
    const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(posts); // Chama o callback com os posts atualizados
  });
  return unsubscribe; // Retorna a função de unsubscribe para parar de ouvir mudanças
};

// Exemplo de PLACEHOLDER para uploadProfilePicture
// Você PRECISA substituir o corpo desta função com a sua lógica real de upload de imagem de perfil.
export async function uploadProfilePicture(file, userId) {
  if (!file || !userId) {
    console.error("File and userId are required for uploadProfilePicture.");
    return null;
  }
  const storageRef = ref(storage, `profile_pictures/${userId}/${file.name}`);
  try {
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('Profile picture uploaded successfully:', downloadURL);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    throw error;
  }
}

// Fim do scripts/firebase-config.js