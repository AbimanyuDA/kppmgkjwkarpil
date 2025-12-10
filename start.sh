#!/bin/sh
# Install fonts for PDF generation (runtime only)
apk add --no-cache fontconfig ttf-dejavu ttf-liberation ca-certificates > /dev/null 2>&1 || true

# Navigate to backend and run the application
cd backend && ./app
