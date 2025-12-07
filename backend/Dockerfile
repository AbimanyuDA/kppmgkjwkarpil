# syntax=docker/dockerfile:1
FROM golang:1.21-alpine AS build
WORKDIR /app
COPY . .
RUN go build -o app .

FROM alpine:latest
WORKDIR /app
COPY --from=build /app/app .
EXPOSE 8080
# Render akan set $PORT, gunakan di CMD
CMD ["sh", "-c", "./app --port ${PORT:-8080}"]