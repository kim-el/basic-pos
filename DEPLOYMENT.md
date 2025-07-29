# Restaurant POS System

A modern Point of Sale system built with Next.js, shadcn/ui, and PostgreSQL. Designed for restaurant operations with real-time sales tracking, inventory management, and smooth user experience.

## Features

- 🏪 **Product Management**: Categorized product grid with real-time inventory
- 🛒 **Smart Cart**: Add, modify, and remove items with instant calculations
- 💳 **Payment Processing**: Multiple payment methods (Cash, Card, Digital Wallet)
- 📊 **Sales Analytics**: Real-time daily sales and transaction tracking
- 🎨 **Modern UI**: Smooth animations and responsive design
- 🐳 **Containerized**: Easy deployment with Docker

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: PostgreSQL 15
- **Deployment**: Docker & Docker Compose
- **Icons**: Lucide React

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ui-test-app
   ```

2. **Start the application**
   ```bash
   docker-compose up -d
   ```

3. **Access the POS**
   - Open http://localhost:3000/pos
   - Database will be automatically initialized with sample products

### DigitalOcean Deployment

#### Option 1: App Platform (Easiest)
1. Push your code to GitHub
2. Create a new App on DigitalOcean App Platform
3. Connect your GitHub repository
4. Select "Docker" as the build method
5. Add environment variables:
   ```
   DATABASE_URL=your_postgresql_connection_string
   NODE_ENV=production
   ```

#### Option 2: Droplet Deployment
1. Create a Ubuntu droplet
2. Install Docker:
   ```bash
   sudo apt update
   sudo apt install docker.io docker-compose
   ```
3. Clone and deploy:
   ```bash
   git clone <your-repo-url>
   cd ui-test-app
   docker-compose up -d
   ```

## Environment Variables

Create a `.env.production` file for production:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@host:5432/database_name

# Security (CHANGE THESE!)
POSTGRES_PASSWORD=your_secure_password
POSTGRES_USER=your_username
POSTGRES_DB=restaurant_pos

# Application
NODE_ENV=production
PORT=3000
```

## Database Schema

### Tables
- **products**: Menu items with pricing and inventory
- **transactions**: Completed sales records
- **transaction_items**: Individual items within transactions
- **daily_sales**: Automated daily sales summaries

### Key Features
- Automatic daily sales calculation via triggers
- Stock quantity tracking
- Transaction history with full audit trail

## API Endpoints

- `GET /api/products` - Fetch all active products
- `POST /api/transactions` - Process a sale
- `GET /api/daily-sales` - Get today's sales summary

## Customization

### Adding Products
Products are automatically loaded from the database. To add new items:
1. Use the admin interface (coming soon)
2. Or insert directly into the `products` table

### Modifying Tax Rate
Edit the tax calculation in:
- `src/app/pos/page.tsx` (line 73)
- `src/components/pos/Cart.tsx` (line 19)

### Styling
All styling uses Tailwind CSS classes. Modify components in `src/components/pos/`

## Production Considerations

### Security
- [ ] Change default database passwords
- [ ] Set up SSL certificates
- [ ] Configure firewall rules
- [ ] Regular database backups

### Performance
- [ ] Configure database connection pooling
- [ ] Set up database indices for large datasets
- [ ] Implement Redis for session management

### Monitoring
- [ ] Set up logging (Winston/Morgan)
- [ ] Database monitoring
- [ ] Application performance monitoring

## Support

For restaurant-specific customizations or enterprise features, contact [your-email].

## License

[Your License Choice]