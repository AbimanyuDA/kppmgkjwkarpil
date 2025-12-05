"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart } from "@/components/ui/chart";
import { formatCurrency } from "@/lib/utils";
import api from "@/lib/api";
import { ArrowUpCircle, ArrowDownCircle, Wallet, Clock } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>({
    totalIncome: 0,
    totalExpense: 0,
    currentBalance: 0,
    monthlyIncome: 0,
    monthlyExpense: 0,
    pendingTransactions: 0,
  });
  const [monthlyData, setMonthlyData] = useState<any[]>([
    { month: "Jul", income: 15000000, expense: 8000000 },
    { month: "Agu", income: 18000000, expense: 9500000 },
    { month: "Sep", income: 16500000, expense: 8800000 },
    { month: "Okt", income: 20000000, expense: 11000000 },
    { month: "Nov", income: 19500000, expense: 10200000 },
    { month: "Des", income: 22000000, expense: 12500000 },
  ]);
  const [categoryData, setCategoryData] = useState<any[]>([
    { category: "Operasional", amount: 5000000, percentage: 40 },
    { category: "Ibadah", amount: 3000000, percentage: 24 },
    { category: "Sosial", amount: 2500000, percentage: 20 },
    { category: "Pemeliharaan", amount: 2000000, percentage: 16 },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, monthlyRes, categoryRes] = await Promise.all([
        api.get("/dashboard/stats"),
        api.get("/dashboard/monthly"),
        api.get("/dashboard/category"),
      ]);

      if (statsRes.data.data) {
        setStats(statsRes.data.data);
      }
      if (monthlyRes.data.data && monthlyRes.data.data.length > 0) {
        setMonthlyData(monthlyRes.data.data);
      }
      if (categoryRes.data.data && categoryRes.data.data.length > 0) {
        setCategoryData(categoryRes.data.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Keep dummy data if API fails
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Ringkasan keuangan dan aktivitas terkini
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Pemasukan
            </CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats?.totalIncome || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Bulan ini: {formatCurrency(stats?.monthlyIncome || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Pengeluaran
            </CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(stats?.totalExpense || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Bulan ini: {formatCurrency(stats?.monthlyExpense || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Saldo Saat Ini
            </CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(stats?.currentBalance || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total Pemasukan - Pengeluaran
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Menunggu Persetujuan
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats?.pendingTransactions || 0}
            </div>
            <p className="text-xs text-muted-foreground">Transaksi pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pemasukan vs Pengeluaran Bulanan</CardTitle>
            <CardDescription>6 bulan terakhir</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart
              data={monthlyData}
              xKey="month"
              bars={[
                { dataKey: "income", fill: "#10b981", name: "Pemasukan" },
                { dataKey: "expense", fill: "#ef4444", name: "Pengeluaran" },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pengeluaran per Kategori</CardTitle>
            <CardDescription>Bulan ini</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryData.map((item: any, index: number) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{item.category}</span>
                    <span className="text-sm text-muted-foreground">
                      {item.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatCurrency(item.amount)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
