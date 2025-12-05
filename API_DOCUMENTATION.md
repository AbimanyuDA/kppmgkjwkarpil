# API Documentation - GKJW Finance System

Base URL: `http://localhost:8080/api`

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

---

## 🔐 Auth Endpoints

### 1. Login

**POST** `/auth/login`

**Request Body:**

```json
{
  "email": "admin@gkjw.com",
  "password": "admin123"
}
```

**Response (200 OK):**

```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid",
      "name": "Administrator",
      "email": "admin@gkjw.com",
      "role": "admin",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

### 2. Register

**POST** `/auth/register`

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "member"
}
```

**Response (201 Created):**

```json
{
  "message": "User registered successfully",
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "member"
  }
}
```

---

## 📊 Dashboard Endpoints

### 1. Get Dashboard Stats

**GET** `/dashboard/stats`

**Response (200 OK):**

```json
{
  "data": {
    "totalIncome": 50000000,
    "totalExpense": 30000000,
    "currentBalance": 20000000,
    "pendingTransactions": 5,
    "monthlyIncome": 10000000,
    "monthlyExpense": 6000000
  }
}
```

### 2. Get Monthly Data

**GET** `/dashboard/monthly`

**Response (200 OK):**

```json
{
  "data": [
    {
      "month": "Jan 2024",
      "income": 8000000,
      "expense": 5000000
    },
    {
      "month": "Feb 2024",
      "income": 9000000,
      "expense": 6000000
    }
  ]
}
```

### 3. Get Category Data

**GET** `/dashboard/category`

**Response (200 OK):**

```json
{
  "data": [
    {
      "category": "Perkap",
      "amount": 2000000,
      "percentage": 35.5
    },
    {
      "category": "Konsumsi",
      "amount": 1500000,
      "percentage": 26.3
    }
  ]
}
```

---

## 💰 Transaction Endpoints

### 1. Get All Transactions

**GET** `/transactions`

**Query Parameters:**

- `status` (optional): pending | approved | rejected
- `type` (optional): income | expense
- `startDate` (optional): YYYY-MM-DD
- `endDate` (optional): YYYY-MM-DD

**Response (200 OK):**

```json
{
  "data": [
    {
      "id": "uuid",
      "type": "expense",
      "amount": 500000,
      "category": "Perkap",
      "description": "Beli perlengkapan ibadah",
      "eventName": "Ibadah Minggu",
      "date": "2024-01-15",
      "createdBy": "uuid",
      "createdByUser": {
        "id": "uuid",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "status": "pending",
      "noteUrl": "/uploads/nota.jpg",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### 2. Get Transaction by ID

**GET** `/transactions/:id`

**Response (200 OK):**

```json
{
  "data": {
    "id": "uuid",
    "type": "expense",
    "amount": 500000,
    "category": "Perkap",
    "description": "Beli perlengkapan ibadah",
    "eventName": "Ibadah Minggu",
    "date": "2024-01-15",
    "status": "pending",
    "noteUrl": "/uploads/nota.jpg"
  }
}
```

### 3. Create Transaction

**POST** `/transactions`

**Request Body:**

```json
{
  "type": "expense",
  "amount": 500000,
  "category": "Perkap",
  "description": "Beli perlengkapan ibadah",
  "eventName": "Ibadah Minggu",
  "date": "2024-01-15",
  "noteUrl": "/uploads/nota.jpg"
}
```

**Response (201 Created):**

```json
{
  "message": "Transaction created successfully",
  "data": {
    "id": "uuid",
    "type": "expense",
    "amount": 500000,
    "status": "pending"
  }
}
```

### 4. Update Transaction

**PUT** `/transactions/:id`

**Request Body:** (Same as Create Transaction)

**Response (200 OK):**

```json
{
  "message": "Transaction updated successfully",
  "data": { ... }
}
```

### 5. Update Transaction Status

**PUT** `/transactions/:id/status`

**Request Body:**

```json
{
  "status": "approved",
  "rejectionReason": "Optional reason if rejected"
}
```

**Response (200 OK):**

```json
{
  "message": "Transaction status updated successfully",
  "data": { ... }
}
```

### 6. Delete Transaction (Admin Only)

**DELETE** `/transactions/:id`

**Response (200 OK):**

```json
{
  "message": "Transaction deleted successfully"
}
```

---

## 📄 Report Endpoints

### 1. Get Reports

**GET** `/reports`

**Query Parameters:**

- `startDate` (optional): YYYY-MM-DD
- `endDate` (optional): YYYY-MM-DD
- `type` (optional): income | expense
- `category` (optional): Perkap | Konsumsi | etc

**Response (200 OK):**

```json
{
  "data": [ ... ],
  "summary": {
    "totalIncome": 50000000,
    "totalExpense": 30000000,
    "balance": 20000000,
    "count": 150
  }
}
```

### 2. Export to PDF

**GET** `/reports/export/pdf`

**Query Parameters:** (Same as Get Reports)

**Response:** PDF file download

### 3. Export to Excel

**GET** `/reports/export/excel`

**Query Parameters:** (Same as Get Reports)

**Response:** Excel file download

---

## 👥 User Management Endpoints (Admin Only)

### 1. Get All Users

**GET** `/users`

**Response (200 OK):**

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "member",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 2. Get User by ID

**GET** `/users/:id`

### 3. Create User

**POST** `/users`

**Request Body:** (Same as Register)

### 4. Update User

**PUT** `/users/:id`

**Request Body:**

```json
{
  "name": "John Doe Updated",
  "email": "newemail@example.com",
  "role": "admin"
}
```

### 5. Delete User

**DELETE** `/users/:id`

---

## 📝 Activity Log Endpoints (Admin Only)

### 1. Get Activity Logs

**GET** `/logs`

**Response (200 OK):**

```json
{
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "user": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "action": "Created transaction: Ibadah Minggu",
      "timestamp": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

## 📤 File Upload Endpoint

### Upload File

**POST** `/upload`

**Content-Type:** `multipart/form-data`

**Form Data:**

- `file`: The file to upload (image or PDF)

**Response (200 OK):**

```json
{
  "message": "File uploaded successfully",
  "data": {
    "url": "/uploads/20240115120000_nota.jpg",
    "filename": "20240115120000_nota.jpg"
  }
}
```

---

## Error Responses

### 400 Bad Request

```json
{
  "error": "Invalid request body"
}
```

### 401 Unauthorized

```json
{
  "error": "Invalid or expired token"
}
```

### 403 Forbidden

```json
{
  "error": "Admin access required"
}
```

### 404 Not Found

```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error"
}
```

---

## Categories Available

- Perkap
- Konsumsi
- Transport
- Kegiatan
- Logistik
- Lain-lain

## User Roles

- **admin**: Full access to all features
- **member**: Can create transactions, view own transactions
- **viewer**: Read-only access to reports
