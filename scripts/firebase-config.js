// scripts/firebase-config.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, collection, addDoc, onSnapshot, serverTimestamp, doc, setDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
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

export const onPostsChange = (callback) => {
    const postsCollection = collection(db, "posts");
    const unsubscribe = onSnapshot(postsCollection, (snapshot) => {
        const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(posts);
    });
    return unsubscribe;
};

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