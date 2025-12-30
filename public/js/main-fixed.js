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
        console.warn('Failed to load products from API, using fallback data:', error);
        // Use minimal fallback - will be replaced when API is available
        products = {
            1: { id: 1, name: 'Product Loading...', price: 0, category: 'loading', image: 'images/loading.png', description: 'Loading product data...', sizes: ['M'] }
        };
        // Retry loading after delay
        setTimeout(() => loadProducts(), 5000);
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
                            <p style="font-size: 0.8rem; color: var(--primary-red); font-weight: 600;">NO RESTOCK.</p>
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
    updateWishlistDisplay();
    createSearchModal();
    createUserMenu();
    loadProducts(); // Load products from database
    
    // Close mobile menu on browser back button
    window.addEventListener('popstate', function() {
        const mobileMenu = document.getElementById('mobileMenu');
        const overlay = document.getElementById('mobileMenuOverlay');
        if (mobileMenu && mobileMenu.classList.contains('open')) {
            mobileMenu.classList.remove('open');
            if (overlay) overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
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
    const sanitizedQuery = query.replace(/[<>"'&]/g, function(match) {
        const escapeMap = { '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '&': '&amp;' };
        return escapeMap[match];
    });
    
    if (results.length === 0) {
        searchResults.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #666;">
                <p>No results found for "${sanitizedQuery}"</p>
                <p style="font-size: 0.9rem; margin-top: 0.5rem;">Try searching for t-shirts or streetwear</p>
            </div>
        `;
        return;
    }
    
    searchResults.innerHTML = `
        <h4 style="margin-bottom: 1rem; color: var(--matte-black);">
            ${results.length} Result${results.length > 1 ? 's' : ''} for "${sanitizedQuery}"
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
    
    const userIcon = document.querySelector('.user-icon');
    if (userIcon) {
        userIcon.style.position = 'relative';
        userIcon.appendChild(userMenu);
    }
    
    updateUserMenuState();
}

function updateUserMenuState() {
    const user = JSON.parse(localStorage.getItem('user'));
    const userMenu = document.getElementById('userMenu');
    
    if (userMenu) {
        if (user) {
            userMenu.innerHTML = `
                <div class="user-menu-content">
                    <div class="user-auth">
                        <h4>Hi, ${user.name}</h4>
                        <p>${user.email}</p>
                    </div>
                    <div class="user-menu-divider"></div>
                    <a href="orders.html" class="user-menu-item">My Orders</a>
                    <button onclick="logout()" class="user-menu-item" style="color: var(--primary-red);">Logout</button>
                </div>
            `;
        } else {
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
        }
    }
}

function logout() {
    localStorage.removeItem('user');
    updateUserMenuState();
    showNotification('Logged out successfully', 'info');
    window.location.href = '/login.html';
}

function showLogin() {
    toggleUserMenu();
    showNotification('Redirecting to login...', 'info');
    window.location.href = '/login.html';
}

function showRegister() {
    toggleUserMenu();
    showNotification('Redirecting to registration...', 'info');
    window.location.href = '/register.html';
}

// Product navigation
function viewProduct(productId) {
    window.location.href = `product.html?id=${productId}`;
}

// Close all modals helper
// Close all modals with mobile-specific cleanup
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
        const overlay = document.getElementById('mobileMenuOverlay');
        const toggle = document.querySelector('.mobile-menu-toggle');
        if (menu) menu.classList.remove('open');
        if (overlay) overlay.classList.remove('active');
        if (toggle) toggle.classList.remove('active');
    }
    
    // Reset body styles
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
}

// Enhanced notification system
// Enhanced notification system with mobile positioning
function showNotification(message, type = 'success') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ',
        warning: '⚠'
    };
    
    const colors = {
        success: '#B00020',
        error: '#dc3545',
        info: '#17a2b8',
        warning: '#ffc107'
    };
    
    // Mobile-responsive positioning
    const isMobile = window.innerWidth <= 768;
    const topPosition = isMobile ? '20px' : '100px';
    const rightPosition = isMobile ? '10px' : '20px';
    const leftPosition = isMobile ? '10px' : 'auto';
    const width = isMobile ? 'calc(100% - 20px)' : 'auto';
    
    notification.style.cssText = `
        position: fixed;
        top: ${topPosition};
        right: ${rightPosition};
        left: ${leftPosition};
        width: ${width};
        max-width: ${isMobile ? 'none' : '400px'};
        background: ${colors[type]};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        z-index: 3000;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
        animation: slideInRight 0.4s ease;
        font-family: 'Poppins', sans-serif;
        font-weight: 500;
        font-size: ${isMobile ? '0.9rem' : '1rem'};
    `;
    
    notification.textContent = `${icons[type]} ${message}`;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.remove();
        }
    }, 3000);
}

// Toggle functions
// Enhanced cart toggle with mobile improvements
function toggleCart() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.querySelector('.cart-overlay');
    
    if (!sidebar || !overlay) return;
    
    window.cartOpen = !window.cartOpen;
    
    if (window.cartOpen) {
        closeAllModals();
        sidebar.classList.add('open');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Mobile-specific handling
        if (window.innerWidth <= 768) {
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
        }
    } else {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
    }
}

function toggleSearch() {
    const searchModal = document.getElementById('searchModal');
    const searchInput = document.getElementById('searchInput');
    
    if (!searchModal) return;
    
    window.searchOpen = !window.searchOpen;
    
    if (window.searchOpen) {
        closeAllModals();
        searchModal.classList.add('open');
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            if (searchInput) searchInput.focus();
        }, 300);
    } else {
        searchModal.classList.remove('open');
        document.body.style.overflow = '';
        if (searchInput) searchInput.value = '';
        resetSearchResults();
    }
}

function toggleUserMenu() {
    const userMenu = document.getElementById('userMenu');
    if (!userMenu) return;
    
    window.userMenuOpen = !window.userMenuOpen;
    
    if (window.userMenuOpen) {
        closeAllModals();
        userMenu.classList.add('open');
    } else {
        userMenu.classList.remove('open');
    }
}

// Toggle mobile menu with improved mobile handling
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    const overlay = document.getElementById('mobileMenuOverlay');
    const toggle = document.querySelector('.mobile-menu-toggle');
    
    if (!mobileMenu) return;
    
    window.mobileMenuOpen = !window.mobileMenuOpen;
    
    if (window.mobileMenuOpen) {
        // Close other modals first
        closeAllModals();
        mobileMenu.classList.add('open');
        if (overlay) overlay.classList.add('active');
        if (toggle) toggle.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Prevent background scrolling on mobile
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
    } else {
        mobileMenu.classList.remove('open');
        if (overlay) overlay.classList.remove('active');
        if (toggle) toggle.classList.remove('active');
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
    }
}

function resetSearchResults() {
    const searchResults = document.getElementById('searchResults');
    if (searchResults) {
        searchResults.innerHTML = `
            <div class="search-suggestions">
                <h4>Popular Searches</h4>
                <div class="suggestion-tags">
                    <span onclick="searchFor('tshirt')">T-Shirts</span>
                    <span onclick="searchFor('streetwear')">Streetwear</span>
                    <span onclick="searchFor('oversized')">Oversized</span>
                    <span onclick="searchFor('graphic')">Graphic Tees</span>
                </div>
            </div>
        `;
    }
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
window.updateUserMenuState = updateUserMenuState;
window.logout = logout;
window.closeAllModals = closeAllModals;
window.showNotification = showNotification;
window.toggleCart = toggleCart;
window.toggleSearch = toggleSearch;
window.toggleUserMenu = toggleUserMenu;
window.toggleMobileMenu = toggleMobileMenu;
window.products = products;
window.loadProducts = loadProducts;
window.updateProductDisplays = updateProductDisplays;
window.addToWishlist = addToWishlist;
window.removeFromWishlist = removeFromWishlist;
window.updateWishlistDisplay = updateWishlistDisplay;

// Wishlist functionality
function addToWishlist(productId, name, price, image) {
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    
    if (!wishlist.find(item => item.id === productId)) {
        wishlist.push({ id: productId, name, price, image });
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        updateWishlistDisplay();
        showNotification(`${name} added to wishlist!`, 'success');
    }
}

function removeFromWishlist(productId) {
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    wishlist = wishlist.filter(item => item.id !== productId);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    updateWishlistDisplay();
}

function updateWishlistDisplay() {
    const wishlistItems = document.getElementById('wishlistItems');
    if (!wishlistItems) return;
    
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    
    if (wishlist.length === 0) {
        wishlistItems.innerHTML = `
            <div style="text-align: center; padding: 3rem 0; color: #999;">
                <p>Your wishlist is empty</p>
                <p style="font-size: 0.9rem; margin-top: 0.5rem;">Add some items you love</p>
            </div>
        `;
        return;
    }
    
    wishlistItems.innerHTML = wishlist.map(item => `
        <div class="wishlist-item" style="display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 0; border-bottom: 1px solid #eee;">
            <div style="flex: 1;">
                <h4 style="margin-bottom: 0.5rem; font-size: 1rem;">${item.name}</h4>
                <p style="color: var(--primary-red); font-weight: 600;">₹${item.price}</p>
                <button onclick="addToCart(${item.id}, '${item.name}', ${item.price}, 'M', 1)" style="background: var(--primary-red); color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; margin-top: 0.5rem;">Add to Cart</button>
            </div>
            <button onclick="removeFromWishlist(${item.id})" style="background: none; border: none; color: #999; cursor: pointer; font-size: 1.5rem; padding: 0.5rem;">&times;</button>
        </div>
    `).join('');
}