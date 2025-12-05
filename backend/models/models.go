package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID           uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Name         string    `gorm:"not null" json:"name"`
	Email        string    `gorm:"unique;not null" json:"email"`
	PasswordHash string    `gorm:"not null" json:"-"`
	Role         string    `gorm:"not null" json:"role"` // admin, member, viewer
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

type Transaction struct {
	ID              uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	FundID          uuid.UUID `gorm:"type:uuid" json:"fundId"`
	Fund            *Fund     `gorm:"foreignKey:FundID" json:"fund,omitempty"`
	Type            string    `gorm:"not null" json:"type"`                         // income, expense
	PaymentMethod   string    `gorm:"not null;default:'cash'" json:"paymentMethod"` // cash, bank
	Amount          float64   `gorm:"not null" json:"amount"`
	Category        string    `gorm:"not null" json:"category"`
	Description     string    `json:"description"`
	EventName       string    `gorm:"not null" json:"eventName"`
	Date            time.Time `gorm:"not null" json:"date"`
	CreatedBy       uuid.UUID `gorm:"type:uuid;not null" json:"createdBy"`
	CreatedByUser   *User     `gorm:"foreignKey:CreatedBy" json:"createdByUser,omitempty"`
	Status          string    `gorm:"not null;default:'pending'" json:"status"` // pending, approved, rejected
	NoteURL         string    `json:"noteUrl,omitempty"`
	RejectionReason string    `json:"rejectionReason,omitempty"`
	CreatedAt       time.Time `json:"createdAt"`
	UpdatedAt       time.Time `json:"updatedAt"`
}

type ActivityLog struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID    uuid.UUID `gorm:"type:uuid;not null" json:"userId"`
	User      *User     `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Action    string    `gorm:"not null" json:"action"`
	Timestamp time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"timestamp"`
}

// BeforeCreate hook for User
func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return nil
}

// BeforeCreate hook for Transaction
func (t *Transaction) BeforeCreate(tx *gorm.DB) error {
	if t.ID == uuid.Nil {
		t.ID = uuid.New()
	}
	return nil
}

// Fund represents a project / program fund envelope
type Fund struct {
	ID          uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Name        string    `gorm:"unique;not null" json:"name"`
	Description string    `json:"description"`
	Status      string    `gorm:"not null;default:'active'" json:"status"` // active, archived
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

// BeforeCreate hook for Fund
func (f *Fund) BeforeCreate(tx *gorm.DB) error {
	if f.ID == uuid.Nil {
		f.ID = uuid.New()
	}
	return nil
}

// Category represents transaction category label (can be used for both income and expense)
type Category struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Type      string    `gorm:"not null;default:'general';index:idx_categories_type_name" json:"type"` // income, expense, or general
	Name      string    `gorm:"not null;index:idx_categories_type_name" json:"name"`                   // category name
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// BeforeCreate hook for Category
func (c *Category) BeforeCreate(tx *gorm.DB) error {
	if c.ID == uuid.Nil {
		c.ID = uuid.New()
	}
	return nil
}

// BeforeCreate hook for ActivityLog
func (a *ActivityLog) BeforeCreate(tx *gorm.DB) error {
	if a.ID == uuid.Nil {
		a.ID = uuid.New()
	}
	return nil
}
