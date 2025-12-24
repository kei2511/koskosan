/**
 * Subscription Helper Functions
 * KosManager - Subscription & Plan Management
 */

export type SubscriptionPlan = 'free' | 'pro';

export interface PlanLimits {
    maxProperties: number | null; // null = unlimited
    maxRooms: number | null;
    bulkUpload: boolean;
    exportLimit: number | null; // null = unlimited
    analytics: boolean;
    autoReminders: boolean;
    multiUser: boolean;
    customInvoice: boolean;
    prioritySupport: boolean;
}

export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
    free: {
        maxProperties: 2,
        maxRooms: 10,
        bulkUpload: false,
        exportLimit: 50, // per month
        analytics: false,
        autoReminders: false,
        multiUser: false,
        customInvoice: false,
        prioritySupport: false,
    },
    pro: {
        maxProperties: null, // unlimited
        maxRooms: null, // unlimited
        bulkUpload: true,
        exportLimit: null, // unlimited
        analytics: true,
        autoReminders: true,
        multiUser: true,
        customInvoice: true,
        prioritySupport: true,
    },
};

export function getPlanLimits(plan: SubscriptionPlan): PlanLimits {
    return PLAN_LIMITS[plan];
}

export function canCreateProperty(plan: SubscriptionPlan, currentCount: number): boolean {
    const limits = getPlanLimits(plan);
    if (limits.maxProperties === null) return true;
    return currentCount < limits.maxProperties;
}

export function canCreateRoom(plan: SubscriptionPlan, currentCount: number): boolean {
    const limits = getPlanLimits(plan);
    if (limits.maxRooms === null) return true;
    return currentCount < limits.maxRooms;
}

export function canUseBulkUpload(plan: SubscriptionPlan): boolean {
    return getPlanLimits(plan).bulkUpload;
}

export function canExport(plan: SubscriptionPlan, monthlyExports: number): boolean {
    const limits = getPlanLimits(plan);
    if (limits.exportLimit === null) return true;
    return monthlyExports < limits.exportLimit;
}

export function canAccessAnalytics(plan: SubscriptionPlan): boolean {
    return getPlanLimits(plan).analytics;
}

export const PRICING = {
    pro: {
        monthly: 99000, // Rp 99K
        yearly: 999000, // Rp 999K (save 2 months)
    },
};

export function formatPrice(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
}
