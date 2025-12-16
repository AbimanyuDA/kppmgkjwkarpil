"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatDate } from "@/lib/utils";
import api, { publicApi } from "@/lib/api";
import {
  Download,
  FileText,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function ReportsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    type: "",
    category: "",
    fundId: "",
  });
  const [funds, setFunds] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Filter visibility toggle
  const [showFilters, setShowFilters] = useState(false);

  // Modal state untuk detail description
  const [selectedDescription, setSelectedDescription] = useState<{
    eventName: string;
    description: string;
  } | null>(null);

  useEffect(() => {
    const fetchFunds = async () => {
      try {
        const res = await publicApi.get("/funds");
        setFunds(res.data.data || []);
      } catch (err) {
        console.error("Error fetching funds", err);
      }
    };
    const fetchCategories = async () => {
      try {
        const res = await publicApi.get("/categories");
        setCategories(res.data.data || []);
      } catch (err) {
        console.error("Error fetching categories", err);
      }
    };
    fetchFunds();
    fetchCategories();
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.type) params.append("type", filters.type);
      if (filters.category) params.append("category", filters.category);
      if (filters.fundId) params.append("fundId", filters.fundId);

      const response = await publicApi.get(`/reports?${params.toString()}`);
      const raw = response.data.data || [];

      // Sort oldest->newest to compute running balance, then flip to show newest on top
      const sortedAsc = [...raw].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      let running = 0;
      const withBalance = sortedAsc.map((t) => {
        running += t.type === "income" ? t.amount : -t.amount;
        return { ...t, runningBalance: running };
      });

      const newestFirst = withBalance.reverse();

      setTransactions(newestFirst);
      setSummary(response.data.summary);
      setCurrentPage(1); // Reset to first page on new search
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = transactions.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleExportPDF = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.type && filters.type !== "all")
        params.append("type", filters.type);
      if (filters.category && filters.category !== "all")
        params.append("category", filters.category);
      if (filters.fundId && filters.fundId !== "all")
        params.append("fundId", filters.fundId);

      const response = await publicApi.get(
        `/reports/export/pdf?${params.toString()}`,
        {
          responseType: "blob",
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `laporan_keuangan_${new Date().getTime()}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("Gagal export PDF");
    }
  };

  const handleExportExcel = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.type && filters.type !== "all")
        params.append("type", filters.type);
      if (filters.category && filters.category !== "all")
        params.append("category", filters.category);
      if (filters.fundId && filters.fundId !== "all")
        params.append("fundId", filters.fundId);

      const response = await publicApi.get(
        `/reports/export/excel?${params.toString()}`,
        {
          responseType: "blob",
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `laporan_keuangan_${new Date().getTime()}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting Excel:", error);
      alert("Gagal export Excel");
    }
  };

  const getTypeBadge = (type: string) => {
    return type === "income" ? (
      <Badge variant="success">Pemasukan</Badge>
    ) : (
      <Badge variant="destructive">Pengeluaran</Badge>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
          📈 Laporan Keuangan
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Filter dan export laporan keuangan lengkap
        </p>
      </div>

      {/* Summary - Bank vs Cash Breakdown */}
      {transactions.length > 0 && (
        <>
          {/* Total Summary */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-green-50 border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-green-700">
                  💰 Total Pemasukan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-green-600">
                  {formatCurrency(summary?.totalIncome || 0)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-red-50 border-red-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-red-700">
                  💸 Total Pengeluaran
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-red-600">
                  {formatCurrency(summary?.totalExpense || 0)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-blue-700">
                  💵 Saldo Akhir
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-blue-600">
                  {formatCurrency(summary?.balance || 0)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-purple-700">
                  📊 Jumlah Transaksi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-purple-600">
                  {summary?.count || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bank vs Cash Breakdown */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">
                💳 Rekap Bank vs Cash
              </CardTitle>
              <CardDescription className="text-sm">
                Breakdown saldo per metode pembayaran
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                {/* Bank Section */}
                <div className="space-y-3 p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="font-bold text-blue-700 flex items-center gap-2">
                    🏦 BANK
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Pemasukan:</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(
                          transactions
                            .filter(
                              (t) =>
                                t.type === "income" &&
                                t.paymentMethod === "bank"
                            )
                            .reduce((sum, t) => sum + t.amount, 0)
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Pengeluaran:
                      </span>
                      <span className="font-semibold text-red-600">
                        {formatCurrency(
                          transactions
                            .filter(
                              (t) =>
                                t.type === "expense" &&
                                t.paymentMethod === "bank"
                            )
                            .reduce((sum, t) => sum + t.amount, 0)
                        )}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-blue-300">
                      <div className="flex justify-between">
                        <span className="font-bold text-blue-700">
                          Saldo Akhir:
                        </span>
                        <span className="font-bold text-lg text-blue-700">
                          {formatCurrency(
                            transactions
                              .filter((t) => t.paymentMethod === "bank")
                              .reduce(
                                (sum, t) =>
                                  sum +
                                  (t.type === "income" ? t.amount : -t.amount),
                                0
                              )
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cash Section */}
                <div className="space-y-3 p-4 rounded-lg bg-green-50 border border-green-200">
                  <div className="font-bold text-green-700 flex items-center gap-2">
                    💵 CASH
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Pemasukan:</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(
                          transactions
                            .filter(
                              (t) =>
                                t.type === "income" &&
                                t.paymentMethod === "cash"
                            )
                            .reduce((sum, t) => sum + t.amount, 0)
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Pengeluaran:
                      </span>
                      <span className="font-semibold text-red-600">
                        {formatCurrency(
                          transactions
                            .filter(
                              (t) =>
                                t.type === "expense" &&
                                t.paymentMethod === "cash"
                            )
                            .reduce((sum, t) => sum + t.amount, 0)
                        )}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-green-300">
                      <div className="flex justify-between">
                        <span className="font-bold text-green-700">
                          Saldo Akhir:
                        </span>
                        <span className="font-bold text-lg text-green-700">
                          {formatCurrency(
                            transactions
                              .filter((t) => t.paymentMethod === "cash")
                              .reduce(
                                (sum, t) =>
                                  sum +
                                  (t.type === "income" ? t.amount : -t.amount),
                                0
                              )
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Export Buttons */}
      {transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">
              📥 Export Laporan
            </CardTitle>
            <CardDescription className="text-sm">
              Download laporan dalam format PDF atau Excel
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={handleExportPDF}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <FileText className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            <Button
              onClick={handleExportExcel}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export Excel
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Cashflow Table with Filters */}
      <Card>
        <CardHeader className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-lg sm:text-xl">
                📊 Laporan Cashflow
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Laporan arus kas dengan saldo berjalan ({transactions.length}{" "}
                transaksi)
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <span className="text-xs sm:text-sm">
                {showFilters ? "Sembunyikan" : "Tampilkan"} Filter
              </span>
              {showFilters ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Filter Section */}
          {showFilters && (
            <div className="pt-2 border-t space-y-4">
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-xs sm:text-sm">
                    Tanggal Mulai
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={filters.startDate}
                    onChange={(e) =>
                      setFilters({ ...filters, startDate: e.target.value })
                    }
                    className="text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-xs sm:text-sm">
                    Tanggal Akhir
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={filters.endDate}
                    onChange={(e) =>
                      setFilters({ ...filters, endDate: e.target.value })
                    }
                    className="text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type" className="text-xs sm:text-sm">
                    Jenis
                  </Label>
                  <Select
                    value={filters.type || "all"}
                    onValueChange={(value) =>
                      setFilters({
                        ...filters,
                        type: value === "all" ? "" : value,
                      })
                    }
                  >
                    <SelectTrigger className="text-xs sm:text-sm">
                      <SelectValue placeholder="Semua" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua</SelectItem>
                      <SelectItem value="income">Pemasukan</SelectItem>
                      <SelectItem value="expense">Pengeluaran</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fund" className="text-xs sm:text-sm">
                    Fund / Proker
                  </Label>
                  <Select
                    value={filters.fundId || "all"}
                    onValueChange={(value) =>
                      setFilters({
                        ...filters,
                        fundId: value === "all" ? "" : value,
                      })
                    }
                  >
                    <SelectTrigger className="text-xs sm:text-sm">
                      <SelectValue placeholder="Semua" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua</SelectItem>
                      {funds.map((fund) => (
                        <SelectItem key={fund.id} value={fund.id}>
                          {fund.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-xs sm:text-sm">
                    Kategori
                  </Label>
                  <Select
                    value={filters.category || "all"}
                    onValueChange={(value) =>
                      setFilters({
                        ...filters,
                        category: value === "all" ? "" : value,
                      })
                    }
                  >
                    <SelectTrigger className="text-xs sm:text-sm">
                      <SelectValue placeholder="Semua" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={fetchReports}
                  disabled={loading}
                  className="w-full sm:w-auto text-xs sm:text-sm"
                >
                  {loading ? "⏳ Memuat..." : "📊 Tampilkan Laporan"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilters({
                      startDate: "",
                      endDate: "",
                      type: "",
                      category: "",
                      fundId: "",
                    });
                    setTransactions([]);
                    setSummary(null);
                  }}
                  className="w-full sm:w-auto text-xs sm:text-sm"
                >
                  🔄 Reset
                </Button>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {/* Items per page selector */}
          {transactions.length > 0 && (
            <div className="p-4 sm:p-0 border-b sm:border-b-0 flex items-center justify-end gap-2 mb-4">
              <Label
                htmlFor="itemsPerPage"
                className="text-xs sm:text-sm whitespace-nowrap"
              >
                Tampilkan:
              </Label>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  setItemsPerPage(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-16 sm:w-20 text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Desktop Table View */}
          <div className="hidden lg:block rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Nama Kegiatan</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Metode</TableHead>
                  <TableHead className="text-right">Pemasukan</TableHead>
                  <TableHead className="text-right">Pengeluaran</TableHead>
                  <TableHead className="text-right font-bold">Saldo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTransactions.length > 0 ? (
                  paginatedTransactions.map((transaction) => {
                    const isIncome = transaction.type === "income";
                    const rb = transaction.runningBalance ?? 0;

                    return (
                      <TableRow
                        key={transaction.id}
                        className="hover:bg-gray-50"
                      >
                        <TableCell className="font-medium text-sm">
                          {formatDate(transaction.date)}
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <button
                            onClick={() =>
                              setSelectedDescription({
                                eventName: transaction.eventName,
                                description:
                                  transaction.description ||
                                  "Tidak ada deskripsi",
                              })
                            }
                            className="text-sm truncate text-blue-600 hover:underline cursor-pointer"
                            title="Klik untuk melihat deskripsi lengkap"
                          >
                            {transaction.eventName || "-"}
                          </button>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {transaction.fund?.name || "-"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {transaction.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              transaction.paymentMethod === "bank"
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {transaction.paymentMethod === "bank"
                              ? "🏦 Bank"
                              : "💵 Cash"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-green-600 text-sm">
                          {isIncome ? formatCurrency(transaction.amount) : "-"}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-red-600 text-sm">
                          {!isIncome ? formatCurrency(transaction.amount) : "-"}
                        </TableCell>
                        <TableCell className="text-right font-bold text-sm bg-blue-50">
                          {formatCurrency(rb)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="text-muted-foreground">
                        Tidak ada data transaksi. Silakan pilih filter dan klik
                        "Tampilkan Laporan"
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {transactions.length > 0 && (
                  <TableRow className="bg-blue-50 font-bold border-t-2">
                    <TableCell colSpan={5} className="text-right">
                      TOTAL:
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      {formatCurrency(summary?.totalIncome || 0)}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      {formatCurrency(summary?.totalExpense || 0)}
                    </TableCell>
                    <TableCell className="text-right text-blue-600 text-lg">
                      {formatCurrency(summary?.balance || 0)}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3 p-3 sm:p-0">
            {paginatedTransactions.length > 0 ? (
              paginatedTransactions.map((transaction) => {
                const isIncome = transaction.type === "income";
                const rb = transaction.runningBalance ?? 0;

                return (
                  <Card key={transaction.id} className="p-3 sm:p-4 shadow-sm">
                    <div className="space-y-3">
                      {/* Header: Date & Amount */}
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">
                            {formatDate(transaction.date)}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            <Badge
                              variant={
                                transaction.paymentMethod === "bank"
                                  ? "default"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              {transaction.paymentMethod === "bank"
                                ? "🏦 Bank"
                                : "💵 Cash"}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-lg font-bold ${
                              isIncome ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {isIncome ? "+" : "-"}{" "}
                            {formatCurrency(transaction.amount)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {isIncome ? "Pemasukan" : "Pengeluaran"}
                          </div>
                        </div>
                      </div>

                      {/* Event Name (Keterangan) - Clickable */}
                      <button
                        onClick={() =>
                          setSelectedDescription({
                            eventName: transaction.eventName,
                            description:
                              transaction.description || "Tidak ada deskripsi",
                          })
                        }
                        className="text-sm font-medium text-blue-600 hover:underline cursor-pointer text-left"
                      >
                        {transaction.eventName || "-"} 📖
                      </button>

                      {/* Fund/Proker & Category */}
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="secondary" className="text-xs">
                          {transaction.fund?.name || "-"}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {transaction.category}
                        </Badge>
                      </div>

                      {/* Running Balance */}
                      <div className="pt-3 border-t flex justify-between items-center">
                        <span className="text-sm font-medium text-muted-foreground">
                          Saldo:
                        </span>
                        <span className="text-base font-bold text-blue-600">
                          {formatCurrency(rb)}
                        </span>
                      </div>
                    </div>
                  </Card>
                );
              })
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Tidak ada data transaksi. Silakan pilih filter dan klik
                "Tampilkan Laporan"
              </div>
            )}

            {/* Mobile Total Summary */}
            {transactions.length > 0 && (
              <Card className="p-3 sm:p-4 bg-blue-50 border-blue-200">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Total Pemasukan:
                    </span>
                    <span className="text-sm sm:text-base font-bold text-green-600">
                      {formatCurrency(summary?.totalIncome || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Total Pengeluaran:
                    </span>
                    <span className="text-sm sm:text-base font-bold text-red-600">
                      {formatCurrency(summary?.totalExpense || 0)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-blue-300 flex justify-between items-center">
                    <span className="text-base sm:text-lg font-bold">
                      Saldo Akhir:
                    </span>
                    <span className="text-lg sm:text-xl font-bold text-blue-600">
                      {formatCurrency(summary?.balance || 0)}
                    </span>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Pagination Controls */}
          {transactions.length > 0 && totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-4 border-t">
              <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                {startIndex + 1} - {Math.min(endIndex, transactions.length)}{" "}
                dari {transactions.length}
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(1)}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0 text-xs"
                >
                  ««
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0 text-xs"
                >
                  «
                </Button>

                {/* Show page numbers only on larger screens */}
                <div className="hidden sm:flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      return (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      );
                    })
                    .map((page, index, array) => {
                      const showEllipsisBefore =
                        index > 0 && page - array[index - 1] > 1;

                      return (
                        <div key={page} className="flex items-center">
                          {showEllipsisBefore && (
                            <span className="px-1 text-xs text-muted-foreground">
                              ...
                            </span>
                          )}
                          <Button
                            variant={
                              currentPage === page ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => goToPage(page)}
                            className="h-8 min-w-[32px] text-xs"
                          >
                            {page}
                          </Button>
                        </div>
                      );
                    })}
                </div>

                {/* Mobile: show current/total only */}
                <span className="sm:hidden text-xs px-2 font-medium whitespace-nowrap">
                  {currentPage}/{totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0 text-xs"
                >
                  »
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0 text-xs"
                >
                  »»
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal untuk menampilkan detail description */}
      <Dialog
        open={!!selectedDescription}
        onOpenChange={(open) => {
          if (!open) setSelectedDescription(null);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>📝 Deskripsi Lengkap</DialogTitle>
            <DialogDescription>
              Nama Kegiatan: {selectedDescription?.eventName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-600 mb-2">
                Deskripsi:
              </p>
              <p className="text-base text-gray-800 whitespace-pre-wrap break-words">
                {selectedDescription?.description}
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setSelectedDescription(null)}
              >
                Tutup
              </Button>
              <Button
                onClick={() => {
                  // Copy to clipboard
                  if (selectedDescription?.description) {
                    navigator.clipboard.writeText(
                      selectedDescription.description
                    );
                    alert("Deskripsi disalin ke clipboard");
                  }
                }}
              >
                📋 Salin Deskripsi
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
