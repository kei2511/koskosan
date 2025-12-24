import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { properties, rooms, tenants } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";

// GET: List all active tenants for the authenticated user
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get all active tenants from user's properties with room price
        const activeTenants = await db
            .select({
                id: tenants.id,
                name: tenants.name,
                roomId: tenants.roomId,
                roomNumber: rooms.roomNumber,
                propertyId: rooms.propertyId,
                propertyName: properties.name,
                price: rooms.price,
            })
            .from(tenants)
            .innerJoin(rooms, eq(tenants.roomId, rooms.id))
            .innerJoin(properties, eq(rooms.propertyId, properties.id))
            .where(and(
                eq(properties.ownerId, session.user.id),
                eq(tenants.isActive, true)
            ))
            .orderBy(properties.name, rooms.roomNumber);

        return NextResponse.json({ tenants: activeTenants });
    } catch (error) {
        console.error("Get active tenants error:", error);
        return NextResponse.json(
            { error: "Terjadi kesalahan server" },
            { status: 500 }
        );
    }
}
