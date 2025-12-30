const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'tragy_admin_secret_key_2024';

// Live visitor tracking
let activeVisitors = new Set();
let sessionTimers = new Map();

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(cors());

// Database setup
const db = new sqlite3.Database('./tragy_database.db');

// Initialize database tables
db.serialize(() => {
    // Admin users table
    db.run(`CREATE TABLE IF NOT EXISTS admin_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'admin',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Products table
    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        image TEXT,
        sizes TEXT,
        stock INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Customers table
    db.run(`CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT,
        phone TEXT,
        address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Check if password column exists in customers table, if not add it
    db.all("PRAGMA table_info(customers)", (err, rows) => {
        if (!err) {
            const hasPassword = rows.some(row => row.name === 'password');
            if (!hasPassword) {
                db.run("ALTER TABLE customers ADD COLUMN password TEXT");
                console.log("Added password column to customers table");
            }
        }
    });

    // Orders table
    db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER,
        customer_name TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        total REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        items TEXT NOT NULL,
        shipping_address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers (id)
    )`);

    // Insert default admin user
    const defaultPassword = bcrypt.hashSync('admin123', 10);
    db.run(`INSERT OR IGNORE INTO admin_users (name, email, password, role) 
            VALUES ('Admin User', 'admin@tragy.com', ?, 'admin')`, [defaultPassword]);

    // Insert sample products
    const sampleProducts = [
        ['Oversized Graphic Tee', 1299, 'tshirts', 'Premium cotton oversized streetwear tee with unique graphic design. Perfect for casual wear and street style.', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop', 'S,M,L,XL,XXL', 50],
        ['Vintage Streetwear Tee', 1199, 'tshirts', 'Retro-inspired street style t-shirt with vintage wash and comfortable fit.', 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop', 'S,M,L,XL,XXL', 30],
        ['Urban Logo Tee', 999, 'tshirts', 'Minimalist logo design streetwear with premium cotton blend material.', 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400&h=400&fit=crop', 'S,M,L,XL,XXL', 40],
        ['Black Hoodie Premium', 2499, 'hoodies', 'Premium black hoodie with soft fleece interior and adjustable drawstrings.', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop', 'S,M,L,XL,XXL', 25],
        ['Distressed Denim Jacket', 3299, 'jackets', 'Classic distressed denim jacket with vintage wash and modern fit.', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop', 'S,M,L,XL', 20],
        ['Cargo Pants Street', 1899, 'pants', 'Tactical cargo pants with multiple pockets and comfortable fit.', 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=400&fit=crop', 'S,M,L,XL,XXL', 35],
        ['Bomber Jacket Classic', 2799, 'jackets', 'Classic bomber jacket with ribbed cuffs and premium materials.', 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=400&fit=crop', 'S,M,L,XL', 18],
        ['Graphic Tank Top', 899, 'tshirts', 'Lightweight graphic tank top perfect for summer streetwear.', 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&h=400&fit=crop', 'S,M,L,XL', 45],
        ['Zip-Up Hoodie Grey', 2199, 'hoodies', 'Comfortable zip-up hoodie in heather grey with kangaroo pocket.', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop', 'S,M,L,XL,XXL', 30],
        ['Ripped Jeans Slim', 2099, 'pants', 'Slim fit ripped jeans with strategic distressing and stretch denim.', 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop', '28,30,32,34,36', 22]
    ];

    sampleProducts.forEach(product => {
        db.run(`INSERT OR IGNORE INTO products (name, price, category, description, image, sizes, stock) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`, product);
    });
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
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

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

app.get('/cart', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cart.html'));
});

app.get('/checkout', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'checkout.html'));
});

// API Routes

// Authentication
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    db.get('SELECT * FROM admin_users WHERE email = ?', [email], (err, user) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
    });
});

app.post('/api/auth/register', (req, res) => {
    const { name, email, password, role } = req.body;

    const hashedPassword = bcrypt.hashSync(password, 10);

    db.run('INSERT INTO admin_users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, role || 'admin'],
        function (err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ success: false, message: 'Email already exists' });
                }
                return res.status(500).json({ success: false, message: 'Database error' });
            }

            res.json({ success: true, message: 'Account created successfully' });
        }
    );
});

app.get('/api/auth/verify', authenticateToken, (req, res) => {
    db.get('SELECT id, name, email, role FROM admin_users WHERE id = ?', [req.user.id], (err, user) => {
        if (err || !user) {
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }

        res.json({ success: true, user });
    });
});

// Dashboard Stats
app.get('/api/dashboard/stats', authenticateToken, (req, res) => {
    const stats = {};

    // Get total sales
    db.get('SELECT SUM(total) as totalSales FROM orders', (err, salesResult) => {
        stats.totalSales = salesResult?.totalSales || 0;

        // Get total orders
        db.get('SELECT COUNT(*) as totalOrders FROM orders', (err, ordersResult) => {
            stats.totalOrders = ordersResult?.totalOrders || 0;

            // Get total products
            db.get('SELECT COUNT(*) as totalProducts FROM products', (err, productsResult) => {
                stats.totalProducts = productsResult?.totalProducts || 0;

                // Get total customers
                db.get('SELECT COUNT(*) as totalCustomers FROM customers', (err, customersResult) => {
                    stats.totalCustomers = customersResult?.totalCustomers || 0;

                    res.json({ success: true, stats });
                });
            });
        });
    });
});

// Products
app.get('/api/products', (req, res) => {
    db.all('SELECT * FROM products ORDER BY created_at DESC', (err, products) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        res.json({ success: true, products });
    });
});

app.post('/api/products', authenticateToken, (req, res) => {
    const { name, price, category, description, image, sizes, stock } = req.body;

    db.run(`INSERT INTO products (name, price, category, description, image, sizes, stock) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [name, price, category, description, image, JSON.stringify(sizes), stock],
        function (err) {
            if (err) {
                return res.status(500).json({ success: false, message: 'Database error' });
            }

            res.json({ success: true, productId: this.lastID });
        }
    );
});

app.delete('/api/products/:id', authenticateToken, (req, res) => {
    const productId = req.params.id;

    db.run('DELETE FROM products WHERE id = ?', [productId], function (err) {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.json({ success: true, message: 'Product deleted successfully' });
    });
});

// Orders
app.get('/api/orders', authenticateToken, (req, res) => {
    db.all('SELECT * FROM orders ORDER BY created_at DESC', (err, orders) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        res.json({ success: true, orders });
    });
});

app.get('/api/orders/recent', authenticateToken, (req, res) => {
    db.all('SELECT * FROM orders ORDER BY created_at DESC LIMIT 5', (err, orders) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        res.json({ success: true, orders });
    });
});

app.post('/api/orders', (req, res) => {
    const { customerName, customerEmail, total, items, shippingAddress } = req.body;

    db.run(`INSERT INTO orders (customer_name, customer_email, total, items, shipping_address) 
            VALUES (?, ?, ?, ?, ?)`,
        [customerName, customerEmail, total, JSON.stringify(items), shippingAddress],
        function (err) {
            if (err) {
                return res.status(500).json({ success: false, message: 'Database error' });
            }

            res.json({ success: true, orderId: this.lastID });
        }
    );
});

// Customer Authentication
app.post('/api/auth/customer/register', (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    db.run('INSERT INTO customers (name, email, password) VALUES (?, ?, ?)',
        [name, email, hashedPassword],
        function (err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ success: false, message: 'Email already exists' });
                }
                return res.status(500).json({ success: false, message: 'Database error' });
            }

            const token = jwt.sign(
                { id: this.lastID, email, role: 'customer' },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                success: true,
                message: 'Account created successfully',
                token,
                user: { id: this.lastID, name, email, role: 'customer' }
            });
        }
    );
});

app.post('/api/auth/customer/login', (req, res) => {
    const { email, password } = req.body;

    db.get('SELECT * FROM customers WHERE email = ?', [email], (err, user) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (!user || !user.password || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: 'customer' },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            token,
            user: { id: user.id, name: user.name, email: user.email, role: 'customer' }
        });
    });
});

// Customers
app.get('/api/customers', authenticateToken, (req, res) => {
    db.all(`SELECT c.*, COUNT(o.id) as orderCount, SUM(o.total) as totalSpent 
            FROM customers c 
            LEFT JOIN orders o ON c.id = o.customer_id 
            GROUP BY c.id 
            ORDER BY c.created_at DESC`, (err, customers) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        res.json({ success: true, customers });
    });
});

// Top Products
app.get('/api/products/top', authenticateToken, (req, res) => {
    // For now, return sample data. In a real app, you'd calculate from order items
    db.all('SELECT * FROM products LIMIT 5', (err, products) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        const topProducts = products.map(product => ({
            ...product,
            salesCount: Math.floor(Math.random() * 50) + 10
        }));

        res.json({ success: true, products: topProducts });
    });
});

// Live visitor tracking API
app.post('/api/visitor/join', (req, res) => {
    const sessionId = Date.now() + Math.random();
    activeVisitors.add(sessionId);
    
    sessionTimers.set(sessionId, setTimeout(() => {
        activeVisitors.delete(sessionId);
        sessionTimers.delete(sessionId);
    }, 30000));
    
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

// Public API for frontend
app.get('/api/public/products', (req, res) => {
    db.all('SELECT * FROM products WHERE stock > 0', (err, products) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        // Parse sizes JSON
        const productsWithSizes = products.map(product => ({
            ...product,
            sizes: product.sizes ? (typeof product.sizes === 'string' && product.sizes.startsWith('[') ? JSON.parse(product.sizes) : product.sizes.split(',')) : []
        }));

        res.json({ success: true, products: productsWithSizes });
    });
});

app.listen(PORT, () => {
    console.log(`🚀 TRAGY Server running on http://localhost:${PORT}`);
    console.log(`📊 Admin Dashboard: http://localhost:${PORT}/admin`);
    console.log(`🛍️ Main Website: http://localhost:${PORT}`);
    console.log(`🔐 Default Admin: admin@tragy.com / admin123`);
});