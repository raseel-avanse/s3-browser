'use server';

import { getCurrentUserOptional } from '@/lib/session';
import { createAuditLog } from '@/lib/audit';

export async function recordBucketEvent(
  action: 'bucket.created' | 'bucket.updated' | 'bucket.deleted',
  bucketId: string,
  details: Record<string, any>
): Promise<void> {
  const user = await getCurrentUserOptional();
  await createAuditLog({
    user_id: user?.id,
    username: user?.username,
    action,
    resource_type: 'bucket',
    resource_id: bucketId,
    details,
    status: 'success',
  });
}

export async function recordBucketAssignment(
  bucketId: string,
  bucketName: string,
  targetUsername: string,
  action: 'bucket.assigned' | 'bucket.unassigned'
): Promise<void> {
  const user = await getCurrentUserOptional();
  await createAuditLog({
    user_id: user?.id,
    username: user?.username,
    action,
    resource_type: 'bucket',
    resource_id: bucketId,
    details: { bucket_name: bucketName, target_username: targetUsername },
    status: 'success',
  });
}
