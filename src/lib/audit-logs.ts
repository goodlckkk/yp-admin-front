import { fetchWithAuth } from './api';

export interface AuditLog {
  id: string;
  entityName: string;
  entityId: string;
  action: string;
  changes: any;
  userId: string;
  userEmail: string;
  createdAt: string;
}

export async function getAuditLogs(entityName: string, entityId: string): Promise<AuditLog[]> {
  const queryParams = new URLSearchParams({
    entityName,
    entityId,
  });
  return fetchWithAuth<AuditLog[]>(`/audit-logs?${queryParams.toString()}`);
}
