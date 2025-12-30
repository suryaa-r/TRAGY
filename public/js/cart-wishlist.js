// Universal Cart/Wishlist Tab Functions
function switchTab(tab) {
    const cartTab = document.getElementById('cartTab');
    const wishlistTab = document.getElementById('wishlistTab');
    const cartContent = document.getElementById('cartContent');
    const wishlistContent = document.getElementById('wishlistContent');
    
    if (tab === 'cart') {
        cartTab.style.background = 'var(--primary-red)';
        cartTab.style.color = 'white';
        wishlistTab.style.background = 'white';
        wishlistTab.style.color = 'var(--primary-red)';
        cartContent.style.display = 'block';
        wishlistContent.style.display = 'none';
    } else {
        wishlistTab.style.background = 'var(--primary-red)';
        wishlistTab.style.color = 'white';
        cartTab.style.background = 'white';
        cartTab.style.color = 'var(--primary-red)';
        cartContent.style.display = 'none';
        wishlistContent.style.display = 'block';
        updateWishlistDisplay();
    }
}

// Universal wishlist functions
function addToWishlist(productId, productName, productPrice, productImage) {
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    
    if (!wishlist.find(item => item.id === productId)) {
        wishlist.push({ id: productId, name: productName, price: productPrice, image: productImage });
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        updateWishlistDisplay();
        showNotification(`${productName} added to wishlist!`, 'success');
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
    if (!wishlistItems) return; // Exit if element doesn't exist
    
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    
    if (wishlist.length === 0) {
        wishlistItems.innerHTML = '<p style="color: #999; text-align: center; margin-top: 2rem;">Your wishlist is empty</p>';
    } else {
        wishlistItems.innerHTML = wishlist.map(item => `
            <div style="display: flex; gap: 1rem; padding: 1rem; border-bottom: 1px solid #eee;">
                <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;">
                <div style="flex: 1;">
                    <h4 style="margin: 0 0 0.5rem 0; font-size: 0.9rem;">${item.name}</h4>
                    <p style="margin: 0; color: var(--primary-red); font-weight: 600;">₹${item.price}</p>
                </div>
                <button onclick="removeFromWishlist(${item.id})" style="background: none; border: none; color: #999; cursor: pointer; font-size: 18px;">&times;</button>
            </div>
        `).join('');
    }
}

// Universal toggle functions
function toggleCart() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.querySelector('.cart-overlay');
    
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

// Order management functions
function createOrder() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) return;
    
    const orders = JSON.parse(localStorage.getItem('userOrders')) || [];
    const orderId = 'TRG' + String(orders.length + 1).padStart(3, '0');
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const newOrder = {
        id: orderId,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        items: cart,
        total: total,
        status: 'processing'
    };
    
    orders.push(newOrder);
    localStorage.setItem('userOrders', JSON.stringify(orders));
    localStorage.removeItem('cart');
    
    return orderId;
}

// Simulate order status updates
function updateOrderStatus(orderId, status) {
    const orders = JSON.parse(localStorage.getItem('userOrders')) || [];
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = status;
        localStorage.setItem('userOrders', JSON.stringify(orders));
    }
}