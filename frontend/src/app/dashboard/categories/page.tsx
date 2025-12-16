"use client";

import { useEffect, useState } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus, Save, X } from "lucide-react";
import api from "@/lib/api";

type Category = {
  id: string;
  type: "income" | "expense" | "general";
  name: string;
};

export default function CategoriesPage() {
  useRouteProtection();

  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [editing, setEditing] = useState<{ id: string; value: string } | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchCategories = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/categories");
      const data: Category[] = res.data.data || [];
      setCategories(data.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (err: any) {
      console.error("Failed to load categories", err);
      const message =
        err?.response?.data?.error || err?.message || "Gagal memuat kategori";
      setError(message);
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const addCategory = async () => {
    const name = newCategory.trim();
    if (!name) return alert("Kategori tidak boleh kosong");
    try {
      await api.post("/categories", { name });
      setNewCategory("");
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.error || "Gagal menambah kategori");
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Yakin ingin menghapus kategori ini?")) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.error || "Gagal menghapus kategori");
    }
  };

  const startEdit = (cat: Category) => {
    setEditing({ id: cat.id, value: cat.name });
  };

  const saveEdit = async () => {
    if (!editing) return;
    const name = editing.value.trim();
    if (!name) return alert("Nama kategori tidak boleh kosong");
    try {
      await api.put(`/categories/${editing.id}`, { name });
      setEditing(null);
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.error || "Gagal mengedit kategori");
    }
  };

  const cancelEdit = () => setEditing(null);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            📂 Kelola Kategori
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Berlaku untuk pemasukan & pengeluaran. Daftar di bawah diambil dari
            data transaksi dan bisa ditambah/edit/hapus.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">Daftar Kategori</CardTitle>
          <CardDescription className="text-sm">
            Satu sumber untuk semua jenis transaksi
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Tambah kategori baru..."
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addCategory()}
              className="flex-1"
              disabled={loading}
            />
            <Button onClick={addCategory} size="sm" disabled={loading}>
              <Plus className="h-4 w-4 mr-1" />
              Tambah
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Nama Kategori</TableHead>
                  <TableHead className="w-28">Tipe</TableHead>
                  <TableHead className="text-right w-32">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category, index) => (
                  <TableRow key={category.id || index}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>
                      {editing?.id === category.id ? (
                        <Input
                          value={editing.value}
                          onChange={(e) =>
                            setEditing({ ...editing, value: e.target.value })
                          }
                          onKeyPress={(e) => e.key === "Enter" && saveEdit()}
                          autoFocus
                        />
                      ) : (
                        <Badge variant="secondary">{category.name}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="capitalize">
                      {category.type || "general"}
                    </TableCell>
                    <TableCell className="text-right">
                      {editing?.id === category.id ? (
                        <div className="flex gap-1 justify-end">
                          <Button size="sm" variant="ghost" onClick={saveEdit}>
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={cancelEdit}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-1 justify-end">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEdit(category)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteCategory(category.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {categories.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-sm text-muted-foreground"
                    >
                      {loading ? "Memuat kategori..." : "Belum ada kategori"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
