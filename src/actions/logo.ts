'use server';

import { writeFile, readFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { getCurrentUserOptional } from '@/lib/session';
import { createAuditLog } from '@/lib/audit';

const LOGO_DIR = join(process.cwd(), 'public', 'uploads');
const LOGO_PATH = join(LOGO_DIR, 'logo.png');
const LOGO_PUBLIC_URL = '/uploads/logo.png';
const META_PATH = join(process.cwd(), 'public', 'uploads', 'logo-meta.json');

export async function uploadLogo(formData: FormData, actor: string): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const file = formData.get('logo') as File;
    if (!file || file.size === 0) return { success: false, error: 'No file provided' };

    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
    if (!allowed.includes(file.type)) return { success: false, error: 'Invalid file type. Use PNG, JPG, SVG or WebP.' };

    if (file.size > 2 * 1024 * 1024) return { success: false, error: 'File too large. Max 2MB.' };

    await mkdir(LOGO_DIR, { recursive: true });
    const bytes = await file.arrayBuffer();
    const ext = file.type === 'image/svg+xml' ? 'svg' : file.type.split('/')[1];
    const filename = `logo.${ext}`;
    const filePath = join(LOGO_DIR, filename);
    await writeFile(filePath, Buffer.from(bytes));

    // Save meta
    await writeFile(META_PATH, JSON.stringify({ url: `/uploads/${filename}`, updatedAt: new Date().toISOString() }));

    const user = await getCurrentUserOptional();
    await createAuditLog({
      user_id: user?.id,
      username: actor,
      action: 'settings.logo_upload',
      resource_type: 'settings',
      details: { filename, size_kb: parseFloat((file.size / 1024).toFixed(1)) },
      status: 'success',
    });
    return { success: true, url: `/uploads/${filename}` };
  } catch (err) {
    console.error('[Logo] Upload error:', err);
    return { success: false, error: 'Upload failed' };
  }
}

export async function getLogoUrl(): Promise<string | null> {
  try {
    if (!existsSync(META_PATH)) return null;
    const meta = JSON.parse(await readFile(META_PATH, 'utf8'));
    return meta.url ?? null;
  } catch {
    return null;
  }
}

export async function removeLogo(actor: string): Promise<void> {
  try {
    const { unlink } = await import('fs/promises');
    if (existsSync(META_PATH)) await unlink(META_PATH);
    const user = await getCurrentUserOptional();
    await createAuditLog({
      user_id: user?.id,
      username: actor,
      action: 'settings.logo_remove',
      resource_type: 'settings',
      status: 'success',
    });
  } catch (err) {
    console.error('[Logo] Remove error:', err);
  }
}
