"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Loader2, Save, ShieldAlert, TestTube } from 'lucide-react';
import { getLdapSettingsAction, updateLdapSettings, testLdapConnection } from '@/actions/settings';
import { useToast } from '@/hooks/use-toast';
import type { LdapSettings, LdapSecurityMode } from '@/lib/settings';

export function LdapSettingsCard() {
  const { toast } = useToast();
  const [enabled, setEnabled] = useState(false);
  const [url, setUrl] = useState('');
  const [security, setSecurity] = useState<LdapSecurityMode>('ldaps');
  const [timeoutMs, setTimeoutMs] = useState(5000);
  const [rejectUnauthorized, setRejectUnauthorized] = useState(true);
  const [caPem, setCaPem] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    getLdapSettingsAction().then((settings) => {
      setEnabled(settings.enabled);
      setUrl(settings.url);
      setSecurity(settings.security);
      setTimeoutMs(settings.timeoutMs);
      setRejectUnauthorized(settings.rejectUnauthorized);
      setCaPem(settings.caPem);
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const result = await updateLdapSettings({
      enabled,
      url,
      security,
      timeoutMs,
      rejectUnauthorized,
      caPem,
    });
    if (result.success && result.settings) {
      toast({ title: 'LDAP settings saved', description: 'Configuration updated successfully.', duration: 2000 });
    } else {
      toast({ variant: 'destructive', title: 'Save failed', description: result.error || 'Unknown error' });
    }
    setSaving(false);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    const result = await testLdapConnection({
      enabled,
      url,
      security,
      timeoutMs,
      rejectUnauthorized,
      caPem,
    });
    setTesting(false);
    
    if (result.reachable) {
      toast({
        title: 'Connection successful',
        description: 'LDAP server is reachable with the current configuration.',
        duration: 3000,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Connection failed',
        description: result.error || 'Unable to connect to LDAP server.',
        duration: 5000,
      });
    }
  };

  return (
    <Card className="skeu-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5" /> LDAP / Active Directory
        </CardTitle>
        <CardDescription>
          Configure LDAP authentication with Active Directory. Users must already exist in the local database
          with username matching their full UPN (e.g. user@domain.com). LDAP verification is tried first;
          if unavailable, local password authentication is used as fallback.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Enable toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="ldap-enabled">Enable LDAP Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  When enabled, LDAP is tried first. If unavailable, local authentication is used as fallback.
                </p>
              </div>
              <Switch
                id="ldap-enabled"
                checked={enabled}
                onCheckedChange={setEnabled}
              />
            </div>

            {/* URL */}
            <div className="space-y-2">
              <Label htmlFor="ldap-url">LDAP Server URL</Label>
              <Input
                id="ldap-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="ldaps://dc.corp.example.com:636"
                className="bg-card"
              />
              <p className="text-xs text-muted-foreground">
                Example: ldaps://dc.corp.example.com:636 (LDAPS) or ldap://dc.corp.example.com:389 (StartTLS/None)
              </p>
            </div>

            {/* Security Mode */}
            <div className="space-y-2">
              <Label htmlFor="ldap-security">Transport / Security Mode</Label>
              <Select value={security} onValueChange={(v: LdapSecurityMode) => setSecurity(v)}>
                <SelectTrigger id="ldap-security" className="bg-card">
                  <SelectValue placeholder="Select security mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ldaps">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 text-green-600" />
                      <span>LDAPS (Implicit TLS)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="starttls">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 text-yellow-600" />
                      <span>StartTLS (Upgrade on plaintext)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="none">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span>None (Plaintext LDAP)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {security === 'none' && (
                <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <p>
                    Plaintext mode transmits credentials in clear text. Only use on trusted networks or for development.
                  </p>
                </div>
              )}
            </div>

            {/* Timeout */}
            <div className="space-y-2">
              <Label htmlFor="ldap-timeout">Connection Timeout (ms)</Label>
              <Input
                id="ldap-timeout"
                type="number"
                value={timeoutMs}
                onChange={(e) => setTimeoutMs(parseInt(e.target.value, 10) || 5000)}
                className="bg-card"
              />
            </div>

            {/* TLS Options - only for ldaps/starttls */}
            {(security === 'ldaps' || security === 'starttls') && (
              <>
                {/* Reject Unauthorized */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="ldap-reject-unauthorized">Reject Unauthorized Certificates</Label>
                    <p className="text-sm text-muted-foreground">
                      When enabled, connections to servers with invalid/untrusted certificates will fail.
                    </p>
                  </div>
                  <Switch
                    id="ldap-reject-unauthorized"
                    checked={rejectUnauthorized}
                    onCheckedChange={setRejectUnauthorized}
                  />
                </div>

                {/* CA PEM */}
                <div className="space-y-2">
                  <Label htmlFor="ldap-ca-pem">Custom CA Certificate (PEM format, optional)</Label>
                  <Textarea
                    id="ldap-ca-pem"
                    value={caPem}
                    onChange={(e) => setCaPem(e.target.value)}
                    placeholder="-----BEGIN CERTIFICATE-----&#10;MIIDXTCCAkWgAwIBAgIJAJC1HiIAZAiU...&#10;-----END CERTIFICATE-----"
                    className="font-mono text-xs min-h-[150px] bg-card"
                  />
                  <p className="text-xs text-muted-foreground">
                    Paste a custom CA certificate in PEM format to trust internal or self-signed LDAP servers.
                    Leave empty to use system CA store.
                  </p>
                </div>
              </>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleTestConnection}
                disabled={testing}
                className="skeu-btn border-0"
              >
                {testing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TestTube className="mr-2 h-4 w-4" />}
                {testing ? 'Testing...' : 'Test Connection'}
              </Button>
              <Button onClick={handleSave} disabled={saving} className="skeu-btn border-0">
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {saving ? 'Saving...' : 'Save LDAP Settings'}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
