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
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validar todos los campos
        if (!validateForm()) {
            return;
        }
        
        // Simular proceso de registro
        showLoadingState();
        
        setTimeout(() => {
            hideLoadingState();
            alert('¡Cuenta creada exitosamente! Ahora puede iniciar sesión.');
            // Redirigir al login
            window.location.href = 'index.html';
        }, 2000);
    });

    function validateForm() {
        let isValid = true;
        
        // Validar nombre
        if (firstName.value.trim().length < 2) {
            showFieldError(firstName, 'El nombre debe tener al menos 2 caracteres');
            isValid = false;
        } else {
            clearFieldError(firstName);
        }
        
        // Validar apellido
        if (lastName.value.trim().length < 2) {
            showFieldError(lastName, 'El apellido debe tener al menos 2 caracteres');
            isValid = false;
        } else {
            clearFieldError(lastName);
        }
        
        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.value.trim())) {
            showFieldError(email, 'Por favor, ingrese un email válido');
            isValid = false;
        } else {
            clearFieldError(email);
        }
        
        // Validar contraseña
        if (password.value.length < 6) {
            showFieldError(password, 'La contraseña debe tener al menos 6 caracteres');
            isValid = false;
        } else {
            clearFieldError(password);
        }
        
        // Validar fecha de nacimiento
        if (!birthday.value) {
            showFieldError(birthday, 'Por favor, seleccione su fecha de nacimiento');
            isValid = false;
        } else {
            // Validar edad mínima (13 años)
            const birthDate = new Date(birthday.value);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            
            if (age < 13 || (age === 13 && monthDiff < 0)) {
                showFieldError(birthday, 'Debe tener al menos 13 años para registrarse');
                isValid = false;
            } else {
                clearFieldError(birthday);
            }
        }
        
        // Validar género
        if (!gender.value) {
            showFieldError(gender, 'Por favor, seleccione su género');
            isValid = false;
        } else {
            clearFieldError(gender);
        }
        
        // Validar términos y condiciones
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
        
        field.parentNode.appendChild(errorDiv);
    }

    function clearFieldError(field) {
        field.style.borderColor = '#e1e1e1';
        
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }

    function showLoadingState() {
        const submitBtn = registerForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Criando conta...';
        submitBtn.style.opacity = '0.7';
    }

    function hideLoadingState() {
        const submitBtn = registerForm.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Cadastrar';
        submitBtn.style.opacity = '1';
    }

    // Validación en tiempo real
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

    // Auto-focus en el primer campo
    firstName.focus();
});
