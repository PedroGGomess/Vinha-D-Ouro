# Vinha D'Ouro Spring Boot Backend - Setup Guide

Complete setup guide for building and running the Spring Boot backend for Vinha D'Ouro wine shop management system.

## Prerequisites

### System Requirements
- Java Development Kit (JDK) 17 or higher
- Apache Maven 3.6.0 or higher
- MySQL Server 8.0 or higher
- Git (optional, for version control)

### Installation

#### Java 17
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install openjdk-17-jdk

# macOS (using Homebrew)
brew install openjdk@17

# Verify installation
java -version
```

#### Maven
```bash
# Ubuntu/Debian
sudo apt-get install maven

# macOS (using Homebrew)
brew install maven

# Verify installation
mvn -version
```

#### MySQL 8.0
```bash
# Ubuntu/Debian
sudo apt-get install mysql-server

# macOS (using Homebrew)
brew install mysql

# Start MySQL
sudo systemctl start mysql
# or
brew services start mysql

# Verify installation
mysql --version
```

## Database Setup

### 1. Create Database
```bash
# Connect to MySQL
mysql -u root -p

# Create database
CREATE DATABASE vinhadouro CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Verify creation
SHOW DATABASES;

# Exit MySQL
EXIT;
```

### 2. Create Tables
```bash
# Run the schema script
mysql -u root -p vinhadouro < database-schema.sql

# Verify tables
mysql -u root -p -e "USE vinhadouro; SHOW TABLES;"
```

### 3. Load Sample Data (Optional)
```bash
# Load sample data for testing
mysql -u root -p vinhadouro < sample-data.sql
```

### 4. Configure Database Connection
Edit `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/vinhadouro?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=your_mysql_password
```

## Project Setup

### 1. Navigate to Project Directory
```bash
cd backend
```

### 2. Verify Maven Configuration
```bash
# Check pom.xml is present
ls -la pom.xml

# Verify Java version in pom.xml
grep -A 3 "<properties>" pom.xml
```

### 3. Build the Project
```bash
# Clean and build
mvn clean install

# Expected output should end with:
# BUILD SUCCESS
```

### 4. Run the Application

#### Option A: Using Maven
```bash
# Run with default profile (production)
mvn spring-boot:run

# Run with development profile
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"
```

#### Option B: Using Java directly
```bash
# Build first
mvn clean package

# Run the JAR
java -jar target/vinhadouro-backend-1.0.0.jar

# Run with dev profile
java -jar target/vinhadouro-backend-1.0.0.jar --spring.profiles.active=dev
```

### 5. Verify Application is Running
```bash
# Health check endpoint
curl http://localhost:8080/api/health

# Expected response:
# OK
```

## Testing the API

### 1. Login
```bash
curl -X POST http://localhost:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "joao.silva",
    "password": "password123"
  }'
```

### 2. Get Dashboard
```bash
curl http://localhost:8080/api/dashboard
```

### 3. List Wines
```bash
curl http://localhost:8080/api/vinhos
```

### 4. List Sales
```bash
curl http://localhost:8080/api/vendas
```

### 5. List Employees
```bash
curl http://localhost:8080/api/funcionarios
```

## IDE Setup

### IntelliJ IDEA
1. Open IntelliJ IDEA
2. File > Open > Select the backend directory
3. Wait for Maven to download dependencies
4. Right-click pom.xml > Run Maven > Install
5. Run > Run 'VinhaDouroApplication'

### Eclipse
1. Import > Existing Maven Projects
2. Select the backend directory
3. Right-click project > Maven > Update Project
4. Right-click project > Run As > Spring Boot App

### VS Code
1. Install Extension Pack for Java
2. Install Spring Boot Extension Pack
3. Open the backend folder
4. Click on VinhaDouroApplication.java > Run
5. Or press Ctrl+Shift+D (Run and Debug)

## Troubleshooting

### Issue: "Connection refused" to MySQL
**Solution:**
```bash
# Check if MySQL is running
sudo systemctl status mysql

# Start MySQL if not running
sudo systemctl start mysql

# Verify connection
mysql -u root -p
```

### Issue: "Database 'vinhadouro' doesn't exist"
**Solution:**
```bash
# Create the database
mysql -u root -p -e "CREATE DATABASE vinhadouro CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Create tables
mysql -u root -p vinhadouro < database-schema.sql
```

### Issue: "Maven build failure - Cannot find symbol"
**Solution:**
```bash
# Clean Maven cache and rebuild
rm -rf ~/.m2/repository
mvn clean install
```

### Issue: "Port 8080 is already in use"
**Solution:**
```bash
# Option 1: Kill the process using port 8080
sudo lsof -i :8080
sudo kill -9 <PID>

# Option 2: Change port in application.properties
server.port=8081
```

### Issue: "Compilation fails - Java 17 not found"
**Solution:**
```bash
# Set JAVA_HOME
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64

# Verify
java -version
```

## Development Tips

### Hot Reload with DevTools
DevTools is included and enabled in the dev profile. Changes to Java files will trigger automatic reload:
```bash
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"
```

### View SQL Queries
In development profile, SQL queries are logged:
```bash
tail -f logs/application.log | grep "SQL"
```

### Useful Maven Commands
```bash
# Build without tests
mvn clean install -DskipTests

# Run specific test
mvn test -Dtest=TestClassName

# Generate project documentation
mvn site

# Check dependencies
mvn dependency:tree
```

## Production Deployment

### Build Production JAR
```bash
mvn clean package -DskipTests
```

### Deploy to Server
```bash
# Copy JAR to server
scp target/vinhadouro-backend-1.0.0.jar user@server:/app/

# Run on server
java -jar /app/vinhadouro-backend-1.0.0.jar \
  --spring.datasource.url=jdbc:mysql://db-server:3306/vinhadouro \
  --spring.datasource.username=db_user \
  --spring.datasource.password=db_password
```

### Using Environment Variables
```bash
export SPRING_DATASOURCE_URL=jdbc:mysql://db-server:3306/vinhadouro
export SPRING_DATASOURCE_USERNAME=db_user
export SPRING_DATASOURCE_PASSWORD=db_password

java -jar target/vinhadouro-backend-1.0.0.jar
```

## Monitoring

### Check Application Logs
```bash
# View logs
tail -f logs/application.log

# Filter by level
grep ERROR logs/application.log
```

### Database Connection Pool Stats
Add to application.properties:
```properties
logging.level.com.zaxxer.hikari=DEBUG
```

## Support Files

- `README.md` - Comprehensive project documentation
- `database-schema.sql` - Database schema definition
- `sample-data.sql` - Sample data for testing
- `pom.xml` - Maven configuration with all dependencies
- `.gitignore` - Git ignore patterns

## Next Steps

1. Configure your IDE for development
2. Build and run the project
3. Test API endpoints using curl or Postman
4. Integrate with your frontend application
5. Customize business logic as needed
6. Deploy to production server

## Additional Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Spring Data JPA Guide](https://spring.io/projects/spring-data-jpa)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Maven Guide](https://maven.apache.org/guides/index.html)

## Support

For issues or questions:
1. Check the Troubleshooting section above
2. Review application logs
3. Check database connectivity
4. Verify all prerequisites are installed
5. Consult Spring Boot and Maven documentation

---

**Version:** 1.0.0
**Last Updated:** 2026-03-29
**Status:** Production Ready
