import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { tenants, rooms, properties, invoices } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

interface TenantUploadData {
    name: string;
    phoneNumber: string;
    roomNumber: string;
    startDate: string;
    dueDate: string;
}

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
        const { tenants: tenantsData } = body as { tenants: TenantUploadData[] };

        if (!tenantsData || !Array.isArray(tenantsData) || tenantsData.length === 0) {
            return NextResponse.json(
                { error: "Data penyewa tidak valid" },
                { status: 400 }
            );
        }

        // Get all user's properties and rooms
        const userProperties = await db
            .select({ id: properties.id })
            .from(properties)
            .where(eq(properties.ownerId, session.user.id));

        const propertyIds = userProperties.map(p => p.id);

        if (propertyIds.length === 0) {
            return NextResponse.json(
                { error: "Anda belum memiliki properti" },
                { status: 400 }
            );
        }

        // Get all rooms for user's properties
        const allRooms = await db
            .select({
                id: rooms.id,
                roomNumber: rooms.roomNumber,
                propertyId: rooms.propertyId,
                status: rooms.status,
                price: rooms.price
            })
            .from(rooms)
            .where(
                and(
                    eq(rooms.status, "available"),
                    ...propertyIds.map(id => eq(rooms.propertyId, id))
                )
            );

        const results = {
            success: 0,
            failed: 0,
            errors: [] as Array<{ name: string; error: string }>
        };

        // Process each tenant
        for (const tenantData of tenantsData) {
            try {
                // Find room by number
                const room = allRooms.find(r =>
                    r.roomNumber.toLowerCase() === tenantData.roomNumber.toLowerCase()
                );

                if (!room) {
                    results.failed++;
                    results.errors.push({
                        name: tenantData.name,
                        error: `Kamar ${tenantData.roomNumber} tidak ditemukan atau sudah terisi`
                    });
                    continue;
                }

                // Validate due date (should be 1-31)
                const dueDate = parseInt(tenantData.dueDate);
                if (isNaN(dueDate) || dueDate < 1 || dueDate > 31) {
                    results.failed++;
                    results.errors.push({
                        name: tenantData.name,
                        error: `Tanggal jatuh tempo harus antara 1-31`
                    });
                    continue;
                }

                // Validate start date
                const startDate = new Date(tenantData.startDate);
                if (isNaN(startDate.getTime())) {
                    results.failed++;
                    results.errors.push({
                        name: tenantData.name,
                        error: `Format tanggal mulai tidak valid`
                    });
                    continue;
                }

                // Create tenant
                const [newTenant] = await db
                    .insert(tenants)
                    .values({
                        name: tenantData.name,
                        phoneNumber: tenantData.phoneNumber,
                        roomId: room.id,
                        startDate: startDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
                        dueDate: dueDate, // Integer 1-31
                        isActive: true,
                    })
                    .returning();

                // Update room status to occupied
                await db
                    .update(rooms)
                    .set({ status: "occupied", updatedAt: new Date() })
                    .where(eq(rooms.id, room.id));

                // Create first invoice
                const invoicePeriod = new Date(startDate);
                invoicePeriod.setDate(1); // Set to first day of month

                // If start date is after due date, the period is for next month
                if (startDate.getDate() > dueDate) {
                    invoicePeriod.setMonth(invoicePeriod.getMonth() + 1);
                }

                await db.insert(invoices).values({
                    tenantId: newTenant.id,
                    amount: room.price,
                    period: invoicePeriod.toISOString().split('T')[0], // Format as YYYY-MM-DD
                    status: "unpaid",
                });

                results.success++;
            } catch (error) {
                results.failed++;
                results.errors.push({
                    name: tenantData.name,
                    error: error instanceof Error ? error.message : "Terjadi kesalahan"
                });
            }
        }

        return NextResponse.json({
            message: `Upload selesai: ${results.success} berhasil, ${results.failed} gagal`,
            success: results.success,
            failed: results.failed,
            errors: results.errors
        });

    } catch (error) {
        console.error("Bulk upload error:", error);
        return NextResponse.json(
            { error: "Terjadi kesalahan server" },
            { status: 500 }
        );
    }
}
