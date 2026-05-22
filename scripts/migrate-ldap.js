#!/usr/bin/env node

/**
 * LDAP Authentication Migration
 * Adds auth_provider column and makes password_hash nullable to support LDAP users.
 */

const { Client } = require('pg');
require('dotenv').config();

async function migrate() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });

  try {
    console.log('Connecting to PostgreSQL...');
    await client.connect();
    console.log('Connected');

    await client.query('BEGIN');

    // Add auth_provider column (idempotent)
    await client.query(`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(20) NOT NULL DEFAULT 'local'
    `);
    console.log("Added column: users.auth_provider");

    // Make password_hash nullable for LDAP users (idempotent via DO block)
    await client.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'users'
            AND column_name = 'password_hash'
            AND is_nullable = 'NO'
        ) THEN
          ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
          RAISE NOTICE 'Made password_hash nullable';
        ELSE
          RAISE NOTICE 'password_hash already nullable, skipping';
        END IF;
      END$$
    `);

    // Add index on auth_provider (idempotent)
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_auth_provider ON users(auth_provider)
    `);
    console.log('Added index: idx_users_auth_provider');

    await client.query('COMMIT');
    console.log('LDAP migration completed successfully');
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

migrate();
