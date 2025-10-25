// scripts/auth-service.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

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
const auth = getAuth(app);

export function logoutUser() {
    console.log('Tentando fazer logout...');
    return signOut(auth)
        .then(() => {
            console.log('Logout realizado com sucesso!');
            window.location.href = 'index.html';
        })
        .catch((error) => {
            console.error('Erro ao fazer logout:', error);
            throw error;
        });
}