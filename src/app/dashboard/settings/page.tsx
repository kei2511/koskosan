import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Settings, User, Crown, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default async function SettingsPage() {
    const session = await auth();
    const userId = session?.user?.id;

    // Get user profile
    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId!))
        .limit(1);

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold">Pengaturan</h1>
                <p className="text-muted-foreground mt-1">
                    Kelola profil dan preferensi akun Anda
                </p>
            </div>

            {/* Profile Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center">
                            <User className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <CardTitle>{user?.fullName}</CardTitle>
                            <CardDescription>{user?.email}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="gap-1">
                            {user?.subscriptionPlan === "pro" ? (
                                <>
                                    <Crown className="h-3 w-3 text-yellow-500" />
                                    Pro
                                </>
                            ) : (
                                <>
                                    <Shield className="h-3 w-3" />
                                    Free
                                </>
                            )}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                            Member sejak {new Date(user?.createdAt || "").toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* Account Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Informasi Akun</CardTitle>
                    <CardDescription>Detail akun Anda</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center py-2">
                        <span className="text-muted-foreground">Nama Lengkap</span>
                        <span className="font-medium">{user?.fullName}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center py-2">
                        <span className="text-muted-foreground">Email</span>
                        <span className="font-medium">{user?.email}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center py-2">
                        <span className="text-muted-foreground">Paket Langganan</span>
                        <Badge variant={user?.subscriptionPlan === "pro" ? "default" : "secondary"}>
                            {user?.subscriptionPlan === "pro" ? "Pro" : "Gratis"}
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Subscription Info */}
            <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Crown className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">Upgrade ke Pro</CardTitle>
                    </div>
                    <CardDescription>
                        Dapatkan fitur premium untuk mengelola kos lebih maksimal
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            Properti & kamar tak terbatas
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            Laporan keuangan otomatis
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            Reminder otomatis via WhatsApp
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            Support prioritas
                        </li>
                    </ul>
                    <p className="text-xs text-muted-foreground mt-4">
                        * Fitur Pro akan segera hadir
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
