# Backend Deployment Guide

## Backend URLs (Production)
- **Primary URL**: `https://kppmgkjwkarpil-nqhm.vercel.app`
- Alternative: `https://kppmgkjwkarpil-backend-abimanyu-danendra-as-projects.vercel.app`

## API Endpoints
All endpoints use `/api` prefix:
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/transactions` - List transactions
- etc.

## Environment Variables (Vercel Backend)
Set these in Vercel Dashboard → Backend Project → Settings → Environment Variables:

```
DB_HOST=aws-1-ap-southeast-1.pooler.supabase.com
DB_PORT=5432
DB_USER=postgres.molbgkfvilqwvxndybyf
DB_PASSWORD=gkjw2024
DB_NAME=postgres
JWT_SECRET=e8a3f4907f77ed84ceb980b50de1955916722c4eda17371925c7b6530c235ee9
GO_VERSION=1.22
```

## Frontend Configuration

### Local Development (`.env.local`)
```
NEXT_PUBLIC_API_URL=https://kppmgkjwkarpil-nqhm.vercel.app/api
```

### Vercel Frontend Environment Variable
Set in Vercel Dashboard → Frontend Project → Settings → Environment Variables:
```
NEXT_PUBLIC_API_URL=https://kppmgkjwkarpil-nqhm.vercel.app/api
```

After updating, **redeploy frontend** to apply changes.

## Deployment Commands (CLI)

### Deploy Backend
```powershell
cd D:\Project\Website\GKJW
npx vercel --prod --cwd backend
```

### Check Backend Status
```powershell
cd D:\Project\Website\GKJW\backend
npx vercel ls
npx vercel inspect <deployment-url>
```

### View Logs
```powershell
npx vercel logs https://kppmgkjwkarpil-nqhm.vercel.app --since 1h
```

## Testing Backend API

### Test Login Endpoint (PowerShell)
```powershell
$body = '{"email":"admin@gkjw.com","password":"yourpassword"}'
Invoke-RestMethod -Uri "https://kppmgkjwkarpil-nqhm.vercel.app/api/auth/login" -Method POST -ContentType "application/json" -Body $body
```

### Test with curl
```bash
curl -X POST https://kppmgkjwkarpil-nqhm.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gkjw.com","password":"yourpassword"}'
```

## Troubleshooting

### 404 Not Found
- Ensure URL includes `/api` prefix for all endpoints
- Check Vercel deployment logs for errors
- Verify `vercel.json` routes configuration

### Network Error from Frontend
- Check `NEXT_PUBLIC_API_URL` in frontend environment variables
- Must include `/api` suffix: `https://kppmgkjwkarpil-nqhm.vercel.app/api`
- Redeploy frontend after env variable changes

### Database Connection Issues
- Verify Supabase allows connections from Vercel IPs
- Check `sslmode=require` in connection string
- Review deployment logs for connection errors

### CORS Errors
- Backend has CORS middleware allowing all origins (`*`)
- Check if request includes proper `Content-Type: application/json` header

## Performance Notes
- **Cold Start**: ~20-22 seconds for first request
- **Warm Response**: < 100ms for subsequent requests
- **AutoMigrate**: Runs on every cold start (~850ms), consider disabling for production
- **SLOW SQL Warning**: Normal for backfill operations, can be optimized

## Security Recommendations
1. Change `JWT_SECRET` to a stronger value in production
2. Restrict CORS to specific frontend domains
3. Set `GIN_MODE=release` for production
4. Move migration logic to separate CLI tool
5. Enable rate limiting for API endpoints

## Database (Supabase)
- **Type**: PostgreSQL (Session Pooler)
- **Host**: `aws-1-ap-southeast-1.pooler.supabase.com`
- **Port**: 5432
- **SSL**: Required (`sslmode=require`)

## Next Steps
1. Update frontend env var in Vercel dashboard
2. Redeploy frontend
3. Test login from frontend UI
4. Monitor logs for any errors
5. Optimize AutoMigrate performance (optional)
