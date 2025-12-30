# TRAGY Admin Dashboard Setup Instructions

## 🚀 Quick Start

### 1. Install Dependencies
```bash
# Copy the new package.json
copy package-admin.json package.json

# Install required packages
npm install
```

### 2. Start the Server
```bash
# Start with database support
node server-with-db.js
```

### 3. Access the Dashboard
- **Main Website**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin
- **Default Admin Login**: 
  - Email: `admin@tragy.com`
  - Password: `admin123`

## 📊 Admin Dashboard Features

### Authentication
- ✅ Secure login/register system
- ✅ JWT token-based authentication
- ✅ Role-based access (Admin, Manager, Staff)
- ✅ Password hashing with bcrypt

### Dashboard Overview
- ✅ Sales statistics
- ✅ Order tracking
- ✅ Product inventory
- ✅ Customer analytics
- ✅ Recent orders display
- ✅ Top products analysis

### Product Management
- ✅ Add new products
- ✅ Edit existing products
- ✅ Delete products
- ✅ Inventory tracking
- ✅ Category management
- ✅ Image upload support

### Order Management
- ✅ View all orders
- ✅ Filter by status
- ✅ Update order status
- ✅ Customer information
- ✅ Order details

### Customer Management
- ✅ Customer database
- ✅ Order history per customer
- ✅ Total spent tracking
- ✅ Registration dates

### Analytics
- ✅ Sales charts (ready for Chart.js)
- ✅ Product performance
- ✅ Revenue tracking
- ✅ Growth metrics

### Settings
- ✅ Website configuration
- ✅ Team member management
- ✅ User roles and permissions

## 🗄️ Database Structure

### Tables Created Automatically:
1. **admin_users** - Dashboard users
2. **products** - Product catalog
3. **customers** - Customer information
4. **orders** - Order tracking

### Sample Data Included:
- Default admin user
- Sample products
- Demo orders (when created)

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/register` - Create admin account
- `GET /api/auth/verify` - Verify token

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Add new product
- `DELETE /api/products/:id` - Delete product
- `GET /api/public/products` - Public product list

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order
- `GET /api/orders/recent` - Recent orders

### Dashboard
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/customers` - Customer list
- `GET /api/products/top` - Top selling products

## 🔐 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Protected admin routes
- SQL injection prevention
- CORS enabled for API access

## 📱 Frontend Integration

The main website now connects to the database:
- Products loaded from database
- Real-time inventory
- Order placement to database
- Search functionality with database

## 🛠️ Customization

### Adding New Admin Users:
1. Go to `/admin`
2. Click "Create Account" tab
3. Fill in details and select role
4. Account created and ready to use

### Adding Products:
1. Login to admin dashboard
2. Go to Products section
3. Click "Add Product"
4. Fill in product details
5. Product appears on main website

### Managing Orders:
1. Orders appear automatically when customers checkout
2. Update status from dashboard
3. Track customer information
4. View order history

## 📊 Database File

- Database file: `tragy_database.db` (SQLite)
- Automatically created on first run
- Contains all your data
- Backup regularly for safety

## 🚨 Important Notes

1. **Change Default Password**: Change the default admin password after first login
2. **Backup Database**: Regular backups of `tragy_database.db`
3. **Environment Variables**: Consider using `.env` file for production
4. **SSL Certificate**: Use HTTPS in production
5. **Database Security**: Secure database file permissions

## 🎯 Next Steps

1. Start the server with `node server-with-db.js`
2. Login to admin dashboard
3. Add your products
4. Customize settings
5. Start selling!

Your TRAGY admin dashboard is now ready with full database integration! 🎉