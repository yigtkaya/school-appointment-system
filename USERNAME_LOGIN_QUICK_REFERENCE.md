# Quick Reference: Username Login Implementation

## What Changed?

Users can now login with **username** instead of email!

```
Before:  Email: teacher@school.com, Password: password123
After:   Username: ozge.cavlak, Password: password123
         OR Email: teacher@school.com, Password: password123 (still works!)
```

## Demo Accounts

| Role | Username | Email | Password |
|------|----------|-------|----------|
| Admin | `admin` | admin@school.com | password123 |
| Teacher | `ozge.cavlak` | teacher@school.com | password123 |

## Username Requirements

- **Min length:** 3 characters
- **Max length:** 30 characters
- **Allowed characters:** `a-z`, `A-Z`, `0-9`, `.`, `-`, `_`
- **Examples:** `john.doe`, `teacher_2024`, `maria-silva`, `admin123`

## Changes Summary

### Backend
- ✅ User model: Added `username` field (unique, indexed)
- ✅ Auth schema: Changed login to accept `username_or_email`
- ✅ Register endpoint: Now requires username
- ✅ Login endpoint: Accepts both username and email
- ✅ Migration: Database update script ready

### Frontend
- ✅ Login form: Username/email input field
- ✅ Register form: Added username input
- ✅ Validation: Username pattern validation
- ✅ Demo section: Shows both username and email options

## Testing

### Login Testing
✅ Try: `ozge.cavlak` + `password123`
✅ Try: `teacher@school.com` + `password123`
✅ Both should work!

### Register Testing
✅ Create new account with username like `john.doe`
✅ Cannot use duplicate username
✅ Cannot use duplicate email

### API Testing (curl)
```bash
# Login with username
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username_or_email":"ozge.cavlak","password":"password123"}'

# Login with email (still works)
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username_or_email":"teacher@school.com","password":"password123"}'

# Register
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"John Doe",
    "email":"john@example.com",
    "username":"john.doe",
    "password":"SecurePass123"
  }'
```

## Files Changed

### Backend
- `app/models/user.py` - Model update
- `app/schemas/user.py` - Schema update
- `app/routers/auth.py` - Auth endpoints update
- `migrations/versions/003_add_username_field.py` - NEW migration

### Frontend
- `src/api/types.ts` - Type definitions
- `src/lib/schemas.ts` - Validation schemas
- `src/pages/Login.tsx` - Login form
- `src/pages/Register.tsx` - Register form

## Deployment Steps

1. **Backup database**
   ```bash
   cp school_appointment_db.sqlite school_appointment_db.backup.sqlite
   ```

2. **Run migration**
   ```bash
   cd backend
   alembic upgrade head
   ```

3. **Verify migration**
   ```bash
   # Check users table
   sqlite3 school_appointment_db.sqlite "SELECT id, email, username FROM users;"
   ```

4. **Restart backend**
   ```bash
   python main.py
   ```

5. **Update frontend** (already done)
   - Test login with both username and email
   - Test registration with new username field

## Backward Compatibility

✅ Existing users can login with email
✅ Existing tokens still work
✅ No data loss
✅ Can rollback migration if needed

## Migration Rollback (if needed)

```bash
cd backend
alembic downgrade -1
# Will remove username column
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Migration fails | Check database permissions, backup exists |
| Can't login | Ensure using correct username_or_email format |
| Username taken | Choose different username |
| Form validation error | Check username has 3+ chars, allowed chars only |

## FAQ

**Q: Can I still login with email?**
A: Yes! Both username and email work equally.

**Q: What if I forget my username?**
A: You can always login with your email instead.

**Q: Can I change my username?**
A: Current system doesn't support it. Contact admin.

**Q: Why add username login?**
A: Usernames are shorter and easier to remember than email addresses.

---

**Status:** ✅ Ready for Production
**Date:** October 22, 2025
