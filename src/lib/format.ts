/**
 * Format number to Indonesian Rupiah currency
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

/**
 * Format date to Indonesian locale
 */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
    const defaultOptions: Intl.DateTimeFormatOptions = {
        day: "numeric",
        month: "long",
        year: "numeric",
    };
    return new Date(date).toLocaleDateString("id-ID", options || defaultOptions);
}

/**
 * Format phone number for WhatsApp link
 */
export function formatPhoneForWhatsApp(phone: string): string {
    // Remove any non-digit characters
    let cleaned = phone.replace(/\D/g, "");

    // Convert local format to international
    if (cleaned.startsWith("0")) {
        cleaned = "62" + cleaned.substring(1);
    }

    return cleaned;
}

/**
 * Generate WhatsApp link with message
 */
export function generateWhatsAppLink(phone: string, message: string): string {
    const formattedPhone = formatPhoneForWhatsApp(phone);
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
}

/**
 * Get room status badge variant
 */
export function getRoomStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
    switch (status) {
        case "available":
            return "default";
        case "occupied":
            return "secondary";
        case "maintenance":
            return "destructive";
        default:
            return "outline";
    }
}

/**
 * Get room status label in Indonesian
 */
export function getRoomStatusLabel(status: string): string {
    switch (status) {
        case "available":
            return "Tersedia";
        case "occupied":
            return "Terisi";
        case "maintenance":
            return "Perbaikan";
        default:
            return status;
    }
}

/**
 * Get invoice status label in Indonesian
 */
export function getInvoiceStatusLabel(status: string): string {
    switch (status) {
        case "unpaid":
            return "Belum Lunas";
        case "paid":
            return "Lunas";
        default:
            return status;
    }
}
