// Firebase Configuration
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, onSnapshot, serverTimestamp, doc, setDoc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

// SUAS CONFIGURAÇÕES DO FIREBASE - SUBSTITUA PELOS SEUS VALORES
const firebaseConfig = {
    apiKey: "SUA_API_KEY_AQUI",
    authDomain: "seu-projeto-id.firebaseapp.com",
    projectId: "seu-projeto-id",
    storageBucket: "seu-projeto-id.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Funções do Firebase
export const firebaseAuth = auth;
export const firebaseDb = db;
export const firebaseStorage = storage;

// Função para fazer login
export async function loginUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Função para criar usuário
export async function createUser(email, password, userData) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Salvar dados adicionais do usuário
        await setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            birthday: userData.birthday,
            gender: userData.gender,
            createdAt: serverTimestamp()
        });
        
        return { success: true, user: user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Função para fazer logout
export async function logoutUser() {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Função para salvar post no Firebase
export async function savePostToFirebase(postData) {
    try {
        const docRef = await addDoc(collection(db, 'posts'), {
            ...postData,
            createdAt: serverTimestamp(),
            likes: 0,
            comments: 0,
            shares: 0
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Função para carregar posts do Firebase
export async function loadPostsFromFirebase() {
    try {
        const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(50));
        const querySnapshot = await getDocs(q);
        const posts = [];
        querySnapshot.forEach((doc) => {
            posts.push({ id: doc.id, ...doc.data() });
        });
        return { success: true, posts: posts };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Função para salvar story no Firebase
export async function saveStoryToFirebase(storyData) {
    try {
        const docRef = await addDoc(collection(db, 'stories'), {
            ...storyData,
            createdAt: serverTimestamp(),
            views: 0
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Função para upload de arquivo
export async function uploadFileToFirebase(file, path) {
    try {
        const storageRef = ref(storage, path);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return { success: true, url: downloadURL };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Função para salvar mensagem no Firebase
export async function saveMessageToFirebase(messageData) {
    try {
        const docRef = await addDoc(collection(db, 'messages'), {
            ...messageData,
            createdAt: serverTimestamp(),
            read: false
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Função para carregar mensagens do Firebase
export async function loadMessagesFromFirebase(chatId) {
    try {
        const q = query(collection(db, 'messages'), orderBy('createdAt', 'asc'));
        const querySnapshot = await getDocs(q);
        const messages = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.chatId === chatId) {
                messages.push({ id: doc.id, ...data });
            }
        });
        return { success: true, messages: messages };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Listener para mudanças de autenticação
export function onAuthStateChange(callback) {
    return onAuthStateChanged(auth, callback);
}

// Listener para posts em tempo real
export function onPostsChange(callback) {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(50));
    return onSnapshot(q, callback);
}

// Listener para mensagens em tempo real
export function onMessagesChange(chatId, callback) {
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'asc'));
    return onSnapshot(q, (snapshot) => {
        const messages = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.chatId === chatId) {
                messages.push({ id: doc.id, ...data });
            }
        });
        callback(messages);
    });
}