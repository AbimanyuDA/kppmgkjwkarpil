"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatDate } from "@/lib/utils";
import api from "@/lib/api";
import { CheckCircle, XCircle, Eye, Pencil } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [user, setUser] = useState<any>(null);
  const [funds, setFunds] = useState<any[]>([]);
  const [editFormData, setEditFormData] = useState<any>({
    amount: "",
    category: "",
    description: "",
    eventName: "",
    date: "",
    fundId: "",
    paymentMethod: "cash",
  });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchTransactions();
    fetchFunds();
  }, []);

  const fetchFunds = async () => {
    try {
      const res = await api.get("/funds");
      setFunds(res.data.data || []);
    } catch (err) {
      console.error("Failed to load funds", err);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await api.get("/transactions");
      setTransactions(response.data.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.put(`/transactions/${id}/status`, { status: "approved" });
      fetchTransactions();
    } catch (error) {
      console.error("Error approving transaction:", error);
    }
  };

  const handleReject = async () => {
    if (!selectedTransaction) return;

    try {
      await api.put(`/transactions/${selectedTransaction.id}/status`, {
        status: "rejected",
        rejectionReason,
      });
      setShowRejectModal(false);
      setRejectionReason("");
      fetchTransactions();
    } catch (error) {
      console.error("Error rejecting transaction:", error);
    }
  };

  const openEditModal = (transaction: any) => {
    setSelectedTransaction(transaction);
    setEditFormData({
      type: transaction.type,
      amount: transaction.amount.toString(),
      category: transaction.category,
      description: transaction.description || "",
      eventName: transaction.eventName || "",
      date: transaction.date.split("T")[0],
      fundId: transaction.fundId || "",
      paymentMethod: transaction.paymentMethod || "cash",
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async () => {
    if (!selectedTransaction) return;

    try {
      await api.put(`/transactions/${selectedTransaction.id}`, {
        ...editFormData,
        type: editFormData.type,
        amount: parseFloat(editFormData.amount),
      });
      setShowEditModal(false);
      alert("Transaksi berhasil diupdate!");
      fetchTransactions();
    } catch (error: any) {
      console.error("Error updating transaction:", error);
      alert(error.response?.data?.error || "Gagal update transaksi");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge variant="success">Disetujui</Badge>;
      case "rejected":
        return <Badge variant="destructive">Ditolak</Badge>;
      case "pending":
        return <Badge variant="pending">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    return type === "income" ? (
      <Badge variant="success">Pemasukan</Badge>
    ) : (
      <Badge variant="destructive">Pengeluaran</Badge>
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Daftar Transaksi</h2>
        <p className="text-muted-foreground">
          Kelola semua transaksi pemasukan dan pengeluaran
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Semua Transaksi</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Kegiatan</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Dibuat Oleh</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{formatDate(transaction.date)}</TableCell>
                  <TableCell>{getTypeBadge(transaction.type)}</TableCell>
                  <TableCell>{transaction.category}</TableCell>
                  <TableCell>{transaction.eventName}</TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(transaction.amount)}
                  </TableCell>
                  <TableCell>{transaction.createdByUser?.name}</TableCell>
                  <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTransaction(transaction);
                          setShowDetailModal(true);
                        }}
                        title="Lihat detail"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(transaction)}
                        title="Edit transaksi"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {user?.role === "admin" &&
                        transaction.status === "pending" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApprove(transaction.id)}
                              className="text-green-600 hover:text-green-700"
                              title="Setujui"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedTransaction(transaction);
                                setShowRejectModal(true);
                              }}
                              className="text-red-600 hover:text-red-700"
                              title="Tolak"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detail Transaksi</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div>
                <Label>Jenis Transaksi</Label>
                <p className="mt-1">{getTypeBadge(selectedTransaction.type)}</p>
              </div>
              <div>
                <Label>Kategori</Label>
                <p className="mt-1">{selectedTransaction.category}</p>
              </div>
              <div>
                <Label>Nama Kegiatan</Label>
                <p className="mt-1">{selectedTransaction.eventName}</p>
              </div>
              <div>
                <Label>Jumlah</Label>
                <p className="mt-1 text-lg font-semibold">
                  {formatCurrency(selectedTransaction.amount)}
                </p>
              </div>
              <div>
                <Label>Deskripsi</Label>
                <p className="mt-1">{selectedTransaction.description}</p>
              </div>
              <div>
                <Label>Tanggal Transaksi</Label>
                <p className="mt-1">{formatDate(selectedTransaction.date)}</p>
              </div>
              {selectedTransaction.noteUrl && (
                <div>
                  <Label>Bukti Nota</Label>
                  <a
                    href={selectedTransaction.noteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-1 text-blue-600 hover:underline"
                  >
                    Lihat Nota
                  </a>
                </div>
              )}
              <div>
                <Label>Status</Label>
                <p className="mt-1">
                  {getStatusBadge(selectedTransaction.status)}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Transaksi</DialogTitle>
            <DialogDescription>
              Berikan alasan penolakan transaksi ini
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Alasan Penolakan</Label>
              <Input
                id="reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Masukkan alasan penolakan..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowRejectModal(false)}
              >
                Batal
              </Button>
              <Button variant="destructive" onClick={handleReject}>
                Tolak Transaksi
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Transaksi</DialogTitle>
            <DialogDescription>
              Ubah data transaksi yang salah input
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Jenis</Label>
                  <p className="mt-1">
                    {getTypeBadge(selectedTransaction.type)}
                  </p>
                </div>
                <div>
                  <Label htmlFor="paymentMethod">Metode Pembayaran *</Label>
                  <Select
                    value={editFormData.paymentMethod}
                    onValueChange={(value) =>
                      setEditFormData({ ...editFormData, paymentMethod: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">💵 Cash</SelectItem>
                      <SelectItem value="bank">🏦 Bank</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="eventName">Nama Kegiatan *</Label>
                <Input
                  id="eventName"
                  value={editFormData.eventName}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      eventName: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Kategori *</Label>
                  <Input
                    id="category"
                    value={editFormData.category}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        category: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="fundId">Fund / Proker *</Label>
                  <Select
                    value={editFormData.fundId}
                    onValueChange={(value) =>
                      setEditFormData({ ...editFormData, fundId: value })
                    }
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Jumlah (Rp) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={editFormData.amount}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        amount: e.target.value,
                      })
                    }
                    required
                    min="0"
                  />
                  {editFormData.amount && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                      }).format(parseFloat(editFormData.amount))}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="date">Tanggal *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={editFormData.date}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, date: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={editFormData.description}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                >
                  Batal
                </Button>
                <Button onClick={handleEditSubmit}>💾 Simpan Perubahan</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
