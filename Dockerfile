FROM golang:1.21-alpine AS build

WORKDIR /app
COPY . .

WORKDIR /app/backend
RUN go mod download
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o app .

FROM alpine:latest

# Install fonts and dependencies for PDF generation
RUN apk add --no-cache ca-certificates tzdata fontconfig ttf-dejavu ttf-liberation

WORKDIR /app
COPY --from=build /app/backend/app ./app

# Create uploads directory
RUN mkdir -p /app/uploads && chmod 777 /app/uploads

EXPOSE 8080

CMD ["/app/app"]
