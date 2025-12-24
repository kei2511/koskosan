import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { properties, rooms, tenants } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import {
    ArrowLeft,
    Building2,
    Plus,
    MapPin,
    DoorOpen,
    User,
    Settings,
    Trash2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { formatCurrency, getRoomStatusLabel } from "@/lib/format";
import { RoomDialog } from "@/components/rooms/room-dialog";
import { DeletePropertyButton } from "@/components/properties/delete-property-button";

interface PropertyDetailPageProps {
    params: Promise<{ id: string }>;
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
    const { id } = await params;
    const session = await auth();
    const userId = session?.user?.id;

    // Fetch property
    const [property] = await db
        .select()
        .from(properties)
        .where(and(eq(properties.id, id), eq(properties.ownerId, userId!)))
        .limit(1);

    if (!property) {
        notFound();
    }

    // Fetch rooms with tenant info
    const propertyRooms = await db
        .select({
            id: rooms.id,
            roomNumber: rooms.roomNumber,
            price: rooms.price,
            status: rooms.status,
            facilities: rooms.facilities,
        })
        .from(rooms)
        .where(eq(rooms.propertyId, property.id))
        .orderBy(rooms.roomNumber);

    // Get tenant info for occupied rooms
    const roomsWithTenants = await Promise.all(
        propertyRooms.map(async (room) => {
            if (room.status === "occupied") {
                const [tenant] = await db
                    .select({ name: tenants.name, phoneNumber: tenants.phoneNumber })
                    .from(tenants)
                    .where(and(eq(tenants.roomId, room.id), eq(tenants.isActive, true)))
                    .limit(1);
                return { ...room, tenant };
            }
            return { ...room, tenant: null };
        })
    );

    const stats = {
        total: propertyRooms.length,
        available: propertyRooms.filter(r => r.status === "available").length,
        occupied: propertyRooms.filter(r => r.status === "occupied").length,
        maintenance: propertyRooms.filter(r => r.status === "maintenance").length,
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "available":
                return "bg-green-100 text-green-700 border-green-200";
            case "occupied":
                return "bg-blue-100 text-blue-700 border-blue-200";
            case "maintenance":
                return "bg-orange-100 text-orange-700 border-orange-200";
            default:
                return "";
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Back Button */}
            <Button variant="ghost" asChild className="-ml-2">
                <Link href="/dashboard/properties">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali
                </Link>
            </Button>

            {/* Property Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div className="h-14 w-14 rounded-2xl gradient-primary flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-7 w-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">{property.name}</h1>
                        <p className="text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="h-4 w-4" />
                            {property.address}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <RoomDialog propertyId={property.id} />
                    <DeletePropertyButton propertyId={property.id} propertyName={property.name} />
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold">{stats.total}</p>
                        <p className="text-sm text-muted-foreground">Total Kamar</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-green-600">{stats.available}</p>
                        <p className="text-sm text-muted-foreground">Tersedia</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-blue-600">{stats.occupied}</p>
                        <p className="text-sm text-muted-foreground">Terisi</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-orange-600">{stats.maintenance}</p>
                        <p className="text-sm text-muted-foreground">Perbaikan</p>
                    </CardContent>
                </Card>
            </div>

            {/* Rooms Grid */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Daftar Kamar</h2>
                </div>

                {roomsWithTenants.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="py-12 text-center">
                            <DoorOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Belum Ada Kamar</h3>
                            <p className="text-muted-foreground mb-4">
                                Tambahkan kamar untuk properti ini
                            </p>
                            <RoomDialog propertyId={property.id} />
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {roomsWithTenants.map((room, index) => (
                            <Card
                                key={room.id}
                                className={`group transition-all duration-300 hover:shadow-md animate-slide-up ${getStatusColor(room.status)}`}
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <DoorOpen className="h-5 w-5" />
                                            <span className="font-bold text-lg">{room.roomNumber}</span>
                                        </div>
                                        <Badge variant="outline" className="text-[10px]">
                                            {getRoomStatusLabel(room.status)}
                                        </Badge>
                                    </div>

                                    <p className="font-semibold text-sm mb-2">
                                        {formatCurrency(room.price)}/bulan
                                    </p>

                                    {room.tenant && (
                                        <div className="flex items-center gap-2 text-xs mt-2 pt-2 border-t">
                                            <User className="h-3 w-3" />
                                            <span className="truncate">{room.tenant.name}</span>
                                        </div>
                                    )}

                                    {room.status === "available" && (
                                        <Button
                                            size="sm"
                                            className="w-full mt-3 text-xs"
                                            asChild
                                        >
                                            <Link href={`/dashboard/tenants/new?roomId=${room.id}`}>
                                                Check-in Penyewa
                                            </Link>
                                        </Button>
                                    )}

                                    {room.facilities && room.facilities.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {room.facilities.slice(0, 2).map((facility, i) => (
                                                <span key={i} className="text-[10px] bg-background/50 px-1.5 py-0.5 rounded">
                                                    {facility}
                                                </span>
                                            ))}
                                            {room.facilities.length > 2 && (
                                                <span className="text-[10px] bg-background/50 px-1.5 py-0.5 rounded">
                                                    +{room.facilities.length - 2}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    <div className="mt-3 pt-3 border-t">
                                        <RoomDialog
                                            propertyId={property.id}
                                            room={{
                                                id: room.id,
                                                roomNumber: room.roomNumber,
                                                price: room.price,
                                                status: room.status,
                                                facilities: room.facilities
                                            }}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
