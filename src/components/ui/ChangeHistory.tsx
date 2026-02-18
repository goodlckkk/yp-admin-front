import { useEffect, useState } from 'react';
import type { AuditLog } from '../../lib/audit-logs';
import { getAuditLogs } from '../../lib/audit-logs';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';

interface ChangeHistoryProps {
  entityName: string;
  entityId: string;
}

export function ChangeHistory({ entityName, entityId }: ChangeHistoryProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (entityName && entityId) {
      loadLogs();
    }
  }, [entityName, entityId]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await getAuditLogs(entityName, entityId);
      setLogs(data);
    } catch (error) {
      console.error('Error loading audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatChanges = (changes: any) => {
    if (!changes) return <span className="text-xs text-gray-500">Sin detalles</span>;
    
    // Si changes tiene diff, mostrar eso (estructura sugerida en backend)
    const displayChanges = changes.diff || changes;

    if (typeof displayChanges === 'object') {
       return Object.entries(displayChanges).map(([key, value]) => (
         <div key={key} className="text-xs text-gray-600 break-all">
           <span className="font-semibold text-gray-700">{key}:</span> {
             typeof value === 'object' ? JSON.stringify(value) : String(value)
           }
         </div>
       ));
    }
    return <span className="text-xs text-gray-600">{String(displayChanges)}</span>;
  };

  if (loading) return <div className="text-sm text-gray-500 p-4 text-center">Cargando historial...</div>;
  if (logs.length === 0) return <div className="text-sm text-gray-500 p-4 text-center">No hay historial de cambios registrado.</div>;

  return (
    <Card className="border border-gray-200 mt-6">
      <CardHeader className="pb-2 bg-gray-50/50">
        <CardTitle className="text-lg text-[#024959] flex items-center gap-2">
          <span>🕒</span> Historial de Cambios
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[300px] overflow-y-auto pr-2 space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="bg-white border border-gray-100 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <div className="flex flex-col">
                  <span className="font-medium text-sm text-[#024959]">{log.userEmail || 'Usuario desconocido'}</span>
                  <span className="text-xs text-gray-500">{formatDate(log.createdAt)}</span>
                </div>
                <Badge variant="outline" className={
                  log.action === 'UPDATE' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                  log.action === 'CREATE' ? 'bg-green-50 text-green-700 border-green-200' :
                  'bg-gray-50 text-gray-700 border-gray-200'
                }>
                  {log.action === 'UPDATE' ? 'Edición' : log.action === 'CREATE' ? 'Creación' : log.action}
                </Badge>
              </div>
              <div className="pl-3 border-l-2 border-gray-200 mt-2 space-y-1 bg-gray-50/50 p-2 rounded-r">
                {formatChanges(log.changes)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
