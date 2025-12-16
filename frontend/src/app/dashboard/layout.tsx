"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FileText,
  Upload,
  DollarSign,
  Users,
  LogOut,
  Menu,
  Folder,
  ArrowLeftRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: SidebarProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      // If no user logged in, create guest user for viewing dashboard
      setUser({ role: "guest", name: "Guest" });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const menuItems = [
    { href: "/dashboard", icon: Home, label: "Dashboard", guestOnly: false },
    {
      href: "/dashboard/transactions",
      icon: FileText,
      label: "Transaksi",
      adminOnly: true,
    },
    {
      href: "/dashboard/income",
      icon: DollarSign,
      label: "Input Pemasukan",
      adminOnly: true,
    },
    {
      href: "/dashboard/upload",
      icon: Upload,
      label: "Input Pengeluaran",
      adminOnly: true,
    },
    {
      href: "/dashboard/transfer",
      icon: ArrowLeftRight,
      label: "Transfer Saldo",
      adminOnly: true,
    },
    {
      href: "/dashboard/reports",
      icon: FileText,
      label: "Laporan",
      guestOnly: false,
    },
    {
      href: "/dashboard/categories",
      icon: Folder,
      label: "Kelola Kategori",
      adminOnly: true,
    },
    {
      href: "/dashboard/funds",
      icon: DollarSign,
      label: "Fund/Proker",
      adminOnly: true,
    },
    {
      href: "/dashboard/users",
      icon: Users,
      label: "Kelola User",
      adminOnly: true,
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-blue-900 text-white transition-all duration-300 flex flex-col`}
      >
        <div className="p-4 flex items-center justify-between">
          <h2 className={`font-bold text-xl ${!sidebarOpen && "hidden"}`}>
            GKJW Finance
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white hover:bg-blue-800"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 px-2 py-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              // Admin dapat akses semua
              if (user?.role === "admin") {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                        isActive
                          ? "bg-blue-700 text-white"
                          : "text-blue-100 hover:bg-blue-800"
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      {sidebarOpen && <span>{item.label}</span>}
                    </Link>
                  </li>
                );
              }

              // Guest hanya bisa akses Dashboard dan Laporan (guestOnly: false)
              if (user?.role === "guest" && item.adminOnly) return null;

              // Member (atau role lain) - ikuti adminOnly logic
              if (item.adminOnly && user?.role !== "admin") return null;

              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                      isActive
                        ? "bg-blue-700 text-white"
                        : "text-blue-100 hover:bg-blue-800"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {sidebarOpen && <span>{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-blue-800">
          {user?.role !== "guest" && (
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-blue-100 hover:bg-blue-800 hover:text-white"
            >
              <LogOut className="h-5 w-5 mr-3" />
              {sidebarOpen && <span>Logout</span>}
            </Button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="bg-white shadow-sm">
          <div className="px-6 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-800">
              Sistem Keuangan GKJW
            </h1>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
