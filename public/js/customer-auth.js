// Customer Authentication Logic

document.addEventListener('DOMContentLoaded', () => {
    // Handle Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const btn = loginForm.querySelector('button[type="submit"]');

            try {
                const btnText = btn.querySelector('.btn-text');
                btnText.textContent = 'Signing In...';
                btn.disabled = true;

                const response = await fetch('/api/auth/customer/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (data.success) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    window.location.href = 'index.html';
                } else {
                    showNotification(data.message, 'error');
                }
            } catch (error) {
                console.error('Login error:', error);
                showNotification('An error occurred. Please try again.', 'error');
            } finally {
                const btnText = btn.querySelector('.btn-text');
                btnText.textContent = 'Sign In';
                btn.disabled = false;
            }
        });
    }

    // Handle Register Form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const btn = registerForm.querySelector('button[type="submit"]');

            try {
                const btnText = btn.querySelector('.btn-text');
                btnText.textContent = 'Creating Account...';
                btn.disabled = true;

                const response = await fetch('/api/auth/customer/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });

                const data = await response.json();

                if (data.success) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    window.location.href = 'index.html';
                } else {
                    showNotification(data.message, 'error');
                }
            } catch (error) {
                console.error('Registration error:', error);
                showNotification('An error occurred. Please try again.', 'error');
            } finally {
                const btnText = btn.querySelector('.btn-text');
                btnText.textContent = 'Create Account';
                btn.disabled = false;
            }
        });
    }

    // Update User Menu based on auth state
    updateUserMenuState();
});

function updateUserMenuState() {
    const user = JSON.parse(localStorage.getItem('user'));
    const userMenuContent = document.querySelector('.user-menu-content');

    if (userMenuContent && user) {
        userMenuContent.innerHTML = `
            <div class="user-auth">
                <h4>Hi, ${user.name}</h4>
                <p>${user.email}</p>
            </div>
            <div class="user-menu-divider"></div>
            <a href="orders.html" class="user-menu-item">My Orders</a>
            <button onclick="logout()" class="user-menu-item" style="color: var(--primary-red);">Logout</button>
        `;
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

window.logout = logout;
