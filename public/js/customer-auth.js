// Customer Authentication Logic

document.addEventListener('DOMContentLoaded', () => {
    // Add test user if no users exist
    const existingUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    if (existingUsers.length === 0) {
        const testUser = {
            id: 1,
            name: 'Test User',
            email: 'test@tragy.com',
            password: 'test123',
            createdAt: new Date().toISOString()
        };
        localStorage.setItem('registeredUsers', JSON.stringify([testUser]));
        console.log('Test user created: test@tragy.com / test123');
    }

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

                // Check localStorage for registered users
                const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
                console.log('Registered users:', registeredUsers);
                console.log('Login attempt:', { email, password });
                const user = registeredUsers.find(u => u.email === email && u.password === password);
                console.log('Found user:', user);

                if (user) {
                    const userSession = { id: user.id, name: user.name, email: user.email };
                    localStorage.setItem('user', JSON.stringify(userSession));
                    showNotification('Login successful!', 'success');
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1000);
                } else {
                    showNotification('Invalid email or password.', 'error');
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

                // Check if user already exists
                const existingUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
                if (existingUsers.find(user => user.email === email)) {
                    showNotification('Email already registered. Please use a different email.', 'error');
                    return;
                }

                // Create new user
                const newUser = {
                    id: Date.now(),
                    name,
                    email,
                    password, // In production, this should be hashed
                    createdAt: new Date().toISOString()
                };

                // Save to localStorage
                existingUsers.push(newUser);
                localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
                
                // Auto-login the user
                const userSession = { id: newUser.id, name: newUser.name, email: newUser.email };
                localStorage.setItem('user', JSON.stringify(userSession));
                
                showNotification('Account created successfully!', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
                
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
