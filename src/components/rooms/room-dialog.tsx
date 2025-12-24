"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Plus, Loader2, DoorOpen, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { roomSchema, type RoomInput } from "@/lib/validations";
import { toast } from "sonner";

interface RoomDialogProps {
    propertyId: string;
    room?: {
        id: string;
        roomNumber: string;
        price: number;
        status: string;
        facilities: string[] | null;
    };
}

const facilityOptions = [
    "AC",
    "Kamar Mandi Dalam",
    "WiFi",
    "Kasur",
    "Lemari",
    "Meja",
    "Kursi",
    "TV",
    "Dapur",
    "Parkir Motor",
    "Parkir Mobil",
];

export function RoomDialog({ propertyId, room }: RoomDialogProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFacilities, setSelectedFacilities] = useState<string[]>(
        room?.facilities || []
    );

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm<RoomInput>({
        resolver: zodResolver(roomSchema),
        defaultValues: {
            roomNumber: room?.roomNumber || "",
            price: room?.price || 0,
            status: (room?.status as "available" | "occupied" | "maintenance") || "available",
            facilities: room?.facilities || [],
        },
    });

    const onSubmit = async (data: RoomInput) => {
        setIsLoading(true);
        try {
            const url = room
                ? `/api/rooms/${room.id}`
                : `/api/properties/${propertyId}/rooms`;

            const response = await fetch(url, {
                method: room ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...data,
                    facilities: selectedFacilities,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                toast.error(result.error || "Gagal menyimpan kamar");
                return;
            }

            toast.success(room ? "Kamar berhasil diperbarui!" : "Kamar berhasil ditambahkan!");
            setOpen(false);
            reset();
            setSelectedFacilities([]);
            router.refresh();
        } catch (error) {
            toast.error("Terjadi kesalahan. Silakan coba lagi.");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleFacility = (facility: string) => {
        setSelectedFacilities((prev) =>
            prev.includes(facility)
                ? prev.filter((f) => f !== facility)
                : [...prev, facility]
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {room ? (
                    <Button variant="outline" size="sm" className="w-full text-xs">
                        <Settings className="mr-2 h-3 w-3" />
                        Edit Kamar
                    </Button>
                ) : (
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Kamar
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                        <DoorOpen className="h-6 w-6 text-primary" />
                    </div>
                    <DialogTitle>{room ? "Edit Kamar" : "Tambah Kamar Baru"}</DialogTitle>
                    <DialogDescription>
                        {room ? "Ubah informasi kamar" : "Tambahkan kamar baru ke properti ini"}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="roomNumber">Nomor Kamar</Label>
                            <Input
                                id="roomNumber"
                                placeholder="Contoh: A1"
                                {...register("roomNumber")}
                            />
                            {errors.roomNumber && (
                                <p className="text-xs text-destructive">{errors.roomNumber.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="price">Harga/Bulan (Rp)</Label>
                            <Input
                                id="price"
                                type="number"
                                placeholder="1000000"
                                {...register("price")}
                            />
                            {errors.price && (
                                <p className="text-xs text-destructive">{errors.price.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Status Kamar</Label>
                        <Select
                            defaultValue={room?.status || "available"}
                            onValueChange={(value) => setValue("status", value as "available" | "occupied" | "maintenance")}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="available">Tersedia</SelectItem>
                                <SelectItem value="occupied">Terisi</SelectItem>
                                <SelectItem value="maintenance">Perbaikan</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Fasilitas</Label>
                        <div className="flex flex-wrap gap-2">
                            {facilityOptions.map((facility) => (
                                <Button
                                    key={facility}
                                    type="button"
                                    variant={selectedFacilities.includes(facility) ? "default" : "outline"}
                                    size="sm"
                                    className="text-xs"
                                    onClick={() => toggleFacility(facility)}
                                >
                                    {facility}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                "Simpan"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
