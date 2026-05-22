# LDAP / Active Directory Authentication

## Overview

This document describes the hybrid authentication architecture added to support Active Directory (LDAP) users alongside existing local accounts.

**Model:**
- Local accounts and LDAP accounts coexist
- Admins pre-create all accounts (no auto-provisioning)
- Admins assign roles manually — AD group membership is not consulted
- The `admin` account (and any other local users) continue to authenticate via bcrypt regardless of LDAP configuration
- LDAP users have no local password; their credentials are verified against the AD server at each login

---

## Environment Variables

Add to `.env`:

| Variable | Required | Default | Description |
|---|---|---|---|
| `LDAP_HOST` | Yes | — | AD/LDAP server hostname, e.g. `dc.company.com` |
| `LDAP_PORT` | No | `389` | Port number. Use `636` to enable LDAPS (TLS) |
| `LDAP_BASE_DN` | Yes | — | Search base, e.g. `DC=company,DC=com` |
| `LDAP_BIND_DN` | No | — | Service account full DN for user search. If omitted, UPN bind is used |
| `LDAP_BIND_PASSWORD` | No | — | Service account password. Required when `LDAP_BIND_DN` is set |

LDAP authentication is **enabled** when both `LDAP_HOST` and `LDAP_BASE_DN` are present. Removing either disables it; all users fall back to local auth.

---

## Authentication Flows

### With service account (`LDAP_BIND_DN` + `LDAP_BIND_PASSWORD` set)

```
1. Bind to AD as service account
2. Search subtree of LDAP_BASE_DN for sAMAccountName = {username}
3. Unbind service account
4. Bind again using found user DN + submitted password
5. Success → create/return local session
```

### Without service account (minimal config)

```
1. Derive domain from LDAP_BASE_DN
   DC=company,DC=com → company.com
2. Attempt direct UPN bind: {username}@{domain} + submitted password
3. Success → create/return local session
```

---

## Database Changes

### Migration: `scripts/migrate-ldap.js`

Run after the base migration:

```bash
node scripts/migrate-ldap.js
```

Changes applied:
1. `users.auth_provider` — `VARCHAR(20) NOT NULL DEFAULT 'local'` — values: `'local'` or `'ldap'`
2. `users.password_hash` — made **nullable** (LDAP users have no local password)

---

## Code Changes

### New: `src/lib/ldap.ts`

Exports:
- `isLdapEnabled(): boolean` — true when `LDAP_HOST` + `LDAP_BASE_DN` are set
- `authenticateWithLdap(username, password): Promise<boolean>` — performs the LDAP bind

### Modified: `src/lib/auth.ts`

- `User` interface gains `auth_provider: 'local' | 'ldap'`
- `authenticate()` checks `user.auth_provider`:
  - `'ldap'` → delegates to `authenticateWithLdap()`
  - `'local'` → existing bcrypt path (unchanged)
- `changePassword()` rejects LDAP users with a clear error

### Modified: `src/lib/users.ts`

- `User` interface updated with `auth_provider`
- All SELECT queries include `auth_provider`
- New export: `createLdapUser(input)` — inserts with `password_hash = NULL`, `auth_provider = 'ldap'`, `must_change_password = false`

### Modified: `src/app/api/users/route.ts`

- `POST /api/users` accepts optional `auth_provider: 'ldap'`
  - When `'ldap'`: password field is not required; routes to `createLdapUser()`
  - When `'local'` (default): existing path unchanged
- `GET /api/users` response includes `ldapEnabled: boolean`

### Modified: `src/app/api/auth/change-password/route.ts`

- Returns `400 { error: 'Password is managed by Active Directory' }` for LDAP users

### Modified: `src/app/users/page.tsx`

- "Add User" form gains **Authentication** select: `Local` / `Active Directory (LDAP)`
  - LDAP option only rendered when `ldapEnabled` is true
  - Password field is hidden when LDAP is selected
- User table gains an `Auth` column showing `AD` badge for LDAP users
- Reset Password button is hidden for LDAP users

---

## Admin Workflow

1. Enable LDAP by setting `LDAP_HOST` and `LDAP_BASE_DN` in `.env` (restart required)
2. Go to **User Management**
3. Click **Add User**
4. Enter the username (must exactly match the AD `sAMAccountName`)
5. Select **Authentication → Active Directory (LDAP)**
6. Assign a role
7. Click **Add User**

The user can now log in with their AD credentials. Role changes, activation/deactivation, and deletion all work the same as for local users.

---

## Security Notes

- LDAP credentials in `.env` are never transmitted to the browser
- The `ldapts` client creates a new connection per login attempt; connections are always unbound after use
- LDAP filter input (`sAMAccountName`) is escaped to prevent LDAP injection
- Port `636` automatically enables `ldaps://` (TLS); port `389` uses plaintext `ldap://`
- LDAP users cannot change their password through the app — they must use AD tooling
