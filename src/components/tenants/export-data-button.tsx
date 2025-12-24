"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import * as XLSX from "xlsx";

interface Tenant {
    id: string;
    name: string;
    phoneNumber: string;
    startDate: string | Date | null;
    dueDate: number;
    isActive: boolean;
    roomNumber: string;
    propertyName: string;
}

interface ExportDataButtonProps {
    tenants: Tenant[];
}

export function ExportDataButton({ tenants }: ExportDataButtonProps) {
    const [isExporting, setIsExporting] = useState(false);

    const formatDate = (date: string | Date | null) => {
        if (!date) return "-";
        const d = typeof date === "string" ? new Date(date) : date;
        return d.toISOString().split('T')[0];
    };

    const prepareExportData = () => {
        return tenants.map(tenant => ({
            "Nama Penyewa": tenant.name,
            "No. Telepon": tenant.phoneNumber,
            "Properti": tenant.propertyName,
            "Nomor Kamar": tenant.roomNumber,
            "Tanggal Mulai": formatDate(tenant.startDate),
            "Tanggal Jatuh Tempo": tenant.dueDate,
            "Status": tenant.isActive ? "Aktif" : "Tidak Aktif"
        }));
    };

    const exportToCSV = () => {
        setIsExporting(true);
        try {
            const data = prepareExportData();
            const ws = XLSX.utils.json_to_sheet(data);
            const csv = XLSX.utils.sheet_to_csv(ws);

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);

            link.setAttribute('href', url);
            link.setAttribute('download', `data_penyewa_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success("Data berhasil diexport ke CSV");
        } catch (error) {
            toast.error("Gagal export data");
            console.error(error);
        } finally {
            setIsExporting(false);
        }
    };

    const exportToExcel = () => {
        setIsExporting(true);
        try {
            const data = prepareExportData();
            const ws = XLSX.utils.json_to_sheet(data);

            // Auto-size columns
            const colWidths = [
                { wch: 25 }, // Nama
                { wch: 15 }, // No. Telepon
                { wch: 20 }, // Properti
                { wch: 12 }, // Nomor Kamar
                { wch: 15 }, // Tanggal Mulai
                { wch: 18 }, // Tanggal Jatuh Tempo
                { wch: 12 }, // Status
            ];
            ws['!cols'] = colWidths;

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Data Penyewa");

            XLSX.writeFile(wb, `data_penyewa_${new Date().toISOString().split('T')[0]}.xlsx`);

            toast.success("Data berhasil diexport ke Excel");
        } catch (error) {
            toast.error("Gagal export data");
            console.error(error);
        } finally {
            setIsExporting(false);
        }
    };

    if (tenants.length === 0) {
        return null; // Don't show button if no tenants
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={isExporting}>
                    {isExporting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Exporting...
                        </>
                    ) : (
                        <>
                            <Download className="mr-2 h-4 w-4" />
                            Download Data
                        </>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Format File</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={exportToExcel}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Excel (.xlsx)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToCSV}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    CSV (.csv)
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
