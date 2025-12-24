import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { properties } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { propertySchema } from "@/lib/validations";

// GET: List all properties for the authenticated user
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const userProperties = await db
            .select()
            .from(properties)
            .where(eq(properties.ownerId, session.user.id))
            .orderBy(desc(properties.createdAt));

        return NextResponse.json({ properties: userProperties });
    } catch (error) {
        console.error("Get properties error:", error);
        return NextResponse.json(
            { error: "Terjadi kesalahan server" },
            { status: 500 }
        );
    }
}

// POST: Create a new property
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
        const parsed = propertySchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0].message },
                { status: 400 }
            );
        }

        const { name, address } = parsed.data;

        // Create property
        const [newProperty] = await db
            .insert(properties)
            .values({
                ownerId: session.user.id,
                name,
                address,
                totalRooms: 0,
            })
            .returning();

        return NextResponse.json(
            {
                message: "Properti berhasil ditambahkan",
                property: newProperty
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Create property error:", error);
        return NextResponse.json(
            { error: "Terjadi kesalahan server" },
            { status: 500 }
        );
    }
}
