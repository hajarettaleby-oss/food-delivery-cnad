Add project README
# Food Delivery Backend – Cloud Native Architecture

## 1. Project Overview

This project implements a cloud-native microservices backend for a Food Delivery platform.

The system is composed of three independent services:

- Restaurant Service
- Menu Service
- Order Service

The services communicate via REST APIs and are exposed through a single API Gateway.  
The system is containerized using Docker and orchestrated with Docker Compose.  
The Order Service is also deployed to Google App Engine (Standard) as part of the cloud integration requirement.

---

## 2. Architecture

### Local Architecture

- API Gateway (Nginx) – Port 8080
- Restaurant Service – Port 3001
- Menu Service – Port 3002
- Order Service – Port 3003
- Docker bridge network (backend-net)

All services communicate internally inside the Docker network.  
Only the API Gateway exposes port 8080 to the client.

Primary operation: Create Order

Flow:

1. Client sends `POST /orders` to API Gateway.
2. Gateway forwards request to Order Service.
3. Order Service validates the request body.
4. Order Service calls Restaurant Service to verify restaurant existence.
5. Order Service calls Menu Service to verify menu item.
6. Order Service computes total price.
7. Response is returned through API Gateway to the client.

See: `architecture-diagram.png`

---

## 3. Run Locally

### Requirements

- Node.js (v18+)
- Docker
- Docker Compose

### Start the system

From the root directory:
docker-compose up --build

All routes must be accessed via:
http://localhost:8080


Direct access to ports 3001, 3002, and 3003 is not allowed.

---

## 4. Services Description

### Restaurant Service (Port 3001)

- GET /restaurants
- GET /restaurants/:id
- GET /health
- Returns structured responses including service identifier

### Menu Service (Port 3002)

- GET /menu/:restaurantId
- POST /menu
- Verifies restaurant existence via REST call
- GET /health

### Order Service (Port 3003)

- POST /orders
- GET /orders
- GET /orders/:id
- Validates restaurant and menu item
- Computes total price
- Returns appropriate HTTP status codes
- GET /health

---

## 5. API Gateway

The API Gateway is implemented using Nginx.

Responsibilities:

- Single entry point on Port 8080
- Route forwarding to internal services
- CORS handling
- Rate limiting
- X-Gateway header injection

Routes:

- /restaurants → Restaurant Service
- /menu → Menu Service
- /orders → Order Service
- /gateway/health → Gateway health endpoint

---
## 6. Logging & Correlation ID

Each microservice implements a request/response logging middleware.

For every request, the following information is logged:

- Timestamp
- HTTP Method
- Request Path
- Response Status Code
- Request Duration
- Service Identifier
- Correlation ID

The API Gateway generates a Correlation ID using Nginx's built-in `$request_id`.

The ID is forwarded to all services through the `X-Correlation-ID` header.

Each service logs this Correlation ID, enabling distributed request tracing across the microservices architecture.

This allows tracking a single client request across:

Client → API Gateway → Order Service → Restaurant Service → Menu Service
---
## 7. Docker Orchestration

The system is orchestrated using docker-compose.yml.

Features:

- Isolated backend network
- Environment variable configuration
- Service-to-service communication via container DNS
- Restart policies
- Health checks

The entire system starts with:
docker-compose up --build


---
## 8. Cloud Platform Integration

### Firebase Firestore (Persistent Storage)

The Order Service uses Firebase Firestore as a managed NoSQL cloud database.

Instead of storing orders in memory, orders are persisted in a Firestore collection.

Benefits:

- Persistent storage (data survives container restarts)
- Managed NoSQL database
- Automatic scaling
- No manual database server management
- Production-ready durability

This replaces in-memory arrays typically used in simple Node.js services.

---

### Google App Engine Deployment

The Order Service is deployed to Google App Engine (Standard Environment).

Deployment command:
gcloud app deploy

Live URL:
https://cnad-food-delivery.oa.r.appspot.com

Cloud Features:

- Managed runtime
- Automatic scaling
- Scaling to zero
- High availability infrastructure

---

## 9. Environment Variables

Environment variables used:

- PORT
- RESTAURANT_SERVICE_URL
- MENU_SERVICE_URL

Defined in:
- docker-compose.yml (local execution)
- App Engine configuration (cloud execution)

---

## 10. Health Checks

Each service exposes:
GET /health


Used for monitoring and production readiness verification.

---

## 11. Postman Collection

The Postman collection for testing all endpoints is included in:

postman-collection.json

---

## 12. AI Usage Declaration

AI assistance was used to:

- Improve response structure consistency
- Refactor error handling
- Clarify architectural documentation

All suggestions were reviewed and validated before integration.
