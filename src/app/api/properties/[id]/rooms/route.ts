import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { properties, rooms } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { roomSchema } from "@/lib/validations";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// POST: Create a new room in a property
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const { id: propertyId } = await params;
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Verify property ownership
        const [property] = await db
            .select()
            .from(properties)
            .where(and(eq(properties.id, propertyId), eq(properties.ownerId, session.user.id)))
            .limit(1);

        if (!property) {
            return NextResponse.json(
                { error: "Properti tidak ditemukan" },
                { status: 404 }
            );
        }

        const body = await request.json();

        // Validate input
        const parsed = roomSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0].message },
                { status: 400 }
            );
        }

        const { roomNumber, price, status, facilities } = parsed.data;

        // Check for duplicate room number
        const [existingRoom] = await db
            .select()
            .from(rooms)
            .where(and(eq(rooms.propertyId, propertyId), eq(rooms.roomNumber, roomNumber)))
            .limit(1);

        if (existingRoom) {
            return NextResponse.json(
                { error: "Nomor kamar sudah ada" },
                { status: 400 }
            );
        }

        // Create room
        const [newRoom] = await db
            .insert(rooms)
            .values({
                propertyId,
                roomNumber,
                price,
                status,
                facilities: facilities || [],
            })
            .returning();

        // Update property totalRooms
        await db
            .update(properties)
            .set({ totalRooms: sql`${properties.totalRooms} + 1` })
            .where(eq(properties.id, propertyId));

        return NextResponse.json(
            {
                message: "Kamar berhasil ditambahkan",
                room: newRoom
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Create room error:", error);
        return NextResponse.json(
            { error: "Terjadi kesalahan server" },
            { status: 500 }
        );
    }
}
