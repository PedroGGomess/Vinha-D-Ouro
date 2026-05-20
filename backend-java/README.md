# Vinha D'Ouro Backend - Spring Boot Application

Complete Spring Boot 3.2 backend for the Vinha D'Ouro wine shop management system.

## Project Structure

```
backend/
├── pom.xml
├── src/main/java/pt/vinhadouro/
│   ├── VinhaDouroApplication.java
│   ├── config/
│   │   ├── WebConfig.java (CORS configuration)
│   │   └── SecurityConfig.java (Security configuration)
│   ├── model/
│   │   ├── Pessoa.java
│   │   ├── Funcionario.java
│   │   ├── Utilizador.java
│   │   ├── Vinho.java
│   │   ├── Venda.java
│   │   └── ItemVenda.java
│   ├── repository/
│   │   ├── PessoaRepository.java
│   │   ├── FuncionarioRepository.java
│   │   ├── UtilizadorRepository.java
│   │   ├── VinhoRepository.java
│   │   ├── VendaRepository.java
│   │   └── ItemVendaRepository.java
│   ├── service/
│   │   ├── AuthService.java
│   │   ├── VinhoService.java
│   │   ├── VendaService.java
│   │   ├── FuncionarioService.java
│   │   └── DashboardService.java
│   ├── controller/
│   │   ├── AuthController.java
│   │   ├── VinhoController.java
│   │   ├── VendaController.java
│   │   ├── FuncionarioController.java
│   │   └── DashboardController.java
│   └── dto/
│       ├── LoginRequest.java
│       ├── LoginResponse.java
│       ├── DashboardDTO.java
│       ├── VendaRequest.java
│       └── VinhoStockRequest.java
└── src/main/resources/
    ├── application.properties
    └── application-dev.properties
```

## Requirements

- Java 17 or higher
- Maven 3.6+
- MySQL 8.0+
- Spring Boot 3.2

## Database Setup

### Prerequisites
Ensure MySQL is running and you have the existing `vinhadouro` database with these tables:
- pessoas
- funcionarios
- utilizadores
- vinhos
- vendas
- itens_venda

### Configuration
Update `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/vinhadouro?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=your_password
```

## Build and Run

### Development Environment
```bash
mvn clean install
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"
```

### Production Build
```bash
mvn clean install
java -jar target/vinhadouro-backend-1.0.0.jar
```

The application will be available at `http://localhost:8080`

## API Endpoints

### Authentication
- **POST** `/api/login` - User login
  ```json
  {
    "username": "user123",
    "password": "password123"
  }
  ```
  Response:
  ```json
  {
    "userId": 1,
    "message": "Login realizado com sucesso",
    "success": true,
    "role": "USER",
    "redirect": "/dashboard"
  }
  ```

- **GET** `/api/health` - Health check

### Dashboard
- **GET** `/api/dashboard` - Get dashboard KPIs
  ```json
  {
    "totalVendas": 15,
    "totalReceita": 450.50,
    "vinhosEmStock": 42,
    "vinhoBaixoStock": 5
  }
  ```

### Wines
- **GET** `/api/vinhos` - List all active wines
- **GET** `/api/vinhos/{id}` - Get wine by ID
- **POST** `/api/vinhos` - Create new wine
- **PUT** `/api/vinhos/{id}` - Update wine
- **PUT** `/api/vinhos/{id}/stock` - Update wine stock
  ```json
  {
    "stock": 50
  }
  ```
- **GET** `/api/vinhos/low-stock/list` - Get wines with low stock
- **DELETE** `/api/vinhos/{id}` - Delete (deactivate) wine

### Sales
- **GET** `/api/vendas` - List all sales
- **GET** `/api/vendas/{id}` - Get sale by ID
- **POST** `/api/vendas` - Create new sale
  ```json
  {
    "utilizador": {
      "id": 1
    },
    "cliente": {
      "id": 2
    },
    "itens": [
      {
        "vinho": {
          "id": 5
        },
        "quantidade": 2
      }
    ]
  }
  ```
- **GET** `/api/vendas/{id}/itens` - Get sale items

### Employees
- **GET** `/api/funcionarios` - List all active employees
- **GET** `/api/funcionarios/{id}` - Get employee by ID
- **POST** `/api/funcionarios` - Create new employee
- **PUT** `/api/funcionarios/{id}` - Update employee
- **DELETE** `/api/funcionarios/{id}` - Delete (deactivate) employee

## Features

### Entities with JPA Mapping
- **Pessoa** - Maps to `pessoas` table
- **Funcionario** - Maps to `funcionarios` table with relationship to Pessoa
- **Utilizador** - Maps to `utilizadores` table with relationship to Pessoa
- **Vinho** - Maps to `vinhos` table with stock management
- **Venda** - Maps to `vendas` table with relationship to Utilizador and Pessoa
- **ItemVenda** - Maps to `itens_venda` table with relationship to Venda and Vinho

### Services
- **AuthService** - Authentication and user login
- **VinhoService** - Wine management with stock control
- **VendaService** - Sales management with automatic stock decrement
- **FuncionarioService** - Employee management
- **DashboardService** - Dashboard KPI calculations

### Configuration
- **WebConfig** - CORS configuration for all origins (development)
- **SecurityConfig** - Basic security configuration with HTTP Basic disabled

### Validation
- Input validation using Jakarta Validation annotations
- Business logic validation in services
- Error handling with proper HTTP status codes

## Key Features

### Stock Management
- Automatic stock decrement when creating sales
- Low stock detection
- Stock validation before sale creation
- Stock minimum configuration per wine

### Dashboard KPIs
- Total sales for current day
- Total revenue for current day
- Total wines with available stock
- Count of wines with low stock

### CORS
- All origins allowed for development
- Can be restricted for production in `WebConfig.java`

### Database Integration
- JPA entities mapped to existing MySQL tables
- Custom repository queries for business logic
- Transaction support for complex operations

## Development Tools

### Profiles
- `dev` - Development profile with verbose logging
- Default - Production profile

### Logging
- Root level: INFO
- Application level: DEBUG
- SQL queries: DEBUG (dev profile)

### Dependencies
- Spring Boot 3.2
- Spring Data JPA
- MySQL Connector/J 8.0
- Lombok for code generation
- Jakarta Validation
- Spring Security (basic auth disabled)

## Error Handling

The application includes error handling for:
- Invalid credentials on login
- Insufficient stock for sales
- Invalid wine IDs
- Database constraint violations
- Validation errors

All errors return appropriate HTTP status codes:
- 200 OK - Successful operation
- 201 Created - Resource created
- 400 Bad Request - Validation error or business logic error
- 401 Unauthorized - Authentication failure
- 404 Not Found - Resource not found
- 500 Internal Server Error - Unexpected server error

## Notes

- CSRF protection is disabled for development (enable for production)
- HTTP Basic authentication is disabled (configure JWT or OAuth2 for production)
- CORS allows all origins for development (restrict for production)
- Passwords stored in plain text (use bcrypt for production)
- ddl-auto set to `validate` (adjust if schema changes needed)

## Production Recommendations

1. Enable CSRF protection
2. Implement JWT authentication
3. Use password hashing (BCrypt)
4. Restrict CORS to specific origins
5. Configure database connection pooling
6. Set proper logging levels
7. Use environment variables for sensitive configuration
8. Add API rate limiting
9. Implement request validation and sanitization
10. Monitor application performance and logs
