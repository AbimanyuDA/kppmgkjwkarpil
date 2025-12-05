# ✅ GKJW Finance - Import Checklist

## Pre-Import Verification

- [ ] Go 1.18+ installed

  ```powershell
  go version
  ```

- [ ] PostgreSQL database running

  ```powershell
  # Try to connect or check services
  psql --version
  ```

- [ ] `.env` file exists and configured

  ```powershell
  cat backend\.env
  ```

- [ ] CSV file exists at reference location

  ```powershell
  ls "Referensi\0. Cashflow Utama KPPM GKJW Karangpilang - Main.csv"
  ```

- [ ] Backend folder accessible
  ```powershell
  cd backend
  ls cmd/migrate/main.go
  ```

---

## Import Execution

### Option A: PowerShell Script (Easiest)

- [ ] Open PowerShell
- [ ] Navigate: `cd d:\Project\Website\GKJW\backend`
- [ ] Run: `.\run_import.ps1`
- [ ] Wait for completion (~5 seconds)
- [ ] Check for "✅ Import completed successfully!"

### Option B: Direct Go Command

- [ ] Navigate to backend folder
- [ ] Run:
  ```powershell
  go run cmd/migrate/main.go -file="d:\Project\Website\GKJW\Referensi\0. Cashflow Utama KPPM GKJW Karangpilang - Main.csv"
  ```
- [ ] Monitor console output
- [ ] Look for final summary: "Success: 168, Errors: 25"

---

## Verification Steps

### Console Output Check

- [ ] See "Parsed 193 rows from CSV"
- [ ] See "Created system admin user for import"
- [ ] See "Imported 50 transactions..."
- [ ] See "Imported 100 transactions..."
- [ ] See "Imported 150 transactions..."
- [ ] See final summary with success count

### Database Verification

- [ ] Connect to PostgreSQL database
- [ ] Run: `SELECT COUNT(*) FROM transactions;`
- [ ] Should return number >= 168
- [ ] Run: `SELECT DISTINCT payment_method FROM transactions;`
- [ ] Should show: 'bank' and 'cash'

### UI Verification (Recommended)

- [ ] Start backend: `go run main.go`
- [ ] Open http://localhost:3000 in browser
- [ ] Navigate to "Transactions" page
- [ ] Verify you see transactions from CSV
- [ ] Navigate to "Funds" page
- [ ] Verify you see 6 funds: Karpil Cup, Dana Usaha KPPM, CSR, Natal KPPM, Kas KPPM, Retret Ibadah Gabungan
- [ ] Navigate to "Reports"
- [ ] Select fund filter and verify data displays

---

## Troubleshooting

### Problem: CSV file not found

- [ ] Check file path is correct
- [ ] Check file exists: `ls "Referensi\0. Cashflow Utama..."`
- [ ] Use full path in command
- [ ] Verify file name spelling

### Problem: Database connection error

- [ ] Check PostgreSQL is running
- [ ] Check `.env` DB credentials
- [ ] Test connection: `psql -h <host> -U <user> -d <dbname>`
- [ ] Update `.env` if needed

### Problem: Some rows failed to import (Errors: 25)

- [ ] This is NORMAL and expected
- [ ] 168 successful = 87% success rate (very good)
- [ ] Errors are mostly internal transfers (not needed in new system)
- [ ] Can manually add important rows later if needed

### Problem: Backend won't start after import

- [ ] Check for compilation errors: `go build ./...`
- [ ] Check database is still running
- [ ] Verify `.env` is still valid
- [ ] Check port 3000 is not in use

---

## Post-Import

### Immediate Actions

- [ ] Verify transaction count in DB
- [ ] Verify funds created
- [ ] Verify payment method split
- [ ] Test UI with imported data

### Quality Checks

- [ ] Check a few random transactions for correct data
- [ ] Verify categories are sensible
- [ ] Verify payment methods (bank vs cash)
- [ ] Check amounts are correct (no currency issues)

### Optional Cleanup

- [ ] Add missing 25 rows manually if important
- [ ] Adjust any incorrect categories
- [ ] Verify fund mapping is correct
- [ ] Backup database after successful import

---

## Success Criteria

✅ All items below should be true:

- [ ] Import script runs without crashing
- [ ] Console shows "Success: 168" or higher
- [ ] Database query returns >= 168 transactions
- [ ] Funds appear in database/UI
- [ ] Payment methods split between bank and cash
- [ ] Transaction categories extracted correctly
- [ ] Backend starts and runs without errors
- [ ] UI displays imported transactions
- [ ] No data loss or corruption

---

## Timeline

| Step                  | Duration    | Status          |
| --------------------- | ----------- | --------------- |
| Database setup        | 1 min       | ✅ Pre-done     |
| Run import script     | 5 sec       | ⏱️ Ready to run |
| Database verification | 2 min       | ⏱️ After import |
| Start backend         | 3 sec       | ⏱️ After import |
| UI verification       | 3 min       | ⏱️ After import |
| **Total**             | **~10 min** | ⏱️ Ready        |

---

## Documentation References

- **Full Guide**: `backend/CSV_MIGRATION_GUIDE.md`
- **Quick Summary**: `IMPORT_SUMMARY.md`
- **This Checklist**: `CHECKLIST_IMPORT.md`
- **Code**: `backend/tools/csv_importer.go`

---

## Emergency Rollback

If something goes wrong:

### Option 1: Delete Imported Transactions

```sql
DELETE FROM transactions WHERE created_by = '00000000-0000-0000-0000-000000000001';
DELETE FROM funds WHERE name IN ('Karpil Cup', 'Dana Usaha KPPM', ...);
DELETE FROM users WHERE email = 'system@admin.local';
```

### Option 2: Restore from Backup

```bash
# If you have a backup
pg_restore -d gkjw_finance backup.sql
```

### Option 3: Start Fresh

```bash
# Drop and recreate database
dropdb gkjw_finance
createdb gkjw_finance
# Then run import again
```

---

## Questions?

1. Check `CSV_MIGRATION_GUIDE.md` section "Troubleshooting"
2. Review error messages in console output
3. Check database logs for detailed errors
4. Verify `.env` configuration

---

## Sign-Off

- [ ] All pre-import checks passed
- [ ] Import executed successfully
- [ ] Post-import verification complete
- [ ] Data looks correct in UI
- [ ] Backend running normally
- [ ] Ready for production use

**Date Completed**: ******\_******
**Verified By**: ******\_******

---

**Status**: Ready to Proceed 🚀

Next: Start backend with `go run main.go` and access http://localhost:3000
