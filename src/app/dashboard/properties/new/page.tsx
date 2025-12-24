"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { propertySchema, type PropertyInput } from "@/lib/validations";
import { toast } from "sonner";
import Link from "next/link";

export default function NewPropertyPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<PropertyInput>({
        resolver: zodResolver(propertySchema),
    });

    const onSubmit = async (data: PropertyInput) => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/properties", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                toast.error(result.error || "Gagal menambah properti");
                return;
            }

            toast.success("Properti berhasil ditambahkan!");
            router.push(`/dashboard/properties/${result.property.id}`);
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
                <Link href="/dashboard/properties">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali
                </Link>
            </Button>

            <Card>
                <CardHeader>
                    <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center mb-4">
                        <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle>Tambah Properti Baru</CardTitle>
                    <CardDescription>
                        Tambahkan informasi bangunan kos Anda
                    </CardDescription>
                </CardHeader>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nama Properti</Label>
                            <Input
                                id="name"
                                placeholder="Contoh: Kos Melati Indah"
                                {...register("name")}
                                className="h-11"
                            />
                            {errors.name && (
                                <p className="text-sm text-destructive">{errors.name.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Alamat Lengkap</Label>
                            <Input
                                id="address"
                                placeholder="Contoh: Jl. Melati No. 123, Jakarta Selatan"
                                {...register("address")}
                                className="h-11"
                            />
                            {errors.address && (
                                <p className="text-sm text-destructive">{errors.address.message}</p>
                            )}
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
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    "Simpan Properti"
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </form>
            </Card>
        </div>
    );
}
