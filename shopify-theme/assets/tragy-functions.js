// Global variables
window.wishlist = JSON.parse(localStorage.getItem('tragy_wishlist')) || [];

// Quick Add to Cart
window.quickAddToCart = function(variantId, productTitle) {
  const btn = event.target;
  const originalText = btn.innerHTML;
  
  btn.innerHTML = 'Adding...';
  btn.disabled = true;
  
  fetch('/cart/add.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: variantId, quantity: 1 })
  })
  .then(response => response.json())
  .then(data => {
    if (data.status) throw new Error(data.description);
    showNotification(productTitle + ' added to cart!', 'success');
    updateCartCount();
  })
  .catch(error => {
    showNotification(error.message, 'error');
  })
  .finally(() => {
    btn.innerHTML = originalText;
    btn.disabled = false;
  });
};

// Toggle Wishlist
window.toggleWishlist = function(productId, productTitle) {
  const btn = document.getElementById('wishlist-btn') || event.target;
  
  if (window.wishlist.includes(productId)) {
    window.wishlist = window.wishlist.filter(id => id !== productId);
    btn.innerHTML = '♡';
    btn.classList.remove('active');
    showNotification('Removed from wishlist', 'info');
  } else {
    window.wishlist.push(productId);
    btn.innerHTML = '♥';
    btn.classList.add('active');
    showNotification(productTitle + ' added to wishlist!', 'success');
  }
  
  localStorage.setItem('tragy_wishlist', JSON.stringify(window.wishlist));
  updateWishlistCount();
};

// Toggle Wishlist from Card
window.toggleWishlistFromCard = function(productId, productTitle) {
  const btn = event.target;
  
  if (window.wishlist.includes(productId)) {
    window.wishlist = window.wishlist.filter(id => id !== productId);
    btn.innerHTML = '♡';
    showNotification('Removed from wishlist', 'info');
  } else {
    window.wishlist.push(productId);
    btn.innerHTML = '♥';
    showNotification(productTitle + ' added to wishlist!', 'success');
  }
  
  localStorage.setItem('tragy_wishlist', JSON.stringify(window.wishlist));
  updateWishlistCount();
};

// Show Notification
window.showNotification = function(message, type) {
  const colors = { success: '#B00020', error: '#dc3545', info: '#17a2b8' };
  
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed; top: 20px; right: 20px; background: ${colors[type] || '#B00020'};
    color: white; padding: 16px 24px; border-radius: 8px; z-index: 10000;
    font-weight: 500; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => notification.remove(), 3000);
};

// Update Cart Count
window.updateCartCount = function() {
  fetch('/cart.js')
    .then(response => response.json())
    .then(cart => {
      const cartCount = document.getElementById('cart-count');
      if (cartCount) {
        cartCount.textContent = cart.item_count;
        cartCount.style.display = cart.item_count > 0 ? 'flex' : 'none';
      }
    })
    .catch(() => {});
};

// Update Wishlist Count
window.updateWishlistCount = function() {
  const wishlistCount = document.getElementById('wishlist-count');
  if (wishlistCount) {
    wishlistCount.textContent = window.wishlist.length;
    wishlistCount.style.display = window.wishlist.length > 0 ? 'flex' : 'none';
  }
};

// Open Size Guide
window.openSizeGuide = function() {
  const modal = document.getElementById('sizeGuideModal');
  if (modal) {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
  }
};

// Close Size Guide
window.closeSizeGuide = function() {
  const modal = document.getElementById('sizeGuideModal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
};

// Submit Review
window.submitReview = function() {
  const rating = document.querySelector('input[name="rating"]:checked');
  const reviewText = document.getElementById('review-text');
  
  if (!rating) {
    showNotification('Please select a rating', 'error');
    return;
  }
  
  if (!reviewText || !reviewText.value.trim()) {
    showNotification('Please write a review', 'error');
    return;
  }
  
  // Store review
  const reviews = JSON.parse(localStorage.getItem('tragy_reviews')) || {};
  const productId = window.location.pathname.split('/').pop();
  
  if (!reviews[productId]) reviews[productId] = [];
  
  reviews[productId].push({
    rating: parseInt(rating.value),
    text: reviewText.value,
    date: new Date().toISOString()
  });
  
  localStorage.setItem('tragy_reviews', JSON.stringify(reviews));
  showNotification('Review submitted!', 'success');
  
  // Reset form
  rating.checked = false;
  reviewText.value = '';
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  updateCartCount();
  updateWishlistCount();
  
  // Initialize wishlist buttons
  const wishlistBtn = document.getElementById('wishlist-btn');
  if (wishlistBtn) {
    const productId = parseInt(document.body.dataset.productId || window.location.pathname.split('/').pop());
    if (window.wishlist.includes(productId)) {
      wishlistBtn.innerHTML = '♥';
      wishlistBtn.classList.add('active');
    }
  }
  
  // Add to cart form
  const productForm = document.getElementById('product-form');
  if (productForm) {
    productForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const btn = document.getElementById('add-to-cart-btn');
      const originalText = btn.innerHTML;
      btn.innerHTML = 'Adding...';
      btn.disabled = true;
      
      const formData = new FormData(this);
      
      fetch('/cart/add.js', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        if (data.status) throw new Error(data.description);
        showNotification('Added to cart!', 'success');
        updateCartCount();
      })
      .catch(error => {
        showNotification(error.message, 'error');
      })
      .finally(() => {
        btn.innerHTML = originalText;
        btn.disabled = false;
      });
    });
  }
  
  // Close modal on outside click
  const sizeModal = document.getElementById('sizeGuideModal');
  if (sizeModal) {
    sizeModal.addEventListener('click', function(e) {
      if (e.target === this) closeSizeGuide();
    });
  }
});