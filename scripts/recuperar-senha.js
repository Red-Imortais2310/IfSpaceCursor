document.addEventListener('DOMContentLoaded', function() {
    const recoveryForm = document.getElementById('recoveryForm');
    const recoveryEmail = document.getElementById('recoveryEmail');

    // Manejar el envío del formulario de recuperación
    recoveryForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = recoveryEmail.value.trim();
        
        if (!email) {
            alert('Por favor, ingrese su email');
            return;
        }
        
        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Por favor, ingrese un email válido');
            return;
        }
        
        // Simular envío de email de recuperación
        showLoadingState();
        
        setTimeout(() => {
            hideLoadingState();
            alert('Se ha enviado un enlace de recuperación a su email. Revise su bandeja de entrada.');
            // En una implementación real, aquí se enviaría el email
            console.log('Email de recuperación enviado a:', email);
        }, 2000);
    });

    function showLoadingState() {
        const submitBtn = recoveryForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';
        submitBtn.style.opacity = '0.7';
    }

    function hideLoadingState() {
        const submitBtn = recoveryForm.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar Link de Recuperación';
        submitBtn.style.opacity = '1';
    }

    // Auto-focus en el campo de email
    recoveryEmail.focus();
});
