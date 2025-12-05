package tools

import (
	"encoding/csv"
	"fmt"
	"gkjw-finance-backend/config"
	"gkjw-finance-backend/models"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
)

// CSVRow represents a row from the cashflow CSV
type CSVRow struct {
	Date          string
	Description   string
	DebitBank     string
	DebitCash     string
	CreditBank    string
	CreditCash    string
	SaldoBank     string
	SaldoCash     string
	Source        string
}

// FundMapping maps source names to fund IDs
var FundMapping = map[string]string{
	"Karpil Cup":                 "",
	"Dana Usaha KPPM":            "",
	"CSR":                        "",
	"Natal KPPM":                 "",
	"Kas KPPM":                   "",
	"Retret Ibadah Gabungan":     "",
}

// ParseCSV reads and parses the CSV file
// Handles multi-level headers: Row 2 = "Cashflow Utama" title, Row 3 = main headers, Row 4 = sub-headers, Row 5+ = data
func ParseCSV(filePath string) ([]CSVRow, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to open file: %w", err)
	}
	defer file.Close()

	reader := csv.NewReader(file)
	reader.FieldsPerRecord = -1 // Allow variable fields

	records, err := reader.ReadAll()
	if err != nil {
		return nil, fmt.Errorf("failed to read CSV: %w", err)
	}

	var rows []CSVRow
	dataStartIdx := 0

	// Identify data start: Look for row containing "Tanggal" (main header row)
	// Then skip one more row for sub-headers (Bank/Cash labels)
	for i, record := range records {
		if len(record) > 1 && strings.Contains(strings.ToLower(record[1]), "tanggal") {
			dataStartIdx = i + 2 // Skip main headers + sub-headers
			break
		}
	}

	// If we couldn't find headers with "Tanggal", use default offset
	if dataStartIdx == 0 {
		dataStartIdx = 5 // Default: Skip first 4 rows (empty, title, headers, sub-headers)
	}

	// Parse data rows
	for i := dataStartIdx; i < len(records); i++ {
		record := records[i]
		if len(record) < 11 {
			continue // Skip incomplete rows
		}

		// Skip completely empty rows
		if len(record) > 1 && strings.TrimSpace(record[1]) == "" {
			continue
		}

		row := CSVRow{
			Date:        strings.TrimSpace(record[1]),
			Description: strings.TrimSpace(record[2]),
			DebitBank:   cleanCurrency(record[3]),
			DebitCash:   cleanCurrency(record[4]),
			CreditBank:  cleanCurrency(record[5]),
			CreditCash:  cleanCurrency(record[6]),
			SaldoBank:   cleanCurrency(record[7]),
			SaldoCash:   cleanCurrency(record[8]),
			Source:      cleanCurrency(record[10]), // Source is at index 10, not 11
		}

		if row.Date != "" {
			rows = append(rows, row)
		}
	}

	return rows, nil
}

// cleanCurrency removes "Rp", spaces, and formats Indonesian thousands (dot) and decimals (comma)
// Indonesian format: "Rp 3.113.000,00" = 3113000.00
func cleanCurrency(value string) string {
	value = strings.TrimSpace(value)
	value = strings.ReplaceAll(value, "Rp", "")
	value = strings.ReplaceAll(value, " ", "")
	value = strings.ReplaceAll(value, "\"", "")
	
	// Handle Indonesian number format: dot for thousands, comma for decimal
	// Example: "3.113.000,00" should become "3113000.00"
	// Replace dot (thousands separator) with empty
	value = strings.ReplaceAll(value, ".", "")
	// Replace comma (decimal separator) with dot
	value = strings.ReplaceAll(value, ",", ".")
	
	return value
}

// parseAmount converts cleaned currency string to float64
func parseAmount(s string) (float64, error) {
	if s == "" || s == "-" {
		return 0, nil
	}
	return strconv.ParseFloat(s, 64)
}

// parseDate converts date string from format "DD/MM/YY" to time.Time
func parseDate(dateStr string) (time.Time, error) {
	dateStr = strings.TrimSpace(dateStr)
	
	// Try DD/MM/YY format
	t, err := time.Parse("02/01/06", dateStr)
	if err == nil {
		return t, nil
	}

	// Try DD/MM/YYYY format (in case some rows use it)
	t, err = time.Parse("02/01/2006", dateStr)
	if err == nil {
		return t, nil
	}

	return time.Time{}, fmt.Errorf("invalid date format: %s", dateStr)
}

// GetFundIDByName retrieves or creates a fund by name
func GetFundIDByName(fundName string) (uuid.UUID, error) {
	fundName = strings.TrimSpace(fundName)
	if fundName == "" {
		fundName = "Default Fund"
	}

	var fund models.Fund
	result := config.DB.Where("name = ?", fundName).First(&fund)
	
	if result.Error == nil {
		return fund.ID, nil
	}

	// Create new fund if it doesn't exist
	newFund := models.Fund{
		ID:          uuid.New(),
		Name:        fundName,
		Description: "Imported from CSV: " + fundName,
	}

	if err := config.DB.Create(&newFund).Error; err != nil {
		return uuid.Nil, fmt.Errorf("failed to create fund: %w", err)
	}

	return newFund.ID, nil
}

// ConvertRowToTransaction converts a CSVRow to a Transaction model
func ConvertRowToTransaction(row CSVRow, adminUserID uuid.UUID) (*models.Transaction, error) {
	// Parse date - handle special format like "20/07/25 - Akhir Kapril Cup"
	dateStr := row.Date
	if strings.Contains(dateStr, " - ") {
		parts := strings.Split(dateStr, " - ")
		dateStr = parts[0]
	}
	
	parsedDate, err := parseDate(dateStr)
	if err != nil {
		return nil, err
	}

	// Determine transaction type and amount
	var txType string
	var amount float64

	debitBank, _ := parseAmount(row.DebitBank)
	debitCash, _ := parseAmount(row.DebitCash)
	creditBank, _ := parseAmount(row.CreditBank)
	creditCash, _ := parseAmount(row.CreditCash)
	saldoBank, _ := parseAmount(row.SaldoBank)
	saldoCash, _ := parseAmount(row.SaldoCash)

	totalDebit := debitBank + debitCash
	totalCredit := creditBank + creditCash

	// Skip pure transfer transactions (both debit and credit but same source/fund)
	// Usually these are internal cash transfers like "Pindah Saldo Cash ke Bank"
	descLower := strings.ToLower(row.Description)
	if strings.Contains(descLower, "pindah saldo") || 
	   (strings.Contains(descLower, "transfer") && !strings.Contains(descLower, "transfer hadiah")) {
		return nil, fmt.Errorf("skipping internal transfer: %s", row.Description)
	}

	// Logic to determine transaction type
	if totalDebit > 0 && totalCredit == 0 {
		// Pure income
		txType = "income"
		amount = totalDebit
	} else if totalCredit > 0 && totalDebit == 0 {
		// Pure expense
		txType = "expense"
		amount = totalCredit
	} else if totalDebit > 0 && totalCredit > 0 {
		// Mixed debit/credit - special handling
		// For "Sisa Dana", "Setor", "Pelunasan" - treat as income
		if strings.Contains(descLower, "sisa dana") || 
		   strings.Contains(descLower, "setor") ||
		   strings.Contains(descLower, "pelunasan") ||
		   strings.Contains(descLower, "pengembalian") ||
		   strings.Contains(descLower, "reimburse") {
			txType = "income"
			amount = totalDebit
		} else if totalDebit > totalCredit {
			txType = "income"
			amount = totalDebit - totalCredit
		} else {
			txType = "expense"
			amount = totalCredit - totalDebit
		}
	} else if totalDebit == 0 && totalCredit == 0 {
		// No debit/credit - try to infer from description
		// These are often "Sisa Dana" (opening balance), "Setor" entries
		
		// For "Sisa Dana" (remaining funds) - treat as opening balance / income
		if strings.Contains(descLower, "sisa dana") {
			// Use saldo as the amount - this represents the balance brought forward
			saldoTotal := saldoBank + saldoCash
			if saldoTotal > 0 {
				txType = "income"
				amount = saldoTotal
			} else {
				// If no saldo, skip it
				return nil, fmt.Errorf("skipping: %s (saldo zero)", row.Description)
			}
		} else if strings.Contains(descLower, "setor") ||
		          strings.Contains(descLower, "pendaftar") ||
		          strings.Contains(descLower, "pelunasan") ||
		          strings.Contains(descLower, "persembahan gereja") ||
		          strings.Contains(descLower, "pengembalian") ||
		          strings.Contains(descLower, "reimburse") ||
		          strings.Contains(descLower, "donasi") ||
		          strings.Contains(descLower, "penjualan") ||
		          strings.Contains(descLower, "penghasilan") {
			// These are income-like transactions
			// Use saldo as amount estimate if available
			saldoTotal := saldoBank + saldoCash
			if saldoTotal > 0 {
				txType = "income"
				amount = saldoTotal
			} else {
				return nil, fmt.Errorf("skipping: %s (insufficient data)", row.Description)
			}
		} else if strings.Contains(descLower, "pembayaran") ||
		          strings.Contains(descLower, "pembelian") ||
		          strings.Contains(descLower, "bayar") ||
		          strings.Contains(descLower, "sewa") ||
		          strings.Contains(descLower, "honor") ||
		          strings.Contains(descLower, "fee") ||
		          strings.Contains(descLower, "transport") ||
		          strings.Contains(descLower, "konsum") ||
		          strings.Contains(descLower, "operasional") ||
		          strings.Contains(descLower, "gaji") ||
		          strings.Contains(descLower, "dp ") ||
		          strings.Contains(descLower, "pkt ") {
			// These are expense-like transactions
			saldoTotal := saldoBank + saldoCash
			if saldoTotal > 0 {
				txType = "expense"
				amount = saldoTotal
			} else {
				return nil, fmt.Errorf("skipping: %s (insufficient data)", row.Description)
			}
		} else {
			return nil, fmt.Errorf("skipping: %s (no debit/credit and unclear type)", row.Description)
		}
	} else {
		return nil, fmt.Errorf("unable to determine transaction type for: %s", row.Description)
	}

	// Skip transactions with zero amount
	if amount <= 0 {
		return nil, fmt.Errorf("skipping zero-amount transaction: %s", row.Description)
	}

	// Determine payment method (prefer bank if either debit/credit was bank)
	var paymentMethod string
	if debitBank > 0 || creditBank > 0 {
		paymentMethod = "bank"
	} else if saldoBank > 0 && saldoCash == 0 {
		paymentMethod = "bank"
	} else {
		paymentMethod = "cash"
	}

	// Normalize EventName from CSV Source
	eventName := normalizeEventName(row.Source)

	// Get fund ID using normalized event name
	fundID, err := GetFundIDByName(eventName)
	if err != nil {
		return nil, fmt.Errorf("failed to get fund for '%s': %w", eventName, err)
	}

	// Extract category from description
	category := extractCategory(row.Description, txType)

	transaction := &models.Transaction{
		ID:            uuid.New(),
		FundID:        fundID,
		Type:          txType,
		Amount:        amount,
		Category:      category,
		Description:   row.Description,
		EventName:     eventName,
		PaymentMethod: paymentMethod,
		Date:          parsedDate,
		CreatedBy:     adminUserID,
		Status:        "approved", // Old data is assumed valid
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}

	return transaction, nil
}

// normalizeEventName consolidates similar event names with different spacing/casing
func normalizeEventName(source string) string {
	source = strings.TrimSpace(source)
	sourceLower := strings.ToLower(source)
	
	// Map variations to canonical names
	if strings.Contains(sourceLower, "retret") && strings.Contains(sourceLower, "gabungan") {
		return "Retret Gabungan KMD 2025"
	} else if strings.Contains(sourceLower, "natal") {
		return "Natal KPPM 2024"
	} else if strings.Contains(sourceLower, "kas kppm") || strings.Contains(sourceLower, "kaskppm") {
		return "Dana Kas KPPM"
	} else if strings.Contains(sourceLower, "karpil") {
		return "Karpil Cup"
	} else if strings.Contains(sourceLower, "dana usaha") || strings.Contains(sourceLower, "danausaha") {
		return "Dana Usaha KPPM"
	} else if strings.Contains(sourceLower, "csr") {
		return "CSR"
	}
	
	// Return original if no mapping found
	return source
}

// extractCategory tries to extract a category from description
func extractCategory(description string, txType string) string {
	desc := strings.ToLower(description)

	if txType == "expense" {
		// Expense categories
		if strings.Contains(desc, "sewa") {
			return "Sewa"
		} else if strings.Contains(desc, "transport") || strings.Contains(desc, "grab") || strings.Contains(desc, "bensin") {
			return "Transport"
		} else if strings.Contains(desc, "makan") || strings.Contains(desc, "konsum") || strings.Contains(desc, "bazar") {
			return "Konsumsi"
		} else if strings.Contains(desc, "honor") || strings.Contains(desc, "fee") || strings.Contains(desc, "gaji") || strings.Contains(desc, "wasit") {
			return "Honor"
		} else if strings.Contains(desc, "peralatan") || strings.Contains(desc, "barang") || strings.Contains(desc, "belanja") || strings.Contains(desc, "pembelian") {
			return "Peralatan"
		} else if strings.Contains(desc, "perbaikan") || strings.Contains(desc, "maintenance") {
			return "Perbaikan"
		}
		return "Pengeluaran Lain"
	} else {
		// Income categories
		if strings.Contains(desc, "penjualan") || strings.Contains(desc, "jualan") {
			return "Penjualan"
		} else if strings.Contains(desc, "persembahan") || strings.Contains(desc, "iuran") || strings.Contains(desc, "donasi") || strings.Contains(desc, "setor") {
			return "Donasi"
		} else if strings.Contains(desc, "bazar") {
			return "Bazar"
		} else if strings.Contains(desc, "ngamen") {
			return "Ngamen"
		} else if strings.Contains(desc, "pkt") || strings.Contains(desc, "persembahan") {
			return "PKT"
		} else if strings.Contains(desc, "sisa dana") || strings.Contains(desc, "pendaftar") || strings.Contains(desc, "pelunasan") {
			return "Pendapatan Khusus"
		}
		return "Pendapatan Lain"
	}
}

// ImportTransactions performs bulk import of transactions
func ImportTransactions(filePath string, adminUserID uuid.UUID) (int, int, error) {
	rows, err := ParseCSV(filePath)
	if err != nil {
		return 0, 0, err
	}

	fmt.Printf("Parsed %d rows from CSV\n", len(rows))

	// Ensure admin user exists
	var user models.User
	if result := config.DB.Where("id = ?", adminUserID).First(&user); result.Error != nil {
		// Create system admin user if doesn't exist
		user = models.User{
			ID:           adminUserID,
			Email:        "system@admin.local",
			Name:         "System Admin",
			PasswordHash: "system-migration",
			Role:         "admin",
		}
		if err := config.DB.Create(&user).Error; err != nil {
			return 0, 0, fmt.Errorf("failed to create system admin user: %w", err)
		}
		fmt.Println("Created system admin user for import")
	}

	successCount := 0
	errorCount := 0

	for i, row := range rows {
		transaction, err := ConvertRowToTransaction(row, adminUserID)
		if err != nil {
			fmt.Printf("Row %d error: %v\n", i+1, err)
			errorCount++
			continue
		}

		if err := config.DB.Create(transaction).Error; err != nil {
			fmt.Printf("Failed to create transaction for '%s': %v\n", row.Description, err)
			errorCount++
			continue
		}

		successCount++
		if successCount%50 == 0 {
			fmt.Printf("Imported %d transactions...\n", successCount)
		}
	}

	return successCount, errorCount, nil
}
