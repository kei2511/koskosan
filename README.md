# KosManager - Aplikasi Manajemen Kos-kosan

Aplikasi SaaS untuk manajemen kos-kosan (boarding house) di Indonesia. Dibangun dengan Next.js 16, Neon PostgreSQL, dan Tailwind CSS.

## 🚀 Fitur Utama

- **📊 Dashboard** - Statistik pendapatan, kamar terisi, dan tagihan
- **🏢 Manajemen Properti** - Kelola banyak bangunan kos
- **🚪 Manajemen Kamar** - Status kamar (tersedia/terisi/perbaikan) dengan fasilitas
- **👥 Manajemen Penyewa** - Check-in/check-out penyewa dengan data lengkap
- **💰 Billing Center** - Buat tagihan bulanan dan lacak pembayaran
- **📱 WhatsApp Reminder** - Kirim pengingat tagihan via WhatsApp
- **📱 Mobile-First** - Responsive design untuk penggunaan di smartphone

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router, TypeScript)
- **Database:** Neon PostgreSQL (Serverless)
- **ORM:** Drizzle ORM
- **Authentication:** NextAuth.js v5 (Auth.js)
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui
- **Icons:** Lucide React
- **Form Handling:** React Hook Form + Zod
- **Data Fetching:** TanStack Query

## 📦 Instalasi

### Prerequisites

- Node.js 18+
- Akun Neon (https://neon.tech)

### Setup

1. Clone repository:
```bash
git clone <repo-url>
cd koskosan
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment file:
```bash
cp env.example .env.local
```

4. Isi konfigurasi di `.env.local`:
```env
# Neon PostgreSQL - dapatkan dari dashboard Neon
DATABASE_URL="postgresql://username:password@your-host.neon.tech/neondb?sslmode=require"

# NextAuth - generate dengan: openssl rand -base64 32
AUTH_SECRET="your-auth-secret-here"
AUTH_URL="http://localhost:3000"
```

5. Push schema ke database:
```bash
npm run db:push
```

6. Jalankan development server:
```bash
npm run dev
```

7. Buka http://localhost:3000

## 📁 Struktur Folder

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── auth/          # NextAuth endpoints
│   │   ├── properties/    # Properties CRUD
│   │   ├── rooms/         # Rooms endpoints
│   │   ├── tenants/       # Tenants CRUD
│   │   └── invoices/      # Invoices CRUD
│   ├── dashboard/         # Protected dashboard pages
│   │   ├── properties/    # Property management
│   │   ├── tenants/       # Tenant management
│   │   ├── invoices/      # Billing center
│   │   └── settings/      # Account settings
│   ├── login/             # Login page
│   └── register/          # Registration page
├── components/            # React components
│   ├── layout/           # Layout components
│   ├── properties/       # Property-related components
│   ├── rooms/            # Room-related components
│   ├── invoices/         # Invoice-related components
│   └── ui/               # shadcn/ui components
├── lib/                   # Utilities
│   ├── db/               # Database config & schema
│   ├── auth.ts           # NextAuth config
│   ├── format.ts         # Formatting utilities
│   ├── utils.ts          # General utilities
│   └── validations.ts    # Zod schemas
└── types/                # TypeScript types
```

## 🔧 Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate migration
npm run db:migrate   # Run migration
npm run db:push      # Push schema to database
npm run db:studio    # Open Drizzle Studio
```

## 📊 Database Schema

```
users
├── id (uuid, pk)
├── email (unique)
├── password (hashed)
├── full_name
├── subscription_plan (free/pro)
└── timestamps

properties
├── id (uuid, pk)
├── owner_id (fk users)
├── name
├── address
├── total_rooms
└── timestamps

rooms
├── id (uuid, pk)
├── property_id (fk properties)
├── room_number
├── price
├── status (available/occupied/maintenance)
├── facilities (array)
└── timestamps

tenants
├── id (uuid, pk)
├── room_id (fk rooms)
├── name
├── phone_number
├── id_card_photo
├── start_date
├── due_date (1-31)
├── is_active
└── timestamps

invoices
├── id (uuid, pk)
├── tenant_id (fk tenants)
├── amount
├── status (unpaid/paid)
├── period (date)
├── paid_at
└── created_at
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/[...nextauth]` - NextAuth handlers

### Properties
- `GET /api/properties` - List properties
- `POST /api/properties` - Create property
- `GET /api/properties/[id]` - Get property
- `PUT /api/properties/[id]` - Update property
- `DELETE /api/properties/[id]` - Delete property
- `POST /api/properties/[id]/rooms` - Add room

### Rooms
- `GET /api/rooms/available` - List available rooms

### Tenants
- `GET /api/tenants` - List tenants
- `POST /api/tenants` - Create tenant (check-in)
- `GET /api/tenants/active` - List active tenants

### Invoices
- `GET /api/invoices` - List invoices
- `POST /api/invoices` - Create invoice
- `PATCH /api/invoices/[id]` - Update status
- `DELETE /api/invoices/[id]` - Delete invoice

## 🎨 UI/UX

- **Mobile-First Design** - Optimized untuk penggunaan di smartphone
- **Bottom Navigation** - Navigasi mudah di mobile
- **Sidebar** - Navigasi desktop yang collapsible
- **Dark Mode Ready** - CSS variables untuk dark mode
- **Animations** - Micro-interactions untuk UX yang lebih baik

## 🔐 Security

- Password hashing dengan bcrypt
- JWT session management
- Protected API routes
- Row-level authorization

## 📝 License

MIT License

## 👨‍💻 Author

Built with ❤️ for Juragan Kos Indonesia
