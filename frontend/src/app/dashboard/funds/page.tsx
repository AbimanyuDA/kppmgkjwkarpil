"use client";

import { useEffect, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/api";
import { Plus, RefreshCcw } from "lucide-react";

interface Fund {
  id: string;
  name: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function FundsPage() {
  const [funds, setFunds] = useState<Fund[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    id: "",
    name: "",
    description: "",
    status: "active",
  });

  const loadFunds = async () => {
    setLoading(true);
    try {
      const res = await api.get("/funds");
      setFunds(res.data.data || []);
    } catch (err) {
      console.error("Failed to load funds", err);
      alert("Gagal memuat fund");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFunds();
  }, []);

  const resetForm = () =>
    setForm({ id: "", name: "", description: "", status: "active" });

  const handleSave = async () => {
    if (!form.name.trim()) {
      alert("Nama proker/fund wajib diisi");
      return;
    }
    setSaving(true);
    try {
      if (form.id) {
        await api.put(`/funds/${form.id}`, {
          name: form.name,
          description: form.description,
          status: form.status,
        });
      } else {
        await api.post("/funds", {
          name: form.name,
          description: form.description,
        });
      }
      resetForm();
      loadFunds();
    } catch (err: any) {
      console.error("Save fund error", err);
      alert(err.response?.data?.error || "Gagal menyimpan fund");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (fund: Fund) => {
    setForm({
      id: fund.id,
      name: fund.name,
      description: fund.description || "",
      status: fund.status,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus fund ini?")) return;
    try {
      await api.delete(`/funds/${id}`);
      loadFunds();
    } catch (err: any) {
      console.error("Delete fund error", err);
      alert(err.response?.data?.error || "Gagal hapus fund");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Fund / Proker</h2>
          <p className="text-muted-foreground">
            Kelola daftar fund untuk setiap program/kegiatan
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadFunds} disabled={loading}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            {loading ? "Memuat..." : "Reload"}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Plus className="h-4 w-4 mr-2" />
            {form.id ? "Update Fund" : "Tambah Fund"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{form.id ? "Edit Fund" : "Fund Baru"}</CardTitle>
          <CardDescription>Isi nama dan deskripsi fund</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nama Proker/Fund *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Contoh: Dana Kas, Karpil Cup, Natal KPPM"
            />
          </div>

          <div className="space-y-2">
            <Label>Deskripsi</Label>
            <Input
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Keterangan singkat"
            />
          </div>

          {form.id && (
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(value) => setForm({ ...form, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Menyimpan..." : form.id ? "Update" : "Simpan"}
            </Button>
            <Button variant="outline" onClick={resetForm} disabled={saving}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Fund</CardTitle>
          <CardDescription>Fund aktif dan arsip</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {funds.length === 0 && (
            <div className="text-muted-foreground">Belum ada fund.</div>
          )}
          {funds.map((fund) => (
            <div
              key={fund.id}
              className="flex items-center justify-between rounded-md border p-3"
            >
              <div>
                <div className="font-semibold flex items-center gap-2">
                  {fund.name}
                  <Badge
                    variant={fund.status === "active" ? "default" : "secondary"}
                  >
                    {fund.status}
                  </Badge>
                </div>
                {fund.description && (
                  <div className="text-sm text-muted-foreground">
                    {fund.description}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(fund)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(fund.id)}
                >
                  Hapus
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
