# Project: SaaS Manajemen Kos (KosManager)

## Role
Act as an Expert Full-Stack Developer specializing in Next.js, Supabase, and Modern UI Design. You are building a SaaS MVP for Boarding House (Kos-kosan) management in Indonesia.

## Tech Stack Requirements
- **Framework:** Next.js 14+ (App Router, TypeScript).
- **Database & Auth:** Supabase (PostgreSQL, Auth, Row Level Security).
- **Styling:** Tailwind CSS.
- **UI Components:** shadcn/ui (use standard components like Card, Table, Dialog, Form, Button, Input).
- **Icons:** Lucide React.
- **Form Handling:** React Hook Form + Zod.
- **State Management:** TanStack Query (React Query) for data fetching.

## Project Goal
Build a mobile-first dashboard where "Juragan Kos" (Landlords) can manage their properties, rooms, tenants, and monthly billing.

## Database Schema (Supabase)
Please design the database with these tables and relationships:

1. **profiles** (Extends Supabase Auth)
   - id (uuid, pk, references auth.users)
   - full_name (text)
   - subscription_plan (text: 'free', 'pro')

2. **properties** (The Boarding House buildings)
   - id (uuid, pk)
   - owner_id (uuid, fk profiles.id)
   - name (text)
   - address (text)
   - total_rooms (int)

3. **rooms** (Individual units)
   - id (uuid, pk)
   - property_id (uuid, fk properties.id)
   - room_number (text)
   - price (int)
   - status (text: 'available', 'occupied', 'maintenance')
   - facilities (text[])

4. **tenants** (The people living there)
   - id (uuid, pk)
   - room_id (uuid, fk rooms.id)
   - name (text)
   - phone_number (text) -- Important for WhatsApp integration later
   - id_card_photo (text, url)
   - start_date (date)
   - due_date (int) -- Day of month for payment (e.g., every 25th)

5. **invoices** (Monthly bills)
   - id (uuid, pk)
   - tenant_id (uuid, fk tenants.id)
   - amount (int)
   - status (text: 'unpaid', 'paid')
   - period (date) -- e.g., '2023-10-01'
   - created_at (timestamp)

## Core Features & Pages to Scaffold

1.  **Authentication Flow**
    - Login/Register page using Supabase Auth UI (Magic Link or Email/Password).

2.  **Dashboard (Home)**
    - Stats Cards: Total Income this month, Occupied Rooms vs Empty Rooms, Unpaid Invoices count.
    - Recent Activity List.

3.  **Property & Room Management**
    - Page to list all Properties.
    - Inside a Property, list all Rooms with visual status badges (Green for Available, Red for Occupied).
    - Dialog/Modal to Add/Edit Room.

4.  **Tenant Onboarding (The "Check-in" Flow)**
    - A form to assign a new Tenant to an 'available' Room.
    - Fields: Name, Phone (Start with +62), Rent Price, Payment Date.
    - Action: Updates Room status to 'occupied'.

5.  **Billing Center**
    - List of Invoices generated.
    - A button "Send Reminder" on each invoice row. For now, this button should just open a `window.open` with a WhatsApp API link: `https://wa.me/{phone}?text=Halo {name}, tagihan kos bulan ini sebesar {amount}...`.

## UI/UX Guidelines
- **Mobile First:** The layout must work perfectly on mobile phones as landlords manage kos on the go.
- **Clean & Professional:** Use a clean white/gray background with blue/indigo primary colors.
- **Empty States:** Create friendly empty states when no data is present (e.g., "Belum ada kamar, tambah sekarang").

## Implementation Steps
1. Initialize Next.js project with the specified stack.
2. Create the Supabase client helper.
3. Define Zod schemas for all forms.
4. Build the Layout (Sidebar for desktop, Bottom Nav for mobile).
5. Implement the pages sequentially starting from Auth -> Dashboard -> Rooms -> Tenants.

**Start by setting up the project structure and the Supabase types.**