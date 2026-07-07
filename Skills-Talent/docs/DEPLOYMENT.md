# Deployment Guide

## Prerequisites
- Java 17+
- Node.js 16+
- PostgreSQL 12+
- Docker (optional)

## Backend Setup

### 1. Environment Configuration
Create `.env` file in backend directory:
```
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/skillset
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=password
JWT_SECRET=MyVerySecureSecretKeyForJWTTokenGenerationAndValidation
JWT_EXPIRATION=86400000
```

### 2. Build Backend
```bash
cd backend/app
mvn clean package
```

### 3. Run Backend
```bash
mvn spring-boot:run
```

Backend will be available at `http://localhost:8080`

## Frontend Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Environment Configuration
Create `.env` file:
```
VITE_API_URL=http://localhost:8080/api
```

### 3. Run Development Server
```bash
npm run dev
```

Frontend will be available at `http://localhost:5173`

### 4. Build for Production
```bash
npm run build
```

## Docker Deployment

### 1. Build Docker Images
```bash
docker-compose build
```

### 2. Start Services
```bash
docker-compose up
```

### 3. Access Application
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8080/api`

## Database Migrations

Run SQL migrations or use JPA auto-update:
```
spring.jpa.hibernate.ddl-auto=update
```

## Production Considerations
- Enable HTTPS/SSL
- Configure CORS properly
- Set up monitoring and logging
- Implement rate limiting
- Configure automated backups
- Use environment-specific configurations
