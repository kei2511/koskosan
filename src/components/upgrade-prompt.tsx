"use client";

import { Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

interface UpgradePromptProps {
    feature: string;
    description: string;
    compact?: boolean;
}

export function UpgradePrompt({ feature, description, compact = false }: UpgradePromptProps) {
    if (compact) {
        return (
            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                        <Crown className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{feature}</p>
                        <p className="text-xs text-muted-foreground">{description}</p>
                    </div>
                    <Button asChild size="sm" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                        <Link href="/dashboard/upgrade">
                            Upgrade
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <Card className="border-2 border-dashed border-amber-300 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
            <CardContent className="py-12 text-center">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-4">
                    <Crown className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2 flex items-center justify-center gap-2">
                    <Sparkles className="h-5 w-5 text-amber-500" />
                    {feature}
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    {description}
                </p>
                <Button
                    asChild
                    size="lg"
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                >
                    <Link href="/dashboard/upgrade">
                        <Crown className="mr-2 h-4 w-4" />
                        Upgrade ke PRO
                    </Link>
                </Button>
                <p className="text-xs text-muted-foreground mt-3">
                    Mulai dari Rp 99.000/bulan • Gratis trial 14 hari
                </p>
            </CardContent>
        </Card>
    );
}
