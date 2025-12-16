"use client";

import React, { useEffect, useState } from "react";
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
import api from "@/lib/api";
import { DollarSign } from "lucide-react";

type Category = {
  id: string;
  name: string;
  type?: string;
};

export default function IncomePage() {
  useRouteProtection();

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [funds, setFunds] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    type: "income",
    amount: "",
    category: "",
    description: "",
    eventName: "",
    date: new Date().toISOString().split("T")[0],
    fundId: "",
    paymentMethod: "cash",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fundRes, categoryRes] = await Promise.all([
          api.get("/funds"),
          api.get("/categories"),
        ]);

        const fundList = fundRes.data.data || [];
        setFunds(fundList);
        if (fundList.length > 0) {
          setFormData((prev) => ({
            ...prev,
            fundId: prev.fundId || fundList[0].id,
          }));
        }

        const catList: Category[] = categoryRes.data.data || [];
        setCategories(catList);
        if (catList.length > 0) {
          setFormData((prev) => ({
            ...prev,
            category: prev.category || catList[0].name,
          }));
        }
      } catch (err) {
        console.error("Failed to load data", err);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Creating income transaction:", {
        ...formData,
        amount: parseFloat(formData.amount),
      });

      const response = await api.post("/transactions", {
        ...formData,
        amount: parseFloat(formData.amount),
        paymentMethod: formData.paymentMethod,
        noteUrl: "",
      });

      console.log("Income created:", response.data);
      alert("Pemasukan berhasil dicatat!");
      router.push("/dashboard/transactions");
    } catch (error: any) {
      console.error("Error:", error);
      console.error("Error response:", error.response?.data);
      const errorMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Gagal mencatat pemasukan";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Input Pemasukan</h2>
        <p className="text-muted-foreground">
          Catat pemasukan gereja seperti persembahan, kas rutin, dan donasi
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Form Pemasukan
          </CardTitle>
          <CardDescription>
            Isi semua data pemasukan dengan lengkap
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="eventName">Nama Kegiatan / Sumber *</Label>
              <Input
                id="eventName"
                placeholder="Contoh: Ibadah Minggu, Kas Pemuda, Donasi Pak Budi"
                value={formData.eventName}
                onChange={(e) =>
                  setFormData({ ...formData, eventName: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Kategori *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori pemasukan" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!formData.category && (
                <p className="text-sm text-red-500">Kategori harus dipilih</p>
              )}
            </div>

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
              {!formData.fundId && (
                <p className="text-sm text-red-500">Fund harus dipilih</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Metode Pembayaran</Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value) =>
                  setFormData({ ...formData, paymentMethod: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih metode pembayaran" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">💵 Tunai (Cash)</SelectItem>
                  <SelectItem value="bank">
                    🏦 Rekening Bank (Transfer)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Jumlah (Rp) *</Label>
              <Input
                id="amount"
                type="number"
                placeholder="500000"
                value={formData.amount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                required
                min="0"
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

            <div className="space-y-2">
              <Label htmlFor="date">Tanggal Transaksi *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Keterangan</Label>
              <Input
                id="description"
                placeholder="Keterangan tambahan (opsional)..."
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? "Memproses..." : "Simpan Pemasukan"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="max-w-2xl bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="text-blue-600 text-2xl">ℹ️</div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">
                Catatan Penting:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
                <li>
                  Pemasukan akan otomatis di-approve jika Anda admin (Bendahara)
                </li>
                <li>
                  Pastikan jumlah dan tanggal sudah benar sebelum menyimpan
                </li>
                <li>
                  Data pemasukan akan masuk ke laporan keuangan setelah approved
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
