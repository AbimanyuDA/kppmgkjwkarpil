# 🏛️ GKJW Karangpilang - Sistem Pelaporan Keuangan

Sistem pelaporan keuangan modern untuk bendahara GKJW Karangpilang yang memudahkan pencatatan pemasukan-pengeluaran, mengelola cashflow, dan mengumpulkan nota pembelian dari anak-anak persekutuan.

## 🎯 Fitur Utama

- ✅ **Dashboard Keuangan Lengkap** - Grafik pemasukan vs pengeluaran, saldo real-time
- ✅ **Upload Nota Digital** - Input pengeluaran dengan upload foto/PDF nota
- ✅ **Approval System** - Bendahara dapat approve/reject transaksi
- ✅ **Input Pemasukan** - Catat persembahan, donasi, kas rutin
- ✅ **Cashflow Real-time** - Otomatis menghitung saldo dari pemasukan-pengeluaran
- ✅ **Laporan Keuangan** - Filter, export ke PDF/Excel, print-friendly
- ✅ **User Management** - Kelola user dengan role-based access
- ✅ **Activity Logs** - Tracking semua aktivitas sistem

## 🏗️ Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **TailwindCSS**
- **Shadcn UI**
- **Recharts** (untuk grafik)

### Backend
- **Golang** (Gin Framework)
- **PostgreSQL**
- **GORM** (ORM)
- **JWT** (Authentication)

### Storage
- Firebase Storage / AWS S3 (untuk upload nota)

## 📁 Struktur Proyek

```
GKJW/
├── frontend/                 # Next.js Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── login/       # Login page
│   │   │   ├── dashboard/   # Dashboard & protected pages
│   │   │   │   ├── page.tsx           # Main dashboard
│   │   │   │   ├── transactions/      # Transaction list
│   │   │   │   ├── upload/            # Upload nota form
│   │   │   │   ├── reports/           # Financial reports
│   │   │   │   └── users/             # User management
│   │   │   ├── layout.tsx
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   └── ui/          # Shadcn UI components
│   │   ├── lib/
│   │   │   ├── api.ts       # Axios instance
│   │   │   └── utils.ts     # Utility functions
│   │   └── types/           # TypeScript types
│   ├── package.json
│   └── tailwind.config.ts
│
└── backend/                  # Golang Backend
    ├── main.go              # Entry point
    ├── config/
    │   └── database.go      # Database connection
    ├── models/
    │   └── models.go        # Database models
    ├── handlers/
    │   ├── auth.go          # Authentication handlers
    │   ├── transactions.go  # Transaction handlers
    │   ├── dashboard.go     # Dashboard handlers
    │   ├── users.go         # User management
    │   └── reports.go       # Report handlers
    ├── middleware/
    │   └── auth.go          # JWT middleware
    ├── routes/
    │   └── routes.go        # API routes
    ├── migrations/
    │   └── 001_init.sql     # Database migrations
    ├── go.mod
    └── .env
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ dan npm/yarn
- Go 1.21+
- PostgreSQL 14+
- Git

### 1. Clone Repository

```bash
git clone <repository-url>
cd GKJW
```

### 2. Setup Database

```bash
# Login ke PostgreSQL
psql -U postgres

# Buat database
CREATE DATABASE gkjw_finance;

# Run migration
psql -U postgres -d gkjw_finance -f backend/migrations/001_init.sql
```

### 3. Setup Backend

```bash
cd backend

# Copy environment file
cp .env.example .env

# Edit .env dengan kredensial database Anda
# DB_HOST=localhost
# DB_PORT=5432
# DB_USER=postgres
# DB_PASSWORD=your_password
# DB_NAME=gkjw_finance
# JWT_SECRET=your-secret-key

# Install dependencies
go mod download

# Run server
go run main.go
```

Server akan berjalan di `http://localhost:8080`

### 4. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.local.example .env.local

# Edit .env.local
# NEXT_PUBLIC_API_URL=http://localhost:8080/api

# Run development server
npm run dev
```

Frontend akan berjalan di `http://localhost:3000`

## 👤 Default Users

Setelah menjalankan migration, akan ada 2 user default:

### Admin
- Email: `admin@gkjw.com`
- Password: `admin123`
- Role: admin

### Member
- Email: `member@gkjw.com`
- Password: `member123`
- Role: member

## 📚 User Roles

### 🔴 Admin (Bendahara)
- Full access ke semua fitur
- Approve/reject transaksi
- Generate laporan bulanan
- Export ke PDF/Excel
- Kelola user
- Lihat activity logs

### 🟡 Member (Anggota Pelaksana)
- Input pengeluaran
- Upload foto nota
- Lihat status pengajuan
- Lihat transaksi sendiri

### 🟢 Viewer (Koordinator/Pendeta)
- Lihat laporan keuangan
- Read-only access

## 🎨 Desain UI

Sistem menggunakan desain modern dengan:
- **Warna Utama**: Biru Navy (#1e3a8a) & Emas (#fbbf24)
- **Sidebar**: Minimalis dengan icons
- **Topbar**: Clean dan informatif
- **Components**: Card, Table, Badge, Modal dari Shadcn UI

## 📊 Workflow Sistem

```
1. User login → JWT token dibuat
2. Member input nota → Status: Pending
3. Bendahara approve/reject → Notifikasi ke member
4. Jika approved → Masuk cashflow otomatis
5. Bendahara generate laporan → Export PDF/Excel
6. Activity log tercatat otomatis
```

## 🔒 Security Features

- ✅ JWT Authentication
- ✅ Password hashing dengan bcrypt
- ✅ Role-based access control
- ✅ Protected API endpoints
- ✅ Input validation
- ✅ CORS configuration

## 📖 API Documentation

Dokumentasi lengkap API tersedia di [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

Base URL: `http://localhost:8080/api`

### Main Endpoints

- `POST /auth/login` - Login
- `GET /dashboard/stats` - Dashboard statistics
- `GET /transactions` - Get all transactions
- `POST /transactions` - Create transaction
- `PUT /transactions/:id/status` - Approve/reject
- `GET /reports` - Get financial reports
- `POST /upload` - Upload file

## 🧪 Testing

### Backend Testing

```bash
cd backend
go test ./...
```

### Frontend Testing

```bash
cd frontend
npm run test
```

## 📦 Build for Production

### Backend

```bash
cd backend
go build -o gkjw-finance-server main.go
./gkjw-finance-server
```

### Frontend

```bash
cd frontend
npm run build
npm start
```

## 🚀 Deployment

### Rekomendasi Deployment

#### Frontend
- **Vercel** (Recommended untuk Next.js)
- Netlify
- AWS Amplify

#### Backend
- **Railway** / Render (Easy deployment)
- DigitalOcean App Platform
- AWS EC2 / Google Cloud Run
- Docker Container

#### Database
- **Supabase** (PostgreSQL managed)
- AWS RDS
- DigitalOcean Managed Database

### Docker Deployment

```bash
# Backend Dockerfile
FROM golang:1.21-alpine
WORKDIR /app
COPY . .
RUN go mod download
RUN go build -o main .
EXPOSE 8080
CMD ["./main"]

# Frontend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔧 Environment Variables

### Backend (.env)
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=gkjw_finance
JWT_SECRET=your-super-secret-jwt-key
PORT=8080
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_APP_NAME=GKJW Finance System
```

## 📝 Database Schema

### Users
- id (UUID)
- name
- email
- password_hash
- role (admin/member/viewer)
- created_at, updated_at

### Transactions
- id (UUID)
- type (income/expense)
- amount
- category
- description
- event_name
- date
- created_by (FK to users)
- status (pending/approved/rejected)
- note_url
- rejection_reason
- created_at, updated_at

### Activity Logs
- id (UUID)
- user_id (FK to users)
- action
- timestamp

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

MIT License - feel free to use this project for your organization

## 👨‍💻 Support

Untuk bantuan atau pertanyaan:
- Email: support@gkjw.com
- GitHub Issues: [Create an issue](link)

## 🎉 Acknowledgments

- GKJW Karangpilang
- Team Pengembang
- Shadcn UI Components
- Gin Framework Community

---

**Built with ❤️ for GKJW Karangpilang**
