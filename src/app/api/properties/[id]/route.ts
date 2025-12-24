import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { properties, rooms, tenants, invoices } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { propertySchema } from "@/lib/validations";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET: Get a single property
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const [property] = await db
            .select()
            .from(properties)
            .where(and(eq(properties.id, id), eq(properties.ownerId, session.user.id)))
            .limit(1);

        if (!property) {
            return NextResponse.json(
                { error: "Properti tidak ditemukan" },
                { status: 404 }
            );
        }

        return NextResponse.json({ property });
    } catch (error) {
        console.error("Get property error:", error);
        return NextResponse.json(
            { error: "Terjadi kesalahan server" },
            { status: 500 }
        );
    }
}

// PUT: Update a property
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

        // Verify ownership
        const [existingProperty] = await db
            .select()
            .from(properties)
            .where(and(eq(properties.id, id), eq(properties.ownerId, session.user.id)))
            .limit(1);

        if (!existingProperty) {
            return NextResponse.json(
                { error: "Properti tidak ditemukan" },
                { status: 404 }
            );
        }

        const body = await request.json();

        const parsed = propertySchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0].message },
                { status: 400 }
            );
        }

        const { name, address } = parsed.data;

        const [updatedProperty] = await db
            .update(properties)
            .set({
                name,
                address,
                updatedAt: new Date(),
            })
            .where(eq(properties.id, id))
            .returning();

        return NextResponse.json({
            message: "Properti berhasil diperbarui",
            property: updatedProperty
        });
    } catch (error) {
        console.error("Update property error:", error);
        return NextResponse.json(
            { error: "Terjadi kesalahan server" },
            { status: 500 }
        );
    }
}

// DELETE: Delete a property
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

        // Verify ownership
        const [existingProperty] = await db
            .select()
            .from(properties)
            .where(and(eq(properties.id, id), eq(properties.ownerId, session.user.id)))
            .limit(1);

        if (!existingProperty) {
            return NextResponse.json(
                { error: "Properti tidak ditemukan" },
                { status: 404 }
            );
        }

        // Delete property (cascade will handle rooms, tenants, invoices)
        await db
            .delete(properties)
            .where(eq(properties.id, id));

        return NextResponse.json({
            message: "Properti berhasil dihapus"
        });
    } catch (error) {
        console.error("Delete property error:", error);
        return NextResponse.json(
            { error: "Terjadi kesalahan server" },
            { status: 500 }
        );
    }
}
