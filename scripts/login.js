document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const forgotPasswordLink = document.getElementById('forgotPassword');
    const registerLink = document.getElementById('register');
    const rememberCheckbox = document.getElementById('remember');

    // Manejar el envío del formulario de login
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        if (!email || !password) {
            alert('Por favor, complete todos los campos');
            return;
        }
        
        // Simular validación de login
        if (email === 'admin@ifspace.com' && password === '123456') {
            // Guardar datos si "Salvar senha" está marcado
            if (rememberCheckbox.checked) {
                localStorage.setItem('ifspace_email', email);
                localStorage.setItem('ifspace_password', password);
            }
            
            // Redirigir al feed
            window.location.href = 'feed.html';
        } else {
            alert('Email o contraseña incorrectos');
        }
    });

    // Manejar click en "Esqueceu sua senha?"
    forgotPasswordLink.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'recuperar-senha.html';
    });

    // Manejar click en "Cadastrar"
    registerLink.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'cadastro.html';
    });

    // Cargar datos guardados si existen
    const savedEmail = localStorage.getItem('ifspace_email');
    const savedPassword = localStorage.getItem('ifspace_password');
    
    if (savedEmail && savedPassword) {
        document.getElementById('email').value = savedEmail;
        document.getElementById('password').value = savedPassword;
        rememberCheckbox.checked = true;
    }
});
