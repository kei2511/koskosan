"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
    ArrowLeft,
    Phone,
    Calendar,
    CreditCard,
    Home,
    User,
    MoreVertical,
    MessageCircle,
    FileText,
    LogOut,
    Edit,
    Trash2,
    Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/format";
import { use } from "react";

interface TenantDetail {
    id: string;
    name: string;
    phoneNumber: string;
    idCardPhoto: string | null;
    startDate: string;
    dueDate: number;
    isActive: boolean;
    createdAt: string;
    room: {
        id: string;
        roomNumber: string;
        price: number;
        property: {
            id: string;
            name: string;
            address: string;
        };
    };
    invoices: {
        id: string;
        amount: number;
        period: string;
        status: string;
        paidAt: string | null;
        createdAt: string;
    }[];
}

export default function TenantDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id: tenantId } = use(params);
    const router = useRouter();
    const [tenant, setTenant] = useState<TenantDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
    const [checkingOut, setCheckingOut] = useState(false);

    useEffect(() => {
        fetchTenantDetail();
    }, [tenantId]);

    async function fetchTenantDetail() {
        try {
            const response = await fetch(`/api/tenants/${tenantId}`);
            if (!response.ok) {
                if (response.status === 404) {
                    setError("Penyewa tidak ditemukan");
                } else {
                    throw new Error("Gagal mengambil data");
                }
                return;
            }
            const data = await response.json();
            setTenant(data);
        } catch (err) {
            setError("Terjadi kesalahan saat mengambil data");
        } finally {
            setLoading(false);
        }
    }

    async function handleCheckout() {
        setCheckingOut(true);
        try {
            const response = await fetch(`/api/tenants/${tenantId}/checkout`, {
                method: "POST",
            });

            if (!response.ok) {
                throw new Error("Gagal melakukan check-out");
            }

            router.push("/dashboard/tenants");
        } catch (err) {
            alert("Gagal melakukan check-out");
        } finally {
            setCheckingOut(false);
            setShowCheckoutDialog(false);
        }
    }

    function openWhatsApp() {
        if (!tenant) return;
        const phone = tenant.phoneNumber.replace(/^0/, "62");
        const message = encodeURIComponent(
            `Halo ${tenant.name}, ini pesan dari pengelola kos ${tenant.room.property.name}.`
        );
        window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-8 w-48" />
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <Skeleton className="h-64" />
                    <Skeleton className="h-64" />
                </div>
            </div>
        );
    }

    if (error || !tenant) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">{error || "Data tidak ditemukan"}</p>
                <Button asChild>
                    <Link href="/dashboard/tenants">Kembali ke Daftar Penyewa</Link>
                </Button>
            </div>
        );
    }

    const unpaidInvoices = tenant.invoices.filter((inv) => inv.status === "unpaid");
    const paidInvoices = tenant.invoices.filter((inv) => inv.status === "paid");
    const totalUnpaid = unpaidInvoices.reduce((sum, inv) => sum + inv.amount, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/dashboard/tenants">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            {tenant.name}
                            <Badge variant={tenant.isActive ? "default" : "secondary"}>
                                {tenant.isActive ? "Aktif" : "Tidak Aktif"}
                            </Badge>
                        </h1>
                        <p className="text-muted-foreground">
                            Kamar {tenant.room.roomNumber} • {tenant.room.property.name}
                        </p>
                    </div>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={openWhatsApp}>
                            <MessageCircle className="mr-2 h-4 w-4" />
                            Hubungi via WhatsApp
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/dashboard/invoices?tenant=${tenant.id}`}>
                                <FileText className="mr-2 h-4 w-4" />
                                Lihat Tagihan
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {tenant.isActive && (
                            <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => setShowCheckoutDialog(true)}
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Check-out
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Info Cards */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Contact Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Informasi Kontak
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">No. WhatsApp</p>
                                <p className="font-medium">{tenant.phoneNumber}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Tanggal Masuk</p>
                                <p className="font-medium">
                                    {format(new Date(tenant.startDate), "d MMMM yyyy", { locale: id })}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Jatuh Tempo Bulanan</p>
                                <p className="font-medium">Tanggal {tenant.dueDate}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Room Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Home className="h-5 w-5" />
                            Informasi Kamar
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Properti</p>
                                <p className="font-medium">{tenant.room.property.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {tenant.room.property.address}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Home className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Nomor Kamar</p>
                                <p className="font-medium">Kamar {tenant.room.roomNumber}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Harga Sewa</p>
                                <p className="font-medium text-lg">
                                    {formatCurrency(tenant.room.price)}
                                    <span className="text-sm font-normal text-muted-foreground">/bulan</span>
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Billing Summary */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Ringkasan Tagihan
                        </span>
                        <Button size="sm" variant="outline" asChild>
                            <Link href={`/dashboard/invoices?tenant=${tenant.id}`}>Lihat Semua</Link>
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 rounded-lg bg-muted/50">
                            <p className="text-2xl font-bold">{tenant.invoices.length}</p>
                            <p className="text-sm text-muted-foreground">Total Tagihan</p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-green-500/10">
                            <p className="text-2xl font-bold text-green-600">{paidInvoices.length}</p>
                            <p className="text-sm text-muted-foreground">Lunas</p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-red-500/10">
                            <p className="text-2xl font-bold text-red-600">{unpaidInvoices.length}</p>
                            <p className="text-sm text-muted-foreground">Belum Lunas</p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-orange-500/10">
                            <p className="text-2xl font-bold text-orange-600">
                                {formatCurrency(totalUnpaid)}
                            </p>
                            <p className="text-sm text-muted-foreground">Total Tunggakan</p>
                        </div>
                    </div>

                    {/* Recent Invoices */}
                    {tenant.invoices.length > 0 && (
                        <div className="mt-6">
                            <h4 className="text-sm font-medium mb-3">Tagihan Terakhir</h4>
                            <div className="space-y-2">
                                {tenant.invoices.slice(0, 3).map((invoice) => (
                                    <div
                                        key={invoice.id}
                                        className="flex items-center justify-between p-3 rounded-lg border"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                {format(new Date(invoice.period), "MMMM yyyy", { locale: id })}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {formatCurrency(invoice.amount)}
                                            </p>
                                        </div>
                                        <Badge
                                            variant={invoice.status === "paid" ? "default" : "destructive"}
                                        >
                                            {invoice.status === "paid" ? "Lunas" : "Belum Lunas"}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Check-out Dialog */}
            <AlertDialog open={showCheckoutDialog} onOpenChange={setShowCheckoutDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Konfirmasi Check-out</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin melakukan check-out untuk {tenant.name}?
                            {unpaidInvoices.length > 0 && (
                                <span className="block mt-2 text-destructive">
                                    Perhatian: Penyewa masih memiliki {unpaidInvoices.length} tagihan
                                    belum lunas sebesar {formatCurrency(totalUnpaid)}.
                                </span>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleCheckout}
                            disabled={checkingOut}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {checkingOut ? "Memproses..." : "Ya, Check-out"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
