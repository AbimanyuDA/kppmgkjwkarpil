"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import api from '@/lib/api'
import { Upload } from 'lucide-react'

export default function UploadNotaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: '',
    description: '',
    eventName: '',
    date: new Date().toISOString().split('T')[0],
  })
  const [file, setFile] = useState<File | null>(null)

  const categories = [
    'Perkap',
    'Konsumsi',
    'Transport',
    'Kegiatan',
    'Logistik',
    'Lain-lain',
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let noteUrl = ''

      // Upload file jika ada
      if (file) {
        const fileFormData = new FormData()
        fileFormData.append('file', file)

        const uploadRes = await api.post('/upload', fileFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        noteUrl = uploadRes.data.data.url
      }

      // Create transaction
      await api.post('/transactions', {
        ...formData,
        amount: parseFloat(formData.amount),
        noteUrl,
      })

      alert('Transaksi berhasil dibuat!')
      router.push('/dashboard/transactions')
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal membuat transaksi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Upload Nota Pengeluaran</h2>
        <p className="text-muted-foreground">
          Input data pengeluaran dan upload bukti nota
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
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
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
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                required
              />
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
                    {file ? file.name : 'Klik untuk upload file'}
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
                {loading ? 'Memproses...' : 'Submit Pengajuan'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
