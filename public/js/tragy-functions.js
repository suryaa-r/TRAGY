// Global cart and wishlist
window.cart = JSON.parse(localStorage.getItem('cart')) || [];
window.wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

// Add to cart function
function addToCart(productId, name, price, size = 'M', quantity = 1) {
    const existingItem = window.cart.find(item => 
        item.id === productId && item.size === size
    );
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        window.cart.push({
            id: productId,
            name: name,
            price: price,
            size: size,
            quantity: quantity
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(window.cart));
    updateCartCount();
    updateCartDisplay();
    showNotification(`${name} added to cart!`, 'success');
}

// Remove from cart
function removeFromCart(productId, size) {
    const item = window.cart.find(item => item.id === productId && item.size === size);
    window.cart = window.cart.filter(item => !(item.id === productId && item.size === size));
    localStorage.setItem('cart', JSON.stringify(window.cart));
    updateCartCount();
    updateCartDisplay();
    showNotification(`${item ? item.name : 'Item'} removed from cart`, 'info');
}

// Update cart quantity
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

// Update cart count in header
function updateCartCount() {
    const count = window.cart.reduce((total, item) => total + item.quantity, 0);
    const cartCountElements = document.querySelectorAll('#cartCount, .cart-count');
    cartCountElements.forEach(element => {
        if (element) {
            element.textContent = count;
            element.style.display = count > 0 ? 'flex' : 'none';
        }
    });
}

// Update cart display in sidebar
function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (!cartItems || !cartTotal) return;
    
    if (window.cart.length === 0) {
        cartItems.innerHTML = `
            <div style="text-align: center; padding: 3rem 0; color: #999;">
                <p>Your cart is empty</p>
                <p style="font-size: 0.9rem; margin-top: 0.5rem;">Add some items to get started</p>
            </div>
        `;
        cartTotal.textContent = '₹0';
        return;
    }
    
    let total = 0;
    cartItems.innerHTML = window.cart.map((item) => {
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
                        <p style="color: #B00020; font-weight: 600;">₹${item.price * item.quantity}</p>
                    </div>
                </div>
                <button onclick="removeFromCart(${item.id}, '${item.size}')" style="background: none; border: none; color: #999; cursor: pointer; font-size: 1.5rem; padding: 0.5rem;">&times;</button>
            </div>
        `;
    }).join('');
    
    cartTotal.textContent = `₹${total}`;
}

// Toggle cart sidebar
function toggleCart() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.querySelector('.cart-overlay');
    
    if (!sidebar || !overlay) return;
    
    if (sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    } else {
        sidebar.classList.add('open');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// View product
function viewProduct(productId) {
    window.location.href = `product.html?id=${productId}`;
}

// Show notification
function showNotification(message, type = 'success') {
    const colors = {
        success: '#B00020',
        error: '#dc3545',
        info: '#17a2b8',
        warning: '#ffc107'
    };
    
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type]};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        z-index: 10000;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

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

// Toggle mobile menu
function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    if (menu) {
        menu.classList.toggle('open');
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    updateCartDisplay();
    
    // Load products from database if available
    loadProductsFromDB();
});

// Load products from database
async function loadProductsFromDB() {
    try {
        const response = await fetch('/api/public/products');
        const data = await response.json();
        
        if (data.success && data.products.length > 0) {
            updateHomepageProducts(data.products);
        }
    } catch (error) {
        console.log('Using static product data');
    }
}

// Update homepage with real products
function updateHomepageProducts(products) {
    const featuredContainer = document.getElementById('featuredProducts');
    const bestSellersContainer = document.getElementById('bestSellers');
    
    if (featuredContainer && products.length > 0) {
        featuredContainer.innerHTML = products.slice(0, 3).map(product => `
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
    
    if (bestSellersContainer && products.length > 3) {
        bestSellersContainer.innerHTML = products.slice(3, 6).map(product => `
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

// CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
document.head.appendChild(style);