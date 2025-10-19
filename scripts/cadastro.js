// scripts/cadastro.js

document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const firstName = document.getElementById('firstName');
    const lastName = document.getElementById('lastName');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const birthday = document.getElementById('birthday');
    const gender = document.getElementById('gender');
    const terms = document.getElementById('terms');

    // Manejar el envío del formulario de registro
    registerForm.addEventListener('submit', async function(e) { // Adicione 'async' aqui!
        e.preventDefault();
        
        // Validar todos los campos antes de tentar o registro no Firebase
        if (!validateForm()) {
            return; // Se a validação falhar, para por aqui.
        }
        
        // Mostrar estado de carregamento enquanto o Firebase processa
        showLoadingState();
        
        try {
            // Chamada REAL para o Firebase Authentication
            // window.firebaseAuth foi inicializado no seu index.html
            const userCredential = await window.firebaseAuth.createUserWithEmailAndPassword(email.value.trim(), password.value);

            // Se o registro no Firebase foi bem-sucedido:
            // TODO: AQUI VOCÊ PODE ADICIONAR CÓDIGO PARA SALVAR firstName, lastName, birthday, gender
            // Isso seria feito usando o Cloud Firestore, mas vamos focar na autenticação por enquanto.
            // Exemplo (será feito em outro momento):
            // const db = window.firebaseFirestore; // Supondo que você também exporte getFirestore como window.firebaseFirestore
            // await db.collection('users').doc(userCredential.user.uid).set({
            //     firstName: firstName.value.trim(),
            //     lastName: lastName.value.trim(),
            //     email: email.value.trim(),
            //     birthday: birthday.value,
            //     gender: gender.value
            // });

            hideLoadingState(); // Esconde o carregamento
            alert('¡Cuenta creada exitosamente! Redirigindo para o login.'); // Mensagem de sucesso
            window.location.href = 'index.html'; // Redireciona para a página de login
            
        } catch (error) {
            // Se houve um erro no Firebase
            hideLoadingState(); // Esconde o carregamento
            console.error('Erro de registro no Firebase:', error.code, error.message);

            let friendlyErrorMessage = 'Erro ao criar conta. Por favor, tente novamente.';
            if (error.code === 'auth/email-already-in-use') {
                friendlyErrorMessage = 'Este e-mail já está cadastrado. Tente fazer login ou use outro e-mail.';
                showFieldError(email, friendlyErrorMessage); // Exibe erro no campo email
            } else if (error.code === 'auth/invalid-email') {
                friendlyErrorMessage = 'O formato do e-mail é inválido.';
                showFieldError(email, friendlyErrorMessage); // Exibe erro no campo email
            } else if (error.code === 'auth/weak-password') {
                friendlyErrorMessage = 'A senha é muito fraca. Use pelo menos 6 caracteres e combine letras, números e símbolos.';
                showFieldError(password, friendlyErrorMessage); // Exibe erro no campo senha
            } else if (error.code === 'auth/operation-not-allowed') {
                friendlyErrorMessage = 'O registro de e-mail/senha não está ativado. Entre em contato com o suporte.';
            }
            alert(friendlyErrorMessage); // Alerta genérico se não for um erro específico de campo
        }
    });

    // Seus métodos de validação de formulário (validateForm, showFieldError, clearFieldError)
    // Seus métodos de estado de carregamento (showLoadingState, hideLoadingState)
    // Suas validações em tempo real (EventListeners de 'blur')
    // Auto-focus em primeiro campo
    // ... TODO: COLE TODO O RESTO DO SEU SCRIPT A PARTIR DAQUI ...
    // ... (incluindo as funções validateForm, showFieldError, clearFieldError,
    // ... showLoadingState, hideLoadingState e todos os seus addEventListener de 'blur')
    // ...
    function validateForm() {
        let isValid = true;
        // ... sua lógica de validação ...
        // Exemplo:
        if (firstName.value.trim().length < 2) {
            showFieldError(firstName, 'El nombre debe tener al menos 2 caracteres');
            isValid = false;
        } else {
            clearFieldError(firstName);
        }
        // ... e assim por diante para todos os campos ...
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Replicando para clareza
        if (!emailRegex.test(email.value.trim())) {
            showFieldError(email, 'Por favor, ingrese un email válido');
            isValid = false;
        } else {
            clearFieldError(email);
        }

        if (password.value.length < 6) { // Firebase exige mínimo de 6
            showFieldError(password, 'La contraseña debe tener al menos 6 caracteres');
            isValid = false;
        } else {
            clearFieldError(password);
        }
        
        // Validação de termos e condições, etc.
        if (!terms.checked) {
            showFieldError(terms, 'Debe aceptar los términos y condiciones');
            isValid = false;
        } else {
            clearFieldError(terms);
        }

        return isValid;
    }

    function showFieldError(field, message) {
        clearFieldError(field);
        
        field.style.borderColor = '#e74c3c';
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.color = '#e74c3c';
        errorDiv.style.fontSize = '12px';
        errorDiv.style.marginTop = '5px';
        
        // Insere o erro abaixo do campo, se for um input ou select
        if (field.type === 'checkbox') { // Para checkbox como "terms"
            field.parentNode.parentNode.appendChild(errorDiv); // Pode precisar ajustar o parentNode
        } else {
            field.parentNode.appendChild(errorDiv);
        }
    }

    function clearFieldError(field) {
        field.style.borderColor = '#e1e1e1';
        
        // Limpa o erro do checkbox de forma diferente se necessário
        const parent = field.type === 'checkbox' ? field.parentNode.parentNode : field.parentNode;
        const existingError = parent.querySelector('.field-error');

        if (existingError) {
            existingError.remove();
        }
    }

    function showLoadingState() {
        const submitBtn = registerForm.querySelector('button[type="submit"]');
        if (submitBtn) { // Verifica se o botão existe
            submitBtn.disabled = true;
            submitBtn.textContent = 'Criando conta...';
            submitBtn.style.opacity = '0.7';
        }
    }

    function hideLoadingState() {
        const submitBtn = registerForm.querySelector('button[type="submit"]');
        if (submitBtn) { // Verifica se o botão existe
            submitBtn.disabled = false;
            submitBtn.textContent = 'Cadastrar';
            submitBtn.style.opacity = '1';
        }
    }

    // Validação em tempo real (os seus já existentes)
    firstName.addEventListener('blur', function() {
        if (this.value.trim().length < 2) {
            showFieldError(this, 'El nombre debe tener al menos 2 caracteres');
        } else {
            clearFieldError(this);
        }
    });

    lastName.addEventListener('blur', function() {
        if (this.value.trim().length < 2) {
            showFieldError(this, 'El apellido debe tener al menos 2 caracteres');
        } else {
            clearFieldError(this);
        }
    });

    email.addEventListener('blur', function() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.value.trim())) {
            showFieldError(this, 'Por favor, ingrese un email válido');
        } else {
            clearFieldError(this);
        }
    });

    password.addEventListener('blur', function() {
        if (this.value.length < 6) {
            showFieldError(this, 'La contraseña debe tener al menos 6 caracteres');
        } else {
            clearFieldError(this);
        }
    });

    birthday.addEventListener('blur', function() {
        if (!this.value) {
            showFieldError(this, 'Por favor, seleccione su fecha de nacimiento');
        } else {
            const birthDate = new Date(this.value);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            
            if (age < 13 || (age === 13 && monthDiff < 0)) {
                showFieldError(this, 'Debe tener al menos 13 años para registrarse');
            } else {
                clearFieldError(this);
            }
        }
    });

    gender.addEventListener('blur', function() {
        if (!this.value) {
            showFieldError(this, 'Por favor, seleccione su género');
        } else {
            clearFieldError(this);
        }
    });

    terms.addEventListener('change', function() {
        if (!this.checked) {
            showFieldError(this, 'Debe aceptar los términos y condiciones');
        } else {
            clearFieldError(this);
        }
    });


    // Auto-focus en el primer campo
    firstName.focus();
});

