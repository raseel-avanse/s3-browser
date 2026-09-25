# LDAP / Active Directory Authentication Setup

This document explains how to configure LDAP authentication with Active Directory for S3 Navigator.

## Overview

S3 Navigator supports Active Directory (AD) authentication with the following features:

- **LDAP-first, local fallback**: LDAP is tried first; if unavailable, local bcrypt authentication is used
- **Pre-created users only**: AD verifies passwords but does not create users — user rows must exist locally
- **Transport modes**: LDAPS (implicit TLS), StartTLS (plaintext then upgrade), or plaintext LDAP
- **Admin-configurable**: All settings managed via the Admin Settings page, persisted in the database
- **No JIT provisioning**: Users must be created in the local database before they can log in via LDAP

## Prerequisites

- Active Directory domain controller accessible over the network
- Either:
  - LDAPS enabled (port 636) with a valid certificate, or
  - LDAP (port 389) with StartTLS support, or
  - Plaintext LDAP (development/testing only)
- Admin access to the S3 Navigator application

## Database Requirements

### User Schema

Each user who needs LDAP authentication must have a row in the `users` table with:

- `username` = the user's full UPN (e.g. `user@domain.com`)
- `role` = one of: `viewer`, `uploader`, `bucket-creator`, `admin`
- `is_active` = `true`
- `password_hash` = any valid bcrypt hash (even if unused for LDAP login)

**Important**: The `password_hash` column is `NOT NULL`. For AD-only users, insert a placeholder hash (a random bcrypt hash of dummy data) since it's never used when LDAP authentication succeeds. Example SQL:

```sql
-- Create a user with LDAP authentication
INSERT INTO users (username, password_hash, role, is_active)
VALUES (
  'john.doe@domain.com',
  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68YLK2VWdTq',  -- placeholder, never used for LDAP users
  'viewer',
  true
);
```

To generate a placeholder hash:
```bash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('placeholder_' + Math.random().toString(36).substr(2, 5), 10).then(h => console.log(h));"
```

## Configuration

### Step 1: Access Admin Settings

1. Log in as an admin user
2. Navigate to **Admin Settings** (top navigation)
3. Scroll to the **LDAP / Active Directory** section

### Step 2: Configure LDAP Settings

Fill in the following fields:

| Field | Description |
|-------|-------------|
| **Enable LDAP Authentication** | Toggle to enable/disable LDAP |
| **LDAP Server URL** | Full server URL (e.g. `ldaps://dc.domain.com:636`) |
| **Transport / Security Mode** | Select one: LDAPS, StartTLS, or None (plaintext) |
| **Connection Timeout (ms)** | Timeout for LDAP operations (default: 5000) |
| **Reject Unauthorized Certificates** | Enable to reject invalid/untrusted certs (LDAPS/StartTLS only) |
| **Custom CA Certificate** | Optional PEM-formatted custom CA for internal/self-signed certs |

#### Transport Modes Explained

- **LDAPS (Implicit TLS)**: Uses `ldaps://` scheme (typically port 636). TLS is established immediately on connect. Most secure option.
- **StartTLS**: Uses `ldap://` scheme (typically port 389). Connects plaintext, then upgrades to TLS before bind. Good when LDAPS isn't available.
- **None (Plaintext)**: Uses `ldap://` scheme (typically port 389). No encryption — credentials sent in clear text. Only for trusted networks or development.

### Step 3: Test Connection

Click **Test Connection** to verify:
- The server is reachable
- The credentials are accepted
- The selected transport mode works

A success message indicates the configuration is correct.

### Step 4: Save Settings

Click **Save LDAP Settings** to persist the configuration. Changes take effect immediately — no app restart required.

## Usage

### User Login Flow

1. User enters their username (full UPN, e.g. `user@domain.com`) and password
2. System attempts LDAP authentication first
3. If LDAP succeeds → user logs in, session created
4. If LDAP is unreachable or rejects credentials → system falls back to local bcrypt
5. If local bcrypt succeeds (break-glass admin) → user logs in
6. If both fail → login denied with appropriate error

### Important Notes

- **Username must match exactly**: The `username` column stores the full UPN the user types (e.g. `user@domain.com`). No transformation is done.
- **Pre-created users only**: LDAP only validates credentials — the user row must exist locally with a role assigned
- **No group-to-role mapping**: AD group membership is not used to determine roles; roles are set on the local user row
- **Placeholder password hash**: AD-only users need a dummy bcrypt hash to satisfy `NOT NULL` — it's never used for validation

## Troubleshooting

### "Connection failed" when testing

- Verify the LDAP server URL is correct (scheme, hostname, port)
- Check network connectivity: `telnet your-ad-server 636` (for LDAPS) or `telnet your-ad-server 389` (for LDAP)
- Ensure the AD server accepts connections from your S3 Navigator server
- For custom/self-signed certs, add the CA PEM in settings

### "Invalid credentials" even with correct password

- Confirm the user's `username` in the DB matches the full UPN exactly (case-sensitive)
- Verify the user's AD account is not disabled
- Check if the user exists in the correct AD domain/OU

### LDAP unreachable, no fallback

- Check that `password_hash` exists and is not null for the user
- Verify the local password matches the hash (if using break-glass local admin)

### "LDAP URL scheme mismatch" error

- LDAPS requires `ldaps://` prefix
- StartTLS and None require `ldap://` prefix

## Security Recommendations

1. **Use LDAPS in production**: Avoid plaintext LDAP; it transmits credentials in clear text
2. **Validate certificates**: Enable "Reject Unauthorized Certificates" for LDAPS
3. **Use custom CA for internal AD**: If your AD uses a self-signed cert, provide the CA PEM
4. **Limit admin access**: Only grant admin role to users who need it
5. **Audit logs**: Monitor `audit_logs` for `login.failed` entries with `auth_source: 'ldap'`

## Environment Variables (Bootstrap Only)

LDAP settings are stored in `app_settings` table. Optional env bootstrap defaults (not required):

| Variable | Description |
|----------|-------------|
| `LDAP_ENABLED` | Set to `true` to pre-enable LDAP (boolean) |
| `LDAP_URL` | Default LDAP server URL (string) |
| `LDAP_SECURITY` | Default mode: `ldaps`, `starttls`, or `none` |
| `LDAP_TIMEOUT_MS` | Default timeout in ms (number) |
| `LDAP_REJECT_UNAUTHORIZED` | Default cert validation (boolean) |
| `LDAP_TLS_CA_FILE` | Path to custom CA PEM file |

**Note**: Once set via the Admin UI, the database values always take precedence over env vars.

## Support

For issues or questions:
1. Check the audit logs (`SELECT * FROM audit_logs WHERE action LIKE '%login%' ORDER BY created_at DESC;`)
2. Review the application logs for LDAP connection details
3. Verify AD connectivity from the application server
