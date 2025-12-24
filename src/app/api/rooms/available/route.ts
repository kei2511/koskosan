import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { properties, rooms } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";

// GET: List all available rooms for the authenticated user
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get all available rooms from user's properties
        const availableRooms = await db
            .select({
                id: rooms.id,
                roomNumber: rooms.roomNumber,
                price: rooms.price,
                propertyId: rooms.propertyId,
                propertyName: properties.name,
            })
            .from(rooms)
            .innerJoin(properties, eq(rooms.propertyId, properties.id))
            .where(and(
                eq(properties.ownerId, session.user.id),
                eq(rooms.status, "available")
            ))
            .orderBy(properties.name, rooms.roomNumber);

        return NextResponse.json({ rooms: availableRooms });
    } catch (error) {
        console.error("Get available rooms error:", error);
        return NextResponse.json(
            { error: "Terjadi kesalahan server" },
            { status: 500 }
        );
    }
}
