import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Crown, Check, Zap, TrendingUp, Users, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { formatPrice, PRICING } from "@/lib/subscription";

export default async function UpgradePage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const currentPlan = session.user.subscriptionPlan || 'free';

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                        <Crown className="h-3 w-3 mr-1" />
                        Upgrade to PRO
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Kelola Kos Lebih Profesional
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Tingkatkan bisnis kos Anda dengan fitur-fitur premium yang menghemat waktu dan meningkatkan pendapatan
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* FREE Plan */}
                    <Card className={`relative ${currentPlan === 'free' ? 'ring-2 ring-blue-500' : ''}`}>
                        {currentPlan === 'free' && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                <Badge>Paket Saat Ini</Badge>
                            </div>
                        )}
                        <CardHeader>
                            <CardTitle className="text-2xl">Free</CardTitle>
                            <CardDescription>Untuk pemilik kos pemula</CardDescription>
                            <div className="mt-4">
                                <span className="text-4xl font-bold">Rp 0</span>
                                <span className="text-muted-foreground">/bulan</span>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-start gap-2">
                                    <Check className="h-5 w-5 text-green-600 mt-0.5" />
                                    <span className="text-sm">Maksimal 2 properti</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Check className="h-5 w-5 text-green-600 mt-0.5" />
                                    <span className="text-sm">Maksimal 10 kamar</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Check className="h-5 w-5 text-green-600 mt-0.5" />
                                    <span className="text-sm">Manajemen penyewa dasar</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Check className="h-5 w-5 text-green-600 mt-0.5" />
                                    <span className="text-sm">Pencatatan tagihan</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Check className="h-5 w-5 text-green-600 mt-0.5" />
                                    <span className="text-sm">Export CSV (50 records/bulan)</span>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" className="w-full" asChild>
                                <Link href="/dashboard">Kembali ke Dashboard</Link>
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* PRO Plan */}
                    <Card className="relative border-2 border-blue-500 shadow-xl">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                                <Crown className="h-3 w-3 mr-1" />
                                Paling Populer
                            </Badge>
                        </div>
                        <CardHeader>
                            <CardTitle className="text-2xl flex items-center gap-2">
                                <Crown className="h-6 w-6 text-yellow-500" />
                                PRO
                            </CardTitle>
                            <CardDescription>Untuk bisnis kos profesional</CardDescription>
                            <div className="mt-4 flex items-baseline gap-2">
                                <span className="text-4xl font-bold">{formatPrice(PRICING.pro.monthly)}</span>
                                <span className="text-muted-foreground">/bulan</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                atau {formatPrice(PRICING.pro.yearly)}/tahun (hemat 2 bulan)
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                                <p className="text-sm font-semibold text-blue-900">Semua fitur FREE, plus:</p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-start gap-2">
                                    <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
                                    <span className="text-sm font-medium">Unlimited properti & kamar</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
                                    <span className="text-sm font-medium">Bulk upload penyewa (CSV/Excel)</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
                                    <span className="text-sm font-medium">Export unlimited (Excel & PDF)</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                                    <span className="text-sm font-medium">Advanced analytics & reports</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                                    <span className="text-sm font-medium">Auto WhatsApp reminder</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                                    <span className="text-sm font-medium">Custom invoice template</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                                    <span className="text-sm font-medium">Priority support 24/7</span>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex-col gap-2">
                            <Button
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                size="lg"
                                disabled={currentPlan === 'pro'}
                            >
                                {currentPlan === 'pro' ? '✓ Paket Aktif' : 'Upgrade ke PRO'}
                            </Button>
                            <p className="text-xs text-center text-muted-foreground">
                                Gratis trial 14 hari • Batal kapan saja
                            </p>
                        </CardFooter>
                    </Card>
                </div>

                {/* Benefits Section */}
                <div className="max-w-4xl mx-auto mt-12">
                    <h2 className="text-2xl font-bold text-center mb-8">Kenapa Upgrade ke PRO?</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <Card>
                            <CardContent className="pt-6 text-center">
                                <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
                                    <Zap className="h-6 w-6 text-blue-600" />
                                </div>
                                <h3 className="font-semibold mb-2">Hemat Waktu</h3>
                                <p className="text-sm text-muted-foreground">
                                    Bulk upload dan auto-reminder menghemat 10+ jam per bulan
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6 text-center">
                                <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center mx-auto mb-4">
                                    <TrendingUp className="h-6 w-6 text-green-600" />
                                </div>
                                <h3 className="font-semibold mb-2">Tingkatkan Revenue</h3>
                                <p className="text-sm text-muted-foreground">
                                    Analytics membantu maksimalkan occupancy rate hingga 95%
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6 text-center">
                                <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center mx-auto mb-4">
                                    <Shield className="h-6 w-6 text-purple-600" />
                                </div>
                                <h3 className="font-semibold mb-2">Lebih Profesional</h3>
                                <p className="text-sm text-muted-foreground">
                                    Invoice custom dan auto-reminder tingkatkan citra bisnis
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
