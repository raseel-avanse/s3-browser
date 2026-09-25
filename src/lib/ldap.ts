/**
 * LDAP / Active Directory authentication utilities using ldapts.
 * Supports LDAPS (implicit TLS), StartTLS (upgrade), and plaintext LDAP.
 */

import { Client, createClient, BindRequest, StartTLSRequest } from 'ldapts';
import { getLdapSettings } from './settings';

export interface LdapResult {
  status: 'success' | 'rejected' | 'unreachable';
  error?: string;
}

/**
 * Resolve LDAP configuration from app_settings, falling back to env bootstrap defaults.
 * Env vars provide optional defaults but app_settings always takes precedence.
 */
export function resolveLdapConfig() {
  // Read from DB (app_settings)
  const settings = getLdapSettings();
  
  // Note: This returns a Promise since getLdapSettings() is async
  // For sync usage, we'd need to await it at the call site
  return settings;
}

/**
 * Create an LDAP client with proper TLS configuration based on security mode.
 */
async function createLdapClient(url: string, security: 'ldaps' | 'starttls' | 'none', timeoutMs: number, rejectUnauthorized: boolean, caPem?: string): Promise<Client> {
  const client = createClient({
    url,
    timeout: timeoutMs,
    connectTimeout: timeoutMs,
    tlsOptions: {
      rejectUnauthorized,
    },
  });

  // Apply custom CA if provided (for ldaps/starttls modes)
  if (caPem && caPem.trim() && security !== 'none') {
    // ldapts doesn't directly support custom CA strings, so we need to use node's https.Agent pattern
    // For now, we'll rely on rejectUnauthorized and system CA store
    // A more complete implementation would create a custom Agent with the CA
    console.warn('Custom CA PEM support requires node tls.Agent configuration - using system CA store instead');
  }

  return client;
}

/**
 * Authenticate against LDAP/Active Directory using the user's UPN and password.
 * 
 * Transport modes:
 * - ldaps: Implicit TLS on connect (e.g., ldaps://dc:636)
 * - starttls: Connect plaintext then upgrade (e.g., ldap://dc:389 then StartTLS)
 * - none: Plaintext LDAP only (e.g., ldap://dc:389) - NOT recommended for production
 */
export async function ldapAuthenticate(upn: string, password: string): Promise<LdapResult> {
  // Empty password is always rejected (anonymous bind guard)
  if (!password || password.trim() === '') {
    return { status: 'rejected', error: 'Empty password' };
  }

  const settings = await getLdapSettings();

  // LDAP is disabled - return unreachable to trigger local fallback
  if (!settings.enabled) {
    return { status: 'unreachable', error: 'LDAP disabled' };
  }

  if (!settings.url) {
    return { status: 'unreachable', error: 'LDAP URL not configured' };
  }

  const { url, security, timeoutMs, rejectUnauthorized, caPem } = settings;

  let client: Client | null = null;

  try {
    client = await createLdapClient(url, security, timeoutMs, rejectUnauthorized, caPem);

    if (security === 'ldaps') {
      // LDAPS: Implicit TLS - just bind
      await client.bind(upn, password);
      return { status: 'success' };
    } else if (security === 'starttls') {
      // StartTLS: Connect plaintext, upgrade, then bind
      await client.startTLS({
        rejectUnauthorized,
      } as StartTLSRequest);
      await client.bind(upn, password);
      return { status: 'success' };
    } else {
      // none: Plaintext - just bind (credentials sent in clear)
      await client.bind(upn, password);
      return { status: 'success' };
    }
  } catch (error: any) {
    // Map specific errors
    if (error?.name === 'InvalidCredentialsError') {
      return { status: 'rejected', error: 'Invalid credentials' };
    }
    
    // Connection errors, timeouts, SSL/TLS errors all map to unreachable
    return { status: 'unreachable', error: error?.message || 'LDAP connection failed' };
  } finally {
    // Always unbind to clean up the connection
    if (client) {
      try {
        await client.unbind();
      } catch (unbindError) {
        // Log but don't propagate unbind errors
        console.warn('LDAP unbind error (non-fatal):', unbindError);
      }
    }
  }
}
