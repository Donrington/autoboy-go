# Session Debug Guide

## Issue: "Session expired" error on logout

### Root Cause Found:
The `isSessionValid` function was checking for `user_id` as a string, but sessions are stored with `UserID` as `primitive.ObjectID`.

### Fix Applied:
1. **Updated `isSessionValid` function** to convert userID string to ObjectID before querying
2. **Updated `InvalidateUserSession` function** to handle ObjectID conversion properly

### Testing Steps:

1. **Register/Login** to get a fresh token
2. **Test session validation** with any protected endpoint
3. **Test logout** - should work without "session expired" error

### Debug Commands:

```bash
# Test login
curl -X POST https://autoboy-go.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!"}'

# Test protected endpoint (should work)
curl -X GET https://autoboy-go.onrender.com/api/v1/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test logout (should work now)
curl -X POST https://autoboy-go.onrender.com/api/v1/user/logout \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Session Flow:
1. **Login** → Creates session with ObjectID
2. **Protected requests** → Validates session with ObjectID conversion
3. **Logout** → Invalidates session with ObjectID conversion

### Files Modified:
- `middleware/auth.go` - Fixed `isSessionValid` function
- `middleware/session.go` - Fixed `InvalidateUserSession` function

The issue should now be resolved!