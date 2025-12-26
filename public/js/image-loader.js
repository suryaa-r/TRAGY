// Product images with loading states
const productImages = {
    1: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
    2: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop',
    3: 'https://images.unsplash.com/photo-1583743814966-8936f37f4678?w=400&h=400&fit=crop',
    4: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400&h=400&fit=crop',
    5: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&h=400&fit=crop',
    6: 'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=400&h=400&fit=crop'
};

function loadProductImage(imgElement, productId) {
    // Show loading image first
    imgElement.src = 'images/loading.png';
    
    // Create new image to preload
    const img = new Image();
    img.onload = function() {
        imgElement.src = productImages[productId];
    };
    img.onerror = function() {
        imgElement.src = 'images/loading.png'; // Keep loading image if error
    };
    img.src = productImages[productId];
}

// Initialize product images on page load
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.product-card img').forEach((img, index) => {
        const productId = index + 1;
        loadProductImage(img, productId);
    });
});