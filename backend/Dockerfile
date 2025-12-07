FROM golang:1.21-alpine AS build

# Folder kerja untuk proses build
WORKDIR /app

# Copy seluruh repository
COPY . .

# Masuk ke folder backend (tempat go.mod berada)
WORKDIR /app/backend

# Build binary
RUN go build -o app .

# Stage final
FROM alpine:latest

WORKDIR /app

# Copy binary dari stage build
COPY --from=build /app/backend/app .

# Port default
EXPOSE 8080

# Jalankan binary
CMD ["sh", "-c", "./app --port ${PORT:-8080}"]
