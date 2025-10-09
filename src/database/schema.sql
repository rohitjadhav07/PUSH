-- PushPay Ultimate Bot Database Schema
-- Complete feature set for the best crypto payment bot ever!

-- Users table with comprehensive profile data
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_id TEXT UNIQUE NOT NULL,
    username TEXT,
    phone_number TEXT,
    wallet_address TEXT UNIQUE NOT NULL,
    private_key TEXT NOT NULL, -- Encrypted
    display_name TEXT,
    profile_photo TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT 1,
    kyc_status TEXT DEFAULT 'pending', -- pending, verified, rejected
    two_fa_enabled BOOLEAN DEFAULT 0,
    two_fa_secret TEXT,
    daily_limit DECIMAL(20,8) DEFAULT 1000.0,
    monthly_limit DECIMAL(20,8) DEFAULT 10000.0,
    total_sent DECIMAL(20,8) DEFAULT 0.0,
    total_received DECIMAL(20,8) DEFAULT 0.0,
    referral_code TEXT UNIQUE,
    referred_by TEXT,
    settings TEXT -- JSON settings
);

-- Transactions table with comprehensive tracking
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tx_hash TEXT UNIQUE NOT NULL,
    from_user_id INTEGER, -- Allow NULL for system transactions like faucet
    to_user_id INTEGER,
    to_address TEXT,
    amount DECIMAL(20,8) NOT NULL,
    token_symbol TEXT NOT NULL DEFAULT 'PC',
    token_address TEXT,
    fee DECIMAL(20,8) DEFAULT 0.0,
    status TEXT DEFAULT 'pending', -- pending, confirmed, failed, cancelled
    type TEXT NOT NULL, -- send, receive, request, split, swap, yield, faucet
    message TEXT,
    block_number INTEGER,
    gas_used INTEGER,
    gas_price DECIMAL(20,8),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    confirmed_at DATETIME,
    metadata TEXT, -- JSON for additional data
    FOREIGN KEY (from_user_id) REFERENCES users(id),
    FOREIGN KEY (to_user_id) REFERENCES users(id)
);

-- Payment requests table
CREATE TABLE IF NOT EXISTS payment_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    requester_id INTEGER NOT NULL,
    payer_id INTEGER,
    amount DECIMAL(20,8) NOT NULL,
    token_symbol TEXT NOT NULL DEFAULT 'PC',
    message TEXT,
    status TEXT DEFAULT 'pending', -- pending, paid, cancelled, expired
    expires_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    paid_at DATETIME,
    transaction_id INTEGER,
    FOREIGN KEY (requester_id) REFERENCES users(id),
    FOREIGN KEY (payer_id) REFERENCES users(id),
    FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);

-- Split payments table
CREATE TABLE IF NOT EXISTS split_payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    creator_id INTEGER NOT NULL,
    total_amount DECIMAL(20,8) NOT NULL,
    token_symbol TEXT NOT NULL DEFAULT 'PC',
    description TEXT,
    status TEXT DEFAULT 'active', -- active, completed, cancelled
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY (creator_id) REFERENCES users(id)
);

-- Split payment participants
CREATE TABLE IF NOT EXISTS split_participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    split_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    amount_owed DECIMAL(20,8) NOT NULL,
    amount_paid DECIMAL(20,8) DEFAULT 0.0,
    status TEXT DEFAULT 'pending', -- pending, paid, skipped
    paid_at DATETIME,
    transaction_id INTEGER,
    FOREIGN KEY (split_id) REFERENCES split_payments(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);

-- Recurring payments
CREATE TABLE IF NOT EXISTS recurring_payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_user_id INTEGER NOT NULL,
    to_user_id INTEGER NOT NULL,
    amount DECIMAL(20,8) NOT NULL,
    token_symbol TEXT NOT NULL DEFAULT 'PC',
    frequency TEXT NOT NULL, -- daily, weekly, monthly
    next_payment DATETIME NOT NULL,
    end_date DATETIME,
    status TEXT DEFAULT 'active', -- active, paused, cancelled, completed
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_payment_at DATETIME,
    total_payments INTEGER DEFAULT 0,
    FOREIGN KEY (from_user_id) REFERENCES users(id),
    FOREIGN KEY (to_user_id) REFERENCES users(id)
);

-- Price alerts
CREATE TABLE IF NOT EXISTS price_alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token_symbol TEXT NOT NULL,
    condition_type TEXT NOT NULL, -- above, below, change_percent
    target_price DECIMAL(20,8),
    change_percent DECIMAL(5,2),
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    triggered_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Merchant accounts
CREATE TABLE IF NOT EXISTS merchants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    business_name TEXT NOT NULL,
    business_type TEXT,
    website TEXT,
    description TEXT,
    logo_url TEXT,
    is_verified BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    merchant_id INTEGER NOT NULL,
    invoice_number TEXT UNIQUE NOT NULL,
    customer_info TEXT, -- JSON
    amount DECIMAL(20,8) NOT NULL,
    token_symbol TEXT NOT NULL DEFAULT 'PC',
    description TEXT,
    status TEXT DEFAULT 'pending', -- pending, paid, cancelled, expired
    expires_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    paid_at DATETIME,
    transaction_id INTEGER,
    payment_link TEXT,
    qr_code TEXT,
    FOREIGN KEY (merchant_id) REFERENCES merchants(id),
    FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);

-- DeFi positions (yield farming, staking, etc.)
CREATE TABLE IF NOT EXISTS defi_positions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    protocol_name TEXT NOT NULL,
    position_type TEXT NOT NULL, -- stake, farm, lend, borrow
    token_symbol TEXT NOT NULL,
    amount DECIMAL(20,8) NOT NULL,
    apy DECIMAL(5,2),
    start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    end_date DATETIME,
    status TEXT DEFAULT 'active', -- active, withdrawn, expired
    rewards_earned DECIMAL(20,8) DEFAULT 0.0,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Social feed (privacy-controlled transactions)
CREATE TABLE IF NOT EXISTS social_feed (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    transaction_id INTEGER NOT NULL,
    visibility TEXT DEFAULT 'private', -- public, friends, private
    message TEXT,
    likes_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);

-- User connections (friends/contacts)
CREATE TABLE IF NOT EXISTS user_connections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    connected_user_id INTEGER NOT NULL,
    connection_type TEXT DEFAULT 'friend', -- friend, blocked, favorite
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (connected_user_id) REFERENCES users(id),
    UNIQUE(user_id, connected_user_id)
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL, -- payment, request, alert, social, system
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data TEXT, -- JSON additional data
    is_read BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Analytics events
CREATE TABLE IF NOT EXISTS analytics_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    event_type TEXT NOT NULL,
    event_data TEXT, -- JSON
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Security logs
CREATE TABLE IF NOT EXISTS security_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    success BOOLEAN NOT NULL,
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_phone_number ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_transactions_hash ON transactions(tx_hash);
CREATE INDEX IF NOT EXISTS idx_transactions_from_user ON transactions(from_user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_to_user ON transactions(to_user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_payment_requests_status ON payment_requests(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);