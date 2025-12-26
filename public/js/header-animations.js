// Global state variables - ensure they exist globally
if (typeof searchOpen === 'undefined') window.searchOpen = false;
if (typeof userMenuOpen === 'undefined') window.userMenuOpen = false;
if (typeof cartOpen === 'undefined') window.cartOpen = false;
if (typeof mobileMenuOpen === 'undefined') window.mobileMenuOpen = false;

// Simple header button functions
function toggleSearch() {
    const searchModal = document.getElementById('searchModal');
    if (!searchModal) return;
    
    const searchInput = document.getElementById('searchInput');
    const searchIcon = document.querySelector('.search-icon');
    
    window.searchOpen = !window.searchOpen;
    
    if (window.searchOpen) {
        closeAllModals();
        window.searchOpen = true;
        searchIcon.style.transform = 'scale(1.3) rotate(90deg)';
        searchIcon.style.color = 'var(--primary-red)';
        searchModal.classList.add('open');
        document.body.style.overflow = 'hidden';
        setTimeout(() => searchInput && searchInput.focus(), 300);
    } else {
        searchIcon.style.transform = 'scale(1) rotate(0deg)';
        searchIcon.style.color = 'white';
        searchModal.classList.remove('open');
        document.body.style.overflow = '';
        if (searchInput) searchInput.value = '';
        resetSearchResults();
    }
}

function toggleUserMenu() {
    const userMenu = document.getElementById('userMenu');
    if (!userMenu) return;
    
    const userIcon = document.querySelector('.user-icon');
    window.userMenuOpen = !window.userMenuOpen;
    
    if (window.userMenuOpen) {
        closeAllModals();
        window.userMenuOpen = true;
        userIcon.style.transform = 'scale(1.2)';
        userIcon.style.color = 'var(--primary-red)';
        userMenu.classList.add('open');
    } else {
        userIcon.style.transform = 'scale(1)';
        userIcon.style.color = 'white';
        userMenu.classList.remove('open');
    }
}

function toggleCart() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.querySelector('.cart-overlay');
    const cartIcon = document.querySelector('.cart-icon');
    
    if (!sidebar || !overlay) return;
    
    window.cartOpen = !window.cartOpen;
    
    if (window.cartOpen) {
        closeAllModals();
        window.cartOpen = true;
        cartIcon.style.transform = 'scale(1.2) rotate(15deg)';
        cartIcon.style.color = 'var(--primary-red)';
        sidebar.classList.add('open');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    } else {
        cartIcon.style.transform = 'scale(1) rotate(0deg)';
        cartIcon.style.color = 'white';
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    if (!mobileMenu) return;
    
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    window.mobileMenuOpen = !window.mobileMenuOpen;
    
    if (window.mobileMenuOpen) {
        closeAllModals();
        window.mobileMenuOpen = true;
        menuToggle.style.transform = 'rotate(90deg)';
        menuToggle.style.color = 'var(--primary-red)';
        mobileMenu.classList.add('open');
        document.body.style.overflow = 'hidden';
    } else {
        menuToggle.style.transform = 'rotate(0deg)';
        menuToggle.style.color = 'white';
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
    }
}

function viewProduct(id) {
    window.location.href = `product.html?id=${id}`;
}

function closeAllModals() {
    // Close cart
    window.cartOpen = false;
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.querySelector('.cart-overlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
    
    // Close search
    window.searchOpen = false;
    const modal = document.getElementById('searchModal');
    if (modal) modal.classList.remove('open');
    
    // Close user menu
    window.userMenuOpen = false;
    const menu = document.getElementById('userMenu');
    if (menu) menu.classList.remove('open');
    
    // Close mobile menu
    window.mobileMenuOpen = false;
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu) mobileMenu.classList.remove('open');
    
    document.body.style.overflow = '';
}

function resetSearchResults() {
    const searchResults = document.getElementById('searchResults');
    if (!searchResults) return;
    
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

// Make functions globally available
window.toggleSearch = toggleSearch;
window.toggleUserMenu = toggleUserMenu;
window.toggleCart = toggleCart;
window.toggleMobileMenu = toggleMobileMenu;
window.viewProduct = viewProduct;
window.closeAllModals = closeAllModals;