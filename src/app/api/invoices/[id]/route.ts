import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { properties, rooms, tenants, invoices } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { updateInvoiceStatusSchema } from "@/lib/validations";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// PATCH: Update invoice status (mark as paid/unpaid)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();

        // Validate input
        const parsed = updateInvoiceStatusSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0].message },
                { status: 400 }
            );
        }

        const { status } = parsed.data;

        // Verify invoice belongs to user
        const [invoice] = await db
            .select({
                id: invoices.id,
                ownerId: properties.ownerId,
            })
            .from(invoices)
            .innerJoin(tenants, eq(invoices.tenantId, tenants.id))
            .innerJoin(rooms, eq(tenants.roomId, rooms.id))
            .innerJoin(properties, eq(rooms.propertyId, properties.id))
            .where(eq(invoices.id, id))
            .limit(1);

        if (!invoice || invoice.ownerId !== session.user.id) {
            return NextResponse.json(
                { error: "Tagihan tidak ditemukan" },
                { status: 404 }
            );
        }

        // Update invoice
        const [updatedInvoice] = await db
            .update(invoices)
            .set({
                status,
                paidAt: status === "paid" ? new Date() : null,
            })
            .where(eq(invoices.id, id))
            .returning();

        return NextResponse.json({
            message: status === "paid" ? "Tagihan ditandai sebagai lunas" : "Status tagihan diperbarui",
            invoice: updatedInvoice
        });
    } catch (error) {
        console.error("Update invoice error:", error);
        return NextResponse.json(
            { error: "Terjadi kesalahan server" },
            { status: 500 }
        );
    }
}

// DELETE: Delete an invoice
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

        // Verify invoice belongs to user
        const [invoice] = await db
            .select({
                id: invoices.id,
                ownerId: properties.ownerId,
            })
            .from(invoices)
            .innerJoin(tenants, eq(invoices.tenantId, tenants.id))
            .innerJoin(rooms, eq(tenants.roomId, rooms.id))
            .innerJoin(properties, eq(rooms.propertyId, properties.id))
            .where(eq(invoices.id, id))
            .limit(1);

        if (!invoice || invoice.ownerId !== session.user.id) {
            return NextResponse.json(
                { error: "Tagihan tidak ditemukan" },
                { status: 404 }
            );
        }

        // Delete invoice
        await db
            .delete(invoices)
            .where(eq(invoices.id, id));

        return NextResponse.json({
            message: "Tagihan berhasil dihapus"
        });
    } catch (error) {
        console.error("Delete invoice error:", error);
        return NextResponse.json(
            { error: "Terjadi kesalahan server" },
            { status: 500 }
        );
    }
}
