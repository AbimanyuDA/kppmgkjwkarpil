FROM golang:1.21-alpine AS build

WORKDIR /app
COPY . .

WORKDIR /app/backend
RUN go build -o app .

FROM alpine:latest

WORKDIR /app
COPY --from=build /app/backend/app .

EXPOSE 8080

CMD ["./app"]
