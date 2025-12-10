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
import { ArrowUpCircle, ArrowDownCircle, Wallet, Clock, TrendingUp, TrendingDown } from "lucide-react";

// Format untuk grafik (tanpa Rp)
const formatChartValue = (value: number) => {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + "M";
  }
  return (value / 1000).toFixed(0) + "K";
};

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
  const [categoryDataExpense, setCategoryDataExpense] = useState<any[]>([
    { category: "Operasional", amount: 5000000, percentage: 40 },
    { category: "Ibadah", amount: 3000000, percentage: 24 },
    { category: "Sosial", amount: 2500000, percentage: 20 },
    { category: "Pemeliharaan", amount: 2000000, percentage: 16 },
  ]);
  const [categoryDataIncome, setCategoryDataIncome] = useState<any[]>([
    { category: "Sumbangan", amount: 15000000, percentage: 60 },
    { category: "Usaha", amount: 8000000, percentage: 32 },
    { category: "Lainnya", amount: 1000000, percentage: 8 },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, monthlyRes, expenseCategoryRes, incomeCategoryRes] = await Promise.all([
        api.get("/dashboard/stats"),
        api.get("/dashboard/monthly"),
        api.get("/dashboard/category?type=expense&period=month"),
        api.get("/dashboard/category?type=income&period=all"),
      ]);

      console.log("Income category response:", incomeCategoryRes.data);
      console.log("Expense category response:", expenseCategoryRes.data);

      if (statsRes.data.data) {
        setStats(statsRes.data.data);
      }
      if (monthlyRes.data.data && monthlyRes.data.data.length > 0) {
        setMonthlyData(monthlyRes.data.data);
      }
      if (expenseCategoryRes.data.data && expenseCategoryRes.data.data.length > 0) {
        setCategoryDataExpense(expenseCategoryRes.data.data);
      }
      if (incomeCategoryRes.data.data && incomeCategoryRes.data.data.length > 0) {
        setCategoryDataIncome(incomeCategoryRes.data.data);
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

      {/* Stats Cards - Enhanced Design */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Pemasukan */}
        <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">
              Total Pemasukan
            </CardTitle>
            <div className="bg-green-200 p-2 rounded-lg">
              <ArrowUpCircle className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-bold text-green-700">
              {formatCurrency(stats?.totalIncome || 0)}
            </div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              Bulan ini: {formatCurrency(stats?.monthlyIncome || 0)}
            </div>
          </CardContent>
        </Card>

        {/* Total Pengeluaran */}
        <Card className="border-0 shadow-md bg-gradient-to-br from-red-50 to-red-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">
              Total Pengeluaran
            </CardTitle>
            <div className="bg-red-200 p-2 rounded-lg">
              <ArrowDownCircle className="h-5 w-5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-bold text-red-700">
              {formatCurrency(stats?.totalExpense || 0)}
            </div>
            <div className="flex items-center text-xs text-red-600">
              <TrendingDown className="h-3 w-3 mr-1" />
              Bulan ini: {formatCurrency(stats?.monthlyExpense || 0)}
            </div>
          </CardContent>
        </Card>

        {/* Saldo Saat Ini */}
        <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">
              Saldo Saat Ini
            </CardTitle>
            <div className="bg-blue-200 p-2 rounded-lg">
              <Wallet className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-bold text-blue-700">
              {formatCurrency(stats?.currentBalance || 0)}
            </div>
            <p className="text-xs text-blue-600">
              Total Pemasukan - Pengeluaran
            </p>
          </CardContent>
        </Card>

        {/* Menunggu Persetujuan */}
        <Card className="border-0 shadow-md bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">
              Menunggu Persetujuan
            </CardTitle>
            <div className="bg-yellow-200 p-2 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-bold text-yellow-700">
              {stats?.pendingTransactions || 0}
            </div>
            <p className="text-xs text-yellow-600">Transaksi pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Pemasukan vs Pengeluaran Bulanan</CardTitle>
            <CardDescription>6 bulan terakhir</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart
              data={monthlyData.map(item => ({
                month: item.month,
                income: item.income,
                expense: item.expense,
              }))}
              xKey="month"
              bars={[
                { dataKey: "income", fill: "#10b981", name: "Pemasukan", formatter: (value: number) => formatCurrency(value) },
                { dataKey: "expense", fill: "#ef4444", name: "Pengeluaran", formatter: (value: number) => formatCurrency(value) },
              ]}
            />
            />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Pengeluaran per Kategori</CardTitle>
            <CardDescription>Bulan ini</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {categoryDataExpense.map((item: any, index: number) => (
                <div key={index} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">{item.category}</span>
                    <span className="inline-block bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full text-xs font-bold">
                      {item.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-red-400 to-red-600 h-2.5 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <p className="text-sm font-semibold text-gray-600">
                    {formatCurrency(item.amount)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Income by Category */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Pemasukan per Kategori</CardTitle>
          <CardDescription>Semua waktu</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categoryDataIncome.map((item: any, index: number) => (
              <div key={index} className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-700">{item.category}</span>
                  <span className="inline-block bg-green-200 text-green-700 px-2.5 py-0.5 rounded-full text-xs font-bold">
                    {item.percentage}%
                  </span>
                </div>
                <div className="text-2xl font-bold text-green-700">
                  {formatCurrency(item.amount)}
                </div>
                <div className="w-full bg-gray-300 rounded-full h-2 mt-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

