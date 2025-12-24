import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { properties, rooms } from "@/lib/db/schema";
import { eq, sql, desc } from "drizzle-orm";
import { Building2, Plus, MapPin, DoorOpen } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function PropertiesPage() {
    const session = await auth();
    const userId = session?.user?.id;

    // Fetch properties with room counts
    const userProperties = await db
        .select({
            id: properties.id,
            name: properties.name,
            address: properties.address,
            totalRooms: properties.totalRooms,
            createdAt: properties.createdAt,
        })
        .from(properties)
        .where(eq(properties.ownerId, userId!))
        .orderBy(desc(properties.createdAt));

    // Get room stats for each property
    const propertiesWithStats = await Promise.all(
        userProperties.map(async (property) => {
            const roomStats = await db
                .select({
                    status: rooms.status,
                    count: sql<number>`count(*)`,
                })
                .from(rooms)
                .where(eq(rooms.propertyId, property.id))
                .groupBy(rooms.status);

            const stats = {
                available: 0,
                occupied: 0,
                maintenance: 0,
                total: 0,
            };

            roomStats.forEach((r) => {
                const count = Number(r.count);
                stats[r.status as keyof typeof stats] = count;
                stats.total += count;
            });

            return { ...property, roomStats: stats };
        })
    );

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Properti Saya</h1>
                    <p className="text-muted-foreground mt-1">
                        Kelola semua properti kos Anda
                    </p>
                </div>
                <Button asChild className="w-full md:w-auto">
                    <Link href="/dashboard/properties/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Properti
                    </Link>
                </Button>
            </div>

            {/* Properties Grid */}
            {propertiesWithStats.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="py-16 text-center">
                        <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Belum Ada Properti</h3>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                            Anda belum memiliki properti kos. Tambahkan properti pertama Anda untuk mulai mengelola kamar dan penyewa.
                        </p>
                        <Button asChild size="lg">
                            <Link href="/dashboard/properties/new">
                                <Plus className="mr-2 h-4 w-4" />
                                Tambah Properti Pertama
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {propertiesWithStats.map((property, index) => (
                        <Card
                            key={property.id}
                            className="group hover:shadow-lg transition-all duration-300 animate-slide-up cursor-pointer"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <Link href={`/dashboard/properties/${property.id}`}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                            <Building2 className="h-6 w-6" />
                                        </div>
                                        <Badge variant="outline" className="text-xs">
                                            {property.roomStats.total} Kamar
                                        </Badge>
                                    </div>
                                    <CardTitle className="mt-3 group-hover:text-primary transition-colors">
                                        {property.name}
                                    </CardTitle>
                                    <CardDescription className="flex items-center gap-1 text-sm">
                                        <MapPin className="h-3 w-3" />
                                        {property.address}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1.5">
                                            <div className="h-2 w-2 rounded-full bg-green-500" />
                                            <span className="text-xs text-muted-foreground">
                                                {property.roomStats.available} Tersedia
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                                            <span className="text-xs text-muted-foreground">
                                                {property.roomStats.occupied} Terisi
                                            </span>
                                        </div>
                                        {property.roomStats.maintenance > 0 && (
                                            <div className="flex items-center gap-1.5">
                                                <div className="h-2 w-2 rounded-full bg-orange-500" />
                                                <span className="text-xs text-muted-foreground">
                                                    {property.roomStats.maintenance} Perbaikan
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Link>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
