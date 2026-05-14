# DripsDivide Backend

A production-ready RESTful API backend for group expense splitting with blockchain-based settlement via the Stellar network. Split expenses with friends and settle debts instantly across international borders without high bank fees.

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.x-blue.svg)](https://www.postgresql.org/)
[![Stellar](https://img.shields.io/badge/Stellar-SDK%2012.x-purple.svg)](https://stellar.org/)

##  Features

- **Group Expense Management**: Create groups, invite members, and track shared expenses
- **Flexible Split Options**: Equal splits, exact amounts, or percentage-based distributions
- **Smart Debt Calculation**: Automatic debt optimization to minimize settlement transactions
- **Blockchain Settlements**: Instant, low-cost international payments via Stellar network
- **Wallet Integration**: Connect Stellar wallets with ownership verification
- **Settlement History**: Complete audit trail with blockchain verification
- **Real-time Notifications**: Email and push notifications for group activities
- **Secure Authentication**: JWT-based auth with bcrypt password hashing
- **Rate Limiting**: Protection against abuse with configurable limits
- **Comprehensive API**: RESTful endpoints with OpenAPI documentation

## Architecture

### System Overview

```
┌─────────────────────────────────────┐
│     Routes Layer                    │  HTTP routing, request parsing
├─────────────────────────────────────┤
│     Controllers Layer               │  Request/response handling
├─────────────────────────────────────┤
│     Services Layer                  │  Business logic
├─────────────────────────────────────┤
│     Data Access Layer (DAL)         │  Database operations
├─────────────────────────────────────┤
│     Models Layer                    │  Data structures, validation
└─────────────────────────────────────┘
```

### Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Runtime | Node.js 20.x | JavaScript runtime |
| Language | TypeScript 5.x | Type safety |
| Framework | Express.js 4.x | Web framework |
| Database | PostgreSQL 15.x | Primary data store |
| Cache | Redis 7.x | Session cache, rate limiting |
| Blockchain | Stellar SDK 12.x | Blockchain integration |
| Testing | Jest 29.x | Unit & integration tests |
| Validation | Joi 17.x | Schema validation |
| Logging | Winston 3.x | Structured logging |

##  Project Structure

```
drips-divide-backend/
├── src/
│   ├── config/              # Configuration files
│   │   ├── database.ts      # Database connection
│   │   ├── stellar.ts       # Stellar network config
│   │   └── redis.ts         # Redis configuration
│   ├── middleware/          # Express middleware
│   │   ├── auth.ts          # JWT authentication
│   │   ├── errorHandler.ts # Global error handling
│   │   ├── rateLimiter.ts  # Rate limiting
│   │   └── validator.ts    # Request validation
│   ├── routes/              # API route definitions
│   ├── controllers/         # Request handlers
│   ├── services/            # Business logic
│   │   ├── auth.service.ts
│   │   ├── expense.service.ts
│   │   ├── debt.service.ts
│   │   └── stellar.service.ts
│   ├── dal/                 # Data access layer
│   ├── models/              # TypeScript types
│   ├── validators/          # Joi schemas
│   ├── utils/               # Helper functions
│   ├── jobs/                # Background workers
│   ├── db/migrations/       # Database migrations
│   ├── app.ts               # Express app setup
│   └── server.ts            # Server entry point
├── tests/
│   ├── unit/                # Unit tests
│   ├── integration/         # Integration tests
│   └── property/            # Property-based tests
├── scripts/
│   ├── migrate.ts           # Run migrations
│   └── seed.ts              # Seed database
├── .env.example             # Environment template
├── Dockerfile               # Container definition
├── docker-compose.yml       # Local development
└── README.md
```

##  Getting Started

### Prerequisites

- Node.js 20.x or higher
- PostgreSQL 15.x
- Redis 7.x
- Docker & Docker Compose (optional)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/drips-divide-backend.git
cd drips-divide-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Set up the database**
```bash
# Create database
createdb drips_divide

# Run migrations
npm run migrate
```

5. **Start the development server**
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

### Using Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following variables:

```bash
# Server Configuration
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/drips_divide
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
DATABASE_SSL=false

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=
REDIS_TLS=false

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRATION=24h

# Stellar Configuration
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
STELLAR_NETWORK=testnet
# For mainnet: STELLAR_HORIZON_URL=https://horizon.stellar.org
# For mainnet: STELLAR_NETWORK=public

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=true

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
```

##  API Documentation

### Base URL

```
http://localhost:3000/api/v1
```

### Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Core Endpoints

#### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh JWT token

#### Groups
- `POST /groups` - Create new group
- `GET /groups` - Get user's groups
- `GET /groups/:id` - Get group details
- `POST /groups/:id/invite` - Invite user to group

#### Expenses
- `POST /expenses` - Create expense
- `GET /expenses/:id` - Get expense details
- `GET /groups/:groupId/expenses` - Get group expenses
- `GET /expenses/search` - Search expenses

#### Debts
- `GET /groups/:groupId/debts` - Get group debts
- `GET /users/me/balance/:groupId` - Get user balance

#### Wallet
- `POST /wallet/connect` - Connect Stellar wallet
- `GET /wallet` - Get wallet info
- `POST /wallet/verify` - Verify wallet ownership

#### Settlements
- `POST /settlements` - Initiate settlement
- `GET /settlements/:id` - Get settlement details
- `GET /settlements` - Get settlement history

### Example Request

**Create Expense:**
```bash
curl -X POST http://localhost:3000/api/v1/expenses \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "groupId": "550e8400-e29b-41d4-a716-446655440000",
    "amount": 120.50,
    "description": "Dinner at Restaurant",
    "splitConfiguration": {
      "type": "equal",
      "splits": [
        { "userId": "user1-uuid" },
        { "userId": "user2-uuid" },
        { "userId": "user3-uuid" }
      ]
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "990e8400-e29b-41d4-a716-446655440003",
    "groupId": "550e8400-e29b-41d4-a716-446655440000",
    "payerId": "user1-uuid",
    "amount": "120.50",
    "description": "Dinner at Restaurant",
    "splitConfiguration": {
      "type": "equal",
      "splits": [
        { "userId": "user1-uuid", "amount": "40.17" },
        { "userId": "user2-uuid", "amount": "40.17" },
        { "userId": "user3-uuid", "amount": "40.16" }
      ]
    },
    "createdAt": "2024-01-15T19:45:00Z"
  }
}
```

##  Testing

### Run All Tests
```bash
npm test
```

### Run Specific Test Suites
```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# Property-based tests only
npm run test:property

# With coverage report
npm run test:coverage

# Watch mode
npm run test:watch
```

### Test Coverage

The project maintains a minimum of **80% code coverage** with:
- Unit tests for all business logic
- Integration tests for all API endpoints
- Property-based tests for critical algorithms
- Stellar testnet integration tests

##  Security Features

- **JWT Authentication**: Secure token-based authentication with 24-hour expiration
- **Password Hashing**: bcrypt with 10 salt rounds
- **Rate Limiting**: 100 requests/minute (general), 5 attempts/15 minutes (auth)
- **Input Validation**: Joi schema validation for all requests
- **SQL Injection Prevention**: Parameterized queries via pg library
- **XSS Prevention**: Input sanitization and output encoding
- **HTTPS Enforcement**: All endpoints require HTTPS in production
- **Security Headers**: Helmet.js for security headers (CORS, CSP, X-Frame-Options)
- **Timing Attack Prevention**: Constant-time comparison for authentication

##  Stellar Blockchain Integration

### Wallet Connection

Users connect their Stellar wallets by providing their public key. The system verifies ownership through a challenge-response mechanism:

1. User provides Stellar public key
2. System generates random challenge
3. User signs challenge with private key
4. System verifies signature

### Settlement Flow

1. User initiates settlement for a debt
2. System creates unsigned Stellar transaction
3. User signs transaction client-side (private key never leaves user's device)
4. User submits signed transaction
5. System submits to Stellar network
6. Background job monitors transaction status
7. On confirmation, debt is marked as settled

### Supported Assets

- **Primary**: Stellar Lumens (XLM)
- **Optional**: Stellar-based stablecoins (USDC, etc.)

### Network Configuration

- **Testnet**: For development and testing
- **Mainnet**: For production deployments

##  Database Schema

### Core Tables

- **users**: User accounts with authentication credentials
- **groups**: Expense groups with creator and members
- **group_members**: Many-to-many relationship between users and groups
- **expenses**: Expense records with split configurations
- **expense_splits**: Individual split amounts per user
- **debts**: Calculated debts between users (optimized)
- **settlements**: Blockchain settlement records
- **notifications**: User notifications for activities

### Relationships

- Users create and belong to multiple Groups
- Groups contain multiple Expenses
- Expenses are split among Group members
- Debts are calculated from Expenses
- Settlements resolve Debts via blockchain

##  Deployment

### Docker Deployment

1. **Build the image**
```bash
docker build -t drips-divide-api:latest .
```

2. **Run the container**
```bash
docker run -d \
  -p 3000:3000 \
  --env-file .env \
  --name drips-divide-api \
  drips-divide-api:latest
```

### Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] SSL/TLS certificates installed
- [ ] Rate limiting configured
- [ ] Monitoring and logging set up
- [ ] Backup strategy implemented
- [ ] Health checks configured
- [ ] Stellar mainnet credentials configured

### Health Check

```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "uptime": 3600
}
```

### Metrics

Key metrics to monitor:

- Request rate and response times
- Database connection pool usage
- Redis cache hit/miss ratio
- Stellar transaction success rate
- Authentication failure rate
- Error rates by endpoint

##  Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write tests for new features
- Update documentation as needed

##  License

This project is licensed under the MIT License - see the LICENSE file for details.

##  Acknowledgments

- [Stellar Development Foundation](https://stellar.org/) for blockchain infrastructure
- [Express.js](https://expressjs.com/) for the web framework



For issues, questions, or contributions:

- **Issues**: [GitHub Issues](https://github.com/jhayniffy/drips-divide-backend/issues)
- **Discussions**: [GitHub Discussions](https://github.com/jhayniffy/drips-divide-backend/discussions)
- **Email**: support@dripsdivide.com or jeremiahniffypeter@gmail.com

## 🗺️ Roadmap

- [ ] Multi-currency support
- [ ] Recurring expenses
-

**Built with love using Node.js, TypeScript, and Stellar**
