# Quick Start Guide

## Installation Steps

### 1. Backend Setup

```bash
cd backend
go mod download
cp .env.example .env
# Edit .env dengan database credentials
go run main.go
```

### 2. Database Setup

```bash
# Create database
createdb gkjw_finance

# Run migration
psql -d gkjw_finance -f migrations/001_init.sql
```

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

## Default Login

**Admin:**

- Email: admin@gkjw.com
- Password: admin123

**Member:**

- Email: member@gkjw.com
- Password: member123

## Main Features

✅ Dashboard with charts
✅ Transaction management
✅ Expense report with file upload
✅ Financial reports (PDF/Excel)
✅ User management
✅ Activity logs
✅ Role-based access control

## Tech Stack

- **Frontend:** Next.js 14, TypeScript, TailwindCSS, Shadcn UI
- **Backend:** Golang (Gin), PostgreSQL, GORM, JWT
- **Storage:** Firebase Storage / AWS S3

## Documentation

- [📖 README.md](./README.md) - Complete documentation
- [🔌 API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - API endpoints
- [📊 WORKFLOW_DIAGRAM.md](./WORKFLOW_DIAGRAM.md) - System workflow
- [🚀 DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Deployment guide
- [🎨 CUSTOMIZATION_GUIDE.md](./CUSTOMIZATION_GUIDE.md) - Customization tips

## Project Structure

```
GKJW/
├── frontend/          # Next.js application
│   ├── src/
│   │   ├── app/      # Pages & routes
│   │   ├── components/  # UI components
│   │   ├── lib/      # Utilities
│   │   └── types/    # TypeScript types
│   └── package.json
│
└── backend/           # Golang API
    ├── config/       # Database config
    ├── handlers/     # API handlers
    ├── middleware/   # Auth middleware
    ├── models/       # Database models
    ├── routes/       # API routes
    └── migrations/   # SQL migrations
```

## Support

For questions: support@gkjw.com

---

**Built with ❤️ for GKJW Karangpilang**
