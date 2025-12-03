# Changelog

All notable changes to GKJW Finance System will be documented in this file.

## [1.0.0] - 2024-12-03

### ✨ Initial Release

#### Features
- ✅ User Authentication (JWT)
  - Login/Register
  - Role-based access control (Admin, Member, Viewer)
  - Password hashing with bcrypt

- ✅ Dashboard
  - Real-time financial statistics
  - Monthly income vs expense charts
  - Category-wise expense breakdown
  - Pending transactions counter

- ✅ Transaction Management
  - Create income/expense transactions
  - Upload receipt files (image/PDF)
  - View all transactions with filters
  - Transaction status (Pending, Approved, Rejected)
  - Admin approval workflow

- ✅ Financial Reports
  - Filter by date range, type, category
  - Export to PDF (planned)
  - Export to Excel (planned)
  - Print-friendly view

- ✅ User Management (Admin only)
  - Create/Edit/Delete users
  - Manage user roles
  - View user list

- ✅ Activity Logs (Admin only)
  - Track all user actions
  - Audit trail

- ✅ UI/UX
  - Modern, responsive design
  - Sidebar navigation
  - TailwindCSS + Shadcn UI components
  - Dark mode support (CSS variables)

#### Backend
- Golang with Gin framework
- PostgreSQL database
- GORM ORM
- JWT authentication
- RESTful API design
- CORS configuration

#### Frontend
- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- Shadcn UI components
- Recharts for data visualization
- Axios for API calls

#### Database
- PostgreSQL schema
- Users table
- Transactions table
- Activity logs table
- Database indexes for performance

#### Documentation
- Complete README
- API documentation
- Workflow diagrams
- Deployment guide
- Customization guide

### 🔒 Security
- Password hashing with bcrypt
- JWT token authentication
- Protected API routes
- Role-based access control
- Input validation

### 📦 Infrastructure
- Docker-ready
- Environment configuration
- Database migrations
- Git ignore files

---

## [Planned] - Future Versions

### v1.1.0 (Planned)
- [ ] Email notifications
- [ ] WhatsApp notifications
- [ ] PDF export implementation
- [ ] Excel export implementation
- [ ] Two-factor authentication
- [ ] Password reset functionality

### v1.2.0 (Planned)
- [ ] Multi-language support (ID/EN)
- [ ] Budget planning module
- [ ] Recurring transactions
- [ ] Advanced analytics
- [ ] Mobile app (React Native)

### v1.3.0 (Planned)
- [ ] Integration with accounting software
- [ ] Bank reconciliation
- [ ] Invoice generation
- [ ] Payment gateway integration
- [ ] Automated reminders

---

## Contributing

See [README.md](./README.md) for contribution guidelines.

## License

MIT License - See [LICENSE](./LICENSE) file for details.
