const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Live tracking
let activeVisitors = new Set();
let sessionTimers = new Map();

app.use(express.static('public'));
app.use(express.json());

// API Routes first
app.post('/api/visitor/join', (req, res) => {
    console.log('POST /api/visitor/join called');
    const sessionId = Date.now() + Math.random();
    activeVisitors.add(sessionId);
    
    sessionTimers.set(sessionId, setTimeout(() => {
        activeVisitors.delete(sessionId);
        sessionTimers.delete(sessionId);
    }, 30000));
    
    console.log('Active visitors:', activeVisitors.size);
    res.json({ sessionId, count: activeVisitors.size });
});

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

app.get('/api/visitors', (req, res) => {
    res.json({ active: activeVisitors.size });
});

// Page Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/shop', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'shop.html'));
});

app.get('/collections', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'collections.html'));
});

app.get('/product', (req, res) => {
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
    console.log(`🚀 TRAGY running on http://localhost:${PORT}`);
    console.log(`👥 Live visitor tracking enabled`);
});