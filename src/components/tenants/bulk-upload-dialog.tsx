"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Download, FileSpreadsheet, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { UpgradePrompt } from "@/components/upgrade-prompt";
import type { SubscriptionPlan } from "@/lib/subscription";

interface TenantData {
    name: string;
    phoneNumber: string;
    roomNumber: string;
    startDate: string;
    dueDate: string;
}

interface ValidationResult {
    valid: TenantData[];
    invalid: Array<{ row: number; data: any; errors: string[] }>;
}

interface BulkUploadDialogProps {
    userPlan?: SubscriptionPlan;
}

export function BulkUploadDialog({ userPlan = 'free' }: BulkUploadDialogProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [preview, setPreview] = useState<ValidationResult | null>(null);

    const downloadTemplate = () => {
        const template = [
            {
                name: "John Doe",
                phoneNumber: "081234567890",
                roomNumber: "A1",
                startDate: "2024-01-15",
                dueDate: "5"
            },
            {
                name: "Jane Smith",
                phoneNumber: "082345678901",
                roomNumber: "A2",
                startDate: "2024-02-01",
                dueDate: "10"
            }
        ];

        const ws = XLSX.utils.json_to_sheet(template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Tenants");
        XLSX.writeFile(wb, "template_penyewa.xlsx");

        toast.success("Template berhasil didownload");
    };

    const validateData = (data: any[]): ValidationResult => {
        const valid: TenantData[] = [];
        const invalid: Array<{ row: number; data: any; errors: string[] }> = [];

        data.forEach((row, index) => {
            const errors: string[] = [];

            if (!row.name || row.name.trim() === "") {
                errors.push("Nama wajib diisi");
            }

            if (!row.phoneNumber || row.phoneNumber.trim() === "") {
                errors.push("Nomor telepon wajib diisi");
            }

            if (!row.roomNumber || row.roomNumber.trim() === "") {
                errors.push("Nomor kamar wajib diisi");
            }

            if (!row.startDate || row.startDate.trim() === "") {
                errors.push("Tanggal mulai wajib diisi");
            }

            if (!row.dueDate || row.dueDate.trim() === "") {
                errors.push("Tanggal jatuh tempo wajib diisi");
            }

            if (errors.length > 0) {
                invalid.push({ row: index + 2, data: row, errors });
            } else {
                valid.push({
                    name: row.name.trim(),
                    phoneNumber: row.phoneNumber.trim(),
                    roomNumber: row.roomNumber.trim(),
                    startDate: row.startDate.trim(),
                    dueDate: row.dueDate.trim()
                });
            }
        });

        return { valid, invalid };
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setFile(selectedFile);

        const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();

        try {
            let parsedData: any[] = [];

            if (fileExtension === 'csv') {
                // Parse CSV
                Papa.parse(selectedFile, {
                    header: true,
                    complete: (results) => {
                        parsedData = results.data;
                        const validated = validateData(parsedData);
                        setPreview(validated);
                    },
                    error: (error) => {
                        toast.error("Gagal membaca file CSV");
                        console.error(error);
                    }
                });
            } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
                // Parse Excel
                const reader = new FileReader();
                reader.onload = (event) => {
                    const data = event.target?.result;
                    const workbook = XLSX.read(data, { type: 'binary' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    parsedData = XLSX.utils.sheet_to_json(worksheet);

                    const validated = validateData(parsedData);
                    setPreview(validated);
                };
                reader.readAsBinaryString(selectedFile);
            } else {
                toast.error("Format file tidak didukung. Gunakan CSV atau Excel.");
            }
        } catch (error) {
            toast.error("Terjadi kesalahan saat membaca file");
            console.error(error);
        }
    };

    const handleUpload = async () => {
        if (!preview || preview.valid.length === 0) {
            toast.error("Tidak ada data valid untuk diupload");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch("/api/tenants/bulk", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tenants: preview.valid }),
            });

            const result = await response.json();

            if (!response.ok) {
                toast.error(result.error || "Gagal mengupload data");
                return;
            }

            toast.success(`Berhasil menambahkan ${result.success} penyewa!`);
            setOpen(false);
            setFile(null);
            setPreview(null);
            router.refresh();
        } catch (error) {
            toast.error("Terjadi kesalahan. Silakan coba lagi.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setFile(null);
        setPreview(null);
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) resetForm();
        }}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload CSV/Excel
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                        <FileSpreadsheet className="h-6 w-6 text-primary" />
                    </div>
                    <DialogTitle>Upload Data Penyewa</DialogTitle>
                    <DialogDescription>
                        Upload file CSV atau Excel untuk menambahkan banyak penyewa sekaligus
                    </DialogDescription>
                </DialogHeader>

                {userPlan !== 'pro' ? (
                    <div className="py-4">
                        <UpgradePrompt
                            feature="Bulk Upload Premium Feature"
                            description="Upload hingga ratusan penyewa sekaligus dengan file CSV atau Excel. Hemat waktu berjam-jam dalam input data manual!"
                        />
                    </div>
                ) : (
                    <>
                        <div className="space-y-4 py-4">
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={downloadTemplate}
                                    className="w-full"
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Download Template
                                </Button>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium">
                                    Pilih File (CSV atau Excel)
                                </label>
                                <input
                                    type="file"
                                    accept=".csv,.xlsx,.xls"
                                    onChange={handleFileChange}
                                    className="block w-full text-sm text-slate-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-lg file:border-0
                                file:text-sm file:font-semibold
                                file:bg-primary file:text-primary-foreground
                                hover:file:bg-primary/90
                                cursor-pointer"
                                />
                                {file && (
                                    <p className="text-sm text-muted-foreground">
                                        File dipilih: {file.name}
                                    </p>
                                )}
                            </div>

                            {preview && (
                                <div className="space-y-4 pt-4 border-t">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                            <div className="flex items-center gap-2 mb-1">
                                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                                <span className="font-semibold text-green-900">Data Valid</span>
                                            </div>
                                            <p className="text-2xl font-bold text-green-600">
                                                {preview.valid.length}
                                            </p>
                                        </div>
                                        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                                            <div className="flex items-center gap-2 mb-1">
                                                <XCircle className="h-5 w-5 text-red-600" />
                                                <span className="font-semibold text-red-900">Data Invalid</span>
                                            </div>
                                            <p className="text-2xl font-bold text-red-600">
                                                {preview.invalid.length}
                                            </p>
                                        </div>
                                    </div>

                                    {preview.invalid.length > 0 && (
                                        <div className="max-h-40 overflow-y-auto bg-red-50 p-3 rounded-lg border border-red-200">
                                            <p className="font-semibold text-red-900 mb-2">Error pada baris:</p>
                                            <ul className="text-sm space-y-1">
                                                {preview.invalid.map((item, idx) => (
                                                    <li key={idx} className="text-red-700">
                                                        Baris {item.row}: {item.errors.join(", ")}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {preview.valid.length > 0 && (
                                        <div className="max-h-48 overflow-y-auto">
                                            <p className="font-semibold mb-2">Preview Data Valid:</p>
                                            <div className="text-xs space-y-2">
                                                {preview.valid.slice(0, 5).map((tenant, idx) => (
                                                    <div key={idx} className="p-2 bg-slate-50 rounded border">
                                                        <p><strong>{tenant.name}</strong> - {tenant.phoneNumber}</p>
                                                        <p className="text-muted-foreground">
                                                            Kamar: {tenant.roomNumber} | Mulai: {tenant.startDate} | Jatuh tempo: {tenant.dueDate}
                                                        </p>
                                                    </div>
                                                ))}
                                                {preview.valid.length > 5 && (
                                                    <p className="text-muted-foreground">
                                                        +{preview.valid.length - 5} data lainnya...
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <DialogFooter className="gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                onClick={handleUpload}
                                disabled={isLoading || !preview || preview.valid.length === 0}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Mengupload...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Upload {preview?.valid.length || 0} Penyewa
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
