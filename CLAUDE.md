# CLAUDE.md - MoneyBuddy Mobile App

## Project Overview

MoneyBuddy is a React Native mobile app for financial education targeted at families. It has two distinct user roles:
- **Parents**: Manage children's pocket money, create tasks/chores with monetary rewards, and access educational finance courses.
- **Children**: View and complete assigned tasks, track pocket money balance, log expenses, and take interactive financial education courses.

## Tech Stack

- **Framework**: React Native `0.81.5` with React `19.1.0`
- **Expo**: `~54.0.25` (managed workflow via EAS)
- **Language**: TypeScript `~5.9.2` (strict mode)
- **Navigation**: `expo-router` ~6.0.15 (file-based routing)
- **HTTP**: `axios` via a custom `ApiService` singleton with JWT interceptors
- **Storage**: `@react-native-async-storage/async-storage`
- **Animations**: `react-native-reanimated`, `react-native-gesture-handler`
- **Graphics**: `react-native-svg` for custom icon components
- **Payments**: `@stripe/stripe-react-native` (Google Pay / Apple Pay)
- **Auth**: JWT tokens + Apple Sign-In + Google Sign-In + PIN for child profiles
- **Package Manager**: npm

## Project Structure

```
app/                    # Expo Router file-based navigation
  _layout.tsx           # Root layout: fonts + AuthProvider
  index.tsx             # Entry/landing/splash
  plans.tsx             # Subscription plan selection
  (auth)/               # Unauthenticated route group
    login.tsx
    register.tsx
    forgot-password.tsx
  (app)/                # Authenticated route group (behind AuthGuard)
    _layout.tsx         # App layout with BottomNavigation
    home/               # Home (parent.tsx / child.tsx variants)
    children/           # Child management: add-money, create-task, goals
    courses/            # Course browser + detail viewer
    tasks/              # Task management + PIN entry for child login
    goals/              # Savings goals
    revenus/            # Income/expenses tracking
    accounts/           # Account management with PIN entry
    profile.tsx

components/             # Reusable UI components
  AuthGuard.tsx         # HOC protecting authenticated routes
  BottomNavigation.tsx  # Tab bar
  Icons/                # 30+ custom SVG icon components

contexts/
  AuthContext.tsx       # Global auth state (user, isAuthenticated, login/logout/refresh)

services/               # API service layer
  api.ts                # Singleton ApiService (Axios + interceptors)
  authService.ts
  userService.ts
  tasksService.ts
  moneyService.ts
  transactionService.ts
  goalsService.ts
  chapterService.ts

types/                  # TypeScript interfaces and enums
  Account.ts            # Account, SubAccount, Authority
  Task.ts               # Task, Income, CreateTaskRequest + enums
  Transaction.ts / Goal.ts / Chapter.ts / api.ts

utils/
  storage.ts            # AsyncStorage abstraction (TokenStorage, UserStorage, PreferencesStorage)
  logger.ts             # Dev/prod logging utility

styles/
  index.ts              # Central `theme` export
  colors.ts             # Full color palette (carbon, primary, secondary, tertiary scales)
  typography.ts         # Font families and size presets
  spacing.ts            # Spacing scale
  shadows.ts            # Shadow presets
  commonStyles.ts       # Shared layout styles

hooks/
  useAuth.ts            # Custom hook wrapping AuthContext
```

## Commands

```bash
npm start               # Start Expo dev server
npm run ios             # Run on iOS simulator
npm run android         # Run on Android emulator
npm run web             # Run in browser
npm run format          # Run Prettier formatter
```

## Environment Variables

```
EXPO_PUBLIC_BASE_URL    # Backend API base URL (required)
```

## Architecture & Key Patterns

### Routing
File-based routing with Expo Router. Route groups:
- `(auth)/` — unauthenticated screens (no token required)
- `(app)/` — authenticated screens, wrapped by `AuthGuard` which redirects unauthenticated users

### API Layer
All API calls go through the singleton `apiService` from `@/services/api.ts`. Individual service modules handle domain-specific endpoints (`authService`, `tasksService`, etc.). The singleton adds JWT tokens to requests via interceptors and handles token refresh.

### Dual Token System
Two separate JWT tokens: one for the main (parent) account and one for the active sub-account (child). These are stored separately in AsyncStorage via `TokenStorage` and selected per-request. Child profiles are switched via PIN entry (`tasks/pin-entry.tsx`), which exchanges for a sub-account token.

### Role-based UI
Parent and child users see different home screens (`home/parent.tsx` vs `home/child.tsx`) based on account role from `AuthContext`.

### Style System
All styles are centralized in `@/styles`. Import `theme` from `@/styles` to access `colors`, `typography`, `spacing`, `shadows`, and `commonStyles`. Do not define colors or font sizes inline.

### Icons
Each icon is a dedicated `.tsx` React component in `components/Icons/` using `react-native-svg`. Add new icons there.

### Path Alias
Use `@/` for absolute imports from the project root (configured in `tsconfig.json`).

```ts
import { theme } from '@/styles';
import { useAuth } from '@/hooks/useAuth';
```

## API Reference

Base URL: `https://api.moneybuddy.fr`

### Authentication (`/auth`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | — | Register new account |
| POST | `/auth/login` | — | Login, returns JWT token |
| POST | `/auth/reset-password` | — | Request password reset |
| POST | `/auth/reset-password/confirm` | Bearer | Confirm password reset with new password + PIN |
| GET | `/auth/me` | Bearer | Get current account |
| POST | `/auth/subAccount/login` | Bearer | Login as sub-account (PIN-based) |
| GET | `/auth/subAccount/me` | Bearer | Get current sub-account |
| POST | `/auth/device` | Bearer | Register device for push notifications |
| PUT | `/auth/device/desactivate` | Bearer | Deactivate device |

**RegisterRequest**: `{ email, password, confirmPassword, pin (4 digits), name }`
**AuthRequest**: `{ email, password }`
**AuthSubAccountRequest**: `{ id, pin? }`
**AuthResetPassword**: `{ password, confirmPassword, pin }`
**CreateDeviceRequest**: `{ userId, token, devicePlatform: IOS|ANDROID }`
**AuthResponse**: `{ token, error? }`

---

### Sub-Accounts (`/subAccount`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/subAccount` | Bearer | Create sub-account (parent/child) |

**SubAccountDto**: `{ name, role: OWNER|PARENT|CHILD, iconStyle?, iconName?, pin? }`

---

### Tasks (`/tasks`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/tasks` | Bearer | List tasks (query: `childId?`, `status?`, `type?`) |
| POST | `/tasks` | Bearer | Create task |
| GET | `/tasks/{id}` | — | Get task with history |
| PUT | `/tasks/{id}` | Bearer | Update task |
| DELETE | `/tasks/{id}` | Bearer | Delete task |
| PUT | `/tasks/prevalidation/{id}` | Bearer | Pre-validate task (parent approval) |
| PUT | `/tasks/complete/{id}` | Bearer | Mark task done/refused |
| GET | `/tasks/history/{id}` | — | Get task history |

**TaskStatus**: `PENDING | PRE_VALIDATE | COMPLETED | REFUSED`
**TaskType**: `PONCTUAL | WEEKLY | MONTHLY`

**TaskRequest**: `{ description, type, subAccountId, coinReward? (max 50), moneyReward?, dateLimit?, weeklyDays?, monthlyDay?, prevalidation? }`
**TaskUpdate**: same fields as TaskRequest + `disable?`
**TaskComplete**: `{ done: boolean }`

---

### Goals (`/goals`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/goals` | Bearer | List goals (query: `childId?`, `accountId?`, `goalStatus?`, `goalProgression?`) |
| POST | `/goals` | Bearer | Create goal |
| GET | `/goals/{id}` | — | Get goal |
| PUT | `/goals/{id}` | Bearer | Update goal |
| DELETE | `/goals/{id}` | Bearer | Delete goal |
| POST | `/goals/add/{id}` | Bearer | Add money to goal |
| POST | `/goals/remove/{id}` | Bearer | Remove money from goal |
| POST | `/goals/transfer/{id}` | Bearer | Transfer completed goal money to balance |

**GoalStatus**: `ACTIVATED | DONE | USED`
**CreateGoalRequest**: `{ name, amount, emoji? }`
**GoalRequest**: `{ name?, amount?, emoji? }`
**GoalMoneyRequest**: `{ transferMoney: number }`

---

### Incomes (`/incomes`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/incomes` | Bearer | List incomes (query: `childId?`, `parentId?`, `status?`) |
| GET | `/incomes/{id}` | — | Get income |
| PUT | `/incomes/{id}` | Bearer | Update income status (REFUSED/ACCEPTED/PENDING) |
| DELETE | `/incomes/{id}` | — | Delete income |
| POST | `/incomes/send` | Bearer | Collect all pending incomes for a sub-account |

**UpdateIncomeRequest**: `{ status: REFUSED|ACCEPTED|PENDING }`
**CollectAllIncome**: `{ subAccountId }`

---

### Allowances (`/allowance`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/allowance` | Bearer | List allowances |
| POST | `/allowance` | Bearer | Create allowance |
| GET | `/allowance/{id}` | — | Get allowance |
| PUT | `/allowance/{id}` | Bearer | Update allowance |

**Frequency**: `WEEKLY | BIWEEKLY | MONTHLY`
**CreateAllowance**: `{ subAccountIdChild, frequency, amount?, active?, weeklyDay?, startDate? }`
**UpdateAllowance**: `{ subAccountIdChild?, frequency?, amount?, weeklyDay?, startDate?, active?, weeklyDayValid? }`

---

### Money (`/money`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/money` | Bearer | Add or remove money (query: `isAdd: boolean`) |

**AddMoney**: `{ subAccountId, amount, description?, goalId? }`

---

### Transactions (`/transactions`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/transactions/subAccount/{subAccountId}` | Bearer | Get transactions for sub-account (query: `isGoal?`) |
| GET | `/transactions/goal/{goalId}` | — | Get transactions for a goal |

**TransactionType**: `CREDIT | DEBIT`
**TransactionCategory**: `COIN | MONEY`

---

### Chapters & Courses (`/chapters`, `/courses`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/chapters` | Bearer | List chapters (paginated, with progress) |
| GET | `/chapters/{id}` | Bearer | Get chapter with progress |
| GET | `/courses/{id}` | Bearer | Get course with progress |
| GET | `/courses/chapter/{chapterId}` | Bearer | List courses in chapter (paginated) |

All paginated endpoints support: `page`, `size`, `sortBy`, `sortDir` query params.

---

### Progress (`/progress`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| PUT | `/progress/section/{sectionId}` | Bearer | Complete a section (with quiz score) |
| PUT | `/progress/course/{courseId}` | Bearer | Mark course as complete |

**CompleteSection**: `{ score: number }`

---

### Key Schemas

**Account**: `{ id, email, role: ADMIN|USER, planType: FREE|BASIC|PREMIUM, subscriptionStatus, subAccounts[], ... }`
**SubAccount**: `{ id, accountId, name, role: OWNER|PARENT|CHILD, money, income, coin, iconStyle, iconName, setting, active, ... }`
**Task**: `{ id, subaccountIdParent, subaccountIdChild, accountId, description, type, status, preValidate, disable, moneyReward, coinReward, weeklyDays, monthlyDay, dateLimit, income, ... }`
**Goal**: `{ id, name, amount, emoji, depositStatement, goalStatus, progression, subaccountIdChild, accountId, ... }`
**Income**: `{ id, accountId, subAccountId, subAccountIdChild, subAccount, task, allowance, amount, status, ... }`
**Transaction**: `{ id, accountId, childId, parentId, goalId, incomeId, type, category, amount, oldAmount, newAmount, description, ... }`
**Allowance**: `{ id, accountId, subAccountId, subAccountIdChild, frequency, amount, weeklyDay, startDate, nextExecution, active, ... }`

---

## Testing

No testing framework is configured. There are no test files or test scripts.

## Build & Distribution

EAS (Expo Application Services) is used for builds, configured in `eas.json`:
- `development` — dev client, internal distribution, iOS simulator enabled
- `preview` — internal distribution
- `production` — auto-increments version
