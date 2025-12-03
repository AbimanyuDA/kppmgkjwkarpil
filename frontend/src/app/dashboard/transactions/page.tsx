"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { formatCurrency, formatDate } from '@/lib/utils'
import api from '@/lib/api'
import { CheckCircle, XCircle, Eye } from 'lucide-react'

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/transactions')
      setTransactions(response.data.data)
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    try {
      await api.put(`/transactions/${id}/status`, { status: 'approved' })
      fetchTransactions()
    } catch (error) {
      console.error('Error approving transaction:', error)
    }
  }

  const handleReject = async () => {
    if (!selectedTransaction) return

    try {
      await api.put(`/transactions/${selectedTransaction.id}/status`, {
        status: 'rejected',
        rejectionReason,
      })
      setShowRejectModal(false)
      setRejectionReason('')
      fetchTransactions()
    } catch (error) {
      console.error('Error rejecting transaction:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Disetujui</Badge>
      case 'rejected':
        return <Badge variant="destructive">Ditolak</Badge>
      case 'pending':
        return <Badge variant="pending">Pending</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    return type === 'income' ? (
      <Badge variant="success">Pemasukan</Badge>
    ) : (
      <Badge variant="destructive">Pengeluaran</Badge>
    )
  }

  if (loading) {
    return <div>Loading...</div>
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
                          setSelectedTransaction(transaction)
                          setShowDetailModal(true)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {user?.role === 'admin' && transaction.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApprove(transaction.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedTransaction(transaction)
                              setShowRejectModal(true)
                            }}
                            className="text-red-600 hover:text-red-700"
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
                <p className="mt-1">{getStatusBadge(selectedTransaction.status)}</p>
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
              <Button variant="outline" onClick={() => setShowRejectModal(false)}>
                Batal
              </Button>
              <Button variant="destructive" onClick={handleReject}>
                Tolak Transaksi
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
