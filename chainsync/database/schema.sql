-- ChainSync Universal Social Commerce Platform
-- Complete database schema for cross-chain e-commerce

-- Users table with cross-chain wallet support
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE,
    display_name TEXT NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    cover_image_url TEXT,
    
    -- Cross-chain wallet addresses
    ethereum_address TEXT,
    polygon_address TEXT,
    solana_address TEXT,
    base_address TEXT,
    push_chain_address TEXT,
    
    -- Authentication
    password_hash TEXT,
    email_verified BOOLEAN DEFAULT 0,
    two_fa_enabled BOOLEAN DEFAULT 0,
    two_fa_secret TEXT,
    
    -- Profile settings
    is_seller BOOLEAN DEFAULT 0,
    is_verified BOOLEAN DEFAULT 0,
    seller_rating DECIMAL(3,2) DEFAULT 0.0,
    total_sales INTEGER DEFAULT 0,
    total_purchases INTEGER DEFAULT 0,
    
    -- Social features
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    social_links TEXT, -- JSON
    
    -- Preferences
    preferred_chain TEXT DEFAULT 'push',
    notification_settings TEXT, -- JSON
    privacy_settings TEXT, -- JSON
    
    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_active DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Products table with cross-chain support
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    seller_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    short_description TEXT,
    
    -- Pricing (supports multiple chains)
    price_pc DECIMAL(20,8),
    price_eth DECIMAL(20,8),
    price_matic DECIMAL(20,8),
    price_sol DECIMAL(20,8),
    price_usd DECIMAL(10,2), -- Reference price
    
    -- Product details
    category TEXT NOT NULL,
    subcategory TEXT,
    tags TEXT, -- JSON array
    condition TEXT DEFAULT 'new', -- new, used, refurbished
    brand TEXT,
    model TEXT,
    
    -- Inventory
    quantity INTEGER DEFAULT 1,
    unlimited_quantity BOOLEAN DEFAULT 0,
    digital_product BOOLEAN DEFAULT 0,
    
    -- Media
    images TEXT, -- JSON array of image URLs
    videos TEXT, -- JSON array of video URLs
    
    -- Shipping
    shipping_required BOOLEAN DEFAULT 1,
    shipping_cost_usd DECIMAL(10,2) DEFAULT 0,
    shipping_regions TEXT, -- JSON array
    processing_time_days INTEGER DEFAULT 3,
    
    -- Social commerce
    featured BOOLEAN DEFAULT 0,
    trending BOOLEAN DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    
    -- SEO
    slug TEXT UNIQUE,
    meta_title TEXT,
    meta_description TEXT,
    
    -- Status
    status TEXT DEFAULT 'active', -- active, inactive, sold, deleted
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (seller_id) REFERENCES users(id)
);

-- Orders table with cross-chain payment tracking
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number TEXT UNIQUE NOT NULL,
    buyer_id INTEGER NOT NULL,
    seller_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    
    -- Order details
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(20,8) NOT NULL,
    total_amount DECIMAL(20,8) NOT NULL,
    currency TEXT NOT NULL, -- PC, ETH, MATIC, SOL
    
    -- Cross-chain payment info
    payment_chain TEXT NOT NULL, -- ethereum, polygon, solana, push
    buyer_address TEXT NOT NULL,
    seller_address TEXT NOT NULL,
    transaction_hash TEXT,
    block_number INTEGER,
    
    -- Shipping info
    shipping_address TEXT, -- JSON
    shipping_cost DECIMAL(10,2) DEFAULT 0,
    tracking_number TEXT,
    
    -- Status tracking
    status TEXT DEFAULT 'pending', -- pending, paid, shipped, delivered, cancelled, disputed
    payment_status TEXT DEFAULT 'pending', -- pending, confirmed, failed
    shipping_status TEXT DEFAULT 'not_shipped', -- not_shipped, shipped, in_transit, delivered
    
    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    paid_at DATETIME,
    shipped_at DATETIME,
    delivered_at DATETIME,
    
    -- Metadata
    notes TEXT,
    metadata TEXT, -- JSON for additional data
    
    FOREIGN KEY (buyer_id) REFERENCES users(id),
    FOREIGN KEY (seller_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Reviews and ratings
CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    reviewer_id INTEGER NOT NULL,
    reviewed_user_id INTEGER NOT NULL, -- seller being reviewed
    product_id INTEGER NOT NULL,
    
    -- Review content
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    content TEXT NOT NULL,
    images TEXT, -- JSON array of review images
    
    -- Verification
    verified_purchase BOOLEAN DEFAULT 1,
    helpful_votes INTEGER DEFAULT 0,
    
    -- Status
    status TEXT DEFAULT 'active', -- active, hidden, flagged
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (reviewer_id) REFERENCES users(id),
    FOREIGN KEY (reviewed_user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Social features - Following system
CREATE TABLE IF NOT EXISTS user_follows (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    follower_id INTEGER NOT NULL,
    following_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (follower_id) REFERENCES users(id),
    FOREIGN KEY (following_id) REFERENCES users(id),
    UNIQUE(follower_id, following_id)
);

-- Product likes/favorites
CREATE TABLE IF NOT EXISTS product_likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    UNIQUE(user_id, product_id)
);

-- Social sharing tracking
CREATE TABLE IF NOT EXISTS social_shares (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER,
    order_id INTEGER,
    platform TEXT NOT NULL, -- twitter, discord, telegram, etc.
    share_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- Group buying feature
CREATE TABLE IF NOT EXISTS group_buys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    creator_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    
    -- Group buy details
    title TEXT NOT NULL,
    description TEXT,
    target_quantity INTEGER NOT NULL,
    current_quantity INTEGER DEFAULT 0,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    
    -- Pricing
    original_price DECIMAL(20,8) NOT NULL,
    group_price DECIMAL(20,8) NOT NULL,
    currency TEXT NOT NULL,
    
    -- Timeline
    starts_at DATETIME NOT NULL,
    ends_at DATETIME NOT NULL,
    
    -- Status
    status TEXT DEFAULT 'active', -- active, completed, cancelled, expired
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (creator_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Group buy participants
CREATE TABLE IF NOT EXISTS group_buy_participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_buy_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (group_buy_id) REFERENCES group_buys(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(group_buy_id, user_id)
);

-- Affiliate program
CREATE TABLE IF NOT EXISTS affiliate_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    affiliate_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    affiliate_code TEXT UNIQUE NOT NULL,
    commission_percentage DECIMAL(5,2) DEFAULT 5.0,
    clicks_count INTEGER DEFAULT 0,
    conversions_count INTEGER DEFAULT 0,
    total_earnings DECIMAL(20,8) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (affiliate_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Notifications system
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL, -- order, payment, social, system
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data TEXT, -- JSON additional data
    
    -- Notification settings
    is_read BOOLEAN DEFAULT 0,
    is_push BOOLEAN DEFAULT 0,
    is_email BOOLEAN DEFAULT 0,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Cross-chain transaction tracking
CREATE TABLE IF NOT EXISTS cross_chain_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    
    -- Source chain info
    source_chain TEXT NOT NULL,
    source_address TEXT NOT NULL,
    source_tx_hash TEXT,
    
    -- Destination chain info
    destination_chain TEXT NOT NULL,
    destination_address TEXT NOT NULL,
    destination_tx_hash TEXT,
    
    -- Transaction details
    amount DECIMAL(20,8) NOT NULL,
    currency TEXT NOT NULL,
    gas_used INTEGER,
    gas_price DECIMAL(20,8),
    
    -- Status
    status TEXT DEFAULT 'pending', -- pending, confirmed, failed
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    confirmed_at DATETIME,
    
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- Analytics and metrics
CREATE TABLE IF NOT EXISTS analytics_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    event_type TEXT NOT NULL,
    event_data TEXT, -- JSON
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_ethereum_address ON users(ethereum_address);
CREATE INDEX IF NOT EXISTS idx_users_push_chain_address ON users(push_chain_address);

CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller ON orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);