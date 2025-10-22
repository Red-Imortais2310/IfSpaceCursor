// scripts/login.js

console.log("-> login.js starting execution (before DOMContentLoaded)."); // DEBUG

// Importar funções do Firebase
import { loginUser, onAuthStateChange } from './firebase-config.js';

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
            
            // Usar a função do firebase-config.js
            const result = await loginUser(email, password);
            
            if (result.success) {
                console.log('Usuário logado com sucesso no Firebase:', result.user); // DEBUG

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
            } else {
                alert('Erro ao fazer login: ' + result.error);
            }

        } catch (error) {
            console.error('Erro ao fazer login no Firebase:', error); // DEBUG
            alert('Erro ao fazer login: ' + error.message);
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
