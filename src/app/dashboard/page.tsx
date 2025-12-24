import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { properties, rooms, tenants, invoices } from "@/lib/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import {
    Building2,
    DoorOpen,
    Users,
    Receipt,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    Clock,
    Crown
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import type { SubscriptionPlan } from "@/lib/subscription";

export default async function DashboardPage() {
    const session = await auth();
    const userId = session?.user?.id;
    const userPlan = ((session?.user as any)?.subscriptionPlan as SubscriptionPlan) || 'free';

    // Fetch dashboard stats
    const [propertyCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(properties)
        .where(eq(properties.ownerId, userId!));

    // Get all property IDs for the owner
    const userProperties = await db
        .select({ id: properties.id })
        .from(properties)
        .where(eq(properties.ownerId, userId!));

    const propertyIds = userProperties.map(p => p.id);

    let roomStats = { total: 0, available: 0, occupied: 0, maintenance: 0 };
    let tenantCount = 0;
    let invoiceStats = { unpaid: 0, totalUnpaid: 0, paidThisMonth: 0 };
    let recentInvoices: any[] = [];

    if (propertyIds.length > 0) {
        // Room stats
        const allRooms = await db
            .select()
            .from(rooms)
            .where(sql`${rooms.propertyId} IN ${propertyIds}`);

        roomStats.total = allRooms.length;
        roomStats.available = allRooms.filter(r => r.status === "available").length;
        roomStats.occupied = allRooms.filter(r => r.status === "occupied").length;
        roomStats.maintenance = allRooms.filter(r => r.status === "maintenance").length;

        const roomIds = allRooms.map(r => r.id);

        if (roomIds.length > 0) {
            // Tenant count
            const [tenantResult] = await db
                .select({ count: sql<number>`count(*)` })
                .from(tenants)
                .where(and(
                    sql`${tenants.roomId} IN ${roomIds}`,
                    eq(tenants.isActive, true)
                ));
            tenantCount = Number(tenantResult?.count || 0);

            // Get tenant IDs
            const allTenants = await db
                .select({ id: tenants.id })
                .from(tenants)
                .where(sql`${tenants.roomId} IN ${roomIds}`);

            const tenantIds = allTenants.map(t => t.id);

            if (tenantIds.length > 0) {
                // Invoice stats
                const allInvoices = await db
                    .select()
                    .from(invoices)
                    .where(sql`${invoices.tenantId} IN ${tenantIds}`);

                const unpaidInvoices = allInvoices.filter(i => i.status === "unpaid");
                invoiceStats.unpaid = unpaidInvoices.length;
                invoiceStats.totalUnpaid = unpaidInvoices.reduce((sum, i) => sum + i.amount, 0);

                const currentMonth = new Date().getMonth();
                const currentYear = new Date().getFullYear();
                invoiceStats.paidThisMonth = allInvoices
                    .filter(i => {
                        if (i.status !== "paid" || !i.paidAt) return false;
                        const paidDate = new Date(i.paidAt);
                        return paidDate.getMonth() === currentMonth && paidDate.getFullYear() === currentYear;
                    })
                    .reduce((sum, i) => sum + i.amount, 0);

                // Recent invoices with tenant info
                recentInvoices = await db
                    .select({
                        id: invoices.id,
                        amount: invoices.amount,
                        status: invoices.status,
                        period: invoices.period,
                        createdAt: invoices.createdAt,
                        tenantName: tenants.name,
                    })
                    .from(invoices)
                    .innerJoin(tenants, eq(invoices.tenantId, tenants.id))
                    .where(sql`${invoices.tenantId} IN ${tenantIds}`)
                    .orderBy(desc(invoices.createdAt))
                    .limit(5);
            }
        }
    }

    const stats = [
        {
            title: "Total Properti",
            value: Number(propertyCount?.count || 0),
            icon: Building2,
            description: "Bangunan kos",
            color: "text-blue-600",
            bgColor: "bg-blue-100",
        },
        {
            title: "Kamar Terisi",
            value: `${roomStats.occupied}/${roomStats.total}`,
            icon: DoorOpen,
            description: `${roomStats.available} tersedia`,
            color: "text-green-600",
            bgColor: "bg-green-100",
        },
        {
            title: "Total Penyewa",
            value: tenantCount,
            icon: Users,
            description: "Penyewa aktif",
            color: "text-purple-600",
            bgColor: "bg-purple-100",
        },
        {
            title: "Tagihan Belum Lunas",
            value: invoiceStats.unpaid,
            icon: Receipt,
            description: formatCurrency(invoiceStats.totalUnpaid),
            color: "text-orange-600",
            bgColor: "bg-orange-100",
        },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl md:text-3xl font-bold">
                            Halo, {session?.user?.name?.split(" ")[0]}! 👋
                        </h1>
                        {userPlan === 'pro' ? (
                            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                                <Crown className="h-3 w-3 mr-1" />
                                PRO
                            </Badge>
                        ) : (
                            <Badge variant="outline" asChild>
                                <Link href="/dashboard/upgrade" className="cursor-pointer hover:bg-muted">
                                    FREE
                                </Link>
                            </Badge>
                        )}
                    </div>
                    <p className="text-muted-foreground mt-1">
                        Selamat datang kembali di KosManager
                    </p>
                </div>
                <Button asChild className="w-full md:w-auto">
                    <Link href="/dashboard/properties/new">
                        <Building2 className="mr-2 h-4 w-4" />
                        Tambah Properti
                    </Link>
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <Card key={stat.title} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                        <CardContent className="p-4 md:p-6">
                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-xl ${stat.bgColor}`}>
                                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-muted-foreground truncate">{stat.title}</p>
                                    <p className="text-xl md:text-2xl font-bold">{stat.value}</p>
                                    <p className="text-xs text-muted-foreground truncate">{stat.description}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Income Summary */}
            <div className="grid md:grid-cols-2 gap-6">
                <Card className="animate-slide-up" style={{ animationDelay: "400ms" }}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                            Pendapatan Bulan Ini
                        </CardTitle>
                        <CardDescription>Tagihan yang sudah dibayar</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-green-600">
                            {formatCurrency(invoiceStats.paidThisMonth)}
                        </p>
                    </CardContent>
                </Card>

                <Card className="animate-slide-up" style={{ animationDelay: "500ms" }}>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Aktivitas Terbaru</CardTitle>
                            <CardDescription>Tagihan terbaru</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/dashboard/invoices">Lihat Semua</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {recentInvoices.length === 0 ? (
                            <div className="text-center py-6">
                                <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">Belum ada tagihan</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentInvoices.map((invoice) => (
                                    <div key={invoice.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                        <div className="flex items-center gap-3">
                                            {invoice.status === "paid" ? (
                                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                            ) : (
                                                <Clock className="h-4 w-4 text-orange-600" />
                                            )}
                                            <div>
                                                <p className="font-medium text-sm">{invoice.tenantName}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(invoice.period).toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-sm">{formatCurrency(invoice.amount)}</p>
                                            <Badge variant={invoice.status === "paid" ? "default" : "secondary"} className="text-[10px]">
                                                {invoice.status === "paid" ? "Lunas" : "Belum Lunas"}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            {propertyCount?.count === 0 && (
                <Card className="border-dashed animate-slide-up" style={{ animationDelay: "600ms" }}>
                    <CardContent className="py-10 text-center">
                        <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Mulai Kelola Kos Anda</h3>
                        <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                            Tambahkan properti pertama Anda untuk mulai mengelola kamar, penyewa, dan tagihan.
                        </p>
                        <Button asChild>
                            <Link href="/dashboard/properties/new">
                                Tambah Properti Pertama
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
