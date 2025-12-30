const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Live tracking
let activeVisitors = new Set();
let sessionTimers = new Map();

app.use(express.static('public'));
app.use(express.json());

console.log('Server routes configured:');
console.log('POST /api/visitor/join');
console.log('POST /api/visitor/ping');
console.log('GET /api/visitors');

// Track visitor endpoint
app.post('/api/visitor/join', (req, res) => {
    console.log('POST /api/visitor/join called');
    const sessionId = Date.now() + Math.random();
    activeVisitors.add(sessionId);
    
    // Auto-remove after 30 seconds of inactivity
    sessionTimers.set(sessionId, setTimeout(() => {
        activeVisitors.delete(sessionId);
        sessionTimers.delete(sessionId);
    }, 30000));
    
    console.log('Active visitors:', activeVisitors.size);
    res.json({ sessionId, count: activeVisitors.size });
});

// Keep alive endpoint
app.post('/api/visitor/ping', (req, res) => {
    const { sessionId } = req.body;
    if (sessionTimers.has(sessionId)) {
        clearTimeout(sessionTimers.get(sessionId));
        sessionTimers.set(sessionId, setTimeout(() => {
            activeVisitors.delete(sessionId);
            sessionTimers.delete(sessionId);
        }, 30000));
    }
    res.json({ count: activeVisitors.size });
});

// Add missing product API endpoint
app.get('/api/public/products', (req, res) => {
    const sampleProducts = [
        { id: 1, name: 'Oversized Graphic Tee', price: 1299, category: 'tshirts', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop', description: 'Premium cotton oversized streetwear tee with unique graphic design.', sizes: ['S', 'M', 'L', 'XL', 'XXL'] },
        { id: 2, name: 'Vintage Streetwear Tee', price: 1199, category: 'tshirts', image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop', description: 'Retro-inspired street style t-shirt with vintage wash.', sizes: ['S', 'M', 'L', 'XL', 'XXL'] },
        { id: 3, name: 'Urban Logo Tee', price: 999, category: 'tshirts', image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400&h=400&fit=crop', description: 'Minimalist logo design streetwear.', sizes: ['S', 'M', 'L', 'XL', 'XXL'] },
        { id: 4, name: 'Black Hoodie Premium', price: 2499, category: 'hoodies', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop', description: 'Premium black hoodie with soft fleece interior.', sizes: ['S', 'M', 'L', 'XL', 'XXL'] },
        { id: 5, name: 'Distressed Denim Jacket', price: 3299, category: 'jackets', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop', description: 'Classic distressed denim jacket with vintage wash.', sizes: ['S', 'M', 'L', 'XL'] },
        { id: 6, name: 'Cargo Pants Street', price: 1899, category: 'pants', image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=400&fit=crop', description: 'Tactical cargo pants with multiple pockets.', sizes: ['S', 'M', 'L', 'XL', 'XXL'] }
    ];
    res.json({ success: true, products: sampleProducts });
});

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/shop', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'shop.html'));
});

app.get('/collections', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'collections.html'));
});

app.get('/product/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'product.html'));
});

app.get('/cart', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cart.html'));
});

app.get('/checkout', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'checkout.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 TRAGY Fashion Store running on http://localhost:${PORT}`);
    console.log(`📱 Premium e-commerce experience with full functionality`);
    console.log(`🎨 Modern design with smooth animations`);
    console.log(`🛒 Complete shopping cart and checkout system`);
    console.log(`👥 Live visitor tracking enabled`);
});