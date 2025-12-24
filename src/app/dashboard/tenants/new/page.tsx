"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { tenantSchema, type TenantInput } from "@/lib/validations";
import { toast } from "sonner";
import Link from "next/link";
import { formatCurrency } from "@/lib/format";

interface Room {
    id: string;
    roomNumber: string;
    price: number;
    propertyName: string;
}

export default function NewTenantPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const preselectedRoomId = searchParams.get("roomId");

    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingRooms, setIsLoadingRooms] = useState(true);
    const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<TenantInput>({
        resolver: zodResolver(tenantSchema),
        defaultValues: {
            roomId: preselectedRoomId || "",
            startDate: new Date().toISOString().split("T")[0],
            dueDate: 1,
        },
    });

    const watchRoomId = watch("roomId");

    // Fetch available rooms
    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await fetch("/api/rooms/available");
                const data = await response.json();
                setAvailableRooms(data.rooms || []);

                // Set preselected room if provided
                if (preselectedRoomId && data.rooms) {
                    const room = data.rooms.find((r: Room) => r.id === preselectedRoomId);
                    if (room) {
                        setSelectedRoom(room);
                        setValue("roomId", room.id);
                    }
                }
            } catch (error) {
                toast.error("Gagal memuat daftar kamar");
            } finally {
                setIsLoadingRooms(false);
            }
        };
        fetchRooms();
    }, [preselectedRoomId, setValue]);

    // Update selected room when roomId changes
    useEffect(() => {
        if (watchRoomId) {
            const room = availableRooms.find(r => r.id === watchRoomId);
            setSelectedRoom(room || null);
        }
    }, [watchRoomId, availableRooms]);

    const onSubmit = async (data: TenantInput) => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/tenants", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                toast.error(result.error || "Gagal menambah penyewa");
                return;
            }

            toast.success("Check-in berhasil!");
            router.push("/dashboard/tenants");
            router.refresh();
        } catch (error) {
            toast.error("Terjadi kesalahan. Silakan coba lagi.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            {/* Back Button */}
            <Button variant="ghost" asChild className="-ml-2">
                <Link href="/dashboard/tenants">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali
                </Link>
            </Button>

            <Card>
                <CardHeader>
                    <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center mb-4">
                        <Users className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle>Check-in Penyewa Baru</CardTitle>
                    <CardDescription>
                        Tambahkan penyewa baru ke kamar yang tersedia
                    </CardDescription>
                </CardHeader>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
                        {/* Room Selection */}
                        <div className="space-y-2">
                            <Label>Pilih Kamar</Label>
                            {isLoadingRooms ? (
                                <div className="flex items-center gap-2 p-3 border rounded-md">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span className="text-sm text-muted-foreground">Memuat kamar...</span>
                                </div>
                            ) : availableRooms.length === 0 ? (
                                <div className="p-4 border rounded-md bg-muted text-center">
                                    <p className="text-sm text-muted-foreground">Tidak ada kamar tersedia</p>
                                    <Button variant="link" asChild className="mt-2">
                                        <Link href="/dashboard/properties">Tambah kamar terlebih dahulu</Link>
                                    </Button>
                                </div>
                            ) : (
                                <Select
                                    value={watchRoomId}
                                    onValueChange={(value) => setValue("roomId", value)}
                                >
                                    <SelectTrigger className="h-11">
                                        <SelectValue placeholder="Pilih kamar yang tersedia" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableRooms.map((room) => (
                                            <SelectItem key={room.id} value={room.id}>
                                                <div className="flex items-center justify-between w-full">
                                                    <span>{room.propertyName} - Kamar {room.roomNumber}</span>
                                                    <span className="text-muted-foreground ml-2">
                                                        {formatCurrency(room.price)}/bln
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                            {errors.roomId && (
                                <p className="text-sm text-destructive">{errors.roomId.message}</p>
                            )}
                        </div>

                        {/* Selected Room Info */}
                        {selectedRoom && (
                            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                                <p className="text-sm font-medium">Kamar yang dipilih:</p>
                                <p className="text-lg font-bold text-primary">
                                    {selectedRoom.propertyName} - Kamar {selectedRoom.roomNumber}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Harga: {formatCurrency(selectedRoom.price)}/bulan
                                </p>
                            </div>
                        )}

                        {/* Tenant Info */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Nama Lengkap</Label>
                            <Input
                                id="name"
                                placeholder="Nama lengkap penyewa"
                                {...register("name")}
                                className="h-11"
                            />
                            {errors.name && (
                                <p className="text-sm text-destructive">{errors.name.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phoneNumber">Nomor WhatsApp</Label>
                            <Input
                                id="phoneNumber"
                                placeholder="+62812345678"
                                {...register("phoneNumber")}
                                className="h-11"
                            />
                            <p className="text-xs text-muted-foreground">
                                Format: +62 atau 08 diikuti nomor (untuk reminder WhatsApp)
                            </p>
                            {errors.phoneNumber && (
                                <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="startDate">Tanggal Mulai</Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    {...register("startDate")}
                                    className="h-11"
                                />
                                {errors.startDate && (
                                    <p className="text-sm text-destructive">{errors.startDate.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="dueDate">Tanggal Jatuh Tempo</Label>
                                <Select
                                    defaultValue="1"
                                    onValueChange={(value) => setValue("dueDate", parseInt(value))}
                                >
                                    <SelectTrigger className="h-11">
                                        <SelectValue placeholder="Pilih tanggal" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                                            <SelectItem key={day} value={day.toString()}>
                                                Tanggal {day}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    Tanggal pembayaran setiap bulan
                                </p>
                                {errors.dueDate && (
                                    <p className="text-sm text-destructive">{errors.dueDate.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={() => router.back()}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1"
                                disabled={isLoading || availableRooms.length === 0}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    "Check-in Penyewa"
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </form>
            </Card>
        </div>
    );
}
