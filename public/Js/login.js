// login.js
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError'); // Assume there's an error display element in your HTML

    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            })
                .then(response => {
                    if (!response.ok) {
                        return response.json().then(error => Promise.reject(error));
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.success) {
                        window.location.href = 'admin';
                    } else {
                        throw new Error('Invalid credentials'); // Generic error for security
                    }
                })
                .catch(error => {
                    console.error('Login Error:', error);
                    loginError.textContent = 'Login failed: ' + error.message; // Display error without alert
                    document.getElementById('password').value = ''; // Clear password field
                });
        });
    }
});
