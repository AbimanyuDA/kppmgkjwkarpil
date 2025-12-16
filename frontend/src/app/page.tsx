"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import {
  ChurchIcon,
  Users,
  Heart,
  BookOpen,
  ArrowRight,
  Globe,
  Shield,
  TrendingUp,
} from "lucide-react";

// Animation styles
const animationStyles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  .animate-fadeInUp {
    animation: fadeInUp 0.6s ease-out forwards;
  }

  .animate-slideInLeft {
    animation: slideInLeft 0.6s ease-out forwards;
  }

  .animate-slideInRight {
    animation: slideInRight 0.6s ease-out forwards;
  }

  .animate-pulse-slow {
    animation: pulse 3s ease-in-out infinite;
  }

  .delay-100 { animation-delay: 0.1s; }
  .delay-200 { animation-delay: 0.2s; }
  .delay-300 { animation-delay: 0.3s; }
  .delay-400 { animation-delay: 0.4s; }
`;

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <style>{animationStyles}</style>

      {/* Navbar */}
      <nav className="bg-white/10 backdrop-blur-md fixed w-full top-0 z-50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 animate-slideInLeft">
            <div className="bg-gradient-to-br from-blue-400 to-cyan-400 p-2 rounded-lg">
              <ChurchIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">KPPM GKJW</h1>
              <p className="text-xs text-blue-200">Karangpilang</p>
            </div>
          </div>
          <div className="flex gap-3 animate-slideInRight">
            {isLoggedIn ? (
              <Button
                onClick={() => router.push("/dashboard")}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0"
              >
                Dashboard <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => router.push("/login")}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0"
                >
                  Login
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow delay-200"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow delay-300"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-8 animate-fadeInUp">
            <div>
              <h2 className="text-6xl md:text-7xl font-bold text-white mb-4 leading-tight">
                Selamat Datang di{" "}
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  KPPM GKJW
                </span>
              </h2>
              <p className="text-2xl text-blue-200 font-light">Karangpilang</p>
            </div>

            <p className="text-lg text-gray-300 leading-relaxed max-w-lg">
              Sistem manajemen keuangan gereja yang modern, transparan, dan
              dapat dipercaya. Kelola dana gereja dengan mudah dan efisien untuk
              pelayanan yang lebih baik.
            </p>

            <div className="flex flex-wrap gap-4">
              {!isLoggedIn ? (
                <>
                  <Button
                    onClick={() => router.push("/dashboard")}
                    variant="outline"
                    size="lg"
                    className="border-2 border-blue-400 text-blue-300 hover:bg-blue-400/10"
                  >
                    Lihat Dashboard <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button
                    onClick={() => router.push("/login")}
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0"
                  >
                    Login Sekarang
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => router.push("/dashboard")}
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0"
                >
                  Buka Dashboard <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>

          <div className="relative h-96 md:h-full animate-slideInRight delay-100">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-2xl backdrop-blur-sm border border-blue-400/30 flex items-center justify-center">
              <div className="text-center">
                <ChurchIcon className="w-32 h-32 text-blue-300 mx-auto mb-4 animate-pulse-slow" />
                <p className="text-blue-200 text-lg font-semibold">
                  Manajemen Keuangan Gereja
                </p>
                <p className="text-gray-400 text-sm">
                  Modern • Transparan • Terpercaya
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white/5 backdrop-blur-sm border-y border-white/10 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Users, label: "Anggota Aktif", value: "150+" },
              { icon: Heart, label: "Dana Terkumpul", value: "Rp 94jt+" },
              { icon: BookOpen, label: "Laporan", value: "Transparan" },
              { icon: TrendingUp, label: "Pertumbuhan", value: "Stabil" },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="animate-fadeInUp"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <Card className="bg-white/5 backdrop-blur border-white/10 text-white hover:bg-white/10 transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <stat.icon className="w-12 h-12 text-cyan-400 mx-auto mb-3" />
                    <p className="text-2xl font-bold text-white mb-1">
                      {stat.value}
                    </p>
                    <p className="text-sm text-gray-400">{stat.label}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-slideInLeft">
              <div className="relative h-96 rounded-2xl overflow-hidden border border-blue-400/30">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-400 opacity-20"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <ChurchIcon className="w-40 h-40 text-blue-300 opacity-50" />
                </div>
              </div>
            </div>

            <div className="space-y-6 animate-slideInRight">
              <div>
                <h3 className="text-4xl font-bold text-white mb-3">
                  Tentang <span className="text-cyan-400">KPPM GKJW</span>
                </h3>
                <p className="text-gray-400">Karangpilang</p>
              </div>

              <div className="space-y-4">
                <div className="group hover:bg-white/5 p-4 rounded-lg transition-all duration-300">
                  <h4 className="text-lg font-semibold text-blue-300 mb-2">
                    📍 Identitas Gereja
                  </h4>
                  <p className="text-gray-300">
                    Gereja Kristen Jawa (GKJW) Karangpilang yang melayani
                    komunitas dengan sepenuh hati.
                  </p>
                </div>

                <div className="group hover:bg-white/5 p-4 rounded-lg transition-all duration-300">
                  <h4 className="text-lg font-semibold text-blue-300 mb-2">
                    🎯 Visi & Misi
                  </h4>
                  <p className="text-gray-300">
                    Menjadi gereja yang melayani, transparan, dan berkomitmen
                    pada pertumbuhan spiritual serta kesejahteraan sosial.
                  </p>
                </div>

                <div className="group hover:bg-white/5 p-4 rounded-lg transition-all duration-300">
                  <h4 className="text-lg font-semibold text-blue-300 mb-2">
                    💼 Pengelolaan Keuangan
                  </h4>
                  <p className="text-gray-300">
                    Mengelola dana gereja dengan sistem yang terorganisir,
                    transparan, dan dapat dipertanggungjawabkan kepada seluruh
                    jemaat.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/5 backdrop-blur-sm border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 animate-fadeInUp">
            <h3 className="text-4xl font-bold text-white mb-4">
              Fitur Unggulan
            </h3>
            <p className="text-gray-400 text-lg">
              Solusi lengkap untuk manajemen keuangan gereja modern
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: BookOpen,
                title: "Laporan Keuangan",
                desc: "Akses laporan detail dan real-time untuk setiap transaksi keuangan gereja.",
                color: "from-blue-500 to-blue-600",
              },
              {
                icon: Shield,
                title: "Keamanan Data",
                desc: "Sistem keamanan berlapis untuk melindungi data dan privasi informasi gereja.",
                color: "from-cyan-500 to-cyan-600",
              },
              {
                icon: TrendingUp,
                title: "Analytics & Insights",
                desc: "Visualisasi data yang jelas untuk membantu pengambilan keputusan strategis.",
                color: "from-blue-500 to-cyan-600",
              },
              {
                icon: Users,
                title: "Manajemen Anggaran",
                desc: "Kelola pengeluaran dan alokasi dana dengan efisien dan terstruktur.",
                color: "from-cyan-500 to-blue-600",
              },
              {
                icon: Heart,
                title: "Transparansi Donasi",
                desc: "Pantau penggunaan dana persembahan dan donasi dengan jelas dan akurat.",
                color: "from-blue-400 to-blue-500",
              },
              {
                icon: Globe,
                title: "Akses Multi-Device",
                desc: "Akses sistem dari perangkat apa pun, kapan saja, di mana saja dengan aman.",
                color: "from-cyan-400 to-cyan-500",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="animate-fadeInUp hover:scale-105 transition-transform duration-300"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <Card className="h-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur border-white/10 hover:border-cyan-400/50 transition-all duration-300 group">
                  <CardContent className="p-6 h-full flex flex-col">
                    <div
                      className={`bg-gradient-to-br ${feature.color} p-3 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-white mb-2">
                      {feature.title}
                    </h4>
                    <p className="text-gray-400 text-sm flex-grow">
                      {feature.desc}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center animate-fadeInUp">
          <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 backdrop-blur border border-blue-400/30 rounded-2xl p-12">
            <h3 className="text-4xl font-bold text-white mb-4">
              Siap Mengelola Keuangan Gereja?
            </h3>
            <p className="text-gray-400 text-lg mb-8">
              Bergabunglah dengan sistem manajemen keuangan gereja yang telah
              dipercaya oleh ratusan gereja di Indonesia.
            </p>
            {!isLoggedIn && (
              <Button
                onClick={() => router.push("/login")}
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 px-8"
              >
                Mulai Sekarang <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/5 backdrop-blur border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-semibold mb-4">KPPM GKJW</h4>
              <p className="text-gray-400 text-sm">Karangpilang</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Produk</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="hover:text-blue-400 cursor-pointer">
                  Dashboard
                </li>
                <li className="hover:text-blue-400 cursor-pointer">Laporan</li>
                <li className="hover:text-blue-400 cursor-pointer">Analitik</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Perusahaan</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="hover:text-blue-400 cursor-pointer">Tentang</li>
                <li className="hover:text-blue-400 cursor-pointer">Kontak</li>
                <li className="hover:text-blue-400 cursor-pointer">Dukungan</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="hover:text-blue-400 cursor-pointer">Privasi</li>
                <li className="hover:text-blue-400 cursor-pointer">Terms</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center">
            <p className="text-gray-500 text-sm">
              &copy; 2025 KPPM GKJW Karangpilang. Semua hak dilindungi.
            </p>
            <p className="text-gray-600 text-xs mt-2">
              Sistem Manajemen Keuangan Gereja • Modern • Transparan • Aman
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
