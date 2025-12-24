"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Building2,
    Users,
    Receipt,
    Settings,
    LogOut,
    ChevronLeft,
    Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { signOut } from "next-auth/react";

const navItems = [
    {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        label: "Properti",
        href: "/dashboard/properties",
        icon: Building2,
    },
    {
        label: "Penyewa",
        href: "/dashboard/tenants",
        icon: Users,
    },
    {
        label: "Tagihan",
        href: "/dashboard/invoices",
        icon: Receipt,
    },
    {
        label: "Pengaturan",
        href: "/dashboard/settings",
        icon: Settings,
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <aside
            className={cn(
                "hidden md:flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out",
                collapsed ? "w-[72px]" : "w-[260px]"
            )}
        >
            {/* Logo */}
            <div className={cn(
                "flex items-center h-16 px-4 border-b border-sidebar-border",
                collapsed ? "justify-center" : "gap-3"
            )}>
                <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-5 w-5 text-white" />
                </div>
                {!collapsed && (
                    <div className="animate-fade-in">
                        <h1 className="font-bold text-lg text-sidebar-foreground">KosManager</h1>
                        <p className="text-[10px] text-muted-foreground">Kelola Kos Lebih Mudah</p>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href !== "/dashboard" && pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                                collapsed && "justify-center",
                                isActive
                                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                            )}
                            title={collapsed ? item.label : undefined}
                        >
                            <item.icon className={cn(
                                "h-5 w-5 flex-shrink-0",
                                isActive && "animate-scale-in"
                            )} />
                            {!collapsed && (
                                <span className="font-medium text-sm animate-fade-in">{item.label}</span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-3 border-t border-sidebar-border space-y-2">
                {/* Collapse Button */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCollapsed(!collapsed)}
                    className={cn(
                        "w-full justify-center h-10",
                        !collapsed && "md:justify-start"
                    )}
                >
                    {collapsed ? (
                        <Menu className="h-5 w-5" />
                    ) : (
                        <>
                            <ChevronLeft className="h-5 w-5" />
                            <span className="ml-2">Sembunyikan</span>
                        </>
                    )}
                </Button>

                {/* Logout Button */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className={cn(
                        "w-full justify-center h-10 text-destructive hover:text-destructive hover:bg-destructive/10",
                        !collapsed && "md:justify-start"
                    )}
                >
                    <LogOut className="h-5 w-5" />
                    {!collapsed && <span className="ml-2">Keluar</span>}
                </Button>
            </div>
        </aside>
    );
}
