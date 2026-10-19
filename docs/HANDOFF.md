# Barangku – Backend Handoff Specification

> **Panduan Database**: Untuk instruksi lengkap pengaturan PostgreSQL, ekstensi PostGIS, skema database, migrasi data, dan checklist tugas rekan database, silakan lihat dokumen [DATABASE_HANDOVER.md](./DATABASE_HANDOVER.md).

## 1. Overview & Running the Project

Barangku is a web application that connects customers with broken electronics (laptops and smartphones) to trusted independent repair technicians nearby in Tangerang. Customers can search and compare repair shops by device type, ratings, and estimated price ranges, book an in-person repair visit, and track repair progress step by step. Technicians have a dedicated portal to manage incoming repair requests, update repair progress, and adjust shop operational status.

### Environment & Toolchain
- **Node.js**: v22 (`.mise.toml`)
- **Package Manager**: pnpm v10.34.3 or npm
- **Framework**: React 19, TypeScript 5.7, Vite 8, Tailwind CSS v4
- **Primary Database**: PostgreSQL (v15+) with PostGIS extension for geospatial queries

### Available Scripts (`package.json`)
```bash
npm install       # Install project dependencies
npm run dev       # Start Vite development server (default: http://localhost:8443)
npm run build     # Compile TypeScript and build production bundle into /dist
npm run preview   # Locally preview production build
npm run db:setup  # Initialize PostgreSQL database, schema, and seed data
npm run db:backup # Export database SQL backup to /backups and sanitize old logs
npm run format    # Run oxfmt code formatter
```

---

## 2. Route Inventory

All routing in the frontend is currently implemented via window hash navigation (`window.location.hash`).

| Hash Route | Page Component | Access Level | Data Read | Data Written |
| :--- | :--- | :--- | :--- | :--- |
| `#beranda`, `#cara-kerja` | `Home` | Public | `searchTechnicians()`, `getFeaturedReviews()` | None |
| `#hasil-pencarian` *(default)* | `SearchResults` (`App.tsx`) | Public | `searchTechnicians({ filters, sort })` | None |
| `#detail/:id` | `TechnicianDetail` | Public | `getTechnician(id)`, `getTechnicianReviews(id)` | None |
| `#pesan/:id` | `Booking` | Protected (Customer) | `getTechnician(id)` | `createOrder(...)` |
| `#lacak/:code` | `Tracking` | Protected (Customer / Authenticated) | `getOrder(code)` | None |
| `#pesanan-saya` | `MyOrders` | Protected (Customer) | `getMyOrders()` | None |
| `#masuk` | `Auth (mode="masuk")` | Public | Validates against database / memory | `login(identity, password, role)` |
| `#daftar` | `Auth (mode="daftar")` | Public | None | `register(userData)` |
| `#lupa-sandi` | `ForgotPassword` (`Auth.tsx`) | Public | None | `requestPasswordReset(identity)` |
| `#profil` | Profile screen (`App.tsx`) | Protected (Authenticated) | `getCurrentUser()` | `logout()`, `deleteAccount()` |
| `#untuk-tukang` | `UntukTukang` | Public | None | None |
| `#daftar-tukang` | `DaftarTukang` | Public / Customer upgrading | `getCurrentUser()` | `registerTechnicianShop(...)` |
| `#dashboard-tukang` | `DashboardTukang` | Protected (Technician only) | `getTechnicianOrders()`, `getShopStatus()` | `setShopStatus(...)`, `acceptOrder(code)`, `rejectOrder(code)` |
| `#pesanan-tukang/:code` | `PesananTukang` | Protected (Technician only) | `getOrder(code)` | `updateOrderStatus(code, status, details)` |
| `#sistem-desain` | `DesignSystem` | Public | Design system demo components | None |

> **Route Protection Logic**:
> - `isProtectedRoute(route)` checks: `pesan/`, `lacak/`, `pesanan-saya`, `profil`, `dashboard-tukang`, `pesanan-tukang/`. Unauthenticated visitors are redirected to `#masuk?next=<route>`.
> - `isTechnicianRoute(route)` checks: `dashboard-tukang`, `pesanan-tukang/`. Authenticated users with `role !== 'tukang'` receive an access-denied screen.

---

## 3. Data Models & Status Mapping

Source of truth: `src/api/types.ts`.

### Models

#### `User`
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | No | Generated unique identifier (e.g., `user-1718000000000`) |
| `name` | `string` | **Yes** | Full user display name |
| `contact` | `string` | **Yes** | Primary contact identifier (email or phone string) |
| `email` | `string` | No | Verified email address |
| `phone` | `string` | No | Mobile phone number |
| `role` | `'pelanggan' \| 'tukang'` | **Yes** | User role |
| `fresh` | `boolean` | No | Flag indicating newly registered account without prior history |

#### `Technician`
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `number` | **Yes** | Unique technician/shop ID |
| `name` | `string` | **Yes** | Workshop or technician name |
| `area` | `string` | **Yes** | District/subdistrict (e.g., `'Karawaci'`) |
| `devices` | `string[]` | **Yes** | Supported device categories (e.g., `['Laptop']`, `['HP']`) |
| `rating` | `string` | **Yes** | Formatted rating string (e.g., `'4,8'`) |
| `reviews` | `number` | **Yes** | Total count of customer reviews |
| `distance` | `number` | **Yes** | Distance from search center in kilometers |
| `min` | `number` | **Yes** | Minimum baseline repair cost (IDR) |
| `max` | `number` | **Yes** | Maximum baseline repair cost (IDR) |
| `status` | `'open' \| 'busy' \| 'closed'` | **Yes** | Shop operational status |
| `verified` | `boolean` | **Yes** | Verification badge indicator |
| `photo` | `string` | No | Shop photo URL |
| `address` | `string` | No | Physical workshop address |

#### `BookingDetails`
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `device` | `string` | **Yes** | Device category (`'Laptop'` or `'HP'`) |
| `model` | `string` | **Yes** | Device model brand/specification |
| `problem` | `string` | **Yes** | Problem category or description |
| `notes` | `string` | **Yes** | Customer notes/symptoms (may be empty string) |
| `date` | `string` | **Yes** | Planned shop visit date (`YYYY-MM-DD`) |
| `time` | `string` | **Yes** | Planned visit time (`HH:mm`) |

#### `Order`
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `code` | `string` | **Yes** | Order tracking code (e.g., `BRK-2026-1024`) |
| `technician` | `Technician` | **Yes** | Assigned technician profile snapshot |
| `details` | `BookingDetails` | **Yes** | Booking specifications |
| `status` | `OrderStatus` (`number`) | **Yes** | Numeric status code (-1 to 5) |
| `photoName` | `string` | No | Uploaded photo file name |
| `estimateMin` | `number` | No | Updated minimum price estimate |
| `estimateMax` | `number` | No | Updated maximum price estimate |
| `message` | `string` | No | Latest message/progress note from technician |
| `rejected` | `boolean` | No | True if technician rejected order |
| `incoming` | `boolean` | No | True if awaiting technician acceptance |
| `customerName` | `string` | No | Customer contact name |
| `customerPhone` | `string` | No | Customer phone number |
| `technicianId` | `number` | No | Foreign key linking to `Technician.id` |
| `shop` | `string` | No | Shop display name |
| `device`, `model`, `damage`, `date`, `time` | `string` | No | Convenience aliases reflecting `details` |

#### `Review`
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | `string` | **Yes** | Reviewer name |
| `date` | `string` | **Yes** | Relative date string (e.g., `'2 minggu lalu'`) |
| `rating` | `number` | **Yes** | Score from 1 to 5 |
| `text` | `string` | **Yes** | Review testimonial text |
| `service` | `string` | **Yes** | Service performed (e.g., `'Servis laptop'`) |

### OrderStatus Definitions & Customer vs. Technician Step Mapping

`OrderStatus` is stored as an integer:
- `-1`: **Ditolak** (Rejected by technician)
- `0`: **Dipesan** (Booked by customer, awaiting technician response)
- `1`: **Diterima** (Accepted by technician / device received at workshop)
- `2`: **Dicek** (Device inspected / diagnosis & cost estimated)
- `3`: **Diperbaiki** (Repair in progress after customer cost confirmation)
- `4`: **Siap diambil** (Repair finished and tested; ready for customer pickup)
- `5`: **Selesai** (Device retrieved by customer; order closed)

#### Mapping: Customer 6 Steps vs. Technician 5 Steps
- **Customer View** (`repairSteps` in `Tracking.tsx`): 6 display steps:
  1. `Dipesan` (Step 0)
  2. `Diterima` (Step 1)
  3. `Dicek` (Step 2)
  4. `Diperbaiki` (Step 3)
  5. `Siap diambil` (Step 4)
  6. `Selesai` (Step 5)
- **Technician View** (`TECH_STEPS` in `PesananTukang.tsx`): 5 in-workshop active steps:
  1. `Diterima` (`status = 1`, tech step index `0`)
  2. `Dicek` (`status = 2`, tech step index `1`)
  3. `Diperbaiki` (`status = 3`, tech step index `2`)
  4. `Siap diambil` (`status = 4`, tech step index `3`)
  5. `Selesai` (`status = 5`, tech step index `4`)
- **How they align**: Status `0` (`Dipesan`) is an **incoming request** in the technician dashboard (`DashboardTukang.tsx`), not an active repair step. The technician either accepts it (advances to status `1`, entering the 5-step repair workflow) or rejects it (sets status to `-1`).

---

## 4. Database Specification (PostgreSQL)

Barangku uses **PostgreSQL (v15+)** as its primary relational database. PostgreSQL provides ACID guarantees for order state transitions, native array/JSON support for device types, and spatial indexing via **PostGIS** for location-based shop search across Tangerang.

### 4.1 Required Extensions
- `pgcrypto` or `uuid-ossp`: For generating secure UUID primary keys (`gen_random_uuid()`).
- `postgis`: Enables geospatial data types (`GEOMETRY(Point, 4326)`) and spatial operators (`ST_DistanceSphere`, `ST_DWithin`) to compute distances between customers and repair shops.

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";
```

### 4.2 Database Schema (DDL)

```sql
-- 1. Enums
CREATE TYPE user_role AS ENUM ('pelanggan', 'tukang');
CREATE TYPE shop_status AS ENUM ('open', 'busy', 'closed');

-- 2. Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(120) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(30) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'pelanggan',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Technicians / Workshops Table
CREATE TABLE technicians (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    area VARCHAR(100) NOT NULL,
    address TEXT,
    location GEOMETRY(Point, 4326),          -- Longitude & Latitude for PostGIS queries
    latitude NUMERIC(10, 7),                 -- Display helper
    longitude NUMERIC(10, 7),                -- Display helper
    devices TEXT[] NOT NULL DEFAULT '{}',    -- e.g. ARRAY['Laptop', 'HP']
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

-- 4. Orders Table
CREATE TABLE orders (
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
    photo_name TEXT,                         -- Uploaded asset name or storage key
    status SMALLINT NOT NULL DEFAULT 0 CHECK (status BETWEEN -1 AND 5),
    estimate_min BIGINT,
    estimate_max BIGINT,
    message TEXT,
    rejected BOOLEAN NOT NULL DEFAULT FALSE,
    incoming BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Order Status History Logs (Audit Trail)
CREATE TABLE order_status_logs (
    id BIGSERIAL PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    previous_status SMALLINT,
    new_status SMALLINT NOT NULL,
    note TEXT,
    changed_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Reviews Table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    technician_id BIGINT NOT NULL REFERENCES technicians(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewer_name VARCHAR(120) NOT NULL,
    rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT NOT NULL,
    service VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 4.3 Recommended Indexes & Performance Optimization
```sql
-- Spatial index for radius and distance calculation
CREATE INDEX idx_technicians_location ON technicians USING GIST (location);

-- Fast lookup for order tracking by customer or tracking code
CREATE UNIQUE INDEX idx_orders_code ON orders (code);
CREATE INDEX idx_orders_customer ON orders (customer_id);
CREATE INDEX idx_orders_technician_status ON orders (technician_id, status);

-- Technician filtering by active status & verification
CREATE INDEX idx_technicians_status_verified ON technicians (status, verified);

-- Customer reviews per shop
CREATE INDEX idx_reviews_technician ON reviews (technician_id);
```

### 4.4 Geospatial Distance Query (PostGIS Example)
To search technicians sorted by proximity to the customer's coordinates:
```sql
SELECT 
    id, 
    name, 
    area, 
    devices, 
    rating, 
    review_count, 
    min_price, 
    max_price, 
    status, 
    verified,
    ROUND((ST_DistanceSphere(location, ST_MakePoint($1, $2)) / 1000.0)::numeric, 1) AS distance_km
FROM technicians
WHERE status != 'closed'
  AND ($3::text IS NULL OR $3 = ANY(devices))
ORDER BY distance_km ASC;
-- $1: user_longitude, $2: user_latitude, $3: optional device filter ('Laptop' / 'HP')
```

---

## 5. Order Status Flow & Permissions

```
[Customer]
    │
    ▼ (createOrder)
[0: Dipesan] (incoming = true)
    │
    ├──────────────────────────────┐
    ▼ [Technician: acceptOrder]    ▼ [Technician: rejectOrder]
[1: Diterima]                  [-1: Ditolak] (rejected = true)
    │
    ▼ [Technician: updateOrderStatus]
[2: Dicek]
    │
    ▼ [Technician: updateOrderStatus]
[3: Diperbaiki]
    │
    ▼ [Technician: updateOrderStatus]
[4: Siap diambil]
    │
    ▼ [Technician: updateOrderStatus]
[5: Selesai]
```

### Role Capabilities
- **Customer**:
  - May initiate an order (`createOrder`) -> creates status `0` (`Dipesan`).
  - No cancellation or status update endpoint is currently implemented in the frontend.
- **Technician**:
  - May accept status `0` -> advances to status `1` (`acceptOrder`).
  - May reject status `0` -> sets status `-1` (`rejectOrder`).
  - May advance active orders forward: `1 -> 2`, `2 -> 3`, `3 -> 4`, `4 -> 5` (`updateOrderStatus`).
  - May update `estimateMin`, `estimateMax`, and status `message` at any active status.

---

## 6. API Functions (Proposed Contract)

All methods in `src/api` return Promises. This contract is the proposed frontend interface that backend endpoints will replace.

### Auth (`src/api/auth.ts`)
- `getCurrentUser(): Promise<User | null>`
- `login(identity: string, password?: string, role?: UserRole): Promise<User>`
- `register(userData: { name: string; email?: string; phone?: string; role: UserRole; password?: string; agreed?: boolean }): Promise<User>`
- `logout(): Promise<void>`
- `requestPasswordReset(identity: string): Promise<void>`

### Technicians & Shops (`src/api/technicians.ts`)
- `searchTechnicians(options?: { device?: string; filters?: string[]; sort?: string }): Promise<Technician[]>`
- `getTechnician(id: number): Promise<Technician | null>`
- `getTechnicianReviews(id: number): Promise<Review[]>`
- `getShopStatus(technicianId?: number): Promise<ShopStatus>`
- `setShopStatus(status: ShopStatus, technicianId?: number): Promise<ShopStatus>`
- `getFeaturedReviews(): Promise<Review[]>`
- `registerTechnicianShop(shopData: { name: string; phone: string; email?: string; shopName: string; address: string; hours?: string; services?: string[]; minPrice?: string | number }): Promise<Technician>`

### Orders (`src/api/orders.ts`)
- `getOrder(code: string): Promise<Order | null>`
- `getMyOrders(userContact?: string): Promise<Order[]>`
- `getTechnicianOrders(technicianId?: number): Promise<Order[]>`
- `createOrder(data: { technician: Technician; details: BookingDetails; photoName?: string; customerName?: string; customerPhone?: string; code?: string }): Promise<Order>`
- `updateOrderStatus(code: string, status: OrderStatus, details?: { message?: string; estimateMin?: number; estimateMax?: number; rejected?: boolean; incoming?: boolean }): Promise<Order>`
- `acceptOrder(code: string): Promise<Order>`
- `rejectOrder(code: string): Promise<Order>`

---

## 7. What Is Fake Today

The frontend currently operates on a local client-side simulation. The following items are completely mock implementations:

1. **In-Memory Volatile Storage**: All state is stored in JavaScript variables (`inMemoryStore` in `src/api/mockData.ts`). Refreshing or reloading the browser resets all orders, accounts, and shop statuses back to default mock data. In production, this is replaced by PostgreSQL persistence.
2. **Login and Roles**: No session tokens, cookies, or backend auth verification exist. Any identity string logs in. If an account is not recognized, one is generated in memory. The user manually toggles between `pelanggan` and `tukang`.
3. **Passwords**: Front-end validation checks `password.length >= 8`, but passwords are never hashed, never validated against a credential store, and discarded upon receipt.
4. **Photo Upload**: The file picker captures a local `File` object and stores only `file.name` as `photoName` on the order object. No binary payload is transferred or stored.
5. **Interactive Map and Pins**: The map is a static SVG vector drawing of Tangerang roads and parks. Technician pin positions (`result-pin-1` through `6`) are hardcoded CSS percentage coordinates.
6. **Distance Calculation**: Distances (e.g., `1.2 km`, `2.1 km`) are hardcoded static numbers in `initialTechnicians`. No GPS coordinates, geocoding, or routing calculations are used. In production, PostgreSQL with PostGIS calculates real distances.
7. **Ratings and Reviews**: Rating numbers (`"4,8"`), review counts (`128`), and review text lists are static mock data generated in `mockData.ts`. Customers cannot submit reviews.
8. **Price Ranges**: Initial minimum and maximum prices are hardcoded per technician. The breakdown tables in `TechnicianDetail.tsx` are hardcoded arrays based on device type.
9. **Order Codes**: Codes are generated client-side using `Math.random()` (e.g., `BRK-2026-${Math.floor(1000 + Math.random() * 9000)}`).
10. **Notifications**: There are no push notifications, SMS, or emails. Timestamps in repair histories are generated client-side relative to booking date.
11. **"Hubungi tukang" & WhatsApp**: Clicking "Hubungi tukang" triggers an alert toast or a simulated dialog modal. There is no WhatsApp URL scheme or messaging integration.

---

## 8. Open Product Questions for Backend

The backend team will need product answers for the following unresolved mechanics:

1. **Technician Verification**: What criteria and documentation (e.g., KTP, business permit, workshop photo) make a technician `verified: true`? What is the administrative verification flow?
2. **Payment & Price Approval**: How and when are payments collected (cash on pickup, down payment, integrated payment gateway)? When a technician modifies `estimateMin` or `estimateMax` during status `2 (Dicek)`, how does the customer formally approve the revised quote before status `3 (Diperbaiki)` begins?
3. **Cancellation**: Can customers cancel an order after booking? Can technicians cancel an order after accepting it? What status code or refund policy applies to cancellations?
4. **Distance & Location Search**: With PostgreSQL + PostGIS (`ST_DistanceSphere`) selected for backend proximity calculation, will customer coordinates originate from the browser Geolocation API (`navigator.geolocation`) or administrative district selection? What map provider (e.g., Leaflet / OpenStreetMap or Mapbox) will replace the SVG illustration?
5. **Rejected Orders**: What happens to a customer order when a technician rejects it (`status: -1`)? Is the customer automatically matched with an alternative technician, prompted to re-book, or notified via SMS/WhatsApp?

---

## 9. Design Tokens & Text Rules

- **Design Tokens**: Defined in `src/index.css` (`:root` variables) and `src/DesignSystem.tsx`.
  - Primary colors: `--primary: #1F6F5C`, `--primary-dark: #14493D`, `--primary-tint: #E3F1EC`, `--accent: #F2A33A`.
  - Neutral & surface: `--background: #FAFAF7`, `--surface: #FFFFFF`, `--border: #E2E6E3`, `--text: #1C2321`, `--text-secondary: #5B6762`.
  - Status indicators: `--success: #2E9E5B`, `--warning: #E8A317`, `--error: #D64545`, `--info: #2F7DD1`.
  - Typography: `Inter` for body text, `Plus Jakarta Sans` for headings.
  - Border radius: `--radius-control: 12px`, `--radius-card: 16px`.
- **Text & Voice Rules** (as documented in `AGENTS.md` and UI copy):
  - Language: Polite, warm, informal Bahasa Indonesia.
  - Core brand tagline: *"Rusak? Benerin dulu, jangan buang."*
  - Reassurance tone: *"Pilih dengan tenang, servis dengan jelas."*
  - Code conventions: Strings containing apostrophes must use double quotes (`"We're here to help"`) or escaped single quotes to prevent build failures. Components use default exports.

---

## 10. How to Replace the Demo Layer

The frontend application was architected so that the presentation layer is decoupled from the data layer.

### Files to Rewrite
Replace the mock in-memory logic inside `src/api/` with real HTTP calls (e.g., `fetch` or `axios`):
1. **`src/api/auth.ts`**: Connect to real auth endpoints (handling HTTP cookies or JWT tokens, session check, login, register, logout).
2. **`src/api/technicians.ts`**: Connect to real search, technician profile, and shop operational status endpoints.
3. **`src/api/orders.ts`**: Connect to real order creation, order tracking retrieval, status advancement, and accept/reject endpoints.
4. **`src/api/mockData.ts`**: Can be deprecated and removed once endpoints are integrated.

### Page Components Remain Untouched
All page components (`Home.tsx`, `App.tsx`, `Booking.tsx`, `Tracking.tsx`, `MyOrders.tsx`, `DashboardTukang.tsx`, `PesananTukang.tsx`, `TechnicianDetail.tsx`, `DaftarTukang.tsx`, `Auth.tsx`) consume data strictly by importing functions and types from `src/api`. As long as the async signatures, input parameters, and return types matching `src/api/types.ts` are preserved, **no page component files need to be modified** when deploying the production backend.

