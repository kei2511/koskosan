import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { tenants, rooms, properties } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// POST /api/tenants/[id]/checkout - Check out a tenant
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        // Get tenant with room info to verify ownership
        const tenantData = await db
            .select({
                id: tenants.id,
                roomId: tenants.roomId,
                isActive: tenants.isActive,
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

        const tenant = tenantData[0];

        // Verify ownership
        if (tenant.ownerId !== session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // Check if already inactive
        if (!tenant.isActive) {
            return NextResponse.json(
                { error: "Tenant already checked out" },
                { status: 400 }
            );
        }

        // Update tenant to inactive
        await db
            .update(tenants)
            .set({ isActive: false })
            .where(eq(tenants.id, id));

        // Update room status to available
        await db
            .update(rooms)
            .set({ status: "available" })
            .where(eq(rooms.id, tenant.roomId));

        return NextResponse.json({
            success: true,
            message: "Tenant checked out successfully",
        });
    } catch (error) {
        console.error("Error checking out tenant:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
