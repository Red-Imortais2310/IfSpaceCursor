// scripts/cadastro.js

console.log("-> cadastro.js starting execution.");

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOMContentLoaded fired in cadastro.js.");

    // Referências aos elementos do DOM
    const registerForm = document.getElementById('registerForm');
    const firstNameInput = document.getElementById('firstName');
    const lastNameInput = document.getElementById('lastName');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const birthdayInput = document.getElementById('birthday');
    const genderSelect = document.getElementById('gender');
    const profilePictureInput = document.getElementById('profilePicture');
    const imagePreview = document.getElementById('imagePreview');
    const termsCheckbox = document.getElementById('terms');
    const errorMessageDiv = document.getElementById('errorMessage'); // Div de erro no HTML
    const loadingStateDiv = document.getElementById('loadingState'); // Div de loading no HTML
    const loadingMessageSpan = document.getElementById('loadingMessage'); // Mensagem de loading no HTML

    // Pré-visualização da imagem de perfil
    if (profilePictureInput && imagePreview) {
        profilePictureInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    imagePreview.src = event.target.result;
                };
                reader.readAsDataURL(file);
            } else {
                imagePreview.src = "https://via.placeholder.com/100?text=Pré-visualização"; // Volta para a imagem padrão
            }
        });
    }

    if (registerForm) {
        console.log("'registerForm' element found.");
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log("Submit event fired on registerForm.");

            hideErrorMessage();

            console.log("Calling validateForm()...");
            if (!validateForm()) {
                console.log("validateForm() returned false. Stopping registration.");
                return;
            }
            console.log("validateForm() returned true. Proceeding with Firebase registration...");

            showLoadingState("Registrando usuário...");

            const email = emailInput.value;
            const password = passwordInput.value;
            const firstName = firstNameInput.value;
            const lastName = lastNameInput.value;
            const birthday = birthdayInput.value;
            const gender = genderSelect.value;
            const profilePictureFile = profilePictureInput.files[0];

            try {
                // 1. Criar usuário no Firebase Authentication
                const userCredential = await window.firebaseCreateUserWithEmailAndPassword(window.firebaseAuth, email, password);
                const user = userCredential.user;
                console.log("User successfully registered in Firebase Auth:", user.uid);
                showLoadingState("Usuário autenticado. Enviando foto de perfil...");

                let profilePictureUrl = '';
                if (profilePictureFile) {
                    // 2. Fazer upload da foto de perfil para o Cloud Storage
                    const storageRef = window.firebaseStorageRef(window.firebaseStorage, `profilePictures/${user.uid}/${profilePictureFile.name}`);
                    const uploadTask = await window.firebaseStorageUploadBytes(storageRef, profilePictureFile);
                    profilePictureUrl = await window.firebaseStorageGetDownloadURL(uploadTask.ref);
                    console.log("Profile picture uploaded to Cloud Storage:", profilePictureUrl);
                } else {
                    console.log("No profile picture selected. Using default.");
                    // Opcional: definir uma URL de imagem padrão aqui se não houver upload
                    // profilePictureUrl = 'URL_DA_SUA_IMAGEM_PADRAO'; 
                }

                // 3. Salvar dados adicionais do usuário (e a URL da foto) no Cloud Firestore
                await window.firebaseFirestoreSetDoc(window.firebaseFirestoreDoc(window.firebaseFirestore, "users", user.uid), {
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    birthday: birthday,
                    gender: gender,
                    profilePictureUrl: profilePictureUrl,
                    createdAt: window.firebaseTimestamp.now()
                });
                console.log("User data successfully saved to Firestore for UID:", user.uid);
                showLoadingState("Dados de perfil salvos. Redirecionando...");

                alert("¡Cuenta creada exitosamente! Redirecionando para o login.");
                window.location.href = 'index.html';

            } catch (error) {
                console.error("Firebase registration error:", error);
                let displayMessage = "Ocorreu um erro ao registrar a conta. Por favor, tente novamente.";

                // Erros comuns do Firebase Authentication
                switch (error.code) {
                    case 'auth/email-already-in-use':
                        displayMessage = 'Este e-mail já está em uso por outra conta.';
                        showFieldError(emailInput, displayMessage);
                        break;
                    case 'auth/invalid-email':
                        displayMessage = 'O formato do e-mail é inválido.';
                        showFieldError(emailInput, displayMessage);
                        break;
                    case 'auth/operation-not-allowed':
                        displayMessage = 'Autenticação por e-mail/senha não está ativada.';
                        break;
                    case 'auth/weak-password':
                        displayMessage = 'A senha é muito fraca. Use pelo menos 6 caracteres.';
                        showFieldError(passwordInput, displayMessage);
                        break;
                    default:
                        displayMessage = `Erro desconhecido: ${error.message}`;
                        break;
                }
                showErrorMessage(displayMessage); // Usa a div de erro
            } finally {
                hideLoadingState();
            }
        });
    } else {
        console.error("Element with ID 'registerForm' not found.");
    }

    function validateForm() {
        console.log("Executing validateForm()...");
        let isValid = true;
        
        // Validações
        if (firstNameInput.value.trim().length < 2) {
            showFieldError(firstNameInput, 'O nome deve ter pelo menos 2 caracteres');
            isValid = false;
        } else {
            clearFieldError(firstNameInput);
        }
        
        if (lastNameInput.value.trim().length < 2) {
            showFieldError(lastNameInput, 'O sobrenome deve ter pelo menos 2 caracteres');
            isValid = false;
        } else {
            clearFieldError(lastNameInput);
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value.trim())) {
            showFieldError(emailInput, 'Por favor, insira um e-mail válido');
            isValid = false;
        } else {
            clearFieldError(emailInput);
        }

        if (passwordInput.value.length < 6) {
            showFieldError(passwordInput, 'A senha deve ter pelo menos 6 caracteres');
            isValid = false;
        } else {
            clearFieldError(passwordInput);
        }
        
        if (!birthdayInput.value) {
            showFieldError(birthdayInput, 'Por favor, selecione sua data de nascimento');
            isValid = false;
        } else {
            const birthDate = new Date(birthdayInput.value);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            
            if (age < 13 || (age === 13 && monthDiff < 0) || (age === 13 && monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                showFieldError(birthdayInput, 'Você deve ter pelo menos 13 anos para se registrar');
                isValid = false;
            } else {
                clearFieldError(birthdayInput);
            }
        }

        if (!genderSelect.value || genderSelect.value === "") {
            showFieldError(genderSelect, 'Por favor, selecione seu gênero');
            isValid = false;
        } else {
            clearFieldError(genderSelect);
        }

        if (!termsCheckbox || !termsCheckbox.checked) {
            showFieldError(termsCheckbox, 'Você deve aceitar os termos e condições');
            isValid = false;
        } else {
            clearFieldError(termsCheckbox);
        }
        
        console.log("validateForm() finished, returning:", isValid);
        return isValid;
    }

    // Funções de feedback visual
    function showFieldError(field, message) {
        clearFieldError(field);
        const parent = field.type === 'checkbox' ? field.parentNode.parentNode : field.parentNode;
        
        field.style.borderColor = '#e74c3c';

        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.color = '#e74c3c';
        errorDiv.style.fontSize = '12px';
        errorDiv.style.marginTop = '5px';
        errorDiv.style.marginBottom = '5px';

        parent.appendChild(errorDiv);
    }

    function clearFieldError(field) {
        const parent = field.type === 'checkbox' ? field.parentNode.parentNode : field.parentNode;
        const existingError = parent.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
        field.style.borderColor = '#e1e1e1';
    }

    function showErrorMessage(message) {
        if (errorMessageDiv) {
            errorMessageDiv.textContent = message;
            errorMessageDiv.style.display = 'block';
        }
    }

    function hideErrorMessage() {
        if (errorMessageDiv) {
            errorMessageDiv.textContent = '';
            errorMessageDiv.style.display = 'none';
        }
    }

    function showLoadingState(message) {
        if (loadingStateDiv && loadingMessageSpan) {
            loadingMessageSpan.textContent = message;
            loadingStateDiv.style.display = 'flex'; 
        }
    }

    function hideLoadingState() {
        if (loadingStateDiv) {
            loadingStateDiv.style.display = 'none';
        }
    }
    
    // Foco inicial
    if (firstNameInput) firstNameInput.focus();
});


