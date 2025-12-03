# 🎨 Customization Guide - GKJW Finance System

Panduan untuk kustomisasi tampilan dan fitur sistem sesuai kebutuhan gereja Anda.

## 🎨 Mengubah Warna Tema

### 1. Warna Utama (Primary Colors)

Edit file `frontend/tailwind.config.ts`:

```typescript
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: "hsl(var(--primary))",
        navy: "#1e3a8a",  // Ganti dengan warna gereja Anda
      },
      secondary: {
        DEFAULT: "hsl(var(--secondary))",
        gold: "#fbbf24",  // Ganti dengan warna sekunder
      },
    }
  }
}
```

### 2. CSS Variables

Edit `frontend/src/app/globals.css`:

```css
:root {
  --primary: 221.2 83.2% 53.3%;  /* Biru navy */
  --secondary: 45 93% 47%;        /* Emas */
  /* Ubah nilai HSL sesuai warna yang diinginkan */
}
```

## 🖼️ Mengganti Logo

### 1. Tambahkan logo di folder `public/`

```
frontend/
  public/
    logo.png
    favicon.ico
```

### 2. Update Login Page

Edit `frontend/src/app/login/page.tsx`:

```tsx
<div className="text-center mb-8">
  <Image src="/logo.png" alt="Logo" width={100} height={100} />
  <h1 className="text-3xl font-bold text-white mb-2">
    GKJW Nama Gereja Anda
  </h1>
</div>
```

### 3. Update Sidebar

Edit `frontend/src/app/dashboard/layout.tsx`:

```tsx
<div className="p-4">
  <Image src="/logo.png" alt="Logo" width={40} height={40} />
</div>
```

## 📝 Mengubah Nama Sistem

### 1. Environment Variables

Edit `frontend/.env.local`:

```env
NEXT_PUBLIC_APP_NAME=Sistem Keuangan [Nama Gereja]
```

### 2. Update Metadata

Edit `frontend/src/app/layout.tsx`:

```tsx
export const metadata: Metadata = {
  title: "Sistem Keuangan [Nama Gereja]",
  description: "Sistem Pelaporan Keuangan [Nama Gereja]",
}
```

## 📊 Menambah Kategori Baru

### 1. Backend

Edit `backend/handlers/transactions.go` atau buat file constants:

```go
var Categories = []string{
  "Perkap",
  "Konsumsi",
  "Transport",
  "Kegiatan",
  "Logistik",
  "Pembangunan",  // Kategori baru
  "Misi",          // Kategori baru
  "Lain-lain",
}
```

### 2. Frontend

Edit `frontend/src/app/dashboard/upload/page.tsx`:

```tsx
const categories = [
  'Perkap',
  'Konsumsi',
  'Transport',
  'Kegiatan',
  'Logistik',
  'Pembangunan',  // Tambahkan di sini
  'Misi',          // Tambahkan di sini
  'Lain-lain',
]
```

## 🔔 Menambah Fitur Notifikasi Email

### 1. Install Package

```bash
cd backend
go get github.com/go-mail/mail
```

### 2. Buat Email Service

Create `backend/services/email.go`:

```go
package services

import (
    "gopkg.in/mail.v2"
    "os"
)

func SendEmail(to, subject, body string) error {
    m := mail.NewMessage()
    m.SetHeader("From", os.Getenv("SMTP_FROM"))
    m.SetHeader("To", to)
    m.SetHeader("Subject", subject)
    m.SetBody("text/html", body)

    d := mail.NewDialer(
        os.Getenv("SMTP_HOST"),
        587,
        os.Getenv("SMTP_USER"),
        os.Getenv("SMTP_PASS"),
    )

    return d.DialAndSend(m)
}
```

### 3. Update .env

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=no-reply@gkjw.com
```

### 4. Gunakan di Handler

```go
// Setelah transaksi di-approve
go services.SendEmail(
    user.Email,
    "Transaksi Disetujui",
    "Transaksi Anda telah disetujui oleh bendahara.",
)
```

## 📱 Menambah Fitur WhatsApp Notification

### 1. Install Twilio atau WhatsApp Business API

```bash
go get github.com/twilio/twilio-go
```

### 2. Create WhatsApp Service

```go
package services

import (
    "github.com/twilio/twilio-go"
    twilioApi "github.com/twilio/twilio-go/rest/api/v2010"
)

func SendWhatsApp(to, message string) error {
    client := twilio.NewRestClient()
    
    params := &twilioApi.CreateMessageParams{}
    params.SetFrom("whatsapp:+14155238886")
    params.SetTo("whatsapp:" + to)
    params.SetBody(message)

    _, err := client.Api.CreateMessage(params)
    return err
}
```

## 🖨️ Custom PDF Template

### 1. Install PDF Library

```bash
go get github.com/jung-kurt/gofpdf
```

### 2. Create PDF Generator

```go
package services

import (
    "github.com/jung-kurt/gofpdf"
)

func GeneratePDFReport(transactions []Transaction) ([]byte, error) {
    pdf := gofpdf.New("P", "mm", "A4", "")
    pdf.AddPage()
    
    // Header dengan logo
    pdf.ImageOptions("logo.png", 10, 6, 30, 0, false, 
        gofpdf.ImageOptions{ImageType: "PNG", ReadDpi: true}, 0, "")
    
    pdf.SetFont("Arial", "B", 16)
    pdf.Cell(40, 10, "Laporan Keuangan GKJW")
    
    // Table
    pdf.SetFont("Arial", "B", 12)
    pdf.Cell(40, 7, "Tanggal")
    pdf.Cell(40, 7, "Kategori")
    pdf.Cell(40, 7, "Jumlah")
    pdf.Ln(-1)
    
    // Data
    pdf.SetFont("Arial", "", 11)
    for _, tx := range transactions {
        pdf.Cell(40, 6, tx.Date)
        pdf.Cell(40, 6, tx.Category)
        pdf.Cell(40, 6, fmt.Sprintf("Rp %,.0f", tx.Amount))
        pdf.Ln(-1)
    }
    
    return pdf.Output(dest)
}
```

## 📊 Menambah Chart Baru di Dashboard

Edit `frontend/src/app/dashboard/page.tsx`:

```tsx
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

// Data untuk pie chart
const pieData = [
  { name: 'Perkap', value: 2000000 },
  { name: 'Konsumsi', value: 1500000 },
  // ...
]

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

// Component
<Card>
  <CardHeader>
    <CardTitle>Distribusi Pengeluaran</CardTitle>
  </CardHeader>
  <CardContent>
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={pieData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {pieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  </CardContent>
</Card>
```

## 🔐 Menambah Two-Factor Authentication (2FA)

### 1. Install TOTP Library

```bash
go get github.com/pquerna/otp/totp
```

### 2. Update User Model

```go
type User struct {
    // ... existing fields
    TwoFactorSecret string `json:"-"`
    TwoFactorEnabled bool  `json:"twoFactorEnabled"`
}
```

### 3. Implement 2FA

```go
// Generate secret
key, _ := totp.Generate(totp.GenerateOpts{
    Issuer:      "GKJW Finance",
    AccountName: user.Email,
})

user.TwoFactorSecret = key.Secret()

// Verify code
valid := totp.Validate(code, user.TwoFactorSecret)
```

## 📱 Responsive Mobile View

Semua halaman sudah responsive by default dengan Tailwind, tapi Anda bisa customize:

```tsx
<div className="
  grid 
  gap-4 
  grid-cols-1      /* Mobile: 1 kolom */
  md:grid-cols-2   /* Tablet: 2 kolom */
  lg:grid-cols-4   /* Desktop: 4 kolom */
">
  {/* Content */}
</div>
```

## 🌐 Multi-language Support

### 1. Install i18n

```bash
npm install next-intl
```

### 2. Create Language Files

```
frontend/
  messages/
    id.json
    en.json
```

### 3. Use in Components

```tsx
import { useTranslations } from 'next-intl'

const t = useTranslations('Dashboard')
<h1>{t('title')}</h1>
```

## 💾 Backup Automation

Create `backend/scripts/backup.sh`:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U postgres gkjw_finance > backup_$DATE.sql
# Upload to cloud storage
```

Add to cron:
```bash
0 2 * * * /path/to/backup.sh
```

---

Untuk pertanyaan lebih lanjut tentang kustomisasi, silakan hubungi tim developer!
