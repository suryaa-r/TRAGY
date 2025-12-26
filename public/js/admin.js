// Admin Dashboard JavaScript
let currentUser = null;
let currentSection = 'overview';

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    setupEventListeners();
});

// Authentication Functions
function checkAuth() {
    const token = localStorage.getItem('adminToken');
    if (token) {
        // Verify token with server
        fetch('/api/auth/verify', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                currentUser = data.user;
                showDashboard();
                loadDashboardData();
            } else {
                showLogin();
            }
        })
        .catch(() => showLogin());
    } else {
        showLogin();
    }
}

function showLogin() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('dashboard').classList.add('hidden');
}

function showDashboard() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('dashboard').classList.remove('hidden');
    document.getElementById('currentUser').textContent = currentUser?.name || 'Admin User';
}

function showRegister() {
    document.getElementById('loginForm').classList.remove('active');
    document.getElementById('registerForm').classList.add('active');
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}

function showLoginForm() {
    document.getElementById('registerForm').classList.remove('active');
    document.getElementById('loginForm').classList.add('active');
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}

// Event Listeners
function setupEventListeners() {
    // Login Form
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                localStorage.setItem('adminToken', data.token);
                currentUser = data.user;
                showDashboard();
                loadDashboardData();
                showNotification('Login successful!', 'success');
            } else {
                showNotification(data.message || 'Login failed', 'error');
            }
        } catch (error) {
            showNotification('Login failed. Please try again.', 'error');
        }
    });
    
    // Register Form
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const role = document.getElementById('registerRole').value;
        
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role })
            });
            
            const data = await response.json();
            
            if (data.success) {
                showNotification('Account created successfully!', 'success');
                showLoginForm();
            } else {
                showNotification(data.message || 'Registration failed', 'error');
            }
        } catch (error) {
            showNotification('Registration failed. Please try again.', 'error');
        }
    });
    
    // Add Product Form
    document.getElementById('addProductForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const productData = {
            name: document.getElementById('productName').value,
            price: parseFloat(document.getElementById('productPrice').value),
            category: document.getElementById('productCategory').value,
            description: document.getElementById('productDescription').value,
            image: document.getElementById('productImage').value,
            sizes: document.getElementById('productSizes').value.split(',').map(s => s.trim()),
            stock: parseInt(document.getElementById('productStock').value)
        };
        
        try {
            const response = await fetch('/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: JSON.stringify(productData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                showNotification('Product added successfully!', 'success');
                closeModal('addProductModal');
                loadProducts();
                document.getElementById('addProductForm').reset();
                
                // Notify that website data should be refreshed
                broadcastProductUpdate();
            } else {
                showNotification(data.message || 'Failed to add product', 'error');
            }
        } catch (error) {
            showNotification('Failed to add product. Please try again.', 'error');
        }
    });
}

// Navigation Functions
function showSection(section) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    
    // Show selected section
    document.getElementById(section + 'Section').classList.add('active');
    event.target.classList.add('active');
    
    // Update section title
    const titles = {
        overview: 'Dashboard Overview',
        products: 'Product Management',
        orders: 'Order Management',
        customers: 'Customer Management',
        analytics: 'Analytics & Reports',
        settings: 'Settings'
    };
    
    document.getElementById('sectionTitle').textContent = titles[section];
    currentSection = section;
    
    // Load section data
    loadSectionData(section);
}

function loadSectionData(section) {
    switch(section) {
        case 'overview':
            loadDashboardData();
            break;
        case 'products':
            loadProducts();
            break;
        case 'orders':
            loadOrders();
            break;
        case 'customers':
            loadCustomers();
            break;
        case 'analytics':
            loadAnalytics();
            break;
        case 'settings':
            loadSettings();
            break;
    }
}

// Data Loading Functions
async function loadDashboardData() {
    try {
        const response = await fetch('/api/dashboard/stats', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        });
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('totalSales').textContent = `₹${data.stats.totalSales.toLocaleString()}`;
            document.getElementById('totalOrders').textContent = data.stats.totalOrders;
            document.getElementById('totalProducts').textContent = data.stats.totalProducts;
            document.getElementById('totalCustomers').textContent = data.stats.totalCustomers;
            
            loadRecentOrders();
            loadTopProducts();
        }
    } catch (error) {
        console.error('Failed to load dashboard data:', error);
    }
}

async function loadProducts() {
    try {
        const response = await fetch('/api/products', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        });
        const data = await response.json();
        
        if (data.success) {
            const tbody = document.getElementById('productsTable');
            tbody.innerHTML = data.products.map(product => `
                <tr>
                    <td><img src="${product.image}" alt="${product.name}" class="product-image"></td>
                    <td>${product.name}</td>
                    <td>₹${product.price}</td>
                    <td>${product.category}</td>
                    <td>${product.stock || 0}</td>
                    <td>
                        <button class="action-btn btn-edit" onclick="editProduct(${product.id})">Edit</button>
                        <button class="action-btn btn-delete" onclick="deleteProduct(${product.id})">Delete</button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Failed to load products:', error);
    }
}

async function loadOrders() {
    try {
        const response = await fetch('/api/orders', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        });
        const data = await response.json();
        
        if (data.success) {
            const tbody = document.getElementById('ordersTable');
            tbody.innerHTML = data.orders.map(order => `
                <tr>
                    <td>#${order.id}</td>
                    <td>${order.customerName}</td>
                    <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>₹${order.total}</td>
                    <td><span class="status-badge status-${order.status}">${order.status}</span></td>
                    <td>
                        <button class="action-btn btn-view" onclick="viewOrder(${order.id})">View</button>
                        <button class="action-btn btn-edit" onclick="updateOrderStatus(${order.id})">Update</button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Failed to load orders:', error);
    }
}

async function loadCustomers() {
    try {
        const response = await fetch('/api/customers', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        });
        const data = await response.json();
        
        if (data.success) {
            const tbody = document.getElementById('customersTable');
            tbody.innerHTML = data.customers.map(customer => `
                <tr>
                    <td>${customer.name}</td>
                    <td>${customer.email}</td>
                    <td>${customer.orderCount || 0}</td>
                    <td>₹${customer.totalSpent || 0}</td>
                    <td>${new Date(customer.createdAt).toLocaleDateString()}</td>
                    <td>
                        <button class="action-btn btn-view" onclick="viewCustomer(${customer.id})">View</button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Failed to load customers:', error);
    }
}

async function loadRecentOrders() {
    try {
        const response = await fetch('/api/orders/recent', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        });
        const data = await response.json();
        
        if (data.success) {
            const container = document.getElementById('recentOrders');
            container.innerHTML = data.orders.map(order => `
                <div class="order-item" style="padding: 1rem; border-bottom: 1px solid #eee;">
                    <div style="display: flex; justify-content: space-between;">
                        <span>#${order.id} - ${order.customerName}</span>
                        <span>₹${order.total}</span>
                    </div>
                    <small style="color: #666;">${new Date(order.createdAt).toLocaleDateString()}</small>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Failed to load recent orders:', error);
    }
}

async function loadTopProducts() {
    try {
        const response = await fetch('/api/products/top', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        });
        const data = await response.json();
        
        if (data.success) {
            const container = document.getElementById('topProducts');
            container.innerHTML = data.products.map(product => `
                <div class="product-item" style="padding: 1rem; border-bottom: 1px solid #eee;">
                    <div style="display: flex; justify-content: space-between;">
                        <span>${product.name}</span>
                        <span>${product.salesCount} sold</span>
                    </div>
                    <small style="color: #666;">₹${product.price}</small>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Failed to load top products:', error);
    }
}

// Modal Functions
function showAddProduct() {
    document.getElementById('addProductModal').classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Product Functions
async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
        const response = await fetch(`/api/products/${productId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Product deleted successfully!', 'success');
            loadProducts();
            
            // Notify that website data should be refreshed
            broadcastProductUpdate();
        } else {
            showNotification(data.message || 'Failed to delete product', 'error');
        }
    } catch (error) {
        showNotification('Failed to delete product. Please try again.', 'error');
    }
}

// Search and Filter Functions
function searchProducts() {
    const query = document.getElementById('productSearch').value;
    // Implement search functionality
    console.log('Searching for:', query);
}

function filterOrders() {
    const status = document.getElementById('orderStatus').value;
    // Implement filter functionality
    console.log('Filtering by status:', status);
}

// Utility Functions
function logout() {
    localStorage.removeItem('adminToken');
    currentUser = null;
    showLogin();
    showNotification('Logged out successfully', 'info');
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 2rem;
        border-radius: 8px;
        color: white;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
    `;
    
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };
    
    notification.style.background = colors[type] || colors.info;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }
    
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// Broadcast product updates to main website
function broadcastProductUpdate() {
    // Use localStorage to signal other tabs to refresh
    localStorage.setItem('productUpdate', Date.now().toString());
    
    // Update sync status
    updateSyncStatus('syncing');
    
    setTimeout(() => {
        localStorage.removeItem('productUpdate');
        updateSyncStatus('synced');
    }, 1000);
}

// Update sync status indicator
function updateSyncStatus(status) {
    const syncStatus = document.getElementById('syncStatus');
    if (!syncStatus) return;
    
    if (status === 'syncing') {
        syncStatus.style.background = '#ffc107';
        syncStatus.innerHTML = `
            <span style="width: 8px; height: 8px; background: white; border-radius: 50%; animation: spin 1s linear infinite;"></span>
            Syncing...
        `;
    } else {
        syncStatus.style.background = '#28a745';
        syncStatus.innerHTML = `
            <span style="width: 8px; height: 8px; background: white; border-radius: 50%; animation: pulse 2s infinite;"></span>
            Website Synced
        `;
    }
}