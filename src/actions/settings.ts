'use server';

import { getCurrentUserOptional } from '@/lib/session';
import { createAuditLog } from '@/lib/audit';
import {
  getBranding,
  setBranding,
  DEFAULT_BRANDING,
  type BrandingSettings,
  getLdapSettings,
  setLdapSettings,
  type LdapSettings,
} from '@/lib/settings';

/**
 * Public read — used by the login page and headers. Never throws.
 */
export async function getBrandingSettings(): Promise<BrandingSettings> {
  try {
    return await getBranding();
  } catch {
    return DEFAULT_BRANDING;
  }
}

/**
 * Admin-only write. Re-checks authorization server-side (client gating is UX-only).
 */
export async function updateBrandingSettings(
  branding: BrandingSettings
): Promise<{ success: boolean; branding?: BrandingSettings; error?: string }> {
  const user = await getCurrentUserOptional();
  if (!user || user.role !== 'admin') {
    return { success: false, error: 'Not authorized' };
  }

  try {
    const saved = await setBranding(branding, user.id);
    await createAuditLog({
      user_id: user.id,
      username: user.username,
      action: 'settings.branding_update',
      resource_type: 'settings',
      details: saved,
      status: 'success',
    });
    return { success: true, branding: saved };
  } catch (err) {
    console.error('[Settings] Branding update failed:', err);
    return { success: false, error: 'Failed to save branding settings' };
  }
}

/**
 * Admin-only read of LDAP settings. Not exposed publicly as it's infrastructure config.
 */
export async function getLdapSettingsAction(): Promise<LdapSettings> {
  try {
    return await getLdapSettings();
  } catch {
    return {
      enabled: false,
      url: '',
      security: 'ldaps',
      timeoutMs: 5000,
      rejectUnauthorized: true,
      caPem: '',
    };
  }
}

/**
 * Admin-only write of LDAP settings. Re-checks authorization server-side.
 */
export async function updateLdapSettings(
  settings: LdapSettings
): Promise<{ success: boolean; settings?: LdapSettings; error?: string }> {
  const user = await getCurrentUserOptional();
  if (!user || user.role !== 'admin') {
    return { success: false, error: 'Not authorized' };
  }

  try {
    const saved = await setLdapSettings(settings, user.id);
    await createAuditLog({
      user_id: user.id,
      username: user.username,
      action: 'settings.ldap_update',
      resource_type: 'settings',
      details: { enabled: saved.enabled, url: saved.url, security: saved.security },
      status: 'success',
    });
    return { success: true, settings: saved };
  } catch (err) {
    console.error('[Settings] LDAP update failed:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Failed to save LDAP settings' };
  }
}

/**
 * Test LDAP connection with the provided settings.
 * Returns { reachable: true } if connection successful, { reachable: false, error } otherwise.
 * This is for testing configuration before saving.
 */
export async function testLdapConnection(
  settings: LdapSettings
): Promise<{ reachable: boolean; error?: string }> {
  const user = await getCurrentUserOptional();
  if (!user || user.role !== 'admin') {
    return { reachable: false, error: 'Not authorized' };
  }

  try {
    // Import ldapAuthenticate dynamically to avoid circular dependency
    const { ldapAuthenticate } = await import('./ldap');

    // Use a dummy username/password for connection test
    const result = await ldapAuthenticate('test@connection.test', 'dummy_password_for_test');

    if (result.status === 'success') {
      return { reachable: true };
    } else {
      return { reachable: false, error: result.error };
    }
  } catch (err: any) {
    console.error('[Test LDAP] Connection test failed:', err);
    return { reachable: false, error: 'Connection test failed' };
  }
}
