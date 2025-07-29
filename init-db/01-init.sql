-- Restaurant POS Database Schema

-- Products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    image_url VARCHAR(500),
    stock_quantity INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    total_amount DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) NOT NULL,
    subtotal_amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    customer_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transaction items table
CREATE TABLE transaction_items (
    id SERIAL PRIMARY KEY,
    transaction_id INTEGER REFERENCES transactions(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Daily sales summary table
CREATE TABLE daily_sales (
    id SERIAL PRIMARY KEY,
    sale_date DATE UNIQUE NOT NULL,
    total_sales DECIMAL(10,2) DEFAULT 0,
    total_transactions INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial products
INSERT INTO products (name, description, price, category, stock_quantity) VALUES
('Coffee', 'Fresh brewed coffee', 4.50, 'Beverages', 100),
('Croissant', 'Buttery croissant', 3.25, 'Bakery', 50),
('Caesar Salad', 'Fresh caesar salad with croutons', 12.99, 'Food', 30),
('Orange Juice', 'Freshly squeezed orange juice', 3.75, 'Beverages', 80),
('Chocolate Muffin', 'Double chocolate chip muffin', 4.25, 'Bakery', 40),
('Sandwich', 'Turkey and cheese sandwich', 8.50, 'Food', 25),
('Latte', 'Espresso with steamed milk', 5.25, 'Beverages', 75),
('Bagel', 'Everything bagel with cream cheese', 2.75, 'Bakery', 60);

-- Create indexes for better performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_transaction_items_transaction_id ON transaction_items(transaction_id);
CREATE INDEX idx_daily_sales_date ON daily_sales(sale_date);

-- Create a function to update daily sales
CREATE OR REPLACE FUNCTION update_daily_sales()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO daily_sales (sale_date, total_sales, total_transactions)
    VALUES (DATE(NEW.created_at), NEW.total_amount, 1)
    ON CONFLICT (sale_date)
    DO UPDATE SET
        total_sales = daily_sales.total_sales + NEW.total_amount,
        total_transactions = daily_sales.total_transactions + 1,
        updated_at = CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update daily sales
CREATE TRIGGER trigger_update_daily_sales
    AFTER INSERT ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_daily_sales();