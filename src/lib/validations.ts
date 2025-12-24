import { z } from "zod";

// ==================== AUTH SCHEMAS ====================
export const loginSchema = z.object({
    email: z.string().email("Email tidak valid"),
    password: z.string().min(6, "Password minimal 6 karakter"),
});

export const registerSchema = z.object({
    fullName: z.string().min(2, "Nama lengkap minimal 2 karakter"),
    email: z.string().email("Email tidak valid"),
    password: z.string().min(6, "Password minimal 6 karakter"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak sama",
    path: ["confirmPassword"],
});

// ==================== PROPERTY SCHEMAS ====================
export const propertySchema = z.object({
    name: z.string().min(2, "Nama properti minimal 2 karakter"),
    address: z.string().min(5, "Alamat minimal 5 karakter"),
});

// ==================== ROOM SCHEMAS ====================
export const roomSchema = z.object({
    roomNumber: z.string().min(1, "Nomor kamar wajib diisi"),
    price: z.coerce.number().min(100000, "Harga minimal Rp 100.000"),
    status: z.enum(["available", "occupied", "maintenance"]).default("available"),
    facilities: z.array(z.string()).optional(),
});

// ==================== TENANT SCHEMAS ====================
export const tenantSchema = z.object({
    name: z.string().min(2, "Nama penyewa minimal 2 karakter"),
    phoneNumber: z.string()
        .min(10, "Nomor telepon minimal 10 digit")
        .regex(/^(\+62|62|0)8[1-9][0-9]{6,10}$/, "Format nomor telepon tidak valid. Contoh: +62812345678"),
    roomId: z.string().uuid("Pilih kamar yang valid"),
    startDate: z.string().min(1, "Tanggal mulai wajib diisi"),
    dueDate: z.coerce.number().min(1, "Tanggal jatuh tempo minimal 1").max(31, "Tanggal jatuh tempo maksimal 31"),
    idCardPhoto: z.string().optional(),
});

// ==================== INVOICE SCHEMAS ====================
export const invoiceSchema = z.object({
    tenantId: z.string().uuid("Pilih penyewa yang valid"),
    amount: z.coerce.number().min(1, "Jumlah tagihan wajib diisi"),
    period: z.string().min(1, "Periode tagihan wajib diisi"),
    status: z.enum(["unpaid", "paid"]).default("unpaid"),
});

export const updateInvoiceStatusSchema = z.object({
    status: z.enum(["unpaid", "paid"]),
});

// ==================== TYPES ====================
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type PropertyInput = z.infer<typeof propertySchema>;
export type RoomInput = z.infer<typeof roomSchema>;
export type TenantInput = z.infer<typeof tenantSchema>;
export type InvoiceInput = z.infer<typeof invoiceSchema>;
