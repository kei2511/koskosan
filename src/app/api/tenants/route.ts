import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { properties, rooms, tenants } from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { tenantSchema } from "@/lib/validations";

// GET: List all tenants for the authenticated user
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
            return NextResponse.json({ tenants: [] });
        }

        // Get rooms from those properties
        const userRooms = await db
            .select({ id: rooms.id })
            .from(rooms)
            .where(sql`${rooms.propertyId} IN ${propertyIds}`);

        const roomIds = userRooms.map(r => r.id);

        if (roomIds.length === 0) {
            return NextResponse.json({ tenants: [] });
        }

        // Get tenants with room and property info
        const allTenants = await db
            .select({
                id: tenants.id,
                name: tenants.name,
                phoneNumber: tenants.phoneNumber,
                startDate: tenants.startDate,
                dueDate: tenants.dueDate,
                isActive: tenants.isActive,
                roomNumber: rooms.roomNumber,
                propertyName: properties.name,
            })
            .from(tenants)
            .innerJoin(rooms, eq(tenants.roomId, rooms.id))
            .innerJoin(properties, eq(rooms.propertyId, properties.id))
            .where(sql`${tenants.roomId} IN ${roomIds}`)
            .orderBy(desc(tenants.createdAt));

        return NextResponse.json({ tenants: allTenants });
    } catch (error) {
        console.error("Get tenants error:", error);
        return NextResponse.json(
            { error: "Terjadi kesalahan server" },
            { status: 500 }
        );
    }
}

// POST: Create a new tenant (check-in)
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
        const parsed = tenantSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0].message },
                { status: 400 }
            );
        }

        const { name, phoneNumber, roomId, startDate, dueDate, idCardPhoto } = parsed.data;

        // Verify room belongs to user and is available
        const [room] = await db
            .select({
                id: rooms.id,
                status: rooms.status,
                propertyId: rooms.propertyId,
            })
            .from(rooms)
            .innerJoin(properties, eq(rooms.propertyId, properties.id))
            .where(and(
                eq(rooms.id, roomId),
                eq(properties.ownerId, session.user.id)
            ))
            .limit(1);

        if (!room) {
            return NextResponse.json(
                { error: "Kamar tidak ditemukan" },
                { status: 404 }
            );
        }

        if (room.status !== "available") {
            return NextResponse.json(
                { error: "Kamar tidak tersedia" },
                { status: 400 }
            );
        }

        // Create tenant
        const [newTenant] = await db
            .insert(tenants)
            .values({
                roomId,
                name,
                phoneNumber,
                startDate,
                dueDate,
                idCardPhoto,
                isActive: true,
            })
            .returning();

        // Update room status to occupied
        await db
            .update(rooms)
            .set({ status: "occupied", updatedAt: new Date() })
            .where(eq(rooms.id, roomId));

        return NextResponse.json(
            {
                message: "Check-in berhasil",
                tenant: newTenant
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Create tenant error:", error);
        return NextResponse.json(
            { error: "Terjadi kesalahan server" },
            { status: 500 }
        );
    }
}
