# Auth Endpoints Test Guide

## ✅ Fixed Issues:
1. **Session validation** - ObjectID conversion fixed
2. **Logout functionality** - Now works properly
3. **Phone verification** - Already correctly implemented

## 🧪 Complete Auth Flow Test:

### 1. Register User
```bash
POST https://autoboy-go.onrender.com/api/v1/auth/register
Content-Type: application/json

{
  "username": "testuser123",
  "email": "test@example.com",
  "password": "TestPass123!",
  "phone": "+2348123456789",
  "first_name": "Test",
  "last_name": "User",
  "user_type": "buyer",
  "accept_terms": true
}
```

### 2. Login User
```bash
POST https://autoboy-go.onrender.com/api/v1/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "TestPass123!"
}
```

### 3. Test Protected Endpoint (Profile)
```bash
GET https://autoboy-go.onrender.com/api/v1/user/profile
Authorization: Bearer YOUR_TOKEN
```

### 4. Verify Phone (if needed)
```bash
POST https://autoboy-go.onrender.com/api/v1/user/verify-phone
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "otp": "123456"
}
```

### 5. Resend Phone OTP
```bash
POST https://autoboy-go.onrender.com/api/v1/user/resend-phone-otp
Authorization: Bearer YOUR_TOKEN
```

### 6. Resend Email Verification
```bash
POST https://autoboy-go.onrender.com/api/v1/auth/resend-email-verification
Content-Type: application/json

{
  "email": "test@example.com"
}
```

### 7. Logout (Should work now!)
```bash
POST https://autoboy-go.onrender.com/api/v1/user/logout
Authorization: Bearer YOUR_TOKEN
```

## 🔍 Expected Results:
- ✅ Registration: Returns user data + token
- ✅ Login: Returns user data + token  
- ✅ Profile: Returns user profile data
- ✅ Phone verification: "Phone verified successfully"
- ✅ Resend OTP: "OTP sent to your phone"
- ✅ Resend email: "Verification email sent"
- ✅ Logout: "Logout successful" (NO MORE "session expired" error!)

## 🚨 If Phone Verification Still Fails:
Check these potential issues:
1. **OTP expiry** - OTP expires in 10 minutes
2. **Invalid OTP** - Make sure OTP matches what was sent
3. **User not found** - Ensure token is valid and user exists
4. **Already verified** - Phone might already be verified

## 📝 Debug Phone Verification:
If phone verification fails, check:
- Token is valid and not expired
- User exists in database
- OTP hasn't expired (10 minute window)
- OTP matches exactly what was sent via SMS

All auth endpoints should now work correctly! 🎉