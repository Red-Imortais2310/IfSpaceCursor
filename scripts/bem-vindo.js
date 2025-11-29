import { auth, db } from './firebase-config.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Prefere dados via Firebase Auth, mas aceita fallback via localStorage
    const user = auth && auth.currentUser ? auth.currentUser : null;
    let name = null;
    let profileUrl = null;

    if (user) {
        try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                name = userData.fullName || userData.firstName || 'Usuário';
                profileUrl = userData.profilePictureUrl || null;
            }
        } catch (err) {
            console.warn('Erro ao buscar dados do Firestore, usando fallback localStorage se disponível', err);
        }
    }

    // Fallback: usar dados armazenados localmente (setados após o cadastro)
    if (!name) name = localStorage.getItem('ifspace_fullName') || 'Usuário';
    if (!profileUrl) profileUrl = localStorage.getItem('ifspace_profilePicture');

    const userNameEl = document.getElementById('userName');
    if (userNameEl) userNameEl.textContent = name;
    const userImg = document.getElementById('userProfileImage');
    if (userImg && profileUrl) {
        userImg.src = profileUrl;
        // Debug: log actual src and natural size if available
        userImg.addEventListener('load', () => {
            console.log('Bem-vindo: userProfileImage loaded', { src: userImg.src, naturalWidth: userImg.naturalWidth, naturalHeight: userImg.naturalHeight });
        });
    }

    const continueBtn = document.getElementById('continueBtn');
    if (continueBtn) continueBtn.addEventListener('click', () => {
        window.location.href = 'feed.html';
    });

    // Auto-redirect após 10s como fallback
    setTimeout(() => {
        window.location.href = 'feed.html';
    }, 10000);
});
// 1) Atualize o método bindEvents
// Removed old bindEvents placeholder: nothing to bind beyond continue button for now


