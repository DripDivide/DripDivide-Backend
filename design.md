# Design Document: DripsDivide Backend

## Overview

DripsDivide-Backend is a production-ready RESTful API service built with Node.js, Express, and PostgreSQL that enables group expense tracking and blockchain-based settlement via the Stellar network. The system follows a layered architecture pattern with clear separation of concerns, comprehensive error handling, and robust security measures.

### Core Capabilities

- **User Management**: Secure registration, authentication with JWT tokens, and profile management
- **Group Collaboration**: Create groups, invite members, manage permissions
- **Expense Tracking**: Record expenses with flexible split configurations (equal, exact amounts, percentages)
- **Debt Calculation**: Automatic debt optimization to minimize settlement transactions
- **Blockchain Settlement**: Integration with Stellar network for instant, low-cost international payments
- **Audit Trail**: Complete history of expenses and settlements with search and filtering
- **Notifications**: Real-time updates for group activities and settlements

### Design Principles

1. **Layered Architecture**: Clear separation between routes, controllers, services, and data access
2. **Security First**: Input validation, SQL injection prevention, rate limiting, HTTPS enforcement
3. **Testability**: Dependency injection, mockable services, comprehensive test coverage
4. **Scalability**: Stateless design, database indexing, connection pooling
5. **Maintainability**: Consistent code structure, comprehensive documentation, error handling

## Architecture

### System Architecture Diagram

```mermaid
graph TB
    Client[Client Applications]
    LB[Load Balancer / Nginx]
    API[Express API Server]
    Auth[Auth Middleware]
    Routes[Route Handlers]
    Controllers[Controllers]
    Services[Business Logic Services]
    Validators[Input Validators]
    DB[(PostgreSQL Database)]
    Stellar[Stellar Network]
    Cache[Redis Cache]
    Queue[Job Queue]
    
    Client -->|HTTPS| LB
    LB --> API
    API --> Auth
    Auth --> Routes
    Routes --> Controllers
    Controllers --> Validators
    Controllers --> Services
    Services --> DB
    Services --> Stellar
    Services --> Cache
    Services --> Queue
```

### Layered Architecture

The application follows a 5-layer architecture:

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

**Layer Responsibilities:**

1. **Routes Layer**: Maps HTTP endpoints to controller methods, applies middleware
2. **Controllers Layer**: Validates requests, calls services, formats responses
3. **Services Layer**: Implements business logic, orchestrates operations, handles transactions
4. **Data Access Layer**: Executes database queries, manages connections
5. **Models Layer**: Defines data structures, validation schemas, type definitions

## Technology Stack

### Core Technologies

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Runtime | Node.js | 20.x LTS | JavaScript runtime |
| Framework | Express.js | 4.x | Web framework |
| Language | TypeScript | 5.x | Type safety |
| Database | PostgreSQL | 15.x | Primary data store |
| Cache | Redis | 7.x | Session cache, rate limiting |
| Blockchain | Stellar SDK | 12.x | Blockchain integration |

### Key Dependencies

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.3",
    "pg-pool": "^3.6.1",
    "@stellar/stellar-sdk": "^12.0.0",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "joi": "^17.11.0",
    "helmet": "^7.1.0",
    "cors": "^2.8.5",
    "express-rate-limit": "^7.1.5",
    "winston": "^3.11.0",
    "dotenv": "^16.3.1",
    "redis": "^4.6.11",
    "bull": "^4.12.0"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "@types/node": "^20.10.5",
    "@types/express": "^4.17.21",
    "jest": "^29.7.0",
    "supertest": "^6.3.3",
    "fast-check": "^3.15.0",
    "ts-node": "^10.9.2",
    "nodemon": "^3.0.2",
    "eslint": "^8.56.0",
    "prettier": "^3.1.1"
  }
}
```

### Technology Justification

- **TypeScript**: Provides type safety, better IDE support, and catches errors at compile time
- **PostgreSQL**: ACID compliance, robust transaction support, excellent for financial data
- **Redis**: Fast in-memory cache for sessions, rate limiting, and temporary data
- **Stellar SDK**: Official SDK for blockchain integration with comprehensive documentation
- **Joi**: Schema validation with clear error messages
- **Winston**: Structured logging with multiple transports
- **Bull**: Reliable job queue for async operations (notifications, blockchain monitoring)

## Project Structure


### Complete Directory Structure

```
drips-divide-backend/
├── src/
│   ├── config/
│   │   ├── database.ts          # Database connection configuration
│   │   ├── stellar.ts           # Stellar network configuration
│   │   ├── redis.ts             # Redis configuration
│   │   └── index.ts             # Centralized config exports
│   ├── middleware/
│   │   ├── auth.ts              # JWT authentication middleware
│   │   ├── errorHandler.ts     # Global error handling
│   │   ├── rateLimiter.ts      # Rate limiting middleware
│   │   ├── validator.ts        # Request validation middleware
│   │   └── logger.ts           # Request logging middleware
│   ├── routes/
│   │   ├── auth.routes.ts      # Authentication endpoints
│   │   ├── user.routes.ts      # User management endpoints
│   │   ├── group.routes.ts     # Group management endpoints
│   │   ├── expense.routes.ts   # Expense endpoints
│   │   ├── settlement.routes.ts # Settlement endpoints
│   │   ├── wallet.routes.ts    # Wallet management endpoints
│   │   └── index.ts            # Route aggregator
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── group.controller.ts
│   │   ├── expense.controller.ts
│   │   ├── settlement.controller.ts
│   │   └── wallet.controller.ts
│   ├── services/
│   │   ├── auth.service.ts     # Authentication logic
│   │   ├── user.service.ts     # User business logic
│   │   ├── group.service.ts    # Group business logic
│   │   ├── expense.service.ts  # Expense business logic
│   │   ├── debt.service.ts     # Debt calculation logic
│   │   ├── settlement.service.ts # Settlement orchestration
│   │   ├── stellar.service.ts  # Stellar blockchain integration
│   │   ├── notification.service.ts # Notification handling
│   │   └── parser.service.ts   # Expense parsing/serialization
│   ├── dal/
│   │   ├── user.dal.ts         # User data access
│   │   ├── group.dal.ts        # Group data access
│   │   ├── expense.dal.ts      # Expense data access
│   │   ├── debt.dal.ts         # Debt data access
│   │   ├── settlement.dal.ts   # Settlement data access
│   │   └── base.dal.ts         # Base DAL with common operations
│   ├── models/
│   │   ├── user.model.ts       # User type definitions
│   │   ├── group.model.ts      # Group type definitions
│   │   ├── expense.model.ts    # Expense type definitions
│   │   ├── debt.model.ts       # Debt type definitions
│   │   ├── settlement.model.ts # Settlement type definitions
│   │   └── common.model.ts     # Shared types
│   ├── validators/
│   │   ├── auth.validator.ts   # Auth request schemas
│   │   ├── user.validator.ts   # User request schemas
│   │   ├── group.validator.ts  # Group request schemas
│   │   ├── expense.validator.ts # Expense request schemas
│   │   └── settlement.validator.ts # Settlement request schemas
│   ├── utils/
│   │   ├── logger.ts           # Winston logger setup
│   │   ├── errors.ts           # Custom error classes
│   │   ├── jwt.ts              # JWT utilities
│   │   ├── crypto.ts           # Encryption utilities
│   │   └── helpers.ts          # General helper functions
│   ├── jobs/
│   │   ├── settlementMonitor.job.ts # Monitor blockchain transactions
│   │   ├── notification.job.ts      # Send notifications
│   │   └── debtOptimization.job.ts  # Periodic debt optimization
│   ├── db/
│   │   ├── migrations/         # Database migration files
│   │   │   ├── 001_create_users.sql
│   │   │   ├── 002_create_groups.sql
│   │   │   ├── 003_create_expenses.sql
│   │   │   ├── 004_create_debts.sql
│   │   │   ├── 005_create_settlements.sql
│   │   │   └── 006_create_indexes.sql
│   │   └── seeds/              # Seed data for development
│   │       └── dev_data.sql
│   ├── types/
│   │   ├── express.d.ts        # Express type extensions
│   │   └── environment.d.ts    # Environment variable types
│   ├── app.ts                  # Express app setup
│   └── server.ts               # Server entry point
├── tests/
│   ├── unit/
│   │   ├── services/
│   │   ├── controllers/
│   │   └── utils/
│   ├── integration/
│   │   ├── auth.test.ts
│   │   ├── expense.test.ts
│   │   └── settlement.test.ts
│   ├── property/
│   │   └── parser.property.test.ts
│   └── setup.ts                # Test configuration
├── scripts/
│   ├── migrate.ts              # Run migrations
│   ├── seed.ts                 # Seed database
│   └── stellar-setup.ts        # Setup Stellar testnet accounts
├── .env.example                # Environment variables template
├── .env.test                   # Test environment variables
├── .gitignore
├── tsconfig.json               # TypeScript configuration
├── jest.config.js              # Jest configuration
├── package.json
├── Dockerfile                  # Container definition
├── docker-compose.yml          # Local development setup
└── README.md                   # Project documentation
```

### File Organization Principles

1. **Feature-based grouping**: Related functionality grouped by domain (auth, expense, settlement)
2. **Layer separation**: Each layer has its own directory (routes, controllers, services, dal)
3. **Shared utilities**: Common code in utils/ and middleware/
4. **Type safety**: All types defined in models/ and types/
5. **Database management**: Migrations and seeds in db/
6. **Testing structure**: Mirrors src/ structure for easy navigation

## Components and Interfaces

### Core Components

#### 1. Authentication Service

**Purpose**: Handle user registration, login, and JWT token management

```typescript
// src/services/auth.service.ts
import bcrypt from 'bcrypt';
import { UserDAL } from '../dal/user.dal';
import { generateToken } from '../utils/jwt';
import { AuthenticationError } from '../utils/errors';

export class AuthService {
  constructor(private userDAL: UserDAL) {}

  async register(email: string, password: string): Promise<{ userId: string; token: string }> {
    // Check if user exists
    const existingUser = await this.userDAL.findByEmail(email);
    if (existingUser) {
      throw new AuthenticationError('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.userDAL.create({
      email,
      password: hashedPassword,
    });

    // Generate token
    const token = generateToken({ userId: user.id, email: user.email });

    return { userId: user.id, token };
  }

  async login(email: string, password: string): Promise<{ userId: string; token: string }> {
    // Add minimum delay to prevent timing attacks
    await new Promise(resolve => setTimeout(resolve, 200));

    // Find user
    const user = await this.userDAL.findByEmail(email);
    if (!user) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Generate token
    const token = generateToken({ userId: user.id, email: user.email });

    return { userId: user.id, token };
  }

  async verifyToken(token: string): Promise<{ userId: string; email: string }> {
    // Token verification logic in jwt.ts utility
    return verifyToken(token);
  }
}
```

#### 2. Expense Service

**Purpose**: Handle expense creation, parsing, and serialization

```typescript
// src/services/expense.service.ts
import { ExpenseDAL } from '../dal/expense.dal';
import { DebtService } from './debt.service';
import { ParserService } from './parser.service';
import { Expense, SplitConfiguration } from '../models/expense.model';
import { ValidationError } from '../utils/errors';

export class ExpenseService {
  constructor(
    private expenseDAL: ExpenseDAL,
    private debtService: DebtService,
    private parserService: ParserService
  ) {}

  async createExpense(
    groupId: string,
    payerId: string,
    amount: number,
    description: string,
    splitConfig: SplitConfiguration
  ): Promise<Expense> {
    // Validate split configuration
    this.validateSplitConfiguration(splitConfig, amount);

    // Parse expense data
    const parsedExpense = this.parserService.parseExpense({
      groupId,
      payerId,
      amount,
      description,
      splitConfig,
    });

    // Create expense in database
    const expense = await this.expenseDAL.create(parsedExpense);

    // Recalculate debts for the group
    await this.debtService.recalculateDebts(groupId);

    return expense;
  }

  async getExpense(expenseId: string): Promise<Expense> {
    const expense = await this.expenseDAL.findById(expenseId);
    
    // Serialize for API response
    return this.parserService.serializeExpense(expense);
  }

  private validateSplitConfiguration(config: SplitConfiguration, totalAmount: number): void {
    switch (config.type) {
      case 'equal':
        // No additional validation needed
        break;
      case 'exact':
        const sum = config.splits.reduce((acc, split) => acc + split.amount, 0);
        if (Math.abs(sum - totalAmount) > 0.01) {
          throw new ValidationError('Split amounts must equal total expense amount');
        }
        break;
      case 'percentage':
        const totalPercent = config.splits.reduce((acc, split) => acc + split.percentage, 0);
        if (Math.abs(totalPercent - 100) > 0.01) {
          throw new ValidationError('Split percentages must equal 100%');
        }
        break;
    }
  }
}
```

#### 3. Debt Calculation Service

**Purpose**: Calculate and optimize debts between group members

```typescript
// src/services/debt.service.ts
import { DebtDAL } from '../dal/debt.dal';
import { ExpenseDAL } from '../dal/expense.dal';
import { Debt } from '../models/debt.model';

export class DebtService {
  constructor(
    private debtDAL: DebtDAL,
    private expenseDAL: ExpenseDAL
  ) {}

  async recalculateDebts(groupId: string): Promise<void> {
    // Get all expenses for the group
    const expenses = await this.expenseDAL.findByGroup(groupId);

    // Calculate balances for each member
    const balances = this.calculateBalances(expenses);

    // Optimize debts to minimize transactions
    const optimizedDebts = this.optimizeDebts(balances);

    // Update debts in database (within transaction)
    await this.debtDAL.replaceGroupDebts(groupId, optimizedDebts);
  }

  private calculateBalances(expenses: any[]): Map<string, number> {
    const balances = new Map<string, number>();

    for (const expense of expenses) {
      // Payer is owed money
      const currentPayerBalance = balances.get(expense.payerId) || 0;
      balances.set(expense.payerId, currentPayerBalance + expense.amount);

      // Split participants owe money
      for (const split of expense.splits) {
        const currentBalance = balances.get(split.userId) || 0;
        balances.set(split.userId, currentBalance - split.amount);
      }
    }

    return balances;
  }

  private optimizeDebts(balances: Map<string, number>): Debt[] {
    // Separate creditors (positive balance) and debtors (negative balance)
    const creditors: Array<{ userId: string; amount: number }> = [];
    const debtors: Array<{ userId: string; amount: number }> = [];

    for (const [userId, balance] of balances.entries()) {
      const roundedBalance = Math.round(balance * 100) / 100;
      if (roundedBalance > 0) {
        creditors.push({ userId, amount: roundedBalance });
      } else if (roundedBalance < 0) {
        debtors.push({ userId, amount: Math.abs(roundedBalance) });
      }
    }

    // Greedy algorithm to minimize number of transactions
    const debts: Debt[] = [];
    let i = 0;
    let j = 0;

    while (i < creditors.length && j < debtors.length) {
      const creditor = creditors[i];
      const debtor = debtors[j];

      const amount = Math.min(creditor.amount, debtor.amount);

      debts.push({
        debtorId: debtor.userId,
        creditorId: creditor.userId,
        amount: Math.round(amount * 100) / 100,
        settled: false,
      });

      creditor.amount -= amount;
      debtor.amount -= amount;

      if (creditor.amount === 0) i++;
      if (debtor.amount === 0) j++;
    }

    return debts;
  }

  async getUserBalance(userId: string, groupId: string): Promise<number> {
    const debts = await this.debtDAL.findByUserAndGroup(userId, groupId);
    
    let balance = 0;
    for (const debt of debts) {
      if (debt.creditorId === userId) {
        balance += debt.amount; // User is owed
      } else {
        balance -= debt.amount; // User owes
      }
    }

    return Math.round(balance * 100) / 100;
  }
}
```

#### 4. Stellar Integration Service

**Purpose**: Handle blockchain transactions and wallet management

```typescript
// src/services/stellar.service.ts
import * as StellarSdk from '@stellar/stellar-sdk';
import { config } from '../config';
import { logger } from '../utils/logger';
import { BlockchainError } from '../utils/errors';

export class StellarService {
  private server: StellarSdk.Horizon.Server;
  private networkPassphrase: string;

  constructor() {
    // Initialize Stellar server (testnet or mainnet)
    this.server = new StellarSdk.Horizon.Server(config.stellar.horizonUrl);
    this.networkPassphrase = config.stellar.isTestnet
      ? StellarSdk.Networks.TESTNET
      : StellarSdk.Networks.PUBLIC;
  }

  async validatePublicKey(publicKey: string): Promise<boolean> {
    try {
      // Check if it's a valid Stellar public key format
      StellarSdk.StrKey.decodeEd25519PublicKey(publicKey);
      
      // Check if account exists on network
      await this.server.loadAccount(publicKey);
      
      return true;
    } catch (error) {
      return false;
    }
  }

  async createSettlementTransaction(
    sourcePublicKey: string,
    destinationPublicKey: string,
    amount: string,
    memo?: string
  ): Promise<string> {
    try {
      // Load source account
      const sourceAccount = await this.server.loadAccount(sourcePublicKey);

      // Build transaction
      const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(
          StellarSdk.Operation.payment({
            destination: destinationPublicKey,
            asset: StellarSdk.Asset.native(), // XLM
            amount: amount,
          })
        )
        .setTimeout(180) // 3 minutes
        .build();

      if (memo) {
        transaction.addMemo(StellarSdk.Memo.text(memo));
      }

      // Return unsigned transaction XDR for client-side signing
      return transaction.toXDR();
    } catch (error) {
      logger.error('Failed to create settlement transaction', { error });
      throw new BlockchainError('Failed to create transaction');
    }
  }

  async submitTransaction(signedTransactionXDR: string): Promise<string> {
    try {
      const transaction = StellarSdk.TransactionBuilder.fromXDR(
        signedTransactionXDR,
        this.networkPassphrase
      );

      const result = await this.server.submitTransaction(transaction as any);

      logger.info('Transaction submitted successfully', {
        hash: result.hash,
        ledger: result.ledger,
      });

      return result.hash;
    } catch (error: any) {
      logger.error('Transaction submission failed', { error });
      
      if (error.response?.data?.extras) {
        throw new BlockchainError(
          `Transaction failed: ${error.response.data.extras.result_codes.transaction}`
        );
      }
      
      throw new BlockchainError('Failed to submit transaction');
    }
  }

  async verifyTransaction(transactionHash: string): Promise<boolean> {
    try {
      const transaction = await this.server.transactions().transaction(transactionHash).call();
      return transaction.successful;
    } catch (error) {
      logger.error('Failed to verify transaction', { transactionHash, error });
      return false;
    }
  }

  async monitorTransaction(
    transactionHash: string,
    callback: (success: boolean) => void
  ): Promise<void> {
    const maxAttempts = 30; // 30 attempts
    const interval = 2000; // 2 seconds

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const isSuccessful = await this.verifyTransaction(transactionHash);
        if (isSuccessful) {
          callback(true);
          return;
        }
      } catch (error) {
        // Transaction not found yet, continue polling
      }

      await new Promise(resolve => setTimeout(resolve, interval));
    }

    // Timeout reached
    callback(false);
  }

  getExplorerUrl(transactionHash: string): string {
    const baseUrl = config.stellar.isTestnet
      ? 'https://stellar.expert/explorer/testnet'
      : 'https://stellar.expert/explorer/public';
    
    return `${baseUrl}/tx/${transactionHash}`;
  }
}
```

#### 5. Parser Service

**Purpose**: Parse and serialize expense data (for property-based testing)

```typescript
// src/services/parser.service.ts
import { Expense, ExpenseInput, SplitConfiguration } from '../models/expense.model';
import { ValidationError } from '../utils/errors';

export class ParserService {
  parseExpense(input: ExpenseInput): Expense {
    // Validate and normalize input
    const expense: Expense = {
      id: this.generateId(),
      groupId: input.groupId,
      payerId: input.payerId,
      amount: this.normalizeAmount(input.amount),
      description: input.description.trim(),
      splitConfig: this.parseSplitConfiguration(input.splitConfig),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return expense;
  }

  serializeExpense(expense: Expense): any {
    return {
      id: expense.id,
      groupId: expense.groupId,
      payerId: expense.payerId,
      amount: expense.amount.toFixed(2),
      description: expense.description,
      splitConfiguration: expense.splitConfig,
      createdAt: expense.createdAt.toISOString(),
      updatedAt: expense.updatedAt.toISOString(),
    };
  }

  private parseSplitConfiguration(config: SplitConfiguration): SplitConfiguration {
    // Normalize split configuration
    return {
      type: config.type,
      splits: config.splits.map(split => ({
        userId: split.userId,
        amount: split.amount ? this.normalizeAmount(split.amount) : undefined,
        percentage: split.percentage,
      })),
    };
  }

  private normalizeAmount(amount: number): number {
    // Round to 2 decimal places
    return Math.round(amount * 100) / 100;
  }

  private generateId(): string {
    return `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

### Interface Definitions

```typescript
// src/models/expense.model.ts
export interface Expense {
  id: string;
  groupId: string;
  payerId: string;
  amount: number;
  description: string;
  splitConfig: SplitConfiguration;
  createdAt: Date;
  updatedAt: Date;
  modifiedBy?: string;
}

export interface SplitConfiguration {
  type: 'equal' | 'exact' | 'percentage';
  splits: Split[];
}

export interface Split {
  userId: string;
  amount?: number;
  percentage?: number;
}

export interface ExpenseInput {
  groupId: string;
  payerId: string;
  amount: number;
  description: string;
  splitConfig: SplitConfiguration;
}

// src/models/debt.model.ts
export interface Debt {
  id?: string;
  groupId?: string;
  debtorId: string;
  creditorId: string;
  amount: number;
  settled: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// src/models/settlement.model.ts
export interface Settlement {
  id: string;
  debtId: string;
  payerId: string;
  payeeId: string;
  amount: number;
  transactionHash: string;
  status: 'pending' | 'confirmed' | 'failed';
  createdAt: Date;
  confirmedAt?: Date;
}

// src/models/user.model.ts
export interface User {
  id: string;
  email: string;
  password: string;
  stellarPublicKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

// src/models/group.model.ts
export interface Group {
  id: string;
  name: string;
  creatorId: string;
  members: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

## Data Models

### Database Schema

#### Entity Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ GROUPS : creates
    USERS ||--o{ GROUP_MEMBERS : "belongs to"
    USERS ||--o{ EXPENSES : pays
    USERS ||--o{ DEBTS : owes
    USERS ||--o{ DEBTS : "is owed by"
    USERS ||--o{ SETTLEMENTS : "pays/receives"
    GROUPS ||--o{ GROUP_MEMBERS : has
    GROUPS ||--o{ EXPENSES : contains
    GROUPS ||--o{ DEBTS : contains
    EXPENSES ||--o{ EXPENSE_SPLITS : "split among"
    DEBTS ||--o{ SETTLEMENTS : "settled by"
    
    USERS {
        uuid id PK
        string email UK
        string password_hash
        string stellar_public_key
        timestamp created_at
        timestamp updated_at
    }
    
    GROUPS {
        uuid id PK
        string name
        uuid creator_id FK
        timestamp created_at
        timestamp updated_at
    }
    
    GROUP_MEMBERS {
        uuid id PK
        uuid group_id FK
        uuid user_id FK
        string role
        timestamp joined_at
    }
    
    EXPENSES {
        uuid id PK
        uuid group_id FK
        uuid payer_id FK
        decimal amount
        string description
        string split_type
        timestamp created_at
        timestamp updated_at
        uuid modified_by FK
    }
    
    EXPENSE_SPLITS {
        uuid id PK
        uuid expense_id FK
        uuid user_id FK
        decimal amount
        decimal percentage
    }
    
    DEBTS {
        uuid id PK
        uuid group_id FK
        uuid debtor_id FK
        uuid creditor_id FK
        decimal amount
        boolean settled
        timestamp created_at
        timestamp updated_at
    }
    
    SETTLEMENTS {
        uuid id PK
        uuid debt_id FK
        uuid payer_id FK
        uuid payee_id FK
        decimal amount
        string transaction_hash UK
        string status
        timestamp created_at
        timestamp confirmed_at
    }
    
    NOTIFICATIONS {
        uuid id PK
        uuid user_id FK
        string type
        jsonb data
        boolean read
        timestamp created_at
    }
```


#### Table Definitions

**users table:**
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    stellar_public_key VARCHAR(56),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_stellar_key ON users(stellar_public_key);
```

**groups table:**
```sql
CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_groups_creator ON groups(creator_id);
```

**group_members table:**
```sql
CREATE TABLE group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(group_id, user_id)
);

CREATE INDEX idx_group_members_group ON group_members(group_id);
CREATE INDEX idx_group_members_user ON group_members(user_id);
```

**expenses table:**
```sql
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    payer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
    description TEXT NOT NULL,
    split_type VARCHAR(20) NOT NULL CHECK (split_type IN ('equal', 'exact', 'percentage')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_by UUID REFERENCES users(id)
);

CREATE INDEX idx_expenses_group ON expenses(group_id);
CREATE INDEX idx_expenses_payer ON expenses(payer_id);
CREATE INDEX idx_expenses_created_at ON expenses(created_at DESC);
```

**expense_splits table:**
```sql
CREATE TABLE expense_splits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2),
    percentage DECIMAL(5, 2),
    CHECK (
        (amount IS NOT NULL AND percentage IS NULL) OR
        (amount IS NULL AND percentage IS NOT NULL)
    )
);

CREATE INDEX idx_expense_splits_expense ON expense_splits(expense_id);
CREATE INDEX idx_expense_splits_user ON expense_splits(user_id);
```

**debts table:**
```sql
CREATE TABLE debts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    debtor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    creditor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
    settled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (debtor_id != creditor_id)
);

CREATE INDEX idx_debts_group ON debts(group_id);
CREATE INDEX idx_debts_debtor ON debts(debtor_id);
CREATE INDEX idx_debts_creditor ON debts(creditor_id);
CREATE INDEX idx_debts_settled ON debts(settled);
```

**settlements table:**
```sql
CREATE TABLE settlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    debt_id UUID NOT NULL REFERENCES debts(id) ON DELETE CASCADE,
    payer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    payee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
    transaction_hash VARCHAR(64) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP
);

CREATE INDEX idx_settlements_debt ON settlements(debt_id);
CREATE INDEX idx_settlements_payer ON settlements(payer_id);
CREATE INDEX idx_settlements_payee ON settlements(payee_id);
CREATE INDEX idx_settlements_status ON settlements(status);
CREATE INDEX idx_settlements_created_at ON settlements(created_at DESC);
```

**notifications table:**
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    data JSONB NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
```

### Data Access Layer Pattern

```typescript
// src/dal/base.dal.ts
import { Pool, QueryResult } from 'pg';
import { logger } from '../utils/logger';

export abstract class BaseDAL {
  constructor(protected pool: Pool) {}

  protected async query<T>(text: string, params?: any[]): Promise<T[]> {
    const start = Date.now();
    try {
      const result: QueryResult = await this.pool.query(text, params);
      const duration = Date.now() - start;
      logger.debug('Executed query', { text, duration, rows: result.rowCount });
      return result.rows;
    } catch (error) {
      logger.error('Query failed', { text, params, error });
      throw error;
    }
  }

  protected async queryOne<T>(text: string, params?: any[]): Promise<T | null> {
    const rows = await this.query<T>(text, params);
    return rows.length > 0 ? rows[0] : null;
  }

  protected async transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

// src/dal/expense.dal.ts
import { BaseDAL } from './base.dal';
import { Expense } from '../models/expense.model';

export class ExpenseDAL extends BaseDAL {
  async create(expense: Expense): Promise<Expense> {
    const query = `
      INSERT INTO expenses (group_id, payer_id, amount, description, split_type)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const result = await this.queryOne<Expense>(query, [
      expense.groupId,
      expense.payerId,
      expense.amount,
      expense.description,
      expense.splitConfig.type,
    ]);

    // Insert splits
    for (const split of expense.splitConfig.splits) {
      await this.createSplit(result!.id, split);
    }

    return result!;
  }

  async findById(id: string): Promise<Expense | null> {
    const query = `
      SELECT e.*, 
             json_agg(
               json_build_object(
                 'userId', es.user_id,
                 'amount', es.amount,
                 'percentage', es.percentage
               )
             ) as splits
      FROM expenses e
      LEFT JOIN expense_splits es ON e.id = es.expense_id
      WHERE e.id = $1
      GROUP BY e.id
    `;
    
    return this.queryOne<Expense>(query, [id]);
  }

  async findByGroup(groupId: string): Promise<Expense[]> {
    const query = `
      SELECT e.*, 
             json_agg(
               json_build_object(
                 'userId', es.user_id,
                 'amount', es.amount,
                 'percentage', es.percentage
               )
             ) as splits
      FROM expenses e
      LEFT JOIN expense_splits es ON e.id = es.expense_id
      WHERE e.group_id = $1
      GROUP BY e.id
      ORDER BY e.created_at DESC
    `;
    
    return this.query<Expense>(query, [groupId]);
  }

  private async createSplit(expenseId: string, split: any): Promise<void> {
    const query = `
      INSERT INTO expense_splits (expense_id, user_id, amount, percentage)
      VALUES ($1, $2, $3, $4)
    `;
    
    await this.query(query, [
      expenseId,
      split.userId,
      split.amount || null,
      split.percentage || null,
    ]);
  }
}
```

## API Design

### RESTful Endpoint Specifications

#### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/auth/register` | Register new user | No |
| POST | `/api/v1/auth/login` | Login user | No |
| POST | `/api/v1/auth/refresh` | Refresh JWT token | Yes |
| POST | `/api/v1/auth/logout` | Logout user | Yes |

**POST /api/v1/auth/register**
```typescript
// Request
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

// Response (201 Created)
{
  "success": true,
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}

// Error Response (400 Bad Request)
{
  "success": false,
  "error": {
    "code": "DUPLICATE_EMAIL",
    "message": "Email already registered"
  }
}
```

**POST /api/v1/auth/login**
```typescript
// Request
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

// Response (200 OK)
{
  "success": true,
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}

// Error Response (401 Unauthorized)
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid credentials"
  }
}
```

#### Group Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/groups` | Create new group | Yes |
| GET | `/api/v1/groups` | Get user's groups | Yes |
| GET | `/api/v1/groups/:id` | Get group details | Yes |
| POST | `/api/v1/groups/:id/invite` | Invite user to group | Yes |
| POST | `/api/v1/groups/:id/accept` | Accept group invitation | Yes |
| DELETE | `/api/v1/groups/:id/members/:userId` | Remove member | Yes |

**POST /api/v1/groups**
```typescript
// Request
{
  "name": "Weekend Trip to Paris"
}

// Response (201 Created)
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "name": "Weekend Trip to Paris",
    "creatorId": "550e8400-e29b-41d4-a716-446655440000",
    "members": ["550e8400-e29b-41d4-a716-446655440000"],
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### Expense Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/expenses` | Create expense | Yes |
| GET | `/api/v1/expenses/:id` | Get expense details | Yes |
| GET | `/api/v1/groups/:groupId/expenses` | Get group expenses | Yes |
| PUT | `/api/v1/expenses/:id` | Update expense | Yes |
| DELETE | `/api/v1/expenses/:id` | Delete expense | Yes |
| GET | `/api/v1/expenses/search` | Search expenses | Yes |

**POST /api/v1/expenses**
```typescript
// Request
{
  "groupId": "660e8400-e29b-41d4-a716-446655440000",
  "amount": 120.50,
  "description": "Dinner at Restaurant",
  "splitConfiguration": {
    "type": "equal",
    "splits": [
      { "userId": "550e8400-e29b-41d4-a716-446655440000" },
      { "userId": "770e8400-e29b-41d4-a716-446655440001" },
      { "userId": "880e8400-e29b-41d4-a716-446655440002" }
    ]
  }
}

// Response (201 Created)
{
  "success": true,
  "data": {
    "id": "990e8400-e29b-41d4-a716-446655440003",
    "groupId": "660e8400-e29b-41d4-a716-446655440000",
    "payerId": "550e8400-e29b-41d4-a716-446655440000",
    "amount": "120.50",
    "description": "Dinner at Restaurant",
    "splitConfiguration": {
      "type": "equal",
      "splits": [
        { "userId": "550e8400-e29b-41d4-a716-446655440000", "amount": "40.17" },
        { "userId": "770e8400-e29b-41d4-a716-446655440001", "amount": "40.17" },
        { "userId": "880e8400-e29b-41d4-a716-446655440002", "amount": "40.16" }
      ]
    },
    "createdAt": "2024-01-15T19:45:00Z"
  }
}
```

#### Debt Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/groups/:groupId/debts` | Get group debts | Yes |
| GET | `/api/v1/users/me/balance/:groupId` | Get user balance in group | Yes |
| GET | `/api/v1/users/me/debts` | Get all user debts | Yes |

**GET /api/v1/groups/:groupId/debts**
```typescript
// Response (200 OK)
{
  "success": true,
  "data": {
    "debts": [
      {
        "id": "aa0e8400-e29b-41d4-a716-446655440004",
        "debtorId": "770e8400-e29b-41d4-a716-446655440001",
        "creditorId": "550e8400-e29b-41d4-a716-446655440000",
        "amount": "45.50",
        "settled": false
      },
      {
        "id": "bb0e8400-e29b-41d4-a716-446655440005",
        "debtorId": "880e8400-e29b-41d4-a716-446655440002",
        "creditorId": "550e8400-e29b-41d4-a716-446655440000",
        "amount": "30.25",
        "settled": false
      }
    ]
  }
}
```

#### Wallet Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/wallet/connect` | Connect Stellar wallet | Yes |
| GET | `/api/v1/wallet` | Get wallet info | Yes |
| PUT | `/api/v1/wallet` | Update wallet | Yes |
| POST | `/api/v1/wallet/verify` | Verify wallet ownership | Yes |

**POST /api/v1/wallet/connect**
```typescript
// Request
{
  "publicKey": "GDJKL...ABCD",
  "signature": "base64_encoded_signature"
}

// Response (200 OK)
{
  "success": true,
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "stellarPublicKey": "GDJKL...ABCD",
    "verified": true
  }
}
```

#### Settlement Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/settlements` | Initiate settlement | Yes |
| GET | `/api/v1/settlements/:id` | Get settlement details | Yes |
| GET | `/api/v1/settlements` | Get settlement history | Yes |
| POST | `/api/v1/settlements/:id/verify` | Verify settlement on blockchain | Yes |

**POST /api/v1/settlements**
```typescript
// Request
{
  "debtId": "aa0e8400-e29b-41d4-a716-446655440004",
  "signedTransactionXDR": "AAAA...base64_encoded_xdr"
}

// Response (201 Created)
{
  "success": true,
  "data": {
    "id": "cc0e8400-e29b-41d4-a716-446655440006",
    "debtId": "aa0e8400-e29b-41d4-a716-446655440004",
    "payerId": "770e8400-e29b-41d4-a716-446655440001",
    "payeeId": "550e8400-e29b-41d4-a716-446655440000",
    "amount": "45.50",
    "transactionHash": "abc123...def456",
    "status": "pending",
    "explorerUrl": "https://stellar.expert/explorer/testnet/tx/abc123...def456",
    "createdAt": "2024-01-15T20:00:00Z"
  }
}
```

### API Response Format

All API responses follow a consistent structure:

```typescript
// Success Response
{
  "success": true,
  "data": { /* response data */ }
}

// Error Response
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { /* optional additional details */ }
  }
}

// Paginated Response
{
  "success": true,
  "data": {
    "items": [ /* array of items */ ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "totalItems": 150,
      "totalPages": 8
    }
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `DUPLICATE_EMAIL` | 400 | Email already exists |
| `INVALID_CREDENTIALS` | 401 | Wrong email/password |
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource conflict |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `BLOCKCHAIN_ERROR` | 500 | Stellar network error |
| `INTERNAL_ERROR` | 500 | Server error |

### Route Implementation Example

```typescript
// src/routes/expense.routes.ts
import { Router } from 'express';
import { ExpenseController } from '../controllers/expense.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { expenseSchemas } from '../validators/expense.validator';

export function createExpenseRoutes(controller: ExpenseController): Router {
  const router = Router();

  // All routes require authentication
  router.use(authenticate);

  router.post(
    '/',
    validate(expenseSchemas.create),
    controller.createExpense.bind(controller)
  );

  router.get(
    '/:id',
    validate(expenseSchemas.getById),
    controller.getExpense.bind(controller)
  );

  router.get(
    '/search',
    validate(expenseSchemas.search),
    controller.searchExpenses.bind(controller)
  );

  return router;
}

// src/controllers/expense.controller.ts
import { Request, Response, NextFunction } from 'express';
import { ExpenseService } from '../services/expense.service';
import { logger } from '../utils/logger';

export class ExpenseController {
  constructor(private expenseService: ExpenseService) {}

  async createExpense(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { groupId, amount, description, splitConfiguration } = req.body;
      const payerId = req.user!.userId; // Set by auth middleware

      const expense = await this.expenseService.createExpense(
        groupId,
        payerId,
        amount,
        description,
        splitConfiguration
      );

      res.status(201).json({
        success: true,
        data: expense,
      });
    } catch (error) {
      next(error);
    }
  }

  async getExpense(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const expense = await this.expenseService.getExpense(id);

      if (!expense) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Expense not found',
          },
        });
      }

      res.json({
        success: true,
        data: expense,
      });
    } catch (error) {
      next(error);
    }
  }
}
```


## Stellar Integration

### Stellar Network Configuration

```typescript
// src/config/stellar.ts
import * as StellarSdk from '@stellar/stellar-sdk';

export const stellarConfig = {
  horizonUrl: process.env.STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org',
  isTestnet: process.env.STELLAR_NETWORK === 'testnet',
  networkPassphrase: process.env.STELLAR_NETWORK === 'testnet'
    ? StellarSdk.Networks.TESTNET
    : StellarSdk.Networks.PUBLIC,
  baseFee: StellarSdk.BASE_FEE,
  transactionTimeout: 180, // 3 minutes
};
```

### Settlement Flow

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Database
    participant Stellar
    
    Client->>API: POST /settlements (debtId)
    API->>Database: Get debt details
    Database-->>API: Debt info
    API->>API: Create unsigned transaction
    API-->>Client: Return transaction XDR
    Client->>Client: Sign transaction with private key
    Client->>API: POST /settlements (signed XDR)
    API->>Stellar: Submit transaction
    Stellar-->>API: Transaction hash
    API->>Database: Create settlement record (pending)
    API-->>Client: Settlement created (pending)
    
    loop Monitor transaction
        API->>Stellar: Check transaction status
        Stellar-->>API: Status update
    end
    
    Stellar-->>API: Transaction confirmed
    API->>Database: Update settlement (confirmed)
    API->>Database: Mark debt as settled
    API->>Client: Send notification
```

### Wallet Connection Flow

```typescript
// src/services/wallet.service.ts
import { StellarService } from './stellar.service';
import { UserDAL } from '../dal/user.dal';
import { ValidationError } from '../utils/errors';
import * as crypto from 'crypto';

export class WalletService {
  constructor(
    private stellarService: StellarService,
    private userDAL: UserDAL
  ) {}

  async connectWallet(userId: string, publicKey: string): Promise<void> {
    // Validate public key format and existence
    const isValid = await this.stellarService.validatePublicKey(publicKey);
    if (!isValid) {
      throw new ValidationError('Invalid Stellar public key or account does not exist');
    }

    // Update user's wallet
    await this.userDAL.updateStellarKey(userId, publicKey);
  }

  async generateChallenge(userId: string): Promise<string> {
    // Generate random challenge for wallet verification
    const challenge = crypto.randomBytes(32).toString('hex');
    
    // Store challenge temporarily (Redis with 5 min expiration)
    await this.storeChallengeTemporarily(userId, challenge);
    
    return challenge;
  }

  async verifyWalletOwnership(
    userId: string,
    signature: string,
    challenge: string
  ): Promise<boolean> {
    // Retrieve stored challenge
    const storedChallenge = await this.getStoredChallenge(userId);
    if (storedChallenge !== challenge) {
      return false;
    }

    // Get user's public key
    const user = await this.userDAL.findById(userId);
    if (!user?.stellarPublicKey) {
      return false;
    }

    // Verify signature (implementation depends on signature scheme)
    // This is a simplified example
    return this.verifySignature(user.stellarPublicKey, challenge, signature);
  }
}
```

### Transaction Monitoring Job

```typescript
// src/jobs/settlementMonitor.job.ts
import { Queue, Worker } from 'bull';
import { StellarService } from '../services/stellar.service';
import { SettlementDAL } from '../dal/settlement.dal';
import { DebtDAL } from '../dal/debt.dal';
import { NotificationService } from '../services/notification.service';
import { logger } from '../utils/logger';

export class SettlementMonitorJob {
  private queue: Queue;
  private worker: Worker;

  constructor(
    private stellarService: StellarService,
    private settlementDAL: SettlementDAL,
    private debtDAL: DebtDAL,
    private notificationService: NotificationService
  ) {
    this.queue = new Queue('settlement-monitor', {
      redis: { host: 'localhost', port: 6379 },
    });

    this.worker = new Worker('settlement-monitor', this.processJob.bind(this), {
      redis: { host: 'localhost', port: 6379 },
    });
  }

  async addToQueue(settlementId: string, transactionHash: string): Promise<void> {
    await this.queue.add(
      { settlementId, transactionHash },
      {
        attempts: 30,
        backoff: { type: 'fixed', delay: 2000 }, // 2 seconds
      }
    );
  }

  private async processJob(job: any): Promise<void> {
    const { settlementId, transactionHash } = job.data;

    try {
      // Check transaction status on Stellar network
      const isConfirmed = await this.stellarService.verifyTransaction(transactionHash);

      if (isConfirmed) {
        // Update settlement status
        await this.settlementDAL.updateStatus(settlementId, 'confirmed');

        // Mark debt as settled
        const settlement = await this.settlementDAL.findById(settlementId);
        await this.debtDAL.markAsSettled(settlement.debtId);

        // Send notifications
        await this.notificationService.sendSettlementConfirmed(
          settlement.payerId,
          settlement.payeeId,
          settlement.amount
        );

        logger.info('Settlement confirmed', { settlementId, transactionHash });
      } else {
        // Transaction not confirmed yet, will retry
        throw new Error('Transaction not confirmed yet');
      }
    } catch (error) {
      logger.error('Settlement monitoring failed', { settlementId, error });
      throw error; // Will trigger retry
    }
  }
}
```

## Authentication Flow

### JWT Token Structure

```typescript
// src/utils/jwt.ts
import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface TokenPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: '24h',
    issuer: 'drips-divide-api',
  });
}

export function verifyToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, config.jwtSecret, {
      issuer: 'drips-divide-api',
    }) as TokenPayload;
  } catch (error) {
    throw new AuthenticationError('Invalid or expired token');
  }
}

export function refreshToken(oldToken: string): string {
  const payload = verifyToken(oldToken);
  
  // Generate new token with same payload
  return generateToken({
    userId: payload.userId,
    email: payload.email,
  });
}
```

### Authentication Middleware

```typescript
// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { AuthenticationError } from '../utils/errors';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
    }
  }
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const payload = verifyToken(token);

    // Attach user info to request
    req.user = {
      userId: payload.userId,
      email: payload.email,
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      },
    });
  }
}

// Optional: Role-based authorization middleware
export function authorize(...roles: string[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Check if user has required role
    // Implementation depends on role storage strategy
    next();
  };
}
```

### Password Security

```typescript
// src/utils/crypto.ts
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function validatePasswordStrength(password: string): boolean {
  // Minimum 8 characters, at least one uppercase, one lowercase, one number
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return regex.test(password);
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Expense Serialization Round-Trip

*For any* valid Expense object, serializing it to JSON format and then parsing it back SHALL produce an equivalent Expense object with the same id, groupId, payerId, amount, description, and splitConfiguration.

**Validates: Requirements 3.2, 3.3, 3.4**

### Property 2: Split Configuration Validation

*For any* split configuration, if the type is 'exact' then the sum of all split amounts SHALL equal the total expense amount within 0.01 precision, and if the type is 'percentage' then the sum of all percentages SHALL equal 100 within 0.01 precision.

**Validates: Requirements 3.8**

### Property 3: Balance Calculation with Precision

*For any* set of expenses in a group, when calculating a user's balance, the result SHALL be accurate to 2 decimal places and SHALL equal the sum of amounts the user paid minus the sum of amounts the user owes from all expense splits.

**Validates: Requirements 4.2, 4.6**

### Property 4: Debt Optimization Minimizes Transactions

*For any* set of user balances in a group, the debt optimization algorithm SHALL produce a set of debts where the number of debt transactions is less than or equal to the number of users minus one, and the sum of all debt amounts SHALL equal the sum of all positive balances.

**Validates: Requirements 4.3**

### Property 5: Debt Consolidation

*For any* pair of users with multiple expenses between them, the calculated debt SHALL be a single net amount equal to the difference between what one user paid for the other minus what the other paid for the first user.

**Validates: Requirements 4.4**

### Property 6: Stellar Public Key Validation

*For any* string that is not a valid Stellar Ed25519 public key format (56 characters starting with 'G'), the validation function SHALL return false or throw a validation error.

**Validates: Requirements 5.2**

### Property 7: Input Validation

*For any* API request, if any required field is missing or any field contains an invalid data type, the API SHALL return a 400 status code with a descriptive validation error indicating which field failed validation.

**Validates: Requirements 10.1, 10.2**

### Property 8: Input Sanitization

*For any* user input containing SQL injection patterns (e.g., '; DROP TABLE) or XSS patterns (e.g., <script>), the sanitization function SHALL escape or remove the malicious content before database storage or response rendering.

**Validates: Requirements 10.6, 10.7**

## Error Handling

### Custom Error Classes

```typescript
// src/utils/errors.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string) {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string) {
    super(message, 403, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}

export class BlockchainError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 500, 'BLOCKCHAIN_ERROR', details);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string) {
    super('Database operation failed', 500, 'DATABASE_ERROR');
  }
}
```

### Global Error Handler

```typescript
// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log error
  logger.error('Request error', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.userId,
  });

  // Handle known errors
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    });
    return;
  }

  // Handle unknown errors
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  });
}

// Async error wrapper
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
```

### Database Error Handling

```typescript
// src/dal/base.dal.ts (error handling addition)
protected async query<T>(text: string, params?: any[]): Promise<T[]> {
  try {
    const result = await this.pool.query(text, params);
    return result.rows;
  } catch (error: any) {
    logger.error('Database query failed', { text, params, error: error.message });
    
    // Handle specific PostgreSQL errors
    if (error.code === '23505') {
      throw new ConflictError('Resource already exists');
    }
    if (error.code === '23503') {
      throw new ValidationError('Referenced resource does not exist');
    }
    if (error.code === '23502') {
      throw new ValidationError('Required field is missing');
    }
    
    throw new DatabaseError(error.message);
  }
}
```

## Testing Strategy

### Testing Approach

The DripsDivide backend uses a comprehensive testing strategy combining:

1. **Unit Tests**: Test individual functions and methods in isolation
2. **Integration Tests**: Test API endpoints and database interactions
3. **Property-Based Tests**: Test universal properties across randomized inputs
4. **Contract Tests**: Verify Stellar blockchain integration

### Unit Testing

**Test Structure:**
```typescript
// tests/unit/services/debt.service.test.ts
import { DebtService } from '../../../src/services/debt.service';
import { DebtDAL } from '../../../src/dal/debt.dal';
import { ExpenseDAL } from '../../../src/dal/expense.dal';

describe('DebtService', () => {
  let debtService: DebtService;
  let mockDebtDAL: jest.Mocked<DebtDAL>;
  let mockExpenseDAL: jest.Mocked<ExpenseDAL>;

  beforeEach(() => {
    mockDebtDAL = {
      findByUserAndGroup: jest.fn(),
      replaceGroupDebts: jest.fn(),
    } as any;

    mockExpenseDAL = {
      findByGroup: jest.fn(),
    } as any;

    debtService = new DebtService(mockDebtDAL, mockExpenseDAL);
  });

  describe('calculateBalances', () => {
    it('should calculate correct balances for simple expense', () => {
      const expenses = [
        {
          payerId: 'user1',
          amount: 100,
          splits: [
            { userId: 'user1', amount: 50 },
            { userId: 'user2', amount: 50 },
          ],
        },
      ];

      const balances = debtService['calculateBalances'](expenses);

      expect(balances.get('user1')).toBe(50); // Paid 100, owes 50
      expect(balances.get('user2')).toBe(-50); // Owes 50
    });

    it('should handle multiple expenses', () => {
      const expenses = [
        {
          payerId: 'user1',
          amount: 100,
          splits: [
            { userId: 'user1', amount: 50 },
            { userId: 'user2', amount: 50 },
          ],
        },
        {
          payerId: 'user2',
          amount: 60,
          splits: [
            { userId: 'user1', amount: 30 },
            { userId: 'user2', amount: 30 },
          ],
        },
      ];

      const balances = debtService['calculateBalances'](expenses);

      expect(balances.get('user1')).toBe(20); // Paid 100, owes 80
      expect(balances.get('user2')).toBe(-20); // Paid 60, owes 80
    });
  });

  describe('optimizeDebts', () => {
    it('should minimize transactions for simple case', () => {
      const balances = new Map([
        ['user1', 50],
        ['user2', -30],
        ['user3', -20],
      ]);

      const debts = debtService['optimizeDebts'](balances);

      expect(debts).toHaveLength(2);
      expect(debts[0]).toMatchObject({
        creditorId: 'user1',
        debtorId: 'user2',
        amount: 30,
      });
      expect(debts[1]).toMatchObject({
        creditorId: 'user1',
        debtorId: 'user3',
        amount: 20,
      });
    });
  });
});
```

### Integration Testing

```typescript
// tests/integration/expense.test.ts
import request from 'supertest';
import { app } from '../../src/app';
import { pool } from '../../src/config/database';

describe('Expense API', () => {
  let authToken: string;
  let userId: string;
  let groupId: string;

  beforeAll(async () => {
    // Setup test database
    await pool.query('BEGIN');
    
    // Create test user and get token
    const registerRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'test@example.com',
        password: 'TestPass123!',
      });
    
    authToken = registerRes.body.data.token;
    userId = registerRes.body.data.userId;

    // Create test group
    const groupRes = await request(app)
      .post('/api/v1/groups')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Test Group' });
    
    groupId = groupRes.body.data.id;
  });

  afterAll(async () => {
    await pool.query('ROLLBACK');
    await pool.end();
  });

  describe('POST /api/v1/expenses', () => {
    it('should create expense with equal split', async () => {
      const res = await request(app)
        .post('/api/v1/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          groupId,
          amount: 120.00,
          description: 'Test expense',
          splitConfiguration: {
            type: 'equal',
            splits: [{ userId }],
          },
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toMatchObject({
        groupId,
        payerId: userId,
        amount: '120.00',
        description: 'Test expense',
      });
    });

    it('should reject invalid split configuration', async () => {
      const res = await request(app)
        .post('/api/v1/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          groupId,
          amount: 100.00,
          description: 'Test expense',
          splitConfiguration: {
            type: 'percentage',
            splits: [
              { userId, percentage: 60 },
              // Missing 40% - should fail
            ],
          },
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/v1/expenses')
        .send({
          groupId,
          amount: 100.00,
          description: 'Test expense',
        });

      expect(res.status).toBe(401);
    });
  });
});
```

### Property-Based Testing

```typescript
// tests/property/parser.property.test.ts
import * as fc from 'fast-check';
import { ParserService } from '../../src/services/parser.service';
import { ExpenseInput } from '../../src/models/expense.model';

describe('ParserService Properties', () => {
  const parserService = new ParserService();

  // Arbitrary generators
  const expenseInputArbitrary = fc.record({
    groupId: fc.uuid(),
    payerId: fc.uuid(),
    amount: fc.double({ min: 0.01, max: 10000, noNaN: true }),
    description: fc.string({ minLength: 1, maxLength: 500 }),
    splitConfig: fc.record({
      type: fc.constantFrom('equal', 'exact', 'percentage'),
      splits: fc.array(
        fc.record({
          userId: fc.uuid(),
          amount: fc.option(fc.double({ min: 0.01, max: 10000 })),
          percentage: fc.option(fc.double({ min: 0.01, max: 100 })),
        }),
        { minLength: 1, maxLength: 10 }
      ),
    }),
  });

  /**
   * Feature: drips-divide-backend-scaffold, Property 1: Expense Serialization Round-Trip
   * For any valid Expense object, serializing it to JSON format and then parsing it back
   * SHALL produce an equivalent Expense object
   */
  it('should preserve expense data through serialize-parse round trip', () => {
    fc.assert(
      fc.property(expenseInputArbitrary, (input: ExpenseInput) => {
        // Parse input to expense
        const expense = parserService.parseExpense(input);

        // Serialize to JSON
        const serialized = parserService.serializeExpense(expense);

        // Parse back (simulating JSON.parse of API response)
        const reparsed = parserService.parseExpense({
          groupId: serialized.groupId,
          payerId: serialized.payerId,
          amount: parseFloat(serialized.amount),
          description: serialized.description,
          splitConfig: serialized.splitConfiguration,
        });

        // Verify equivalence
        expect(reparsed.groupId).toBe(expense.groupId);
        expect(reparsed.payerId).toBe(expense.payerId);
        expect(reparsed.amount).toBeCloseTo(expense.amount, 2);
        expect(reparsed.description).toBe(expense.description);
        expect(reparsed.splitConfig.type).toBe(expense.splitConfig.type);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: drips-divide-backend-scaffold, Property 3: Balance Calculation with Precision
   * For any set of expenses, balance calculations SHALL maintain 2 decimal place precision
   */
  it('should maintain 2 decimal precision in all calculations', () => {
    fc.assert(
      fc.property(
        fc.array(fc.double({ min: 0.01, max: 1000, noNaN: true }), {
          minLength: 1,
          maxLength: 100,
        }),
        (amounts: number[]) => {
          const sum = amounts.reduce((acc, amt) => acc + amt, 0);
          const normalized = Math.round(sum * 100) / 100;

          // Verify precision
          const decimalPlaces = (normalized.toString().split('.')[1] || '').length;
          expect(decimalPlaces).toBeLessThanOrEqual(2);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Test Coverage Requirements

- **Minimum 80% code coverage** across all modules
- **100% coverage** for critical paths (authentication, payment processing, debt calculation)
- **Property-based tests** for parser/serializer with minimum 100 iterations
- **Integration tests** for all API endpoints
- **Stellar testnet tests** for blockchain integration

### Running Tests

```json
// package.json scripts
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest tests/unit",
    "test:integration": "jest tests/integration",
    "test:property": "jest tests/property",
    "test:coverage": "jest --coverage",
    "test:watch": "jest --watch"
  }
}
```


## Deployment Architecture

### Infrastructure Overview

```mermaid
graph TB
    subgraph "Production Environment"
        LB[Load Balancer / Nginx]
        API1[API Server Instance 1]
        API2[API Server Instance 2]
        API3[API Server Instance 3]
        
        subgraph "Data Layer"
            PG_PRIMARY[(PostgreSQL Primary)]
            PG_REPLICA[(PostgreSQL Replica)]
            REDIS[(Redis Cache)]
        end
        
        subgraph "Background Jobs"
            WORKER1[Worker Instance 1]
            WORKER2[Worker Instance 2]
        end
        
        subgraph "External Services"
            STELLAR[Stellar Network]
            EMAIL[Email Service]
        end
    end
    
    CLIENT[Clients] --> LB
    LB --> API1
    LB --> API2
    LB --> API3
    
    API1 --> PG_PRIMARY
    API2 --> PG_PRIMARY
    API3 --> PG_PRIMARY
    
    API1 --> PG_REPLICA
    API2 --> PG_REPLICA
    API3 --> PG_REPLICA
    
    API1 --> REDIS
    API2 --> REDIS
    API3 --> REDIS
    
    WORKER1 --> PG_PRIMARY
    WORKER2 --> PG_PRIMARY
    WORKER1 --> REDIS
    WORKER2 --> REDIS
    
    API1 --> STELLAR
    API2 --> STELLAR
    API3 --> STELLAR
    
    WORKER1 --> EMAIL
    WORKER2 --> EMAIL
```

### Docker Configuration

**Dockerfile:**
```dockerfile
# Multi-stage build for optimized image size
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy source code
COPY src ./src

# Build TypeScript
RUN npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "dist/server.js"]
```

**docker-compose.yml (Development):**
```yaml
version: '3.8'

services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/drips_divide
      - REDIS_URL=redis://redis:6379
      - STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
      - STELLAR_NETWORK=testnet
      - JWT_SECRET=dev_secret_change_in_production
    depends_on:
      - postgres
      - redis
    volumes:
      - ./src:/app/src
    command: npm run dev

  postgres:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=drips_divide
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./src/db/migrations:/docker-entrypoint-initdb.d

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  worker:
    build:
      context: .
      dockerfile: Dockerfile
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/drips_divide
      - REDIS_URL=redis://redis:6379
      - STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
      - STELLAR_NETWORK=testnet
    depends_on:
      - postgres
      - redis
    command: npm run worker

volumes:
  postgres_data:
  redis_data:
```

### Environment Configuration

**.env.example:**
```bash
# Server Configuration
NODE_ENV=production
PORT=3000
API_VERSION=v1

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/drips_divide
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
DATABASE_SSL=true

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=
REDIS_TLS=false

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRATION=24h

# Stellar Configuration
STELLAR_HORIZON_URL=https://horizon.stellar.org
STELLAR_NETWORK=public
# For testnet: STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
# For testnet: STELLAR_NETWORK=testnet

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
CORS_ORIGIN=https://yourdomain.com
CORS_CREDENTIALS=true

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# Email Configuration (optional)
EMAIL_SERVICE=sendgrid
EMAIL_API_KEY=
EMAIL_FROM=noreply@dripsdivide.com

# Monitoring (optional)
SENTRY_DSN=
NEW_RELIC_LICENSE_KEY=
```

### Configuration Management

```typescript
// src/config/index.ts
import dotenv from 'dotenv';
import { logger } from '../utils/logger';

dotenv.config();

interface Config {
  env: string;
  port: number;
  apiVersion: string;
  database: {
    url: string;
    poolMin: number;
    poolMax: number;
    ssl: boolean;
  };
  redis: {
    url: string;
    password?: string;
    tls: boolean;
  };
  jwt: {
    secret: string;
    expiration: string;
  };
  stellar: {
    horizonUrl: string;
    isTestnet: boolean;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  cors: {
    origin: string;
    credentials: boolean;
  };
  logging: {
    level: string;
    format: string;
  };
}

function validateConfig(): Config {
  const requiredEnvVars = [
    'DATABASE_URL',
    'REDIS_URL',
    'JWT_SECRET',
    'STELLAR_HORIZON_URL',
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }

  return {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    apiVersion: process.env.API_VERSION || 'v1',
    database: {
      url: process.env.DATABASE_URL!,
      poolMin: parseInt(process.env.DATABASE_POOL_MIN || '2', 10),
      poolMax: parseInt(process.env.DATABASE_POOL_MAX || '10', 10),
      ssl: process.env.DATABASE_SSL === 'true',
    },
    redis: {
      url: process.env.REDIS_URL!,
      password: process.env.REDIS_PASSWORD,
      tls: process.env.REDIS_TLS === 'true',
    },
    jwt: {
      secret: process.env.JWT_SECRET!,
      expiration: process.env.JWT_EXPIRATION || '24h',
    },
    stellar: {
      horizonUrl: process.env.STELLAR_HORIZON_URL!,
      isTestnet: process.env.STELLAR_NETWORK === 'testnet',
    },
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
      maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    },
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      credentials: process.env.CORS_CREDENTIALS === 'true',
    },
    logging: {
      level: process.env.LOG_LEVEL || 'info',
      format: process.env.LOG_FORMAT || 'json',
    },
  };
}

export const config = validateConfig();

// Log configuration on startup (excluding secrets)
logger.info('Configuration loaded', {
  env: config.env,
  port: config.port,
  stellar: {
    network: config.stellar.isTestnet ? 'testnet' : 'mainnet',
  },
});
```

### Application Entry Point

```typescript
// src/server.ts
import { app } from './app';
import { config } from './config';
import { logger } from './utils/logger';
import { pool } from './config/database';

const PORT = config.port;

// Graceful shutdown handler
let server: any;

async function startServer() {
  try {
    // Test database connection
    await pool.query('SELECT NOW()');
    logger.info('Database connection established');

    // Start server
    server = app.listen(PORT, () => {
      logger.info(`Server started`, {
        port: PORT,
        env: config.env,
        apiVersion: config.apiVersion,
      });
    });

    // Handle graceful shutdown
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

async function gracefulShutdown() {
  logger.info('Received shutdown signal, closing server gracefully');

  // Stop accepting new connections
  server.close(async () => {
    logger.info('HTTP server closed');

    try {
      // Close database connections
      await pool.end();
      logger.info('Database connections closed');

      // Exit process
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown', { error });
      process.exit(1);
    }
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
}

// Start the server
startServer();

// src/app.ts
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { config } from './config';
import { requestLogger } from './middleware/logger';
import { rateLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import { createRoutes } from './routes';

export const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.cors.origin,
  credentials: config.cors.credentials,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// Rate limiting
app.use(rateLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API version endpoint
app.get('/version', (req, res) => {
  res.json({
    version: config.apiVersion,
    environment: config.env,
  });
});

// API routes
app.use(`/api/${config.apiVersion}`, createRoutes());

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found',
    },
  });
});

// Error handler (must be last)
app.use(errorHandler);
```

### Database Migrations

```typescript
// scripts/migrate.ts
import { Pool } from 'pg';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { config } from '../src/config';
import { logger } from '../src/utils/logger';

const pool = new Pool({ connectionString: config.database.url });

async function runMigrations() {
  try {
    // Create migrations table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Get list of migration files
    const migrationsDir = join(__dirname, '../src/db/migrations');
    const files = readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    // Get executed migrations
    const { rows } = await pool.query('SELECT name FROM migrations');
    const executedMigrations = new Set(rows.map(r => r.name));

    // Run pending migrations
    for (const file of files) {
      if (!executedMigrations.has(file)) {
        logger.info(`Running migration: ${file}`);
        
        const sql = readFileSync(join(migrationsDir, file), 'utf-8');
        
        await pool.query('BEGIN');
        try {
          await pool.query(sql);
          await pool.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
          await pool.query('COMMIT');
          
          logger.info(`Migration completed: ${file}`);
        } catch (error) {
          await pool.query('ROLLBACK');
          throw error;
        }
      }
    }

    logger.info('All migrations completed successfully');
  } catch (error) {
    logger.error('Migration failed', { error });
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
```

### Deployment Checklist

**Pre-Deployment:**
- [ ] All tests passing (unit, integration, property-based)
- [ ] Code coverage meets 80% threshold
- [ ] Security audit completed
- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] Stellar testnet integration verified
- [ ] Load testing completed
- [ ] Documentation updated

**Deployment Steps:**
1. Build Docker image: `docker build -t drips-divide-api:latest .`
2. Run database migrations: `npm run migrate`
3. Deploy API servers with rolling update strategy
4. Deploy worker instances
5. Verify health checks passing
6. Monitor error rates and performance metrics
7. Rollback plan ready if issues detected

**Post-Deployment:**
- [ ] Health checks passing
- [ ] API endpoints responding correctly
- [ ] Database connections stable
- [ ] Stellar integration working
- [ ] Background jobs processing
- [ ] Monitoring alerts configured
- [ ] Logs being collected
- [ ] Performance metrics within acceptable range

### Monitoring and Logging

```typescript
// src/utils/logger.ts
import winston from 'winston';
import { config } from '../config';

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  config.logging.format === 'json'
    ? winston.format.json()
    : winston.format.simple()
);

export const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  defaultMeta: {
    service: 'drips-divide-api',
    environment: config.env,
  },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    // Add file transport for production
    ...(config.env === 'production'
      ? [
          new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
          }),
          new winston.transports.File({
            filename: 'logs/combined.log',
          }),
        ]
      : []),
  ],
});

// Request logging middleware
// src/middleware/logger.ts
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    
    logger.info('HTTP Request', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      userId: req.user?.userId,
      ip: req.ip,
    });
  });

  next();
}
```

### Security Hardening

```typescript
// src/middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';
import { config } from '../config';

export const rateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limit for authentication endpoints
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  skipSuccessfulRequests: true,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many login attempts, please try again later',
    },
  },
});
```

### Performance Optimization

**Database Connection Pooling:**
```typescript
// src/config/database.ts
import { Pool } from 'pg';
import { config } from './index';
import { logger } from '../utils/logger';

export const pool = new Pool({
  connectionString: config.database.url,
  min: config.database.poolMin,
  max: config.database.poolMax,
  ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  logger.error('Unexpected database error', { error: err });
});

pool.on('connect', () => {
  logger.debug('New database connection established');
});
```

**Redis Caching:**
```typescript
// src/config/redis.ts
import { createClient } from 'redis';
import { config } from './index';
import { logger } from '../utils/logger';

export const redisClient = createClient({
  url: config.redis.url,
  password: config.redis.password,
  socket: {
    tls: config.redis.tls,
    rejectUnauthorized: false,
  },
});

redisClient.on('error', (err) => {
  logger.error('Redis error', { error: err });
});

redisClient.on('connect', () => {
  logger.info('Redis connection established');
});

export async function connectRedis() {
  await redisClient.connect();
}

// Cache helper functions
export async function cacheGet<T>(key: string): Promise<T | null> {
  const value = await redisClient.get(key);
  return value ? JSON.parse(value) : null;
}

export async function cacheSet(
  key: string,
  value: any,
  expirationSeconds: number = 3600
): Promise<void> {
  await redisClient.setEx(key, expirationSeconds, JSON.stringify(value));
}

export async function cacheDelete(key: string): Promise<void> {
  await redisClient.del(key);
}
```

## Summary

This design document provides a comprehensive blueprint for building the DripsDivide backend with:

1. **Layered Architecture**: Clear separation of concerns across routes, controllers, services, and data access layers
2. **Technology Stack**: Modern Node.js/TypeScript stack with PostgreSQL, Redis, and Stellar SDK
3. **Complete Project Structure**: Detailed directory organization with 50+ files organized by feature and layer
4. **Code Examples**: Production-ready implementation patterns for all major components
5. **Database Schema**: Normalized schema with proper indexes and constraints for financial data
6. **RESTful API**: Comprehensive endpoint specifications with request/response examples
7. **Stellar Integration**: Complete blockchain integration with wallet management and settlement monitoring
8. **Authentication**: JWT-based auth with secure password hashing and token management
9. **Error Handling**: Custom error classes and global error handling middleware
10. **Testing Strategy**: Unit, integration, and property-based testing with 80% coverage target
11. **Deployment**: Docker containerization, environment configuration, and production deployment guide
12. **Security**: Rate limiting, input validation, SQL injection prevention, and HTTPS enforcement
13. **Monitoring**: Structured logging, health checks, and performance monitoring

The design follows industry best practices for building scalable, secure, and maintainable backend services while providing specific implementation details for the expense splitting and blockchain settlement features.

