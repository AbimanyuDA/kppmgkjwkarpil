# Build stage
FROM golang:1.21-alpine AS build
WORKDIR /app

# Copy go mod files first for better caching
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o app .

# Runtime stage
FROM alpine:latest

# Install fonts and dependencies for PDF generation
RUN apk add --no-cache ca-certificates tzdata fontconfig ttf-dejavu ttf-liberation

WORKDIR /app

# Copy binary from build stage
COPY --from=build /app/app .

# Create uploads directory for temporary files
RUN mkdir -p /app/uploads && chmod 777 /app/uploads

# Expose port
EXPOSE 8080

# Run the application
CMD ["sh", "-c", "./app"]