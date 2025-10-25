// scripts/cadastro.js
import { auth, db, uploadProfilePicture } from './firebase-config.js';
import { createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { doc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const signupEmail = document.getElementById('signupEmail');
    const signupPassword = document.getElementById('signupPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    const profilePictureInput = document.getElementById('registerProfilePictureInput');
    const profileImagePreview = document.getElementById('registerProfileImagePreview');
    const uploadStatus = document.getElementById('registerUploadStatus');

    if (profilePictureInput && profileImagePreview) {
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

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = signupEmail.value.trim();
            const password = signupPassword.value.trim();
            const confirmPass = confirmPassword ? confirmPassword.value.trim() : password;
            const file = profilePictureInput ? profilePictureInput.files[0] : null;

            if (!email || !password || !confirmPass) {
                uploadStatus.textContent = 'Por favor, preencha todos os campos.';
                uploadStatus.style.display = 'block';
                uploadStatus.style.color = 'red';
                setTimeout(() => { uploadStatus.style.display = 'none'; }, 5000);
                return;
            }

            if (password !== confirmPass) {
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

