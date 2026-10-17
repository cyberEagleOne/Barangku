-- ==============================================================================
-- Barangku Database Schema (PostgreSQL + PostGIS)
-- Reference: docs/HANDOFF.md Section 4
-- ==============================================================================

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. Custom Types / Enums
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('pelanggan', 'tukang');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE shop_status AS ENUM ('open', 'busy', 'closed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(120) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(30) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'pelanggan',
    fresh BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Technicians / Workshops Table
CREATE TABLE IF NOT EXISTS technicians (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    area VARCHAR(100) NOT NULL,
    address TEXT,
    location GEOMETRY(Point, 4326),          -- PostGIS Point (Longitude, Latitude)
    latitude NUMERIC(10, 7),                 -- Display helper
    longitude NUMERIC(10, 7),                -- Display helper
    devices TEXT[] NOT NULL DEFAULT '{}',    -- ARRAY['Laptop', 'HP']
    rating NUMERIC(2, 1) NOT NULL DEFAULT 0.0,
    review_count INTEGER NOT NULL DEFAULT 0,
    min_price BIGINT NOT NULL DEFAULT 50000,
    max_price BIGINT NOT NULL DEFAULT 350000,
    status shop_status NOT NULL DEFAULT 'open',
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    photo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(30) UNIQUE NOT NULL,       -- e.g., 'BRK-2026-1024'
    customer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    customer_name VARCHAR(120) NOT NULL,
    customer_phone VARCHAR(30) NOT NULL,
    technician_id BIGINT NOT NULL REFERENCES technicians(id) ON DELETE RESTRICT,
    device VARCHAR(50) NOT NULL,             -- 'Laptop' | 'HP'
    model VARCHAR(120) NOT NULL,
    problem VARCHAR(150) NOT NULL,
    notes TEXT NOT NULL DEFAULT '',
    visit_date DATE NOT NULL,
    visit_time TIME NOT NULL,
    photo_name TEXT,
    status SMALLINT NOT NULL DEFAULT 0 CHECK (status BETWEEN -1 AND 5),
    estimate_min BIGINT,
    estimate_max BIGINT,
    message TEXT,
    rejected BOOLEAN NOT NULL DEFAULT FALSE,
    incoming BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Order Status History Logs (Audit Trail)
CREATE TABLE IF NOT EXISTS order_status_logs (
    id BIGSERIAL PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    previous_status SMALLINT,
    new_status SMALLINT NOT NULL,
    note TEXT,
    changed_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    technician_id BIGINT NOT NULL REFERENCES technicians(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewer_name VARCHAR(120) NOT NULL,
    rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT NOT NULL,
    service VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Indexes & Performance Optimizations
CREATE INDEX IF NOT EXISTS idx_technicians_location ON technicians USING GIST (location);
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_code ON orders (code);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders (customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_technician_status ON orders (technician_id, status);
CREATE INDEX IF NOT EXISTS idx_technicians_status_verified ON technicians (status, verified);
CREATE INDEX IF NOT EXISTS idx_reviews_technician ON reviews (technician_id);
