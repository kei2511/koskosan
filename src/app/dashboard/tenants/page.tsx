import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { properties, rooms, tenants } from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { Users, Plus, Phone, Home, Calendar, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function TenantsPage() {
    const session = await auth();
    const userId = session?.user?.id;

    // Get all properties owned by user
    const userProperties = await db
        .select({ id: properties.id })
        .from(properties)
        .where(eq(properties.ownerId, userId!));

    const propertyIds = userProperties.map(p => p.id);

    let allTenants: any[] = [];

    if (propertyIds.length > 0) {
        // Get all rooms from user's properties
        const userRooms = await db
            .select({ id: rooms.id, roomNumber: rooms.roomNumber, propertyId: rooms.propertyId })
            .from(rooms)
            .where(sql`${rooms.propertyId} IN ${propertyIds}`);

        const roomIds = userRooms.map(r => r.id);

        if (roomIds.length > 0) {
            // Get all tenants with room info
            allTenants = await db
                .select({
                    id: tenants.id,
                    name: tenants.name,
                    phoneNumber: tenants.phoneNumber,
                    startDate: tenants.startDate,
                    dueDate: tenants.dueDate,
                    isActive: tenants.isActive,
                    roomId: tenants.roomId,
                    roomNumber: rooms.roomNumber,
                    propertyId: rooms.propertyId,
                    propertyName: properties.name,
                })
                .from(tenants)
                .innerJoin(rooms, eq(tenants.roomId, rooms.id))
                .innerJoin(properties, eq(rooms.propertyId, properties.id))
                .where(sql`${tenants.roomId} IN ${roomIds}`)
                .orderBy(desc(tenants.createdAt));
        }
    }

    const activeTenants = allTenants.filter(t => t.isActive);
    const inactiveTenants = allTenants.filter(t => !t.isActive);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Penyewa</h1>
                    <p className="text-muted-foreground mt-1">
                        Kelola semua penyewa kos Anda
                    </p>
                </div>
                <Button asChild className="w-full md:w-auto">
                    <Link href="/dashboard/tenants/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Check-in Penyewa
                    </Link>
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
                            <Users className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{activeTenants.length}</p>
                            <p className="text-sm text-muted-foreground">Penyewa Aktif</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center">
                            <Users className="h-6 w-6 text-gray-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{inactiveTenants.length}</p>
                            <p className="text-sm text-muted-foreground">Sudah Keluar</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tenants List */}
            {allTenants.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="py-16 text-center">
                        <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Belum Ada Penyewa</h3>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                            Mulai check-in penyewa baru ke kamar yang tersedia.
                        </p>
                        <Button asChild size="lg">
                            <Link href="/dashboard/tenants/new">
                                <Plus className="mr-2 h-4 w-4" />
                                Check-in Penyewa Pertama
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {/* Active Tenants */}
                    {activeTenants.length > 0 && (
                        <div className="space-y-3">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-green-500" />
                                Penyewa Aktif
                            </h2>
                            <div className="grid gap-3">
                                {activeTenants.map((tenant, index) => (
                                    <Card
                                        key={tenant.id}
                                        className="group hover:shadow-md transition-all duration-300 animate-slide-up"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                                <div className="flex items-start gap-3">
                                                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                        <Users className="h-6 w-6 text-primary" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h3 className="font-semibold truncate">{tenant.name}</h3>
                                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                                                            <span className="flex items-center gap-1">
                                                                <Phone className="h-3 w-3" />
                                                                {tenant.phoneNumber}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Home className="h-3 w-3" />
                                                                {tenant.propertyName} - {tenant.roomNumber}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 ml-15 md:ml-0">
                                                    <Badge variant="outline" className="text-xs">
                                                        <Calendar className="h-3 w-3 mr-1" />
                                                        Bayar tgl {tenant.dueDate}
                                                    </Badge>
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={`/dashboard/tenants/${tenant.id}`}>
                                                            Detail
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Inactive Tenants */}
                    {inactiveTenants.length > 0 && (
                        <div className="space-y-3 mt-8">
                            <h2 className="text-lg font-semibold flex items-center gap-2 text-muted-foreground">
                                <div className="h-2 w-2 rounded-full bg-gray-400" />
                                Sudah Keluar ({inactiveTenants.length})
                            </h2>
                            <div className="grid gap-3 opacity-60">
                                {inactiveTenants.slice(0, 5).map((tenant) => (
                                    <Card key={tenant.id}>
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center">
                                                        <Users className="h-5 w-5 text-gray-400" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-medium">{tenant.name}</h3>
                                                        <p className="text-sm text-muted-foreground">
                                                            {tenant.propertyName} - {tenant.roomNumber}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge variant="secondary">Keluar</Badge>
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
