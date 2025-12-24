"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
import { toast } from "sonner";
import { formatCurrency } from "@/lib/format";

interface Tenant {
    id: string;
    name: string;
    roomNumber: string;
    propertyName: string;
    price: number;
}

export function CreateInvoiceDialog() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingTenants, setIsLoadingTenants] = useState(true);
    const [activeTenants, setActiveTenants] = useState<Tenant[]>([]);
    const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
    const [amount, setAmount] = useState<number>(0);
    const [period, setPeriod] = useState<string>(
        new Date().toISOString().slice(0, 7) + "-01"
    );

    // Fetch active tenants
    useEffect(() => {
        const fetchTenants = async () => {
            try {
                const response = await fetch("/api/tenants/active");
                const data = await response.json();
                setActiveTenants(data.tenants || []);
            } catch (error) {
                toast.error("Gagal memuat daftar penyewa");
            } finally {
                setIsLoadingTenants(false);
            }
        };

        if (open) {
            fetchTenants();
        }
    }, [open]);

    const handleTenantChange = (tenantId: string) => {
        const tenant = activeTenants.find(t => t.id === tenantId);
        setSelectedTenant(tenant || null);
        if (tenant) {
            setAmount(tenant.price);
        }
    };

    const handleSubmit = async () => {
        if (!selectedTenant) {
            toast.error("Pilih penyewa terlebih dahulu");
            return;
        }

        if (amount <= 0) {
            toast.error("Jumlah tagihan harus lebih dari 0");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch("/api/invoices", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tenantId: selectedTenant.id,
                    amount,
                    period,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                toast.error(result.error || "Gagal membuat tagihan");
                return;
            }

            toast.success("Tagihan berhasil dibuat!");
            setOpen(false);
            setSelectedTenant(null);
            setAmount(0);
            router.refresh();
        } catch (error) {
            toast.error("Terjadi kesalahan. Silakan coba lagi.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full md:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    Buat Tagihan
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                        <Receipt className="h-6 w-6 text-primary" />
                    </div>
                    <DialogTitle>Buat Tagihan Baru</DialogTitle>
                    <DialogDescription>
                        Buat tagihan bulanan untuk penyewa
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Tenant Selection */}
                    <div className="space-y-2">
                        <Label>Pilih Penyewa</Label>
                        {isLoadingTenants ? (
                            <div className="flex items-center gap-2 p-3 border rounded-md">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="text-sm text-muted-foreground">Memuat penyewa...</span>
                            </div>
                        ) : activeTenants.length === 0 ? (
                            <div className="p-4 border rounded-md bg-muted text-center">
                                <p className="text-sm text-muted-foreground">Tidak ada penyewa aktif</p>
                            </div>
                        ) : (
                            <Select onValueChange={handleTenantChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih penyewa" />
                                </SelectTrigger>
                                <SelectContent>
                                    {activeTenants.map((tenant) => (
                                        <SelectItem key={tenant.id} value={tenant.id}>
                                            {tenant.name} - {tenant.propertyName} ({tenant.roomNumber})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    {/* Selected Tenant Info */}
                    {selectedTenant && (
                        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                            <p className="text-sm font-medium">Penyewa:</p>
                            <p className="text-lg font-bold text-primary">{selectedTenant.name}</p>
                            <p className="text-sm text-muted-foreground">
                                {selectedTenant.propertyName} - Kamar {selectedTenant.roomNumber}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Harga kamar: {formatCurrency(selectedTenant.price)}/bulan
                            </p>
                        </div>
                    )}

                    {/* Period */}
                    <div className="space-y-2">
                        <Label>Periode Tagihan</Label>
                        <Input
                            type="month"
                            value={period.slice(0, 7)}
                            onChange={(e) => setPeriod(e.target.value + "-01")}
                        />
                    </div>

                    {/* Amount */}
                    <div className="space-y-2">
                        <Label>Jumlah Tagihan (Rp)</Label>
                        <Input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                            placeholder="Masukkan jumlah tagihan"
                        />
                        <p className="text-xs text-muted-foreground">
                            Bisa diubah jika ada biaya tambahan
                        </p>
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Batal
                    </Button>
                    <Button onClick={handleSubmit} disabled={isLoading || !selectedTenant}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Menyimpan...
                            </>
                        ) : (
                            "Buat Tagihan"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
