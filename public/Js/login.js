document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');

    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            if (!username.trim() || !password.trim()) {
                loginError.textContent = 'Username and password are required.';
                return;
            }

            fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        window.location.href = '/admin'; // Redirect on success
                    } else {
                        throw new Error(data.message || 'Invalid credentials');
                    }
                })
                .catch(error => {
                    console.error('Login Error:', error);
                    loginError.textContent = 'Login failed: ' + error.message;
                });
        });
    }
});
