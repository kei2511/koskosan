import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { rooms, properties } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { roomSchema } from "@/lib/validations";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// PUT: Update a room
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get room and verify ownership through property
        const [existingRoom] = await db
            .select({
                room: rooms,
                ownerId: properties.ownerId
            })
            .from(rooms)
            .innerJoin(properties, eq(rooms.propertyId, properties.id))
            .where(eq(rooms.id, id))
            .limit(1);

        if (!existingRoom) {
            return NextResponse.json(
                { error: "Kamar tidak ditemukan" },
                { status: 404 }
            );
        }

        if (existingRoom.ownerId !== session.user.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 403 }
            );
        }

        const body = await request.json();

        const parsed = roomSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0].message },
                { status: 400 }
            );
        }

        const { roomNumber, price, status, facilities } = parsed.data;

        const [updatedRoom] = await db
            .update(rooms)
            .set({
                roomNumber,
                price,
                status,
                facilities: facilities || [],
                updatedAt: new Date(),
            })
            .where(eq(rooms.id, id))
            .returning();

        return NextResponse.json({
            message: "Kamar berhasil diperbarui",
            room: updatedRoom
        });
    } catch (error) {
        console.error("Update room error:", error);
        return NextResponse.json(
            { error: "Terjadi kesalahan server" },
            { status: 500 }
        );
    }
}

// DELETE: Delete a room
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get room and verify ownership through property
        const [existingRoom] = await db
            .select({
                room: rooms,
                ownerId: properties.ownerId
            })
            .from(rooms)
            .innerJoin(properties, eq(rooms.propertyId, properties.id))
            .where(eq(rooms.id, id))
            .limit(1);

        if (!existingRoom) {
            return NextResponse.json(
                { error: "Kamar tidak ditemukan" },
                { status: 404 }
            );
        }

        if (existingRoom.ownerId !== session.user.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 403 }
            );
        }

        // Check if room is occupied
        if (existingRoom.room.status === "occupied") {
            return NextResponse.json(
                { error: "Tidak dapat menghapus kamar yang sedang terisi" },
                { status: 400 }
            );
        }

        await db.delete(rooms).where(eq(rooms.id, id));

        return NextResponse.json({
            message: "Kamar berhasil dihapus"
        });
    } catch (error) {
        console.error("Delete room error:", error);
        return NextResponse.json(
            { error: "Terjadi kesalahan server" },
            { status: 500 }
        );
    }
}
