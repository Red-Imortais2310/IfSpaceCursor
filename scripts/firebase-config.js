import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, collection, addDoc, onSnapshot, serverTimestamp, doc, setDoc, getDocs, updateDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js'; // Adicionado 'updateDoc'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

const firebaseConfig = {
    apiKey: "AIzaSyDQ_hTliPlLpW2W6ACCoka1HD5So0K9b9Q",
    authDomain: "redeifspace.firebaseapp.com",
    projectId: "redeifspace",
    storageBucket: "redeifspace.firebasestorage.app",
    messagingSenderId: "237485490117",
    appId: "1:237485490117:web:6ad953ad50e6097cb7d5ac",
    measurementId: "G-JKRWBEBJKV"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const onAuthStateChange = (callback) => onAuthStateChanged(auth, callback);

// ----------------------------------------------------------------
// FUNÇÕES DE POSTAGEM E PERFIL
// ----------------------------------------------------------------

// Função: Salvar Post
export async function savePostToFirebase(postData) {
    try {
        const docRef = await addDoc(collection(db, "posts"), {
            ...postData,
            timestamp: serverTimestamp()
        });
        console.log("Post salvo com ID: ", docRef.id);
        return { success: true, id: docRef.id };
    } catch (e) {
        console.error("Erro ao salvar post: ", e);
        return { success: false, error: e.message };
    }
}

// Função: Listener de Posts
export const onPostsChange = (callback) => {
    const postsCollection = collection(db, "posts");
    const unsubscribe = onSnapshot(postsCollection, (snapshot) => {
        const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(posts);
    });
    return unsubscribe;
};

// Função: Upload de Foto de Perfil
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

// ----------------------------------------------------------------
// FUNÇÕES DE CHAT E MENSAGENS (Adições Necessárias)
// ----------------------------------------------------------------

// Função: Buscar Usuários para Chat (loadUsersForChat)
export async function loadUsersForChat(currentUserId) {
    const usersCollection = collection(db, "users"); 
    
    try {
        const querySnapshot = await getDocs(usersCollection);
        const users = [];

        querySnapshot.forEach((doc) => {
            const userData = doc.data();
            
            if (doc.id !== currentUserId && userData.displayName) { 
                users.push({
                    id: doc.id, 
                    name: userData.displayName || 'Usuário IfSpace', 
                    avatar: userData.photoURL || 'https://via.placeholder.com/45', 
                    status: 'Online' 
                });
            }
        });
        return users;
    } catch (error) {
        console.error("Erro ao carregar usuários para o chat:", error);
        return [];
    }
}

// Função: Salvar Mensagem de Chat (saveMessageToFirebase)
export async function saveMessageToFirebase(message) {
    // Coleção: chats/{chatId}/messages
    const chatCollectionRef = collection(db, "chats", message.chatId, "messages");
    
    try {
        await addDoc(chatCollectionRef, {
            senderId: message.senderId,
            text: message.text,
            type: message.type,
            mediaUrl: message.mediaUrl || null,
            timestamp: serverTimestamp(), 
            reaction: message.reaction || null
        });
        return { success: true };
    } catch (e) {
        console.error("Erro ao salvar mensagem: ", e);
        return { success: false, error: e.message };
    }
}

// Função: Upload de Mídia para Chat (uploadMediaToStorage)
export async function uploadMediaToStorage(file, path) {
    if (!file) return null;

    const storageRef = ref(storage, `${path}/media/${Date.now()}_${file.name}`);
    
    try {
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        console.log('Mídia do chat enviada com sucesso:', downloadURL);
        return downloadURL;
    } catch (error) {
        console.error("Erro ao fazer upload da mídia do chat:", error);
        throw error;
    }
}

// Função: Atualizar Reação em Mensagem (updateMessageReaction)
export async function updateMessageReaction(chatId, messageId, emoji) {
    const messageRef = doc(db, "chats", chatId, "messages", messageId);
    
    try {
        // Usa updateDoc para modificar um campo específico
        await updateDoc(messageRef, {
            reaction: emoji
        });
        return { success: true };
    } catch (e) {
        console.error("Erro ao atualizar reação da mensagem:", e);
        return { success: false, error: e.message };
    }
}