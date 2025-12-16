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
import { Upload } from "lucide-react";

type Category = {
  id: string;
  name: string;
  type?: string;
};

export default function UploadNotaPage() {
  useRouteProtection();

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [funds, setFunds] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    type: "expense",
    amount: "",
    category: "",
    description: "",
    eventName: "",
    date: new Date().toISOString().split("T")[0],
    fundId: "",
    paymentMethod: "cash",
  });
  const [file, setFile] = useState<File | null>(null);

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
      let noteUrl = "";

      // Upload file jika ada
      if (file) {
        console.log("Uploading file:", file.name);
        const fileFormData = new FormData();
        fileFormData.append("file", file);

        const uploadRes = await api.post("/upload", fileFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        console.log("Upload response:", uploadRes.data);
        noteUrl = uploadRes.data.data.url;
      }

      // Create transaction
      console.log("Creating transaction with data:", {
        ...formData,
        amount: parseFloat(formData.amount),
        noteUrl,
      });

      const response = await api.post("/transactions", {
        ...formData,
        amount: parseFloat(formData.amount),
        paymentMethod: formData.paymentMethod,
        noteUrl,
      });

      console.log("Transaction created:", response.data);
      alert("Transaksi berhasil dibuat!");
      router.push("/dashboard/transactions");
    } catch (error: any) {
      console.error("Error:", error);
      console.error("Error response:", error.response?.data);
      const errorMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Gagal membuat transaksi";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Input Pengeluaran</h2>
        <p className="text-muted-foreground">
          Input data pengeluaran dan upload bukti nota (opsional)
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Form Pengeluaran</CardTitle>
          <CardDescription>
            Isi semua data dengan lengkap dan upload bukti nota
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="eventName">Nama Kegiatan *</Label>
              <Input
                id="eventName"
                placeholder="Contoh: Ibadah Minggu, Retreat Pemuda"
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
                  <SelectValue placeholder="Pilih kategori" />
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
                placeholder="50000"
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
              <Label htmlFor="date">Tanggal Transaksi *</Label>
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

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Input
                id="description"
                placeholder="Keterangan tambahan..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Upload Bukti Nota (Foto/PDF)</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <input
                  id="file"
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <label
                  htmlFor="file"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="h-10 w-10 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    {file ? file.name : "Klik untuk upload file"}
                  </span>
                  <span className="text-xs text-gray-400 mt-1">
                    JPG, PNG, atau PDF (Max 5MB)
                  </span>
                </label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Batal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Memproses..." : "Submit Pengajuan"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
