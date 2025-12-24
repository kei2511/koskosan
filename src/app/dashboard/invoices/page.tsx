import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { properties, rooms, tenants, invoices } from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import {
    Receipt,
    Plus,
    Phone,
    CheckCircle2,
    Clock,
    MessageCircle,
    Calendar
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { formatCurrency, formatDate, generateWhatsAppLink } from "@/lib/format";
import { CreateInvoiceDialog } from "@/components/invoices/create-invoice-dialog";
import { InvoiceActions } from "@/components/invoices/invoice-actions";

export default async function InvoicesPage() {
    const session = await auth();
    const userId = session?.user?.id;

    // Get all properties owned by user
    const userProperties = await db
        .select({ id: properties.id })
        .from(properties)
        .where(eq(properties.ownerId, userId!));

    const propertyIds = userProperties.map(p => p.id);

    let allInvoices: any[] = [];
    let stats = { total: 0, unpaid: 0, paid: 0, totalUnpaid: 0, totalPaid: 0 };

    if (propertyIds.length > 0) {
        // Get all rooms and tenants
        const userRooms = await db
            .select({ id: rooms.id })
            .from(rooms)
            .where(sql`${rooms.propertyId} IN ${propertyIds}`);

        const roomIds = userRooms.map(r => r.id);

        if (roomIds.length > 0) {
            const allTenants = await db
                .select({ id: tenants.id })
                .from(tenants)
                .where(sql`${tenants.roomId} IN ${roomIds}`);

            const tenantIds = allTenants.map(t => t.id);

            if (tenantIds.length > 0) {
                // Get all invoices with tenant info
                allInvoices = await db
                    .select({
                        id: invoices.id,
                        amount: invoices.amount,
                        status: invoices.status,
                        period: invoices.period,
                        createdAt: invoices.createdAt,
                        paidAt: invoices.paidAt,
                        tenantId: invoices.tenantId,
                        tenantName: tenants.name,
                        tenantPhone: tenants.phoneNumber,
                        roomNumber: rooms.roomNumber,
                        propertyName: properties.name,
                    })
                    .from(invoices)
                    .innerJoin(tenants, eq(invoices.tenantId, tenants.id))
                    .innerJoin(rooms, eq(tenants.roomId, rooms.id))
                    .innerJoin(properties, eq(rooms.propertyId, properties.id))
                    .where(sql`${invoices.tenantId} IN ${tenantIds}`)
                    .orderBy(desc(invoices.createdAt));

                // Calculate stats
                stats.total = allInvoices.length;
                stats.unpaid = allInvoices.filter(i => i.status === "unpaid").length;
                stats.paid = allInvoices.filter(i => i.status === "paid").length;
                stats.totalUnpaid = allInvoices
                    .filter(i => i.status === "unpaid")
                    .reduce((sum, i) => sum + i.amount, 0);
                stats.totalPaid = allInvoices
                    .filter(i => i.status === "paid")
                    .reduce((sum, i) => sum + i.amount, 0);
            }
        }
    }

    const unpaidInvoices = allInvoices.filter(i => i.status === "unpaid");
    const paidInvoices = allInvoices.filter(i => i.status === "paid");

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Tagihan</h1>
                    <p className="text-muted-foreground mt-1">
                        Kelola dan kirim tagihan ke penyewa
                    </p>
                </div>
                <CreateInvoiceDialog />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center">
                                <Clock className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.unpaid}</p>
                                <p className="text-xs text-muted-foreground">Belum Lunas</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.paid}</p>
                                <p className="text-xs text-muted-foreground">Lunas</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-2 lg:col-span-1">
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground mb-1">Total Belum Dibayar</p>
                        <p className="text-xl font-bold text-orange-600">
                            {formatCurrency(stats.totalUnpaid)}
                        </p>
                    </CardContent>
                </Card>
                <Card className="col-span-2 lg:col-span-1">
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground mb-1">Total Sudah Dibayar</p>
                        <p className="text-xl font-bold text-green-600">
                            {formatCurrency(stats.totalPaid)}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Invoices List */}
            {allInvoices.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="py-16 text-center">
                        <Receipt className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Belum Ada Tagihan</h3>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                            Buat tagihan bulanan untuk penyewa Anda.
                        </p>
                        <CreateInvoiceDialog />
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {/* Unpaid Invoices */}
                    {unpaidInvoices.length > 0 && (
                        <div className="space-y-3">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <Clock className="h-5 w-5 text-orange-600" />
                                Belum Lunas ({unpaidInvoices.length})
                            </h2>
                            <div className="grid gap-3">
                                {unpaidInvoices.map((invoice, index) => (
                                    <Card
                                        key={invoice.id}
                                        className="group hover:shadow-md transition-all duration-300 animate-slide-up border-l-4 border-l-orange-500"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                                                        <Receipt className="h-6 w-6 text-orange-600" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h3 className="font-semibold">{invoice.tenantName}</h3>
                                                        <p className="text-sm text-muted-foreground">
                                                            {invoice.propertyName} - Kamar {invoice.roomNumber}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Badge variant="outline" className="text-xs">
                                                                <Calendar className="h-3 w-3 mr-1" />
                                                                {new Date(invoice.period).toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col md:flex-row items-start md:items-center gap-3 ml-15 md:ml-0">
                                                    <div className="text-right">
                                                        <p className="text-xl font-bold text-orange-600">
                                                            {formatCurrency(invoice.amount)}
                                                        </p>
                                                        <Badge variant="secondary" className="text-xs">
                                                            Belum Lunas
                                                        </Badge>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <InvoiceActions
                                                            invoiceId={invoice.id}
                                                            tenantName={invoice.tenantName}
                                                            tenantPhone={invoice.tenantPhone}
                                                            amount={invoice.amount}
                                                            period={invoice.period}
                                                            status={invoice.status}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Paid Invoices */}
                    {paidInvoices.length > 0 && (
                        <div className="space-y-3">
                            <h2 className="text-lg font-semibold flex items-center gap-2 text-muted-foreground">
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                Lunas ({paidInvoices.length})
                            </h2>
                            <div className="grid gap-3">
                                {paidInvoices.slice(0, 10).map((invoice, index) => (
                                    <Card
                                        key={invoice.id}
                                        className="group transition-all duration-300 animate-slide-up border-l-4 border-l-green-500 opacity-75"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h3 className="font-medium">{invoice.tenantName}</h3>
                                                        <p className="text-sm text-muted-foreground">
                                                            {invoice.propertyName} - {invoice.roomNumber} • {new Date(invoice.period).toLocaleDateString("id-ID", { month: "short", year: "numeric" })}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <p className="font-semibold text-green-600">
                                                        {formatCurrency(invoice.amount)}
                                                    </p>
                                                    {invoice.paidAt && (
                                                        <p className="text-xs text-muted-foreground">
                                                            Dibayar {formatDate(invoice.paidAt)}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
