// login.js
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent the form from submitting via the browser

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to login');
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.success) {
                        window.location.href = '/admin.html'; // Redirect to the admin page
                    } else {
                        alert('Login failed: ' + (data.error || 'Invalid credentials'));
                    }
                })
                .catch(error => {
                    console.error('Login Error:', error);
                    alert('Login failed: ' + error.message);
                });
        });
    }
});
