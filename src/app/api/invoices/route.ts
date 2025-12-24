import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { properties, rooms, tenants, invoices } from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { invoiceSchema } from "@/lib/validations";

// GET: List all invoices for the authenticated user
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get user's properties
        const userProperties = await db
            .select({ id: properties.id })
            .from(properties)
            .where(eq(properties.ownerId, session.user.id));

        const propertyIds = userProperties.map(p => p.id);

        if (propertyIds.length === 0) {
            return NextResponse.json({ invoices: [] });
        }

        // Get rooms and tenants
        const userRooms = await db
            .select({ id: rooms.id })
            .from(rooms)
            .where(sql`${rooms.propertyId} IN ${propertyIds}`);

        const roomIds = userRooms.map(r => r.id);

        if (roomIds.length === 0) {
            return NextResponse.json({ invoices: [] });
        }

        const allTenants = await db
            .select({ id: tenants.id })
            .from(tenants)
            .where(sql`${tenants.roomId} IN ${roomIds}`);

        const tenantIds = allTenants.map(t => t.id);

        if (tenantIds.length === 0) {
            return NextResponse.json({ invoices: [] });
        }

        // Get invoices with details
        const allInvoices = await db
            .select({
                id: invoices.id,
                amount: invoices.amount,
                status: invoices.status,
                period: invoices.period,
                createdAt: invoices.createdAt,
                paidAt: invoices.paidAt,
                tenantName: tenants.name,
                tenantPhone: tenants.phoneNumber,
                roomNumber: rooms.roomNumber,
                propertyName: properties.name,
            })
            .from(invoices)
            .innerJoin(tenants, eq(invoices.tenantId, tenants.id))
            .innerJoin(rooms, eq(tenants.roomId, rooms.id))
            .innerJoin(properties, eq(rooms.propertyId, properties.id))
            .where(sql`${invoices.tenantId} IN ${tenantIds}`)
            .orderBy(desc(invoices.createdAt));

        return NextResponse.json({ invoices: allInvoices });
    } catch (error) {
        console.error("Get invoices error:", error);
        return NextResponse.json(
            { error: "Terjadi kesalahan server" },
            { status: 500 }
        );
    }
}

// POST: Create a new invoice
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();

        // Validate input
        const parsed = invoiceSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0].message },
                { status: 400 }
            );
        }

        const { tenantId, amount, period } = parsed.data;

        // Verify tenant belongs to user
        const [tenant] = await db
            .select({
                id: tenants.id,
                ownerId: properties.ownerId,
            })
            .from(tenants)
            .innerJoin(rooms, eq(tenants.roomId, rooms.id))
            .innerJoin(properties, eq(rooms.propertyId, properties.id))
            .where(eq(tenants.id, tenantId))
            .limit(1);

        if (!tenant || tenant.ownerId !== session.user.id) {
            return NextResponse.json(
                { error: "Penyewa tidak ditemukan" },
                { status: 404 }
            );
        }

        // Check for duplicate invoice for same period
        const [existingInvoice] = await db
            .select()
            .from(invoices)
            .where(and(
                eq(invoices.tenantId, tenantId),
                eq(invoices.period, period)
            ))
            .limit(1);

        if (existingInvoice) {
            return NextResponse.json(
                { error: "Tagihan untuk periode ini sudah ada" },
                { status: 400 }
            );
        }

        // Create invoice
        const [newInvoice] = await db
            .insert(invoices)
            .values({
                tenantId,
                amount,
                period,
                status: "unpaid",
            })
            .returning();

        return NextResponse.json(
            {
                message: "Tagihan berhasil dibuat",
                invoice: newInvoice
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Create invoice error:", error);
        return NextResponse.json(
            { error: "Terjadi kesalahan server" },
            { status: 500 }
        );
    }
}
