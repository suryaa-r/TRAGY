// Global state management - ensure variables are on window object
window.cart = JSON.parse(localStorage.getItem('cart')) || [];
window.wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
window.user = JSON.parse(localStorage.getItem('user')) || null;
window.cartOpen = false;
window.mobileMenuOpen = false;
window.searchOpen = false;
window.userMenuOpen = false;

// Product data - will be loaded from database
let products = {};

// Load products from database
async function loadProducts() {
    try {
        const response = await fetch('/api/public/products');
        const data = await response.json();
        
        if (data.success) {
            // Convert array to object for easy lookup
            products = {};
            data.products.forEach(product => {
                products[product.id] = {
                    ...product,
                    sizes: typeof product.sizes === 'string' ? JSON.parse(product.sizes) : product.sizes
                };
            });
            
            // Update product displays
            updateProductDisplays();
        }
    } catch (error) {
        console.error('Failed to load products:', error);
        // Fallback to sample data if database fails
        products = {
            1: { id: 1, name: 'Oversized Graphic Tee', price: 1299, category: 'tshirts', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop', description: 'Premium cotton oversized streetwear tee', sizes: ['S', 'M', 'L', 'XL', 'XXL'] },
            2: { id: 2, name: 'Vintage Streetwear Tee', price: 1199, category: 'tshirts', image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop', description: 'Retro-inspired street style t-shirt', sizes: ['S', 'M', 'L', 'XL', 'XXL'] },
            3: { id: 3, name: 'Urban Logo Tee', price: 999, category: 'tshirts', image: 'https://images.unsplash.com/photo-1583743814966-8936f37f4678?w=400&h=400&fit=crop', description: 'Minimalist logo design streetwear', sizes: ['S', 'M', 'L', 'XL', 'XXL'] }
        };
    }
}

// Update product displays on homepage
function updateProductDisplays() {
    const productArray = Object.values(products);
    
    // Update featured products
    const featuredContainer = document.getElementById('featuredProducts');
    if (featuredContainer && productArray.length > 0) {
        featuredContainer.innerHTML = productArray.slice(0, 3).map(product => `
            <div class="product-card" onclick="viewProduct(${product.id})">
                <div class="product-image">
                    <img src="${product.image || 'images/loading.png'}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;">
                    <div class="product-overlay">
                        <button class="quick-view-btn">Quick View</button>
                    </div>
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-price">₹${product.price}</p>
                </div>
            </div>
        `).join('');
    }
    
    // Update best sellers
    const bestSellersContainer = document.getElementById('bestSellers');
    if (bestSellersContainer && productArray.length > 3) {
        bestSellersContainer.innerHTML = productArray.slice(3, 6).map(product => `
            <div class="product-card" onclick="viewProduct(${product.id})">
                <div class="product-image">
                    <img src="${product.image || 'images/loading.png'}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-price">₹${product.price}</p>
                </div>
            </div>
        `).join('');
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    updateCartDisplay();
    createSearchModal();
    createUserMenu();
    loadProducts(); // Load products from database
    
    // Listen for product updates from admin
    window.addEventListener('storage', function(e) {
        if (e.key === 'productUpdate') {
            loadProducts(); // Refresh products when admin makes changes
        }
    });
});

// Cart functionality
function addToCart(productId = 1, name, price, size = 'M', quantity = 1) {
    const product = products[productId] || { id: productId, name: name || 'Product', price: price || 0 };
    
    const existingItem = window.cart.find(item => 
        item.id === productId && item.size === size
    );
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        window.cart.push({
            id: productId,
            name: product.name,
            price: product.price,
            size: size,
            quantity: quantity,
            image: product.image
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(window.cart));
    updateCartCount();
    updateCartDisplay();
    showNotification(`${product.name} added to cart!`, 'success');
}

function removeFromCart(productId, size) {
    const item = window.cart.find(item => item.id === productId && item.size === size);
    window.cart = window.cart.filter(item => !(item.id === productId && item.size === size));
    localStorage.setItem('cart', JSON.stringify(window.cart));
    updateCartCount();
    updateCartDisplay();
    showNotification(`${item ? item.name : 'Item'} removed from cart`, 'info');
}

function updateCartCount() {
    const count = window.cart.reduce((total, item) => total + item.quantity, 0);
    const cartCountElements = document.querySelectorAll('#cartCount');
    cartCountElements.forEach(element => {
        if (element) {
            element.textContent = count;
            element.style.display = count > 0 ? 'flex' : 'none';
        }
    });
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (!cartItems || !cartTotal) return;
    
    if (window.cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart" style="text-align: center; padding: 3rem 0; color: #999;">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="margin-bottom: 1rem; opacity: 0.5;">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <path d="m16 10a4 4 0 0 1-8 0"></path>
                </svg>
                <p>Your cart is empty</p>
                <p style="font-size: 0.9rem; margin-top: 0.5rem;">Add some items to get started</p>
            </div>
        `;
        cartTotal.textContent = '₹0';
        return;
    }
    
    let total = 0;
    cartItems.innerHTML = window.cart.map((item, index) => {
        total += item.price * item.quantity;
        return `
            <div class="cart-item" style="display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 0; border-bottom: 1px solid #eee;">
                <div style="flex: 1;">
                    <h4 style="margin-bottom: 0.5rem; font-size: 1rem;">${item.name}</h4>
                    <p style="color: #666; font-size: 0.9rem; margin-bottom: 0.5rem;">Size: ${item.size}</p>
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <div style="display: flex; align-items: center; border: 1px solid #ddd; border-radius: 4px;">
                            <button onclick="updateCartQuantity(${item.id}, '${item.size}', -1)" style="background: none; border: none; padding: 0.25rem 0.5rem; cursor: pointer;">-</button>
                            <span style="padding: 0.25rem 0.5rem; min-width: 30px; text-align: center;">${item.quantity}</span>
                            <button onclick="updateCartQuantity(${item.id}, '${item.size}', 1)" style="background: none; border: none; padding: 0.25rem 0.5rem; cursor: pointer;">+</button>
                        </div>
                        <p style="color: var(--primary-red); font-weight: 600;">₹${item.price * item.quantity}</p>
                    </div>
                </div>
                <button onclick="removeFromCart(${item.id}, '${item.size}')" style="background: none; border: none; color: #999; cursor: pointer; font-size: 1.5rem; padding: 0.5rem;">&times;</button>
            </div>
        `;
    }).join('');
    
    cartTotal.textContent = `₹${total}`;
}

function updateCartQuantity(productId, size, change) {
    const item = window.cart.find(item => item.id === productId && item.size === size);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId, size);
        } else {
            localStorage.setItem('cart', JSON.stringify(window.cart));
            updateCartCount();
            updateCartDisplay();
        }
    }
}

// Search functionality
function createSearchModal() {
    if (document.getElementById('searchModal')) return;
    
    const searchModal = document.createElement('div');
    searchModal.id = 'searchModal';
    searchModal.innerHTML = `
        <div class="search-overlay" onclick="toggleSearch()"></div>
        <div class="search-container">
            <div class="search-header">
                <h3>Search Products</h3>
                <button class="search-close" onclick="toggleSearch()">&times;</button>
            </div>
            <div class="search-input-container">
                <input type="text" id="searchInput" placeholder="Search for products..." autocomplete="off">
                <button class="search-btn" onclick="performSearch()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                </button>
            </div>
            <div class="search-results" id="searchResults">
                <div class="search-suggestions">
                    <h4>Popular Searches</h4>
                    <div class="suggestion-tags">
                        <span onclick="searchFor('tshirt')">T-Shirts</span>
                        <span onclick="searchFor('streetwear')">Streetwear</span>
                        <span onclick="searchFor('oversized')">Oversized</span>
                        <span onclick="searchFor('graphic')">Graphic Tees</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(searchModal);
}

function performSearch() {
    const query = document.getElementById('searchInput').value.trim().toLowerCase();
    if (!query) return;
    
    const results = Object.values(products).filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
    );
    
    displaySearchResults(results, query);
}

function searchFor(term) {
    document.getElementById('searchInput').value = term;
    performSearch();
}

function displaySearchResults(results, query) {
    const searchResults = document.getElementById('searchResults');
    
    if (results.length === 0) {
        searchResults.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #666;">
                <p>No results found for "${query}"</p>
                <p style="font-size: 0.9rem; margin-top: 0.5rem;">Try searching for t-shirts or streetwear</p>
            </div>
        `;
        return;
    }
    
    searchResults.innerHTML = `
        <h4 style="margin-bottom: 1rem; color: var(--matte-black);">
            ${results.length} Result${results.length > 1 ? 's' : ''} for "${query}"
        </h4>
        ${results.map(product => `
            <div class="search-result-item" onclick="viewProductFromSearch(${product.id})" style="display: flex; align-items: center; padding: 1rem; border-bottom: 1px solid #eee; cursor: pointer;">
                <div style="width: 60px; height: 60px; background: var(--light-gray); border-radius: 8px; margin-right: 1rem;"></div>
                <div>
                    <h5>${product.name}</h5>
                    <p style="color: var(--primary-red); font-weight: 600;">₹${product.price}</p>
                </div>
            </div>
        `).join('')}
    `;
}

function viewProductFromSearch(productId) {
    toggleSearch();
    setTimeout(() => {
        viewProduct(productId);
    }, 300);
}

// User menu functionality
function createUserMenu() {
    if (document.getElementById('userMenu')) return;
    
    const userMenu = document.createElement('div');
    userMenu.id = 'userMenu';
    userMenu.className = 'user-dropdown';
    userMenu.innerHTML = `
        <div class="user-menu-content">
            <div class="user-auth">
                <h4>Welcome to TRAGY</h4>
                <p>Sign in to access your account</p>
            </div>
            <div class="user-menu-divider"></div>
            <button onclick="showLogin()" class="user-menu-item">Sign In</button>
            <button onclick="showRegister()" class="user-menu-item">Create Account</button>
        </div>
    `;
    
    const userIcon = document.querySelector('.user-icon');
    if (userIcon) {
        userIcon.style.position = 'relative';
        userIcon.appendChild(userMenu);
    }
}

function showLogin() {
    toggleUserMenu();
    showNotification('Login functionality coming soon!', 'info');
}

function showRegister() {
    toggleUserMenu();
    showNotification('Registration functionality coming soon!', 'info');
}

// Product navigation
function viewProduct(productId) {
    window.location.href = `product.html?id=${productId}`;
}

// Close all modals helper
function closeAllModals() {
    if (window.cartOpen) {
        window.cartOpen = false;
        const sidebar = document.getElementById('cartSidebar');
        const overlay = document.querySelector('.cart-overlay');
        if (sidebar) sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('active');
    }
    if (window.searchOpen) {
        window.searchOpen = false;
        const modal = document.getElementById('searchModal');
        if (modal) modal.classList.remove('open');
    }
    if (window.userMenuOpen) {
        window.userMenuOpen = false;
        const menu = document.getElementById('userMenu');
        if (menu) menu.classList.remove('open');
    }
    if (window.mobileMenuOpen) {
        window.mobileMenuOpen = false;
        const menu = document.getElementById('mobileMenu');
        if (menu) menu.classList.remove('open');
    }
    document.body.style.overflow = '';
}

// Enhanced notification system
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const colors = {
        success: 'var(--primary-red)',
        error: '#dc3545',
        info: '#17a2b8',
        warning: '#ffc107'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${colors[type]};
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        z-index: 3000;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
        animation: slideInRight 0.4s ease;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Export functions for global access
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartQuantity = updateCartQuantity;
window.viewProduct = viewProduct;
window.performSearch = performSearch;
window.searchFor = searchFor;
window.viewProductFromSearch = viewProductFromSearch;
window.showLogin = showLogin;
window.showRegister = showRegister;
window.closeAllModals = closeAllModals;
window.showNotification = showNotification;
window.products = products;
window.loadProducts = loadProducts;
window.updateProductDisplays = updateProductDisplays;