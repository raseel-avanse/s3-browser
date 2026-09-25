import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ldapAuthenticate } from './ldap';
import { getLdapSettings, setLdapSettings } from './settings';

// Mock the database and settings
vi.mock('./settings', () => ({
  getLdapSettings: vi.fn(),
  setLdapSettings: vi.fn(),
  DEFAULT_LDAP: {
    enabled: false,
    url: '',
    security: 'ldaps' as const,
    timeoutMs: 5000,
    rejectUnauthorized: true,
    caPem: '',
  },
}));

describe('ldapAuthenticate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should reject empty passwords', async () => {
    const result = await ldapAuthenticate('user@domain.com', '');
    expect(result.status).toBe('rejected');
    expect(result.error).toBe('Empty password');
  });

  it('should return unreachable when LDAP is disabled', async () => {
    vi.mocked(getLdapSettings).mockResolvedValue({
      enabled: false,
      url: 'ldaps://dc.domain.com:636',
      security: 'ldaps',
      timeoutMs: 5000,
      rejectUnauthorized: true,
      caPem: '',
    });

    const result = await ldapAuthenticate('user@domain.com', 'password123');
    expect(result.status).toBe('unreachable');
    expect(result.error).toBe('LDAP disabled');
  });

  it('should return unreachable when URL is not configured', async () => {
    vi.mocked(getLdapSettings).mockResolvedValue({
      enabled: true,
      url: '',
      security: 'ldaps',
      timeoutMs: 5000,
      rejectUnauthorized: true,
      caPem: '',
    });

    const result = await ldapAuthenticate('user@domain.com', 'password123');
    expect(result.status).toBe('unreachable');
    expect(result.error).toBe('LDAP URL not configured');
  });

  it('should handle ldaps transport mode', async () => {
    // Mock ldapts client
    vi.mock('ldapts', () => ({
      createClient: vi.fn(() => ({
        bind: vi.fn().mockResolvedValue(undefined),
        unbind: vi.fn().mockResolvedValue(undefined),
      })),
    }));

    vi.mocked(getLdapSettings).mockResolvedValue({
      enabled: true,
      url: 'ldaps://dc.domain.com:636',
      security: 'ldaps',
      timeoutMs: 5000,
      rejectUnauthorized: true,
      caPem: '',
    });

    const result = await ldapAuthenticate('user@domain.com', 'password123');
    expect(result.status).toBe('success');
  });

  it('should handle starttls transport mode', async () => {
    vi.mock('ldapts', () => ({
      createClient: vi.fn(() => ({
        bind: vi.fn().mockResolvedValue(undefined),
        unbind: vi.fn().mockResolvedValue(undefined),
        startTLS: vi.fn().mockResolvedValue(undefined),
      })),
    }));

    vi.mocked(getLdapSettings).mockResolvedValue({
      enabled: true,
      url: 'ldap://dc.domain.com:389',
      security: 'starttls',
      timeoutMs: 5000,
      rejectUnauthorized: true,
      caPem: '',
    });

    const result = await ldapAuthenticate('user@domain.com', 'password123');
    expect(result.status).toBe('success');
  });

  it('should handle none transport mode (plaintext)', async () => {
    vi.mock('ldapts', () => ({
      createClient: vi.fn(() => ({
        bind: vi.fn().mockResolvedValue(undefined),
        unbind: vi.fn().mockResolvedValue(undefined),
      })),
    }));

    vi.mocked(getLdapSettings).mockResolvedValue({
      enabled: true,
      url: 'ldap://dc.domain.com:389',
      security: 'none',
      timeoutMs: 5000,
      rejectUnauthorized: true,
      caPem: '',
    });

    const result = await ldapAuthenticate('user@domain.com', 'password123');
    expect(result.status).toBe('success');
  });

  it('should return rejected on invalid credentials', async () => {
    vi.mock('ldapts', () => ({
      createClient: vi.fn(() => ({
        bind: vi.fn().mockRejectedValue({ name: 'InvalidCredentialsError' }),
        unbind: vi.fn().mockResolvedValue(undefined),
      })),
    }));

    vi.mocked(getLdapSettings).mockResolvedValue({
      enabled: true,
      url: 'ldaps://dc.domain.com:636',
      security: 'ldaps',
      timeoutMs: 5000,
      rejectUnauthorized: true,
      caPem: '',
    });

    const result = await ldapAuthenticate('user@domain.com', 'wrongpassword');
    expect(result.status).toBe('rejected');
    expect(result.error).toBe('Invalid credentials');
  });

  it('should return unreachable on connection errors', async () => {
    vi.mock('ldapts', () => ({
      createClient: vi.fn(() => ({
        bind: vi.fn().mockRejectedValue(new Error('ETIMEDOUT')),
        unbind: vi.fn().mockResolvedValue(undefined),
      })),
    }));

    vi.mocked(getLdapSettings).mockResolvedValue({
      enabled: true,
      url: 'ldaps://dc.domain.com:636',
      security: 'ldaps',
      timeoutMs: 5000,
      rejectUnauthorized: true,
      caPem: '',
    });

    const result = await ldapAuthenticate('user@domain.com', 'password123');
    expect(result.status).toBe('unreachable');
  });

  it('should always unbind in finally block', async () => {
    const unbindMock = vi.fn().mockResolvedValue(undefined);
    const bindMock = vi.fn().mockResolvedValue(undefined);

    vi.mock('ldapts', () => ({
      createClient: vi.fn(() => ({
        bind: bindMock,
        unbind: unbindMock,
      })),
    }));

    vi.mocked(getLdapSettings).mockResolvedValue({
      enabled: true,
      url: 'ldaps://dc.domain.com:636',
      security: 'ldaps',
      timeoutMs: 5000,
      rejectUnauthorized: true,
      caPem: '',
    });

    await ldapAuthenticate('user@domain.com', 'password123');
    expect(unbindMock).toHaveBeenCalledTimes(1);
  });
});
