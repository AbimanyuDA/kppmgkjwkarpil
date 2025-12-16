"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRouteProtection } from "@/lib/useRouteProtection";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeftRight, ArrowRight } from "lucide-react";
import api from "@/lib/api";

export default function TransferPage() {
  useRouteProtection();

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [funds, setFunds] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    amount: "",
    fromMethod: "cash",
    toMethod: "bank",
    description: "",
    date: new Date().toISOString().split("T")[0],
    fundId: "",
  });

  useEffect(() => {
    const fetchFunds = async () => {
      try {
        const res = await api.get("/funds");
        setFunds(res.data.data || []);
        if ((res.data.data || []).length > 0) {
          setFormData((prev) => ({
            ...prev,
            fundId: prev.fundId || res.data.data[0].id,
          }));
        }
      } catch (err) {
        console.error("Failed to load funds", err);
      }
    };
    fetchFunds();
  }, []);

  const handleSwapMethods = () => {
    setFormData((prev) => ({
      ...prev,
      fromMethod: prev.toMethod,
      toMethod: prev.fromMethod,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.fromMethod === formData.toMethod) {
      alert("Sumber dan tujuan tidak boleh sama!");
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert("Jumlah harus lebih dari 0!");
      return;
    }

    setLoading(true);

    try {
      // Transfer dilakukan dengan 2 transaksi:
      // 1. Pengeluaran dari sumber (expense)
      // 2. Pemasukan ke tujuan (income)

      const amount = parseFloat(formData.amount);
      const description =
        formData.description ||
        `Transfer dari ${formData.fromMethod === "bank" ? "Bank" : "Cash"} ke ${
          formData.toMethod === "bank" ? "Bank" : "Cash"
        }`;

      // Transaksi 1: Pengeluaran dari sumber
      await api.post("/transactions", {
        type: "expense",
        amount: amount,
        category: "Transfer",
        description: `${description} (Pengeluaran)`,
        eventName: "Transfer Saldo",
        date: formData.date,
        fundId: formData.fundId,
        paymentMethod: formData.fromMethod,
        noteUrl: "",
      });

      // Transaksi 2: Pemasukan ke tujuan
      await api.post("/transactions", {
        type: "income",
        amount: amount,
        category: "Transfer",
        description: `${description} (Pemasukan)`,
        eventName: "Transfer Saldo",
        date: formData.date,
        fundId: formData.fundId,
        paymentMethod: formData.toMethod,
        noteUrl: "",
      });

      alert("Transfer berhasil!");
      router.push("/dashboard/transactions");
    } catch (error: any) {
      console.error("Error:", error);
      const errorMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Gagal melakukan transfer";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
          🔄 Transfer Saldo
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Pindahkan saldo antara Cash dan Bank
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">Form Transfer</CardTitle>
          <CardDescription className="text-sm">
            Transfer saldo akan mencatat 2 transaksi: pengeluaran dari sumber
            dan pemasukan ke tujuan
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Transfer Direction */}
            <div className="space-y-2">
              <Label>Arah Transfer</Label>
              <div className="flex items-center gap-2">
                <Select
                  value={formData.fromMethod}
                  onValueChange={(value) =>
                    setFormData({ ...formData, fromMethod: value })
                  }
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">💵 Cash</SelectItem>
                    <SelectItem value="bank">🏦 Bank</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleSwapMethods}
                  title="Tukar arah transfer"
                >
                  <ArrowLeftRight className="h-4 w-4" />
                </Button>

                <Select
                  value={formData.toMethod}
                  onValueChange={(value) =>
                    setFormData({ ...formData, toMethod: value })
                  }
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">💵 Cash</SelectItem>
                    <SelectItem value="bank">🏦 Bank</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">
                Transfer dari{" "}
                <span className="font-semibold">
                  {formData.fromMethod === "bank" ? "Bank" : "Cash"}
                </span>{" "}
                ke{" "}
                <span className="font-semibold">
                  {formData.toMethod === "bank" ? "Bank" : "Cash"}
                </span>
              </p>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Jumlah Transfer (Rp) *</Label>
              <Input
                id="amount"
                type="number"
                placeholder="100000"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                required
                min="1"
              />
              {formData.amount && (
                <p className="text-sm text-muted-foreground">
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                  }).format(parseFloat(formData.amount))}
                </p>
              )}
            </div>

            {/* Fund */}
            <div className="space-y-2">
              <Label htmlFor="fund">Fund / Proker *</Label>
              <Select
                value={formData.fundId}
                onValueChange={(value) =>
                  setFormData({ ...formData, fundId: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih fund" />
                </SelectTrigger>
                <SelectContent>
                  {funds.map((fund) => (
                    <SelectItem key={fund.id} value={fund.id}>
                      {fund.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Tanggal Transfer *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Keterangan (Opsional)</Label>
              <Textarea
                id="description"
                placeholder="Contoh: Setor tunai ke bank untuk operasional"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>

            {/* Info Alert */}
            <div className="p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-xs sm:text-sm text-blue-800">
                <strong>ℹ️ Catatan:</strong> Transfer akan mencatat 2 transaksi:
                <br />
                1. Pengeluaran dari{" "}
                <strong>
                  {formData.fromMethod === "bank" ? "Bank" : "Cash"}
                </strong>
                <br />
                2. Pemasukan ke{" "}
                <strong>
                  {formData.toMethod === "bank" ? "Bank" : "Cash"}
                </strong>
                <br />
                Saldo total tidak berubah, hanya berpindah metode pembayaran.
              </p>
            </div>

            {/* Submit */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="w-full sm:flex-1"
              >
                {loading ? "⏳ Memproses..." : "💸 Transfer Saldo"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/transactions")}
                className="w-full sm:w-auto"
              >
                Batal
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
