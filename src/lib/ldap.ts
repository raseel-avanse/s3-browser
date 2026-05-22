import { Client } from 'ldapts';

interface LdapConfig {
  url: string;
  baseDN: string;
  bindDN?: string;
  bindPassword?: string;
}

function getConfig(): LdapConfig | null {
  const host = process.env.LDAP_HOST;
  const baseDN = process.env.LDAP_BASE_DN;
  if (!host || !baseDN) return null;

  const port = parseInt(process.env.LDAP_PORT || '389', 10);
  const protocol = port === 636 ? 'ldaps' : 'ldap';
  const url = `${protocol}://${host}:${port}`;

  return {
    url,
    baseDN,
    bindDN: process.env.LDAP_BIND_DN || undefined,
    bindPassword: process.env.LDAP_BIND_PASSWORD || undefined,
  };
}

export function isLdapEnabled(): boolean {
  return !!(process.env.LDAP_HOST && process.env.LDAP_BASE_DN);
}

// Escape special characters in LDAP filter values to prevent injection.
function escapeLdapFilter(value: string): string {
  return value
    .replace(/\\/g, '\\5c')
    .replace(/\*/g, '\\2a')
    .replace(/\(/g, '\\28')
    .replace(/\)/g, '\\29')
    .replace(/\0/g, '\\00');
}

function domainFromBaseDN(baseDN: string): string {
  return baseDN
    .split(',')
    .filter((p) => p.trim().toUpperCase().startsWith('DC='))
    .map((p) => p.trim().slice(3))
    .join('.');
}

export async function authenticateWithLdap(
  username: string,
  password: string
): Promise<boolean> {
  const config = getConfig();
  if (!config) throw new Error('LDAP is not configured');
  if (!password) {
    console.log('[LDAP] Rejecting login: empty password supplied');
    return false;
  }

  console.log(`[LDAP] authenticate: user="${username}" url="${config.url}" baseDN="${config.baseDN}" flow="${config.bindDN ? 'service-account' : 'upn'}"`);

  if (config.bindDN && config.bindPassword) {
    return authenticateViaServiceAccount(config, username, password);
  }
  return authenticateViaUpn(config, username, password);
}

async function authenticateViaServiceAccount(
  config: LdapConfig,
  username: string,
  password: string
): Promise<boolean> {
  const filter = `(sAMAccountName=${escapeLdapFilter(username)})`;
  console.log(`[LDAP] service-account flow: bindDN="${config.bindDN}" searchBase="${config.baseDN}" filter="${filter}"`);

  const searchClient = new Client({ url: config.url });
  try {
    console.log('[LDAP] Binding service account…');
    await searchClient.bind(config.bindDN!, config.bindPassword!);
    console.log('[LDAP] Service account bind OK');

    console.log('[LDAP] Searching for user…');
    const { searchEntries } = await searchClient.search(config.baseDN, {
      scope: 'sub',
      filter,
      attributes: ['dn'],
    });
    await searchClient.unbind();

    console.log(`[LDAP] Search returned ${searchEntries.length} entr${searchEntries.length === 1 ? 'y' : 'ies'}`);
    if (searchEntries.length === 0) {
      console.log(`[LDAP] User "${username}" not found in directory — check sAMAccountName and search base`);
      return false;
    }

    const userDN = searchEntries[0].dn;
    console.log(`[LDAP] Found user DN: "${userDN}"`);

    const userClient = new Client({ url: config.url });
    try {
      console.log('[LDAP] Binding as user to verify password…');
      await userClient.bind(userDN, password);
      console.log('[LDAP] User bind OK — authentication successful');
      return true;
    } catch (err) {
      console.error('[LDAP] User bind failed (wrong password or account locked):', (err as Error).message);
      return false;
    } finally {
      await userClient.unbind().catch(() => {});
    }
  } catch (err) {
    console.error('[LDAP] Service-account flow error:', (err as Error).message);
    return false;
  } finally {
    await searchClient.unbind().catch(() => {});
  }
}

async function authenticateViaUpn(
  config: LdapConfig,
  username: string,
  password: string
): Promise<boolean> {
  const domain = domainFromBaseDN(config.baseDN);
  const upn = `${username}@${domain}`;
  console.log(`[LDAP] UPN flow: binding as "${upn}"`);

  const client = new Client({ url: config.url });
  try {
    await client.bind(upn, password);
    console.log('[LDAP] UPN bind OK — authentication successful');
    return true;
  } catch (err) {
    console.error('[LDAP] UPN bind failed:', (err as Error).message);
    return false;
  } finally {
    await client.unbind().catch(() => {});
  }
}
