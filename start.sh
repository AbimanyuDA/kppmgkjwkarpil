#!/bin/sh
# Install fonts if not exists
if ! apk info fontconfig > /dev/null 2>&1; then
    echo "Installing fonts..."
    apk add --no-cache fontconfig ttf-dejavu ttf-liberation ca-certificates
fi

# Run the application
cd backend && ./app
