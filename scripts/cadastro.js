// scripts/cadastro.js
import { auth, db, uploadProfilePicture } from './firebase-config.js';
import { createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { doc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('registerForm'); // registerForm no HTML
    const signupEmail = document.getElementById('email');
    const signupPassword = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword'); // pode ser nulo se campo não existir
    const profilePictureInput = document.getElementById('profilePicture');
    const profileImagePreview = document.getElementById('imagePreview');
    const uploadStatus = document.getElementById('errorMessage'); // reaproveitar div de erro/aviso

    if (profilePictureInput && profileImagePreview) {
        profilePictureInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    profileImagePreview.src = event.target.result;
                    if (uploadStatus) {
                        uploadStatus.textContent = 'Imagem selecionada!';
                        uploadStatus.style.display = 'block';
                        uploadStatus.style.color = 'green';
                        setTimeout(() => { uploadStatus.style.display = 'none'; }, 3000);
                    }
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
                    if (uploadStatus) {
                        uploadStatus.textContent = 'Imagem enviada com sucesso!';
                        uploadStatus.style.display = 'block';
                        uploadStatus.style.color = 'green';
                        setTimeout(() => { uploadStatus.style.display = 'none'; }, 3000);
                    }
                }

                                // ==== PEGAR DADOS DO FORMULÁRIO DE CADASTRO ====
                const firstName = document.getElementById('firstName').value.trim();
                const lastName  = document.getElementById('lastName').value.trim();
                const fullName  = `${firstName} ${lastName}`.trim();

                const birthday = document.getElementById('birthday').value;
                const gender   = document.getElementById('gender').value;

                // Validação básica do nome
                if (!firstName || !lastName) {
                    document.getElementById('errorMessage').textContent = 'Preencha nome e sobrenome.';
                    document.getElementById('errorMessage').style.display = 'block';
                    hideLoadingState();
                    return;
                }

                // ==== SALVAR TODOS OS DADOS NO FIRESTORE (incluindo o NOME!) ====
                await setDoc(doc(db, "users", user.uid), {
                    fullName: fullName,                    // ← ESSA LINHA É A CHAVE!
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    profilePictureUrl: profilePictureUrl || 'https://placehold.co/100x100?text=AV',
                    birthday: birthday,
                    gender: gender,
                    createdAt: serverTimestamp()
                });

                console.log("Perfil completo salvo no Firestore com nome:", fullName);

                console.log("Dados do usuário salvos no Firestore.");
                // Salvar informações do usuário no localStorage para a tela de boas-vindas
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

