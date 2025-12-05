# CSV Migration Tool Documentation

## Overview

Tool Go untuk mengimport data transaksi dari file CSV (cashflow lama) ke database sistem web GKJW Finance.

## Fitur

- ✅ Parse CSV dengan format Cashflow Utama KPPM GKJW
- ✅ Konversi debit/credit → income/expense
- ✅ Mapping payment method (bank/cash)
- ✅ Auto-create funds dari "Sumber" column
- ✅ Extract category otomatis dari description
- ✅ Validasi data sebelum insert
- ✅ Skip internal transfers (pindah saldo, transfers)
- ✅ Bulk import dengan error handling

## Struktur CSV yang Didukung

File CSV harus memiliki kolom:

```
Tanggal | Keterangan | Debit Bank | Debit Cash | Kredit Bank | Kredit Cash | Saldo Bank | Saldo Cash | Sumber
```

Contoh dari file referensi:

```
10/01/25 | Sisa Dana Karpil Cup V 2023 | (debit) | (debit) | (kredit) | (kredit) | ... | Karpil Cup
```

### Format Tanggal

- Supported: `DD/MM/YY` (01/01/25) atau `DD/MM/YYYY` (01/01/2025)

### Kolom Keterangan (Description)

- Digunakan untuk ekstrak kategori otomatis
- Keywords: "penjualan", "sewa", "transport", "makan", "honor", "peralatan", "bazar", "ngamen", "persembahan", dll

### Kolom Sumber (Fund/Source)

- Auto-map ke Fund yang ada atau create fund baru
- Supported funds: "Karpil Cup", "Dana Usaha KPPM", "CSR", "Natal KPPM", "Kas KPPM", "Retret Ibadah Gabungan", dll

## Instalasi & Persiapan

### 1. Setup Environment Variables

Pastikan `.env` sudah ter-setup dengan DB credentials:

```bash
DB_HOST=your_host
DB_PORT=5432
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=gkjw_finance
```

### 2. Verifikasi Go Installation

```bash
go version  # Pastikan Go 1.18+
```

## Penggunaan

### Basic Import

```bash
cd backend
go run cmd/migrate/main.go -file="/path/to/csv/file.csv"
```

### Contoh dengan file referensi:

```bash
go run cmd/migrate/main.go -file="d:\Project\Website\GKJW\Referensi\0. Cashflow Utama KPPM GKJW Karangpilang - Main.csv"
```

### Output

```
Initializing database...
Database initialized successfully
Starting import from: ...csv

Parsed 193 rows from CSV
Created system admin user for import
Imported 50 transactions...
Imported 100 transactions...
Imported 150 transactions...

=== Import Complete ===
Success: 168
Errors:  25
Total:   193
```

## Data Mapping

### Transaction Type Conversion

| CSV Pattern    | Type           | Logic                                     |
| -------------- | -------------- | ----------------------------------------- |
| Debit saja     | income         | `Type: "income"`, `Amount: debit_total`   |
| Kredit saja    | expense        | `Type: "expense"`, `Amount: kredit_total` |
| Debit + Kredit | income/expense | Net amount (beda debit-kredit)            |
| "Pindah Saldo" | SKIP           | Internal transfer diabaikan               |

### Payment Method Mapping

| Pattern                 | Payment Method |
| ----------------------- | -------------- |
| Ada Debit/Kredit Bank   | `bank`         |
| Hanya Debit/Kredit Cash | `cash`         |

### Category Extraction

**Income Categories:**

- "penjualan", "jualan" → `Penjualan`
- "persembahan", "iuran", "donasi" → `Donasi`
- "bazar" → `Bazar`
- "ngamen" → `Ngamen`
- "pkt" → `PKT`
- Default → `Pendapatan Lain`

**Expense Categories:**

- "sewa" → `Sewa`
- "transport", "grab", "bensin" → `Transport`
- "makan", "konsum", "bazar" → `Konsumsi`
- "honor", "fee", "gaji" → `Honor`
- "peralatan", "barang", "belanja" → `Peralatan`
- "perbaikan", "maintenance" → `Perbaikan`
- Default → `Pengeluaran Lain`

## Errors & Skipped Rows

### Rows yang di-skip (tidak error):

1. **Transfer internal** (`"Pindah Saldo"`, `"Transfer Hadiah"`)
2. Baris kosong

### Common Error Messages:

| Error                                  | Penyebab                    | Solusi                                               |
| -------------------------------------- | --------------------------- | ---------------------------------------------------- |
| `unable to determine transaction type` | Tidak ada debit atau kredit | Review CSV row, mungkin saldo awal atau transfer kas |
| `invalid date format`                  | Format tanggal tidak sesuai | Ubah ke DD/MM/YY atau DD/MM/YYYY                     |
| `failed to get fund`                   | Fund tidak bisa dibuat      | Check DB permissions, unique constraint              |
| `violates foreign key`                 | User ID tidak ada           | Auto-create system user, pastikan DB clean           |

## Hasil Import

### Database Changes:

- ✅ **168 transaksi** baru ditambahkan ke tabel `transactions`
- ✅ **6 funds** dibuat/diupdate: Karpil Cup, Dana Usaha KPPM, CSR, Natal KPPM, Kas KPPM, Retret Ibadah Gabungan
- ✅ **1 system user** dibuat untuk `created_by` (ID: `00000000-0000-0000-0000-000000000001`)
- ✅ Status semua transaksi: `approved` (data lama dianggap valid)

### Verifikasi Import:

```sql
-- Cek jumlah transaksi
SELECT COUNT(*) FROM transactions;  -- Harus >= 168

-- Cek per fund
SELECT fund_id, COUNT(*) FROM transactions GROUP BY fund_id;

-- Cek payment method split
SELECT payment_method, COUNT(*) FROM transactions GROUP BY payment_method;

-- Cek by type
SELECT type, COUNT(*) FROM transactions GROUP BY type;
```

## Rebuild Backend (Setelah Import)

```bash
cd backend
go build -o bin/app main.go

# Atau langsung run
go run main.go
```

## Troubleshooting

### 1. Database Connection Error

**Error:** `hostname resolving error`

- Check `.env` file exists & DB credentials correct
- Pastikan PostgreSQL running

### 2. CSV File Not Found

**Error:** `CSV file not found: ...`

- Check file path (support full path)
- Use correct path format (forward slash atau backslash)

### 3. Foreign Key Violation

**Error:** `violates foreign key constraint fk_transactions_created_by_user`

- Solusi: Tool auto-create system user (seharusnya OK)
- Jika masih error: cek DB foreign key constraints

### 4. Fund Already Exists

**Behavior:** Fund auto-created jika belum ada, atau skip jika sudah

- No manual intervention needed

## Notes

- **Data Integrity**: Setiap transaksi mendapat UUID baru, tidak ada duplicate
- **Timestamp**: `created_at`, `updated_at` diset ke waktu import
- **Status**: Semua transaksi diset `"approved"` (asumsi data lama valid)
- **Rollback**: Untuk rollback, delete transaksi via DB atau aplikasi

## Next Steps

1. ✅ Run import → selesai
2. Verify data di UI aplikasi (dashboard transactions, reports)
3. Check fund balances & payment method split
4. Optional: Add manual corrections untuk 25 skipped rows jika diperlukan

---

**Last Updated:** Dec 5, 2025
**Version:** 1.0
**Tool:** GKJW Finance CSV Importer
