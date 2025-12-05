package tools

import (
	"fmt"

	"golang.org/x/crypto/bcrypt"
)

func GeneratePasswordHashes() {
	passwords := map[string]string{
		"admin123":  "",
		"member123": "",
	}

	for password := range passwords {
		hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
		if err != nil {
			fmt.Println("Error:", err)
			continue
		}
		passwords[password] = string(hash)
		fmt.Printf("Password: %s\n", password)
		fmt.Printf("Hash: %s\n\n", string(hash))
	}
}
