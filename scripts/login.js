// scripts/login.js

console.log("-> login.js starting execution (before DOMContentLoaded)."); // DEBUG

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOMContentLoaded fired in login.js."); // DEBUG

    const loginForm = document.getElementById('loginForm');
    const forgotPasswordLink = document.getElementById('forgotPassword');
    const registerLink = document.getElementById('register');
    const rememberCheckbox = document.getElementById('remember');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    if (!loginForm) {
        console.error("ERROR: 'loginForm' (ID) not found in the HTML! Submit listener NOT attached."); // CRITICAL DEBUG
        return;
    } else {
        console.log("'loginForm' element found."); // DEBUG
    }

    // --- MANEJAR O ENVIO DO FORMULÁRIO DE LOGIN ---
    loginForm.addEventListener('submit', async function(e) { // Adicione 'async' aqui!
        console.log("Submit event fired on loginForm."); // DEBUG
        e.preventDefault(); // Impede o envio padrão do formulário
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        if (!email || !password) {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        try {
            console.log("Attempting Firebase login with email:", email); // DEBUG
            // Chamada REAL para o Firebase Authentication para fazer login
            const userCredential = await window.firebaseSignInWithEmailAndPassword(window.firebaseAuth, email, password);
            
            console.log('Usuário logado com sucesso no Firebase:', userCredential.user); // DEBUG

            // Salvar APENAS o email no localStorage se "Salvar email" estiver marcado
            if (rememberCheckbox.checked) {
                localStorage.setItem('ifspace_email', email);
                // NUNCA SALVE A SENHA NO LOCALSTORAGE POR RAZÕES DE SEGURANÇA!
            } else {
                localStorage.removeItem('ifspace_email'); // Se desmarcado, remove o email salvo
            }
            
            // Redirecionar para o feed após o login bem-sucedido
            alert('Login bem-sucedido! Redirecionando para o feed...');
            window.location.href = 'feed.html';

        } catch (error) {
            console.error('Erro ao fazer login no Firebase:', error.code, error.message); // DEBUG
            let friendlyErrorMessage = 'Erro ao fazer login. Por favor, tente novamente.';

            if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
                friendlyErrorMessage = 'Email ou senha incorretos.';
            } else if (error.code === 'auth/invalid-email') {
                friendlyErrorMessage = 'O formato do e-mail é inválido.';
            } else if (error.code === 'auth/user-disabled') {
                friendlyErrorMessage = 'Esta conta foi desativada.';
            } else {
                 friendlyErrorMessage += ` (Detalhe: ${error.message})`; // Fallback para outros erros
            }
            alert(friendlyErrorMessage);
        }
    });

    // --- MANEJAR CLICKS DOS LINKS ---
    forgotPasswordLink.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'recuperar-senha.html';
    });

    registerLink.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'cadastro.html';
    });

    // --- CARREGAR DADOS SALVOS (EMAIL APENAS) ---
    const savedEmail = localStorage.getItem('ifspace_email');
    
    if (savedEmail) {
        emailInput.value = savedEmail;
        rememberCheckbox.checked = true; // Marca a caixa se houver email salvo
    }
    // As credenciais de login simuladas foram removidas daqui
});
