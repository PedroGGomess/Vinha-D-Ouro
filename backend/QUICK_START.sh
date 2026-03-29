#!/bin/bash

# Vinha D'Ouro Spring Boot Backend - Quick Start Script
# This script automates the setup and launch process

set -e

echo "======================================"
echo "Vinha D'Ouro Backend - Quick Start"
echo "======================================"
echo ""

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

# Check Java
if ! command -v java &> /dev/null; then
    echo -e "${RED}Java is not installed${NC}"
    echo "Please install Java 17 or higher"
    exit 1
fi

JAVA_VERSION=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}')
echo -e "${GREEN}✓ Java ${JAVA_VERSION} found${NC}"

# Check Maven
if ! command -v mvn &> /dev/null; then
    echo -e "${RED}Maven is not installed${NC}"
    echo "Please install Maven"
    exit 1
fi

MVN_VERSION=$(mvn -version | head -1)
echo -e "${GREEN}✓ ${MVN_VERSION}${NC}"

# Check MySQL
if ! command -v mysql &> /dev/null; then
    echo -e "${RED}MySQL is not installed${NC}"
    echo "Please install MySQL 8.0 or higher"
    exit 1
fi

MYSQL_VERSION=$(mysql --version)
echo -e "${GREEN}✓ ${MYSQL_VERSION}${NC}"

echo ""
echo -e "${YELLOW}Setting up database...${NC}"

# Database configuration
DB_USER="root"
DB_NAME="vinhadouro"
DB_PASSWORD=""

# Prompt for MySQL password if needed
read -sp "Enter MySQL root password (press Enter if none): " DB_PASSWORD
echo ""

# Test database connection
if [ -z "$DB_PASSWORD" ]; then
    MYSQL_CONN="mysql -u $DB_USER"
else
    MYSQL_CONN="mysql -u $DB_USER -p$DB_PASSWORD"
fi

if ! $MYSQL_CONN -e "SELECT 1" > /dev/null 2>&1; then
    echo -e "${RED}Cannot connect to MySQL${NC}"
    echo "Please verify MySQL is running and credentials are correct"
    exit 1
fi

echo -e "${GREEN}✓ MySQL connection successful${NC}"

# Check if database exists
if $MYSQL_CONN -e "USE $DB_NAME" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Database '$DB_NAME' exists${NC}"
else
    echo -e "${YELLOW}Creating database '$DB_NAME'...${NC}"
    $MYSQL_CONN -e "CREATE DATABASE $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    echo -e "${GREEN}✓ Database created${NC}"
fi

# Load schema
echo -e "${YELLOW}Loading database schema...${NC}"
if [ -f "database-schema.sql" ]; then
    $MYSQL_CONN $DB_NAME < database-schema.sql
    echo -e "${GREEN}✓ Schema loaded${NC}"
else
    echo -e "${RED}database-schema.sql not found${NC}"
    exit 1
fi

# Load sample data
read -p "Load sample data? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [ -f "sample-data.sql" ]; then
        $MYSQL_CONN $DB_NAME < sample-data.sql
        echo -e "${GREEN}✓ Sample data loaded${NC}"
    else
        echo -e "${RED}sample-data.sql not found${NC}"
    fi
fi

echo ""
echo -e "${YELLOW}Configuring application...${NC}"

# Update connection string in application.properties
if [ -f "src/main/resources/application.properties" ]; then
    if [ -z "$DB_PASSWORD" ]; then
        sed -i.bak "s/spring.datasource.password=.*/spring.datasource.password=/" \
            src/main/resources/application.properties
    else
        sed -i.bak "s/spring.datasource.password=.*/spring.datasource.password=$DB_PASSWORD/" \
            src/main/resources/application.properties
    fi
    echo -e "${GREEN}✓ Application configured${NC}"
fi

echo ""
echo -e "${YELLOW}Building project...${NC}"

# Build project
if mvn clean install -DskipTests > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Build successful${NC}"
else
    echo -e "${RED}Build failed${NC}"
    echo "Run 'mvn clean install' for detailed error messages"
    exit 1
fi

echo ""
echo -e "${GREEN}======================================"
echo "Setup Complete!"
echo "======================================${NC}"
echo ""
echo "To start the application, run:"
echo ""
echo -e "${YELLOW}Development mode:${NC}"
echo "  mvn spring-boot:run -Dspring-boot.run.arguments=\"--spring.profiles.active=dev\""
echo ""
echo -e "${YELLOW}Production mode:${NC}"
echo "  mvn spring-boot:run"
echo ""
echo "Or run the JAR directly:"
echo "  java -jar target/vinhadouro-backend-1.0.0.jar"
echo ""
echo "Test the API:"
echo "  curl http://localhost:8080/api/health"
echo ""
echo -e "${GREEN}Sample login credentials:${NC}"
echo "  Username: joao.silva"
echo "  Password: password123"
echo ""
echo "See README.md and SETUP_GUIDE.md for more information."
