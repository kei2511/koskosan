import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  DoorOpen,
  Users,
  Receipt,
  MessageCircle,
  ArrowRight,
  Star,
  Shield,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  const features = [
    {
      icon: Building2,
      title: "Kelola Properti",
      description: "Tambah dan kelola banyak properti kos dalam satu dashboard.",
    },
    {
      icon: DoorOpen,
      title: "Manajemen Kamar",
      description: "Pantau status kamar: tersedia, terisi, atau perbaikan.",
    },
    {
      icon: Users,
      title: "Data Penyewa",
      description: "Simpan data penyewa lengkap dengan check-in & check-out.",
    },
    {
      icon: Receipt,
      title: "Tagihan Otomatis",
      description: "Buat tagihan bulanan dan lacak pembayaran dengan mudah.",
    },
    {
      icon: MessageCircle,
      title: "Reminder WhatsApp",
      description: "Kirim pengingat tagihan langsung ke WhatsApp penyewa.",
    },
    {
      icon: Shield,
      title: "Aman & Terpercaya",
      description: "Data Anda tersimpan aman dengan enkripsi modern.",
    },
  ];

  const testimonials = [
    {
      name: "Budi Santoso",
      role: "Pemilik 3 Kos",
      content: "KOMA sangat membantu saya mengelola 3 properti kos. Tagihan jadi teratur!",
      rating: 5,
    },
    {
      name: "Siti Rahayu",
      role: "Juragan Kos Jakarta",
      content: "Fitur reminder WhatsApp sangat berguna. Penyewa jadi lebih tepat waktu bayar.",
      rating: 5,
    },
    {
      name: "Ahmad Fauzi",
      role: "Pemilik Kos Mahasiswa",
      content: "Aplikasi yang simple tapi powerful. Cocok untuk yang baru mulai bisnis kos.",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl">KOMA</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Masuk</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Daftar Gratis</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        {/* Background Effects */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-6 animate-fade-in">
            <Zap className="h-3 w-3 mr-1" />
            Gratis untuk memulai
          </Badge>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 animate-slide-up">
            Kelola Kos-Kosan
            <br />
            <span className="text-primary">Lebih Mudah</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-slide-up" style={{ animationDelay: "100ms" }}>
            Aplikasi manajemen kos all-in-one untuk memantau properti, kamar, penyewa, dan tagihan bulanan dalam satu dashboard.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: "200ms" }}>
            <Button size="lg" className="w-full sm:w-auto text-base h-12 px-8" asChild>
              <Link href="/register">
                Mulai Gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-base h-12 px-8" asChild>
              <Link href="/login">
                Masuk ke Akun
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto animate-slide-up" style={{ animationDelay: "300ms" }}>
            <div>
              <p className="text-3xl font-bold text-primary">100+</p>
              <p className="text-sm text-muted-foreground">Juragan Kos</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">500+</p>
              <p className="text-sm text-muted-foreground">Kamar Terkelola</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">99%</p>
              <p className="text-sm text-muted-foreground">Puas</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Semua yang Anda Butuhkan
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Fitur lengkap untuk mengelola bisnis kos-kosan Anda dengan efisien
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card
                key={feature.title}
                className="group hover:shadow-lg transition-all duration-300 animate-slide-up border-0 bg-card"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Dipercaya Juragan Kos
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Lihat apa kata mereka yang sudah menggunakan KOMA
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card
                key={testimonial.name}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Mulai Kelola Kos Anda Sekarang
          </h2>
          <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
            Daftar gratis dan rasakan kemudahan mengelola kos-kosan dengan KOMA.
          </p>
          <Button size="lg" variant="secondary" className="text-base h-12 px-8" asChild>
            <Link href="/register">
              Daftar Gratis Sekarang
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
                <Building2 className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold">KOMA</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 KOMA. Dibuat dengan ❤️ di Indonesia.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
