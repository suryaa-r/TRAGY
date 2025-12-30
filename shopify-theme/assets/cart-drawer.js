class CartDrawer extends HTMLElement {
  constructor() {
    super();

    this.addEventListener('keyup', (evt) => evt.code === 'Escape' && this.close());
    this.querySelector('#CartDrawer-Overlay').addEventListener('click', this.close.bind(this));
    this.setHeaderCartIconAccessibility();
  }

  setHeaderCartIconAccessibility() {
    const cartLink = document.querySelector('#cart-icon-bubble');
    cartLink.setAttribute('role', 'button');
    cartLink.setAttribute('aria-haspopup', 'dialog');
    cartLink.addEventListener('click', (event) => {
      event.preventDefault();
      this.open(cartLink)
    });
    cartLink.addEventListener('keydown', (event) => {
      if (event.code.toUpperCase() === 'SPACE') {
        event.preventDefault();
        this.open(cartLink);
      }
    });
  }

  open(triggeredBy) {
    if (triggeredBy) this.setActiveElement(triggeredBy);
    const cartDrawerNote = this.querySelector('[id^="Details-"] summary');
    if (cartDrawerNote && !cartDrawerNote.hasAttribute('role')) this.setSummaryAccessibility(cartDrawerNote);
    setTimeout(() => {trapFocus(this, this.querySelector('.drawer__inner'));});
    document.body.classList.add('overflow-hidden');
  }

  close() {
    this.classList.remove('active');
    document.body.classList.remove('overflow-hidden');
    removeTrapFocus(this.activeElement);
  }

  setSummaryAccessibility(cartDrawerNote) {
    cartDrawerNote.setAttribute('role', 'button');
    cartDrawerNote.setAttribute('aria-expanded', 'false');

    if(cartDrawerNote.nextElementSibling.getAttribute('id')) {
      cartDrawerNote.setAttribute('aria-controls', cartDrawerNote.nextElementSibling.id);
    }

    cartDrawerNote.addEventListener('click', (event) => {
      event.currentTarget.setAttribute('aria-expanded', !event.currentTarget.closest('details').hasAttribute('open'));
    });

    cartDrawerNote.parentElement.addEventListener('keyup', onKeyUpEscape);
  }

  renderContents(parsedState) {
    this.querySelector('.drawer__inner').classList.contains('is-empty') && this.querySelector('.drawer__inner').classList.remove('is-empty');
    this.productId = parsedState.id;
    this.getSectionsToRender().forEach((section => {
      const sectionElement = section.selector ? document.querySelector(section.selector) : document.getElementById(section.id);
      sectionElement.innerHTML =
        this.getSectionInnerHTML(parsedState.sections[section.id], section.selector);
    }));

    setTimeout(() => {
      this.querySelector('#CartDrawer-Overlay').addEventListener('click', this.close.bind(this));
      this.open();
    });
  }

  getSectionsToRender() {
    return [
      {
        id: 'cart-drawer',
        selector: '#CartDrawer .drawer__inner'
      },
      {
        id: 'cart-icon-bubble'
      }
    ];
  }

  getSectionInnerHTML(html, selector = '.shopify-section') {
    return new DOMParser()
      .parseFromString(html, 'text/html')
      .querySelector(selector).innerHTML;
  }

  setActiveElement(element) {
    this.activeElement = element;
  }
}

customElements.define('cart-drawer', CartDrawer);

class CartDrawerItems extends CartItems {
  getSectionsToRender() {
    return [
      {
        id: 'CartDrawer',
        section: 'cart-drawer',
        selector: '.drawer__inner',
      },
      {
        id: 'cart-icon-bubble',
        section: 'cart-icon-bubble',
        selector: '.shopify-section'
      }
    ];
  }
}

customElements.define('cart-drawer-items', CartDrawerItems);

// Enhanced Add to Cart functionality
document.addEventListener('DOMContentLoaded', function() {
  // Add to cart with AJAX
  const addToCartForms = document.querySelectorAll('product-form form');
  
  addToCartForms.forEach(form => {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const formData = new FormData(form);
      const submitButton = form.querySelector('[type="submit"]');
      
      // Show loading state
      submitButton.textContent = 'Adding...';
      submitButton.disabled = true;
      
      try {
        const response = await fetch('/cart/add.js', {
          method: 'POST',
          body: formData
        });
        
        const item = await response.json();
        
        if (response.ok) {
          // Update cart count
          updateCartCount();
          
          // Show success notification
          showNotification('Added to cart!', 'success');
          
          // Open cart drawer if it exists
          const cartDrawer = document.querySelector('cart-drawer');
          if (cartDrawer) {
            cartDrawer.open();
          }
        } else {
          throw new Error(item.description || 'Failed to add to cart');
        }
      } catch (error) {
        showNotification(error.message, 'error');
      } finally {
        submitButton.textContent = 'Add to Cart';
        submitButton.disabled = false;
      }
    });
  });
  
  // Update cart count
  async function updateCartCount() {
    try {
      const response = await fetch('/cart.js');
      const cart = await response.json();
      
      const cartCountElements = document.querySelectorAll('.cart-count, #cart-count');
      cartCountElements.forEach(element => {
        element.textContent = cart.item_count;
        element.style.display = cart.item_count > 0 ? 'flex' : 'none';
      });
    } catch (error) {
      console.error('Failed to update cart count:', error);
    }
  }
  
  // Initialize cart count
  updateCartCount();
});

// Quick Add to Cart for product cards
function quickAddToCart(variantId, productTitle) {
  const formData = new FormData();
  formData.append('id', variantId);
  formData.append('quantity', 1);
  
  fetch('/cart/add.js', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(item => {
    if (item.status) {
      throw new Error(item.description);
    }
    showNotification(`${productTitle} added to cart!`, 'success');
    updateCartCount();
  })
  .catch(error => {
    showNotification(error.message, 'error');
  });
}

// Utility functions
function updateCartCount() {
  fetch('/cart.js')
    .then(response => response.json())
    .then(cart => {
      const cartCountElements = document.querySelectorAll('.cart-count');
      cartCountElements.forEach(element => {
        element.textContent = cart.item_count;
        element.style.display = cart.item_count > 0 ? 'flex' : 'none';
      });
    });
}

function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  
  const colors = {
    success: 'var(--primary-red)',
    error: '#dc3545',
    info: '#17a2b8'
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
    animation: slideInRight 0.4s ease;
    font-weight: 500;
  `;
  
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.4s ease';
    setTimeout(() => notification.remove(), 400);
  }, 3000);
}