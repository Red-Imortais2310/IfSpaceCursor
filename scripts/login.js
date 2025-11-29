// scripts/login.js
import { auth, db, uploadProfilePicture } from './firebase-config.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { doc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const showRegisterFormLink = document.getElementById('showRegisterForm');
    const backToLoginLink = document.getElementById('backToLogin');
    // Botão opcional para escolher foto (não existe no modal padrão — usamos input direto)
    const selectProfilePictureBtn = null;
    const profilePictureInput = document.getElementById('registerProfilePicture');
    const profileImagePreview = document.getElementById('registerImagePreview');
    const uploadStatus = document.getElementById('registerErrorMessage');

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
    if (profilePictureInput) {
        if (selectProfilePictureBtn) {
            selectProfilePictureBtn.addEventListener('click', () => {
                profilePictureInput.click();
            });
        }

        profilePictureInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && profileImagePreview) {
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
            // No confirmPassword field in the new modal; do not require confirmation here as cadastro.html does not have it
            const file = profilePictureInput ? profilePictureInput.files[0] : null;

            if (!email || !password) {
                uploadStatus.textContent = 'Por favor, preencha todos os campos.';
                uploadStatus.style.display = 'block';
                uploadStatus.style.color = 'red';
                setTimeout(() => { uploadStatus.style.display = 'none'; }, 5000);
                return;
            }

            // Não há campo de confirmação de senha neste módulo (consistente com cadastro.html)

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

                                // Pegar os dados do formulário de cadastro (nome dividido)
                                const firstName = document.getElementById('registerFirstName').value.trim();
                                const lastName = document.getElementById('registerLastName').value.trim();
                                const fullName = `${firstName} ${lastName}`.trim();

                                const birthday = document.getElementById('registerBirthday') ? document.getElementById('registerBirthday').value : '';
                                const gender = document.getElementById('registerGender') ? document.getElementById('registerGender').value : '';
                                const termsChecked = document.getElementById('registerTerms') ? document.getElementById('registerTerms').checked : true;

                                if (!firstName || !lastName) {
                                        uploadStatus.textContent = 'Por favor, preencha nome e sobrenome.';
                                        uploadStatus.style.display = 'block';
                                        uploadStatus.style.color = 'red';
                                        setTimeout(() => { uploadStatus.style.display = 'none'; }, 5000);
                                        return;
                                }

                                if (!termsChecked) {
                                        uploadStatus.textContent = 'Por favor, aceite os termos de uso.';
                                        uploadStatus.style.display = 'block';
                                        uploadStatus.style.color = 'red';
                                        setTimeout(() => { uploadStatus.style.display = 'none'; }, 5000);
                                        return;
                                }

                await setDoc(doc(db, 'users', user.uid), {
                    fullName: fullName,                    // ← AQUI ESTÁ O NOME!
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    profilePictureUrl: profilePictureUrl,
                    birthday: birthday,
                    gender: gender,
                    createdAt: serverTimestamp()
                });

                console.log("Dados do usuário salvos no Firestore.");
                // Salvar informações no localStorage para a tela de boas-vindas
                try {
                    localStorage.setItem('ifspace_fullName', fullName);
                    localStorage.setItem('ifspace_profilePicture', profilePictureUrl || 'https://placehold.co/100x100?text=AV');
                    console.log('localStorage salvo:', {
                        ifspace_fullName: localStorage.getItem('ifspace_fullName'),
                        ifspace_profilePicture: localStorage.getItem('ifspace_profilePicture')
                    });
                } catch (err) {
                    console.warn('Não foi possível salvar dados no localStorage:', err);
                }
                // Redirecionar para a tela de boas-vindas
                window.location.href = 'bem-vindo.html';
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