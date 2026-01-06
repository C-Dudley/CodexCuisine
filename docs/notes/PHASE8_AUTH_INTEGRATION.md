# Phase 8: CodexClarity Authentication Integration

## Overview

Phase 8 involves integrating CodexClarity's existing, production-ready authentication system with CodexCuisine instead of building new auth from scratch. This leverages CodexClarity's battle-tested JWT + httpOnly cookie approach, MFA support, and established user model.

**Key Decision:** Reuse existing CodexClarity auth infrastructure to accelerate development while ensuring security best practices.

---

## CodexClarity Auth Architecture

### Authentication Method: JWT + httpOnly Cookies

**Token Strategy:**

- **Access Token (short-lived):** 15 minutes
- **Refresh Token (long-lived):** 7 days
- **Token Type:** JWT signed with `SESSION_SECRET` environment variable
- **Storage:** httpOnly cookies (immune to XSS attacks)
- **Cookie Names:**
  - `codexclarity_session` - Access token
  - `codexclarity_refresh` - Refresh token

### Token Payload Structure

```typescript
interface TokenPayload {
  userId: string; // User's unique ID
  email: string; // User's email address
  role?: string; // 'user' or 'admin'
  plan?: string; // 'free', 'pro', or 'enterprise'
  type: "access" | "refresh";
}

interface DecodedToken extends TokenPayload {
  iat: number; // Issued at (Unix timestamp)
  exp: number; // Expiration time (Unix timestamp)
}
```

### Key JWT Functions

**Token Generation:**

- `generateAccessToken(userId, email, role?, plan?)` → JWT string
- `generateRefreshToken(userId, email)` → JWT string
- `generateTokenPair(userId, email, role?, plan?)` → `{ accessToken, refreshToken }`

**Token Verification:**

- `verifyAccessToken(token)` → DecodedToken | throws Error
- `verifyRefreshToken(token)` → DecodedToken | throws Error
- `verifyToken(token, expectedType)` → DecodedToken | throws Error

**Cookie Management:**

- `setAccessTokenCookie(token)` → Set-Cookie header string
- `setRefreshTokenCookie(token)` → Set-Cookie header string
- `extractAccessToken(cookieHeader)` → token | null
- `extractRefreshToken(cookieHeader)` → token | null
- `clearAuthCookies()` → Array of expired cookie headers

**Token Rotation:**

- `rotateRefreshToken(oldToken, userId, email, role?, plan?)` → New token pair or null

**Utility:**

- `isTokenExpiringSoon(token)` → boolean (expires within 5 min)
- `getTokenExpiration(token)` → Date | null

### Authentication Endpoints (Next.js API Routes)

**Location:** `Z:/AppData/codexclarity/src/app/api/auth/`

**Endpoints:**

1. **POST /api/auth/login**

   - Input: `{ email: string, password: string }`
   - Output: `{ id, email, name, role, plan, mfaEnabled }`
   - Sets httpOnly access & refresh token cookies
   - If MFA enabled: Returns `{ requiresMfa: true, userId }`

2. **POST /api/auth/signup**

   - Input: `{ email: string, password: string, ...optional fields }`
   - Output: User object
   - Creates account, sets auth cookies

3. **POST /api/auth/logout**

   - Clears auth cookies
   - Logs audit entry

4. **POST /api/auth/refresh**

   - Input: None (uses refresh cookie)
   - Output: Updated user object
   - Implements refresh token rotation

5. **GET /api/auth/session**

   - Input: None (uses access cookie)
   - Output: Current user data
   - Verifies session is valid

6. **POST /api/auth/mfa/enroll**

   - Enables MFA (TOTP) for user

7. **POST /api/auth/mfa/verify**

   - Verifies TOTP code

8. **POST /api/auth/reset-password/request**
   - Initiates password reset flow

### Middleware Pattern

**File:** `Z:/AppData/codexclarity/src/lib/auth-middleware.ts`

**Key Functions:**

```typescript
// Extract user from JWT cookie
getUserFromRequest(req: NextRequest) → DecodedToken | null

// Require authentication (401 if not logged in)
requireAuth(req, handler) → Promise<Response>

// Require admin role (403 if not admin)
requireAdmin(req, handler) → Promise<Response>

// Require specific plan tier (403 if insufficient plan)
requirePlan(req, requiredPlan, handler) → Promise<Response>

// Verify resource ownership (403 if user doesn't own resource)
requireOwnership(req, getUserIdFromRequest, handler) → Promise<Response>
```

### User Model (CodexClarity Database)

**Key Fields:**

- `uid` (string) - Primary key, user ID
- `email` (string) - Unique email
- `passwordHash` (string) - bcrypt hash
- `name` (string?) - Display name
- `role` ('user' | 'admin') - User role
- `plan` ('free' | 'pro' | 'enterprise') - Subscription tier
- `mfaEnabled` (boolean) - MFA status
- `createdAt`, `updatedAt` - Timestamps

---

## Integration Strategy for CodexCuisine

### Architecture Decision

**Option 1: Full Integration (Recommended)**

- CodexClarity authentication serves CodexCuisine users
- Single sign-on across both apps
- Shared user database
- CodexCuisine tokens/endpoints reuse CodexClarity JWT system

**Option 2: Federated (Alternative)**

- CodexClarity auth endpoint available as external provider
- CodexCuisine creates shadow user records
- Requires more complexity but allows independent deployment

**Decision:** **Option 1 - Full Integration**

- User logs into CodexClarity (or CodexCuisine login page that calls CodexClarity endpoint)
- Receives JWT cookies valid for both apps
- CodexCuisine backend validates token using `verifyAccessToken()`
- User context shared across both systems

---

## Implementation Plan

### Phase 8.1: Backend Integration Middleware

**Objective:** Create Express middleware that validates CodexClarity JWT tokens

**Files to Create:**

1. `backend/src/middleware/auth.ts` - JWT verification middleware
2. `backend/src/middleware/requireAuth.ts` - Route-level auth guards

**Key Functions:**

```typescript
// Extract user from incoming request
export function getUserFromRequest(req: Request): DecodedToken | null;

// Middleware that validates token and attaches user to request
export function authMiddleware(req: Request, res: Response, next: NextFunction);

// Route-level guard (similar to CodexClarity's requireAuth)
export async function requireAuth(handler: (req, res) => Promise<Response>);
```

**Implementation Notes:**

- Copy CodexClarity's JWT verification logic to backend/src/services/jwt-utils.ts
- Extract access token from incoming cookies using CodexClarity's parsing logic
- Attach decoded user to Express request object (e.g., `req.user`)
- Handle expired/invalid tokens gracefully (401 responses)

### Phase 8.2: Backend Route Updates

**Objective:** Add auth guards to existing recipe/meal plan routes

**Files to Update:**

1. `backend/src/routes/recipes.ts` - Add optional auth for "my recipes" endpoints
2. `backend/src/routes/meal-plan.ts` - Add required auth (already expects `req.user`)
3. `backend/src/routes/video-recipes.ts` - Add auth for saved extraction history

**Pattern:**

```typescript
// Before (no auth):
router.get('/', (req, res) => { ... });

// After (with auth):
router.get('/', authMiddleware, (req, res) => {
  const user = req.user; // Now available and type-safe
  // Filter recipes by userId, etc.
});
```

**Routes Affected:**

- `GET /api/recipes/:id` - Keep public, allow anonymous access
- `POST /api/recipes` - Require auth (user-created recipes)
- `PUT /api/recipes/:id` - Require auth + ownership check
- `DELETE /api/recipes/:id` - Require auth + ownership check
- `GET /api/meal-plan` - Require auth (already does)
- `POST /api/meal-plan` - Require auth
- `GET /api/video-recipes` - Optional auth (public access, but link to user favorites if logged in)
- `POST /api/video-recipes/scrape` - Optional auth (save to user's history if logged in)

### Phase 8.3: Frontend Auth Provider

**Objective:** Create React context mirroring CodexClarity's AuthContext

**Files to Create:**

1. `web/src/context/AuthContext.tsx` - Auth state management
2. `web/src/components/AuthProvider.tsx` - Provider wrapper
3. `web/src/hooks/useAuth.ts` - Custom hook for auth access

**Key Features:**

- `user` state - Current logged-in user
- `signIn(email, password)` - Login via CodexClarity endpoint
- `signUp(email, password)` - Register via CodexClarity endpoint
- `logout()` - Clear session
- `refreshSession()` - Auto-refresh token every 10 minutes
- `loading` state - App initialization loading

**Implementation Notes:**

- Mirror CodexClarity's pattern (fetch `/api/auth/login`, store user, set cookies)
- Auto-refresh token 10 minutes before expiry
- Handle MFA flow if enabled
- Graceful fallback for rate-limited auth endpoints

### Phase 8.4: Login & Signup Pages

**Objective:** Create auth UI pages

**Files to Create:**

1. `web/src/pages/LoginPage.tsx` - Login form + email/password inputs
2. `web/src/pages/SignupPage.tsx` - Registration form
3. `web/src/components/MfaVerifyForm.tsx` - MFA code verification (optional)

**Features:**

- Email/password form with validation
- Loading states during auth
- Error message display (rate limit, invalid credentials)
- Redirect to home page on successful login
- Link to signup from login page and vice versa
- Password visibility toggle
- Remember me option (optional)

### Phase 8.5: Protected Route Guards

**Objective:** Wrap routes that require authentication

**Implementation:**

```typescript
// web/src/components/ProtectedRoute.tsx
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" />;

  return children;
}

// Use in App.tsx routes
<Route
  path="/meal-plan"
  element={
    <ProtectedRoute>
      <MealPlanPage />
    </ProtectedRoute>
  }
/>;
```

### Phase 8.6: Token Validation at Backend

**Objective:** Ensure all protected endpoints validate CodexClarity JWT

**Implementation:**

1. Copy `jwt.ts` utilities to `backend/src/services/jwt-utils.ts`
2. Import `SESSION_SECRET` from environment
3. Middleware extracts token from cookies on each request
4. Token validated against `SESSION_SECRET`
5. Expired tokens return 401; user context updated in frontend

**Security Checklist:**

- ✅ httpOnly cookies (no JavaScript access)
- ✅ Secure flag in production (HTTPS only)
- ✅ SameSite=Strict (CSRF protection)
- ✅ Token expiry validation
- ✅ Rate limiting on auth endpoints
- ✅ Audit logging of auth events

---

## Integration Points

### 1. CodexClarity Auth → CodexCuisine Backend

**Flow:**

1. Frontend calls `POST /api/auth/login` (CodexClarity endpoint)
2. CodexClarity returns JWT + sets httpOnly cookies
3. Frontend calls CodexCuisine API (e.g., `GET /api/recipes`)
4. CodexCuisine backend extracts JWT from cookies
5. Backend calls `verifyAccessToken()` to validate
6. If valid: Request proceeds with `req.user` populated
7. If expired: Frontend auto-refreshes via `POST /api/auth/refresh`

### 2. User Context Propagation

**Mapping:**

```
CodexClarity User
├── uid → CodexCuisine userId
├── email → Unique identifier
├── role → Authorization level
└── plan → Feature access tier

CodexCuisine Recipe/MealPlan
├── userId (foreign key to CodexClarity uid)
├── createdAt
└── updatedAt
```

### 3. Database Schema Updates

**Existing Prisma Models:**

- `User` (if exists) → Needs `codexClarityUid` field to link accounts
- `Recipe` (if private) → Add `userId` field
- `MealPlan` → Already has `userId` field (update to link to CodexClarity uid)
- `Favorite` (if exists) → Add `userId` field

**Migration Pattern:**

```sql
-- Add userId foreign key linking to CodexClarity users
ALTER TABLE recipes ADD COLUMN userId String UNIQUE;
-- Ensure not null for new recipes
ALTER TABLE recipes ADD CONSTRAINT recipes_userId_fk FOREIGN KEY (userId) REFERENCES users(codexClarityUid);
```

---

## Security Considerations

### Token Security

✅ **httpOnly Cookies:** Prevents XSS token theft  
✅ **Secure Flag:** Ensures HTTPS transmission in production  
✅ **SameSite=Strict:** Prevents CSRF attacks  
✅ **Short Expiry:** 15-minute access tokens limit exposure  
✅ **Refresh Rotation:** New refresh tokens prevent reuse attacks

### API Security

✅ **Rate Limiting:** 5 login attempts per 15 minutes  
✅ **Audit Logging:** Track login success/failures  
✅ **Ownership Checks:** Verify user owns resource before modification  
✅ **Role Validation:** Admin-only routes require admin role  
✅ **Plan Tier:** Feature gating by subscription level

### Password Security

✅ **Bcrypt Hashing:** Password never stored in plaintext  
✅ **Salt Rounds:** 10 rounds (configurable)  
✅ **Min Length:** 8 characters enforced  
✅ **Strong Patterns:** Uppercase, lowercase, digit required

---

## Testing Strategy

### Manual Testing (Phase 8 Completion)

1. **Login Flow:**

   - Navigate to `/login`
   - Enter email/password
   - Verify redirect to home page
   - Verify user menu shows logged-in user
   - Verify token in cookies (DevTools → Storage → Cookies)

2. **Protected Routes:**

   - Log in successfully
   - Verify `/meal-plan` page loads (protected route)
   - Log out
   - Verify redirect to `/login` when accessing `/meal-plan`

3. **Token Refresh:**

   - Wait 10 minutes (or mock in dev tools)
   - Verify automatic token refresh without user action
   - Verify user stays logged in

4. **API Calls with Auth:**

   - Create new meal plan
   - Verify backend receives valid user context
   - Verify meal plan linked to logged-in user

5. **Error Handling:**
   - Attempt login with invalid credentials
   - Verify error message displayed
   - Test rate limiting (5 failed attempts)
   - Verify backend returns 401 for expired tokens

### Automated Testing

- Unit tests for JWT token generation/verification
- Integration tests for protected routes
- Mock auth context in component tests
- E2E tests for full login flow

---

## Timeline & Dependencies

### Phase 8 Milestones

**Week 1 (Days 1-2):**

- Create `auth.ts` middleware
- Update `requireAuth` for Express routes
- Test token validation

**Week 1 (Days 3-4):**

- Build AuthContext in React
- Create LoginPage & SignupPage
- Integrate auth flow

**Week 1 (Days 5):**

- Add ProtectedRoute guards
- Update all auth-required endpoints
- End-to-end testing

**Week 2 (Days 1-2):**

- Database schema updates (add userId foreign keys)
- Prisma migrations
- Verify all user data links correctly

**Week 2 (Days 3-5):**

- Security audit & hardening
- Rate limiting validation
- Audit logging verification
- Go-live prep

### Dependencies

- CodexClarity must be running & accessible at `Z:/AppData/codexclarity`
- `SESSION_SECRET` environment variable set in CodexCuisine backend `.env`
- Database migrations ready for user field additions

---

## Known Limitations & Future Work

### Current Scope (Phase 8)

✅ JWT + httpOnly cookies authentication  
✅ Login/logout flows  
✅ Protected routes with auth guards  
✅ Token refresh & auto-refresh  
✅ Basic MFA support (optional, can defer)

### Future Enhancements (Phase 9+)

- [ ] MFA (TOTP) full implementation & UI
- [ ] OAuth integrations (Google, GitHub)
- [ ] Password reset flow
- [ ] User profile management page
- [ ] Account settings (change password, email, etc.)
- [ ] Session management (view/revoke active sessions)
- [ ] Audit log view (user can see login history)
- [ ] Plan tier feature gating

---

## Quick Reference: Key Files

### CodexClarity Source

- `/jwt.ts` - Token generation/verification logic
- `/auth-middleware.ts` - Middleware patterns (requireAuth, requireAdmin)
- `/constants.ts` - TOKEN_EXPIRY, COOKIE_NAME, etc.
- `/app/api/auth/login/route.ts` - Login endpoint pattern

### CodexCuisine New Files

- `backend/src/middleware/auth.ts` - Express JWT validation
- `web/src/context/AuthContext.tsx` - Frontend auth state
- `web/src/pages/LoginPage.tsx` - Login UI
- `web/src/pages/SignupPage.tsx` - Signup UI

### CodexCuisine Modified Files

- `backend/src/server.ts` - Register auth middleware
- `backend/src/routes/*.ts` - Add auth guards
- `web/src/App.tsx` - Add login/signup routes, ProtectedRoute wrappers
- `web/src/components/Header.tsx` - Add logout button, user menu
- `backend/prisma/schema.prisma` - Add userId foreign keys

---

## Notes for Handoff

**Current Status:**

- CodexClarity auth system analyzed and documented
- Integration approach defined
- Implementation plan ready for execution

**Next Steps:**

1. Confirm `SESSION_SECRET` environment variable in CodexCuisine backend
2. Begin Phase 8.1 (Backend middleware creation)
3. Execute milestones in sequence
4. Test each phase before moving to next

**Questions to Clarify:**

- Should new CodexCuisine users auto-create in CodexClarity or vice versa?
- Are there existing CodexClarity users we should migrate to CodexCuisine?
- Should MFA be mandatory or optional during Phase 8?
- Any custom user fields beyond email/password for CodexCuisine?
