// TRAGY Shopify Theme Functions
window.TRAGY = window.TRAGY || {};

// Cart functionality for Shopify
TRAGY.cart = {
  addItem: function(variantId, quantity = 1) {
    return fetch('/cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [{
          id: variantId,
          quantity: quantity
        }]
      })
    }).then(response => response.json());
  },

  updateItem: function(key, quantity) {
    return fetch('/cart/update.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        updates: {
          [key]: quantity
        }
      })
    }).then(response => response.json());
  },

  getCart: function() {
    return fetch('/cart.js').then(response => response.json());
  }
};

// Initialize theme
document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu toggle
  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  
  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', function() {
      mobileMenu.classList.toggle('open');
    });
  }

  // Product form handling
  const productForms = document.querySelectorAll('[data-product-form]');
  productForms.forEach(form => {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const formData = new FormData(form);
      const variantId = formData.get('id');
      const quantity = formData.get('quantity') || 1;
      
      TRAGY.cart.addItem(variantId, quantity)
        .then(item => {
          // Show success message
          console.log('Item added to cart:', item);
        })
        .catch(error => {
          console.error('Error adding to cart:', error);
        });
    });
  });
});