"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, CheckCircle2, Loader2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";
import { formatCurrency, formatPhoneForWhatsApp } from "@/lib/format";

interface InvoiceActionsProps {
    invoiceId: string;
    tenantName: string;
    tenantPhone: string;
    amount: number;
    period: string;
    status: string;
}

export function InvoiceActions({
    invoiceId,
    tenantName,
    tenantPhone,
    amount,
    period,
    status,
}: InvoiceActionsProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const periodText = new Date(period).toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric",
    });

    const reminderMessage = `Halo ${tenantName}, ini adalah pengingat tagihan kos bulan ${periodText} sebesar ${formatCurrency(amount)}. Mohon segera melakukan pembayaran. Terima kasih! 🏠`;

    const handleSendReminder = () => {
        const formattedPhone = formatPhoneForWhatsApp(tenantPhone);
        const encodedMessage = encodeURIComponent(reminderMessage);
        const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
        window.open(whatsappUrl, "_blank");
        toast.success("Membuka WhatsApp...");
    };

    const handleMarkAsPaid = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/invoices/${invoiceId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "paid" }),
            });

            const result = await response.json();

            if (!response.ok) {
                toast.error(result.error || "Gagal mengubah status");
                return;
            }

            toast.success("Tagihan ditandai sebagai lunas!");
            setShowConfirm(false);
            router.refresh();
        } catch (error) {
            toast.error("Terjadi kesalahan. Silakan coba lagi.");
        } finally {
            setIsLoading(false);
        }
    };

    if (status === "paid") {
        return null;
    }

    return (
        <>
            <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleSendReminder}
            >
                <MessageCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Kirim Reminder</span>
            </Button>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleSendReminder}>
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Kirim Reminder WA
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() => setShowConfirm(true)}
                        className="text-green-600 focus:text-green-600"
                    >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Tandai Lunas
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Konfirmasi Pembayaran</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah tagihan <strong>{formatCurrency(amount)}</strong> dari <strong>{tenantName}</strong> untuk periode <strong>{periodText}</strong> sudah dibayar?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleMarkAsPaid}
                            disabled={isLoading}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Memproses...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Ya, Sudah Lunas
                                </>
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
