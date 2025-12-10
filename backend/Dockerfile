FROM golang:1.21-alpine AS build
WORKDIR /app
COPY . .
RUN go build -o app .

FROM alpine:latest
# Install fonts and dependencies for PDF generation
RUN apk add --no-cache ca-certificates tzdata fontconfig ttf-dejavu
WORKDIR /app
COPY --from=build /app/app .
# Create uploads directory for temporary files
RUN mkdir -p /app/uploads && chmod 777 /app/uploads
EXPOSE 8080
CMD ["sh", "-c", "./app --port ${PORT:-8080}"]