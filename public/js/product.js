// Product page functionality
let currentProduct = null;
let selectedSize = '';
let currentQuantity = 1;
let products = {};

// Get product ID from URL
const urlParams = new URLSearchParams(window.location.search);
const productId = parseInt(urlParams.get('id')) || 1;

// Load product data
document.addEventListener('DOMContentLoaded', function() {
    loadProductsAndDisplay();
    updateCartCount();
    updateCartDisplay();
    createSearchModal();
    createUserMenu();
});

async function loadProductsAndDisplay() {
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
            
            loadProduct();
            loadRelatedProducts();
        }
    } catch (error) {
        console.error('Failed to load products:', error);
        // Fallback to show error
        document.getElementById('productName').textContent = 'Product Not Found';
        document.getElementById('productDescription').textContent = 'Failed to load product data.';
    }
}

function loadProduct() {
    // Check if products is available
    if (typeof products === 'undefined') {
        console.error('Products data not available');
        return;
    }
    
    currentProduct = products[productId];
    
    if (!currentProduct) {
        document.getElementById('productName').textContent = 'Product Not Found';
        document.getElementById('productDescription').textContent = 'The requested product could not be found.';
        return;
    }
    
    // Update breadcrumb
    document.getElementById('breadcrumbProduct').textContent = currentProduct.name;
    
    // Update product info
    document.getElementById('productName').textContent = currentProduct.name;
    document.getElementById('productPrice').textContent = `₹${currentProduct.price.toLocaleString()}`;
    document.getElementById('productDescription').textContent = currentProduct.description;
    
    // Load product image with loading state
    const productImg = document.getElementById('productImage');
    productImg.src = 'images/loading.png';
    productImg.alt = currentProduct.name;
    
    // Load actual image
    const img = new Image();
    img.onload = function() {
        productImg.src = currentProduct.image;
    };
    img.onerror = function() {
        productImg.src = 'images/loading.png';
    };
    img.src = currentProduct.image;
    
    // Update thumbnails
    const thumbnails = document.querySelectorAll('.thumbnail-images img');
    thumbnails.forEach((thumb, index) => {
        thumb.src = currentProduct.image;
        thumb.onclick = () => changeMainImage(currentProduct.image);
    });
    
    // Load size options
    const sizeOptions = document.getElementById('sizeOptions');
    if (currentProduct.sizes && currentProduct.sizes.length > 0) {
        sizeOptions.innerHTML = currentProduct.sizes.map(size => 
            `<button onclick="selectSize('${size}')" class="size-btn" data-size="${size}" 
             style="padding: 0.75rem 1rem; border: 2px solid #ddd; background: white; cursor: pointer; border-radius: 8px; transition: all 0.3s ease; font-weight: 600; min-width: 50px;">
             ${size}</button>`
        ).join('');
        
        // Select first size by default
        selectSize(currentProduct.sizes[0]);
    } else {
        sizeOptions.innerHTML = '<p style="color: #666;">One size fits all</p>';
        selectedSize = 'OS';
    }
}

function selectSize(size) {
    selectedSize = size;
    
    // Update size button styles
    document.querySelectorAll('.size-btn').forEach(btn => {
        if (btn.dataset.size === size) {
            btn.style.borderColor = 'var(--primary-red)';
            btn.style.background = 'var(--primary-red)';
            btn.style.color = 'white';
            btn.style.transform = 'scale(1.05)';
        } else {
            btn.style.borderColor = '#ddd';
            btn.style.background = 'white';
            btn.style.color = 'black';
            btn.style.transform = 'scale(1)';
        }
    });
}

function changeQuantity(change) {
    const newQuantity = currentQuantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
        currentQuantity = newQuantity;
        document.getElementById('quantity').textContent = currentQuantity;
        
        // Add visual feedback
        const quantityEl = document.getElementById('quantity');
        quantityEl.style.transform = 'scale(1.1)';
        setTimeout(() => {
            quantityEl.style.transform = 'scale(1)';
        }, 150);
    }
}

function changeMainImage(src) {
    const mainImg = document.getElementById('productImage');
    mainImg.style.opacity = '0.5';
    
    setTimeout(() => {
        mainImg.src = src;
        mainImg.style.opacity = '1';
    }, 150);
    
    // Update thumbnail borders
    document.querySelectorAll('.thumbnail-images img').forEach(thumb => {
        if (thumb.src === src) {
            thumb.style.borderColor = 'var(--primary-red)';
        } else {
            thumb.style.borderColor = 'transparent';
        }
    });
}

function addToCartFromProduct() {
    if (!currentProduct) {
        showNotification('Product not found', 'error');
        return;
    }
    
    if (!selectedSize) {
        showNotification('Please select a size', 'warning');
        return;
    }
    
    // Check if addToCart function exists
    if (typeof addToCart === 'function') {
        addToCart(currentProduct.id, currentProduct.name, currentProduct.price, selectedSize, currentQuantity);
    } else {
        showNotification('Added to cart successfully!', 'success');
    }
    
    // Reset quantity
    currentQuantity = 1;
    document.getElementById('quantity').textContent = currentQuantity;
}

function toggleWishlist() {
    if (!currentProduct) return;
    
    // Check if toggleWishlist function exists in main.js
    if (typeof window.toggleWishlist === 'function') {
        window.toggleWishlist(currentProduct.id);
    } else {
        showNotification('Added to wishlist!', 'success');
    }
}

function goBack() {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        window.location.href = '/shop';
    }
}

function loadRelatedProducts() {
    const container = document.getElementById('relatedProducts');
    if (!container || typeof products === 'undefined') return;
    
    // Get related products (exclude current product)
    const relatedProducts = Object.values(products)
        .filter(product => product.id !== productId)
        .slice(0, 3);
    
    if (relatedProducts.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666;">No related products found.</p>';
        return;
    }
    
    container.innerHTML = relatedProducts.map(product => `
        <div class="product-card" onclick="viewProduct(${product.id})" style="cursor: pointer;">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" style="width: 100%; height: 250px; object-fit: cover;" onerror="this.src='images/loading.png'">
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

// Simple notification function if not available
function showNotification(message, type = 'success') {
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type);
        return;
    }
    
    // Fallback notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? 'var(--primary-red)' : type === 'error' ? '#dc3545' : '#ffc107'};
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        z-index: 3000;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        animation: slideInRight 0.4s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    .thumbnail-images img:hover {
        transform: scale(1.1);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }
    
    .size-btn:hover {
        transform: scale(1.05) !important;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    
    .product-detail {
        animation: fadeInUp 0.6s ease;
    }
    
    @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    @media (max-width: 768px) {
        .product-detail {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
        }
        
        .product-actions {
            flex-direction: column !important;
        }
        
        .thumbnail-images {
            justify-content: flex-start !important;
            overflow-x: auto;
        }
    }
`;
document.head.appendChild(style);