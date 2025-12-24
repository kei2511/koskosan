import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { tenants, rooms, properties, invoices } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

// GET /api/tenants/[id] - Get tenant detail with room, property, and invoices
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        // Get tenant with room and property info
        const tenantData = await db
            .select({
                id: tenants.id,
                name: tenants.name,
                phoneNumber: tenants.phoneNumber,
                idCardPhoto: tenants.idCardPhoto,
                startDate: tenants.startDate,
                dueDate: tenants.dueDate,
                isActive: tenants.isActive,
                createdAt: tenants.createdAt,
                roomId: rooms.id,
                roomNumber: rooms.roomNumber,
                roomPrice: rooms.price,
                propertyId: properties.id,
                propertyName: properties.name,
                propertyAddress: properties.address,
                propertyOwnerId: properties.ownerId,
            })
            .from(tenants)
            .innerJoin(rooms, eq(tenants.roomId, rooms.id))
            .innerJoin(properties, eq(rooms.propertyId, properties.id))
            .where(eq(tenants.id, id))
            .limit(1);

        if (tenantData.length === 0) {
            return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
        }

        const tenant = tenantData[0];

        // Verify ownership
        if (tenant.propertyOwnerId !== session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // Get invoices for this tenant
        const tenantInvoices = await db
            .select({
                id: invoices.id,
                amount: invoices.amount,
                period: invoices.period,
                status: invoices.status,
                paidAt: invoices.paidAt,
                createdAt: invoices.createdAt,
            })
            .from(invoices)
            .where(eq(invoices.tenantId, id))
            .orderBy(desc(invoices.period));

        // Format response
        const response = {
            id: tenant.id,
            name: tenant.name,
            phoneNumber: tenant.phoneNumber,
            idCardPhoto: tenant.idCardPhoto,
            startDate: tenant.startDate,
            dueDate: tenant.dueDate,
            isActive: tenant.isActive,
            createdAt: tenant.createdAt,
            room: {
                id: tenant.roomId,
                roomNumber: tenant.roomNumber,
                price: tenant.roomPrice,
                property: {
                    id: tenant.propertyId,
                    name: tenant.propertyName,
                    address: tenant.propertyAddress,
                },
            },
            invoices: tenantInvoices,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("Error fetching tenant:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// DELETE /api/tenants/[id] - Delete a tenant
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        // Verify ownership through room -> property
        const tenantData = await db
            .select({
                roomId: tenants.roomId,
                ownerId: properties.ownerId,
            })
            .from(tenants)
            .innerJoin(rooms, eq(tenants.roomId, rooms.id))
            .innerJoin(properties, eq(rooms.propertyId, properties.id))
            .where(eq(tenants.id, id))
            .limit(1);

        if (tenantData.length === 0) {
            return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
        }

        if (tenantData[0].ownerId !== session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // Update room status to available
        await db
            .update(rooms)
            .set({ status: "available" })
            .where(eq(rooms.id, tenantData[0].roomId));

        // Delete tenant
        await db.delete(tenants).where(eq(tenants.id, id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting tenant:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
