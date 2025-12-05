package handlers

import (
	"fmt"
	"gkjw-finance-backend/config"
	"gkjw-finance-backend/models"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jung-kurt/gofpdf"
	"github.com/xuri/excelize/v2"
)

func GetReports(c *gin.Context) {
	var transactions []models.Transaction

	query := config.DB.Preload("CreatedByUser").Preload("Fund").Where("status = ?", "approved")

	// Filter by date range
	if startDate := c.Query("startDate"); startDate != "" {
		query = query.Where("date >= ?", startDate)
	}
	if endDate := c.Query("endDate"); endDate != "" {
		query = query.Where("date <= ?", endDate)
	}

	// Filter by type
	if txType := c.Query("type"); txType != "" {
		query = query.Where("type = ?", txType)
	}

	// Filter by category
	if category := c.Query("category"); category != "" {
		query = query.Where("category = ?", category)
	}

	// Filter by fund
	if fundID := c.Query("fundId"); fundID != "" && fundID != "all" {
		query = query.Where("fund_id = ?", fundID)
	}

	query = query.Order("date ASC")

	if err := query.Find(&transactions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch transactions"})
		return
	}

	// Calculate summary
	var totalIncome, totalExpense float64
	for _, t := range transactions {
		if t.Type == "income" {
			totalIncome += t.Amount
		} else {
			totalExpense += t.Amount
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"data": transactions,
		"summary": gin.H{
			"totalIncome":  totalIncome,
			"totalExpense": totalExpense,
			"balance":      totalIncome - totalExpense,
			"count":        len(transactions),
		},
	})
}

func ExportPDF(c *gin.Context) {
	// Fetch transactions
	var transactions []models.Transaction
	query := config.DB.Preload("CreatedByUser").Preload("Fund").Where("status = ?", "approved")

	if startDate := c.Query("startDate"); startDate != "" {
		query = query.Where("date >= ?", startDate)
	}
	if endDate := c.Query("endDate"); endDate != "" {
		query = query.Where("date <= ?", endDate)
	}
	if txType := c.Query("type"); txType != "" && txType != "all" {
		query = query.Where("type = ?", txType)
	}
	if category := c.Query("category"); category != "" && category != "all" {
		query = query.Where("category = ?", category)
	}
	if fundID := c.Query("fundId"); fundID != "" && fundID != "all" {
		query = query.Where("fund_id = ?", fundID)
	}

	if err := query.Order("date ASC").Find(&transactions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch transactions"})
		return
	}

	// Calculate summary
	var totalIncome, totalExpense float64
	for _, tx := range transactions {
		if tx.Type == "income" {
			totalIncome += tx.Amount
		} else {
			totalExpense += tx.Amount
		}
	}

	// Create PDF
	pdf := gofpdf.New("L", "mm", "A4", "")
	pdf.AddPage()

	// Title
	pdf.SetFont("Arial", "B", 16)
	pdf.Cell(0, 10, "LAPORAN KEUANGAN GKJW KARANGPILANG")
	pdf.Ln(8)

	// Period
	pdf.SetFont("Arial", "", 10)
	periodText := "Periode: "
	if c.Query("startDate") != "" {
		periodText += c.Query("startDate")
	} else {
		periodText += "Awal"
	}
	periodText += " s/d "
	if c.Query("endDate") != "" {
		periodText += c.Query("endDate")
	} else {
		periodText += "Sekarang"
	}
	pdf.Cell(0, 6, periodText)
	pdf.Ln(8)

	// Summary
	pdf.SetFont("Arial", "B", 11)
	pdf.Cell(70, 7, fmt.Sprintf("Total Pemasukan: Rp %.0f", totalIncome))
	pdf.Cell(70, 7, fmt.Sprintf("Total Pengeluaran: Rp %.0f", totalExpense))
	pdf.Cell(70, 7, fmt.Sprintf("Saldo: Rp %.0f", totalIncome-totalExpense))
	pdf.Ln(10)

	// Table Header
	pdf.SetFont("Arial", "B", 9)
	pdf.SetFillColor(59, 130, 246)
	pdf.SetTextColor(255, 255, 255)
	pdf.CellFormat(25, 8, "Tanggal", "1", 0, "C", true, 0, "")
	pdf.CellFormat(50, 8, "Kegiatan", "1", 0, "C", true, 0, "")
	pdf.CellFormat(25, 8, "Kategori", "1", 0, "C", true, 0, "")
	pdf.CellFormat(45, 8, "Keterangan", "1", 0, "C", true, 0, "")
	pdf.CellFormat(28, 8, "Pemasukan", "1", 0, "C", true, 0, "")
	pdf.CellFormat(28, 8, "Pengeluaran", "1", 0, "C", true, 0, "")
	pdf.CellFormat(35, 8, "Saldo", "1", 1, "C", true, 0, "")

	// Table Body - Cashflow format
	pdf.SetFont("Arial", "", 8)
	pdf.SetTextColor(0, 0, 0)
	fill := false
	runningBalance := 0.0
	
	for _, tx := range transactions {
		if fill {
			pdf.SetFillColor(240, 240, 240)
		} else {
			pdf.SetFillColor(255, 255, 255)
		}

		// Update running balance
		if tx.Type == "income" {
			runningBalance += tx.Amount
		} else {
			runningBalance -= tx.Amount
		}

		incomeStr := "-"
		expenseStr := "-"
		if tx.Type == "income" {
			incomeStr = fmt.Sprintf("Rp %.0f", tx.Amount)
		} else {
			expenseStr = fmt.Sprintf("Rp %.0f", tx.Amount)
		}

		pdf.CellFormat(25, 7, tx.Date.Format("02/01/2006"), "1", 0, "C", fill, 0, "")
		pdf.CellFormat(50, 7, truncateString(tx.EventName, 30), "1", 0, "L", fill, 0, "")
		pdf.CellFormat(25, 7, truncateString(tx.Category, 12), "1", 0, "C", fill, 0, "")
		pdf.CellFormat(45, 7, truncateString(tx.Description, 25), "1", 0, "L", fill, 0, "")
		pdf.CellFormat(28, 7, incomeStr, "1", 0, "R", fill, 0, "")
		pdf.CellFormat(28, 7, expenseStr, "1", 0, "R", fill, 0, "")
		pdf.CellFormat(35, 7, fmt.Sprintf("Rp %.0f", runningBalance), "1", 1, "R", fill, 0, "")
		fill = !fill
	}

	// Total Row
	pdf.SetFont("Arial", "B", 9)
	pdf.SetFillColor(59, 130, 246)
	pdf.SetTextColor(255, 255, 255)
	pdf.CellFormat(145, 8, "TOTAL", "1", 0, "R", true, 0, "")
	pdf.CellFormat(28, 8, fmt.Sprintf("Rp %.0f", totalIncome), "1", 0, "R", true, 0, "")
	pdf.CellFormat(28, 8, fmt.Sprintf("Rp %.0f", totalExpense), "1", 0, "R", true, 0, "")
	pdf.CellFormat(35, 8, fmt.Sprintf("Rp %.0f", totalIncome-totalExpense), "1", 1, "R", true, 0, "")

	// Output PDF
	filename := fmt.Sprintf("laporan_keuangan_%s.pdf", time.Now().Format("20060102150405"))
	filepath := "./uploads/" + filename

	if err := pdf.OutputFileAndClose(filepath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate PDF"})
		return
	}

	c.FileAttachment(filepath, filename)

	// Clean up file after sending
	go func() {
		time.Sleep(5 * time.Second)
		os.Remove(filepath)
	}()
}

func truncateString(s string, maxLen int) string {
	if len(s) <= maxLen {
		return s
	}
	return s[:maxLen-3] + "..."
}

func ExportExcel(c *gin.Context) {
	// Fetch transactions
	var transactions []models.Transaction
	query := config.DB.Preload("CreatedByUser").Where("status = ?", "approved")

	if startDate := c.Query("startDate"); startDate != "" {
		query = query.Where("date >= ?", startDate)
	}
	if endDate := c.Query("endDate"); endDate != "" {
		query = query.Where("date <= ?", endDate)
	}
	if txType := c.Query("type"); txType != "" && txType != "all" {
		query = query.Where("type = ?", txType)
	}
	if category := c.Query("category"); category != "" && category != "all" {
		query = query.Where("category = ?", category)
	}

	if err := query.Order("date ASC").Find(&transactions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch transactions"})
		return
	}

	// Calculate summary
	var totalIncome, totalExpense float64
	for _, tx := range transactions {
		if tx.Type == "income" {
			totalIncome += tx.Amount
		} else {
			totalExpense += tx.Amount
		}
	}

	// Create Excel file
	f := excelize.NewFile()
	sheetName := "Laporan Keuangan"
	index, _ := f.NewSheet(sheetName)
	f.SetActiveSheet(index)
	f.DeleteSheet("Sheet1")

	// Title
	f.SetCellValue(sheetName, "A1", "LAPORAN KEUANGAN GKJW KARANGPILANG")
	titleStyle, _ := f.NewStyle(&excelize.Style{
		Font: &excelize.Font{Bold: true, Size: 14},
		Alignment: &excelize.Alignment{
			Horizontal: "center",
			Vertical:   "center",
		},
	})
	f.SetCellStyle(sheetName, "A1", "G1", titleStyle)
	f.MergeCell(sheetName, "A1", "G1")
	f.SetRowHeight(sheetName, 1, 25)

	// Period
	periodText := "Periode: "
	if c.Query("startDate") != "" {
		periodText += c.Query("startDate")
	} else {
		periodText += "Awal"
	}
	periodText += " s/d "
	if c.Query("endDate") != "" {
		periodText += c.Query("endDate")
	} else {
		periodText += "Sekarang"
	}
	f.SetCellValue(sheetName, "A2", periodText)
	f.MergeCell(sheetName, "A2", "G2")

	// Summary
	f.SetCellValue(sheetName, "A4", "RINGKASAN")
	f.SetCellValue(sheetName, "A5", "Total Pemasukan:")
	f.SetCellValue(sheetName, "B5", totalIncome)
	f.SetCellValue(sheetName, "A6", "Total Pengeluaran:")
	f.SetCellValue(sheetName, "B6", totalExpense)
	f.SetCellValue(sheetName, "A7", "Saldo:")
	f.SetCellValue(sheetName, "B7", totalIncome-totalExpense)

	summaryStyle, _ := f.NewStyle(&excelize.Style{
		Font: &excelize.Font{Bold: true},
	})
	f.SetCellStyle(sheetName, "A4", "A7", summaryStyle)

	numberStyle, _ := f.NewStyle(&excelize.Style{
		NumFmt: 3, // #,##0
	})
	f.SetCellStyle(sheetName, "B5", "B7", numberStyle)

	// Table Headers - Cashflow format
	row := 9
	headers := []string{"Tanggal", "Kegiatan", "Kategori", "Pemasukan", "Pengeluaran", "Saldo Akhir"}
	for col, header := range headers {
		cell, _ := excelize.CoordinatesToCellName(col+1, row)
		f.SetCellValue(sheetName, cell, header)
	}

	headerStyle, _ := f.NewStyle(&excelize.Style{
		Font: &excelize.Font{Bold: true, Color: "FFFFFF"},
		Fill: excelize.Fill{Type: "pattern", Color: []string{"3B82F6"}, Pattern: 1},
		Alignment: &excelize.Alignment{
			Horizontal: "center",
			Vertical:   "center",
		},
		Border: []excelize.Border{
			{Type: "left", Color: "000000", Style: 1},
			{Type: "top", Color: "000000", Style: 1},
			{Type: "bottom", Color: "000000", Style: 1},
			{Type: "right", Color: "000000", Style: 1},
		},
	})
	f.SetCellStyle(sheetName, "A9", "F9", headerStyle)

	// Data Rows - Cashflow format
	row = 10
	runningBalance := 0.0
	for _, tx := range transactions {
		// Update running balance
		if tx.Type == "income" {
			runningBalance += tx.Amount
		} else {
			runningBalance -= tx.Amount
		}

		f.SetCellValue(sheetName, fmt.Sprintf("A%d", row), tx.Date.Format("02/01/2006"))
		f.SetCellValue(sheetName, fmt.Sprintf("B%d", row), tx.EventName)
		f.SetCellValue(sheetName, fmt.Sprintf("C%d", row), tx.Category)
		
		// Pemasukan column
		if tx.Type == "income" {
			f.SetCellValue(sheetName, fmt.Sprintf("D%d", row), tx.Amount)
		} else {
			f.SetCellValue(sheetName, fmt.Sprintf("D%d", row), "-")
		}
		
		// Pengeluaran column
		if tx.Type == "expense" {
			f.SetCellValue(sheetName, fmt.Sprintf("E%d", row), tx.Amount)
		} else {
			f.SetCellValue(sheetName, fmt.Sprintf("E%d", row), "-")
		}
		
		// Saldo column
		f.SetCellValue(sheetName, fmt.Sprintf("F%d", row), runningBalance)
		row++
	}

	// Apply number format to amount columns
	if len(transactions) > 0 {
		f.SetCellStyle(sheetName, "D10", fmt.Sprintf("D%d", row-1), numberStyle)
		f.SetCellStyle(sheetName, "E10", fmt.Sprintf("E%d", row-1), numberStyle)
		f.SetCellStyle(sheetName, "F10", fmt.Sprintf("F%d", row-1), numberStyle)
	}

	// Total Row
	totalRow := row
	totalStyle, _ := f.NewStyle(&excelize.Style{
		Font: &excelize.Font{Bold: true, Color: "FFFFFF"},
		Fill: excelize.Fill{Type: "pattern", Color: []string{"3B82F6"}, Pattern: 1},
		Alignment: &excelize.Alignment{Horizontal: "right"},
		NumFmt: 3,
	})
	
	f.SetCellValue(sheetName, fmt.Sprintf("A%d", totalRow), "TOTAL")
	f.MergeCell(sheetName, fmt.Sprintf("A%d", totalRow), fmt.Sprintf("C%d", totalRow))
	f.SetCellValue(sheetName, fmt.Sprintf("D%d", totalRow), totalIncome)
	f.SetCellValue(sheetName, fmt.Sprintf("E%d", totalRow), totalExpense)
	f.SetCellValue(sheetName, fmt.Sprintf("F%d", totalRow), totalIncome-totalExpense)
	f.SetCellStyle(sheetName, fmt.Sprintf("A%d", totalRow), fmt.Sprintf("F%d", totalRow), totalStyle)

	// Set column widths
	f.SetColWidth(sheetName, "A", "A", 12)
	f.SetColWidth(sheetName, "B", "B", 35)
	f.SetColWidth(sheetName, "C", "C", 20)
	f.SetColWidth(sheetName, "D", "D", 15)
	f.SetColWidth(sheetName, "E", "E", 15)
	f.SetColWidth(sheetName, "F", "F", 18)

	// Save file
	filename := fmt.Sprintf("laporan_keuangan_%s.xlsx", time.Now().Format("20060102150405"))
	filepath := "./uploads/" + filename

	if err := f.SaveAs(filepath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate Excel file"})
		return
	}

	c.FileAttachment(filepath, filename)

	// Clean up file after sending
	go func() {
		time.Sleep(5 * time.Second)
		os.Remove(filepath)
	}()
}

func UploadFile(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file provided", "details": err.Error()})
		return
	}

	// Validate file size (max 5MB)
	maxSize := int64(5 * 1024 * 1024) // 5MB
	if file.Size > maxSize {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File size exceeds 5MB limit"})
		return
	}

	// Create uploads directory if not exists
	os.MkdirAll("./uploads", os.ModePerm)

	// Generate unique filename
	filename := time.Now().Format("20060102150405") + "_" + file.Filename
	
	// Save file to uploads directory
	uploadPath := "./uploads/" + filename
	if err := c.SaveUploadedFile(file, uploadPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file", "details": err.Error()})
		return
	}

	// In production, you should upload to Firebase Storage or S3
	// and return the public URL
	fileURL := "/uploads/" + filename

	c.JSON(http.StatusOK, gin.H{
		"message": "File uploaded successfully",
		"data": gin.H{
			"url":      fileURL,
			"filename": filename,
		},
	})
}
