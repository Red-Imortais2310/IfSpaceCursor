// scripts/login.js
import { auth, db, uploadProfilePicture } from './firebase-config.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { doc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const showRegisterFormLink = document.getElementById('showRegisterForm');
    const backToLoginLink = document.getElementById('backToLogin');
    const selectProfilePictureBtn = document.getElementById('selectRegisterProfilePictureBtn');
    const profilePictureInput = document.getElementById('registerProfilePictureInput');
    const profileImagePreview = document.getElementById('registerProfileImagePreview');
    const uploadStatus = document.getElementById('registerUploadStatus');

    // Alternar entre formulários
    if (showRegisterFormLink) {
        showRegisterFormLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
        });
    }

    if (backToLoginLink) {
        backToLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            registerForm.style.display = 'none';
            loginForm.style.display = 'block';
        });
    }

    // Pré-visualização da imagem de perfil
    if (selectProfilePictureBtn && profilePictureInput) {
        selectProfilePictureBtn.addEventListener('click', () => {
            profilePictureInput.click();
        });

        profilePictureInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    profileImagePreview.src = event.target.result;
                    uploadStatus.textContent = 'Imagem selecionada!';
                    uploadStatus.style.display = 'block';
                    uploadStatus.style.color = 'green';
                    setTimeout(() => { uploadStatus.style.display = 'none'; }, 3000);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Login
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();

            if (!email || !password) {
                alert('Por favor, preencha email e senha.');
                return;
            }

            try {
                await signInWithEmailAndPassword(auth, email, password);
                console.log("Usuário logado com sucesso.");
                window.location.href = 'feed.html';
            } catch (error) {
                console.error("Erro no login:", error);
                alert(`Erro: ${error.message}`);
            }
        });
    }

    // Cadastro
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('registerEmail').value.trim();
            const password = document.getElementById('registerPassword').value.trim();
            const confirmPassword = document.getElementById('confirmPassword').value.trim();
            const file = profilePictureInput ? profilePictureInput.files[0] : null;

            if (!email || !password || !confirmPassword) {
                uploadStatus.textContent = 'Por favor, preencha todos os campos.';
                uploadStatus.style.display = 'block';
                uploadStatus.style.color = 'red';
                setTimeout(() => { uploadStatus.style.display = 'none'; }, 5000);
                return;
            }

            if (password !== confirmPassword) {
                uploadStatus.textContent = 'As senhas não coincidem.';
                uploadStatus.style.display = 'block';
                uploadStatus.style.color = 'red';
                setTimeout(() => { uploadStatus.style.display = 'none'; }, 5000);
                return;
            }

            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                console.log("Usuário cadastrado:", user.uid);

                let profilePictureUrl = 'https://placehold.co/50x50?text=AV';

                if (file) {
                    profilePictureUrl = await uploadProfilePicture(file, user.uid);
                    if (!profilePictureUrl) {
                        throw new Error('Falha ao fazer upload da imagem de perfil.');
                    }
                    console.log("Imagem de perfil enviada:", profilePictureUrl);
                    uploadStatus.textContent = 'Imagem enviada com sucesso!';
                    uploadStatus.style.display = 'block';
                    uploadStatus.style.color = 'green';
                    setTimeout(() => { uploadStatus.style.display = 'none'; }, 3000);
                }

                await setDoc(doc(db, 'users', user.uid), {
                    email: email,
                    profilePictureUrl: profilePictureUrl,
                    createdAt: serverTimestamp()
                });

                console.log("Dados do usuário salvos no Firestore.");
                window.location.href = 'feed.html';
            } catch (error) {
                console.error("Erro no cadastro:", error);
                uploadStatus.textContent = `Erro: ${error.message}`;
                uploadStatus.style.display = 'block';
                uploadStatus.style.color = 'red';
                setTimeout(() => { uploadStatus.style.display = 'none'; }, 5000);
            }
        });
    }
});